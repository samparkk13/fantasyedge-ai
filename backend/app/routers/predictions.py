from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.database import get_db, PlayerPrediction, Player
from app.services.prediction_service import PredictionService
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/predictions", tags=["predictions"])
prediction_service = PredictionService()

# Pydantic models for API responses
class ProjectedStatsResponse(BaseModel):
    passing_yards: Optional[int] = None
    passing_tds: Optional[int] = None
    interceptions: Optional[int] = None
    rushing_yards: Optional[int] = None
    rushing_tds: Optional[int] = None
    receptions: Optional[int] = None
    receiving_yards: Optional[int] = None
    receiving_tds: Optional[int] = None
    targets: Optional[int] = None
    fantasy_points: Optional[float] = None

class PlayerPredictionResponse(BaseModel):
    id: str
    player_id: str
    player_name: str
    player_position: str
    player_team: str
    season: int
    predicted_points: float
    confidence: float
    reasoning: str
    projected_stats: Optional[dict] = None
    breakout_score: float
    bust_risk: float
    created_at: str
    
    class Config:
        from_attributes = True

class PredictionSummaryResponse(BaseModel):
    total_predictions: int
    avg_confidence: float
    high_confidence_count: int
    breakout_candidates: int
    bust_risks: int

@router.get("/", response_model=List[PlayerPredictionResponse])
async def get_predictions(
    season: Optional[int] = Query(2025, description="Season year"),
    position: Optional[str] = Query(None, description="Filter by position"),
    min_confidence: Optional[float] = Query(None, ge=0, le=1, description="Minimum confidence threshold"),
    min_breakout_score: Optional[float] = Query(None, ge=0, le=1, description="Minimum breakout score"),
    limit: int = Query(50, ge=1, le=100, description="Number of predictions to return"),
    db: Session = Depends(get_db)
):
    """Get player predictions with filtering options"""
    
    query = db.query(PlayerPrediction).join(Player).filter(
        PlayerPrediction.season == season
    )
    
    # Apply filters
    if position:
        query = query.filter(Player.position == position.upper())
    
    if min_confidence is not None:
        query = query.filter(PlayerPrediction.confidence >= min_confidence)
    
    if min_breakout_score is not None:
        query = query.filter(PlayerPrediction.breakout_score >= min_breakout_score)
    
    predictions = query.limit(limit).all()
    
    # Format response
    result = []
    for pred in predictions:
        result.append(PlayerPredictionResponse(
            id=pred.id,
            player_id=pred.player_id,
            player_name=pred.player.name,
            player_position=pred.player.position,
            player_team=pred.player.team,
            season=pred.season,
            predicted_points=pred.predicted_points,
            confidence=pred.confidence,
            reasoning=pred.reasoning,
            projected_stats=pred.projected_stats,
            breakout_score=pred.breakout_score,
            bust_risk=pred.bust_risk,
            created_at=pred.created_at.isoformat()
        ))
    
    return result

@router.get("/player/{player_id}", response_model=PlayerPredictionResponse)
async def get_player_prediction(
    player_id: str, 
    season: int = Query(2025, description="Season year"),
    db: Session = Depends(get_db)
):
    """Get prediction for a specific player"""
    
    prediction = db.query(PlayerPrediction).join(Player).filter(
        PlayerPrediction.player_id == player_id,
        PlayerPrediction.season == season
    ).first()
    
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction not found")
    
    return PlayerPredictionResponse(
        id=prediction.id,
        player_id=prediction.player_id,
        player_name=prediction.player.name,
        player_position=prediction.player.position,
        player_team=prediction.player.team,
        season=prediction.season,
        predicted_points=prediction.predicted_points,
        confidence=prediction.confidence,
        reasoning=prediction.reasoning,
        projected_stats=prediction.projected_stats,
        breakout_score=prediction.breakout_score,
        bust_risk=prediction.bust_risk,
        created_at=prediction.created_at.isoformat()
    )

@router.post("/generate/{player_id}")
async def generate_player_prediction(
    player_id: str,
    season: int = Query(2025, description="Season year"),
    db: Session = Depends(get_db)
):
    """Generate a new prediction for a specific player"""
    
    try:
        prediction = await prediction_service.generate_player_prediction(
            db, player_id, season
        )
        
        return {
            "message": f"Generated prediction for player {player_id}",
            "prediction_id": prediction.id,
            "predicted_points": prediction.predicted_points,
            "confidence": prediction.confidence
        }
        
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error generating prediction: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating prediction: {str(e)}")

@router.post("/generate-all")
async def generate_all_predictions(
    season: int = Query(2025, description="Season year"),
    db: Session = Depends(get_db)
):
    """Generate predictions for all players"""
    
    try:
        predictions = await prediction_service.generate_all_predictions(db, season)
        
        return {
            "message": f"Generated predictions for {len(predictions)} players",
            "season": season,
            "predictions_created": len(predictions)
        }
        
    except Exception as e:
        logger.error(f"Error generating predictions: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating predictions: {str(e)}")

@router.get("/breakout-candidates", response_model=List[PlayerPredictionResponse])
async def get_breakout_candidates(
    season: int = Query(2025, description="Season year"),
    min_score: float = Query(0.6, ge=0, le=1, description="Minimum breakout score"),
    limit: int = Query(20, ge=1, le=50, description="Number of candidates to return"),
    db: Session = Depends(get_db)
):
    """Get players with high breakout potential"""
    
    try:
        candidates = await prediction_service.get_breakout_candidates(
            db, season, min_score
        )
        
        # Sort by breakout score descending
        candidates.sort(key=lambda x: x.breakout_score, reverse=True)
        candidates = candidates[:limit]
        
        result = []
        for pred in candidates:
            result.append(PlayerPredictionResponse(
                id=pred.id,
                player_id=pred.player_id,
                player_name=pred.player.name,
                player_position=pred.player.position,
                player_team=pred.player.team,
                season=pred.season,
                predicted_points=pred.predicted_points,
                confidence=pred.confidence,
                reasoning=pred.reasoning,
                projected_stats=pred.projected_stats,
                breakout_score=pred.breakout_score,
                bust_risk=pred.bust_risk,
                created_at=pred.created_at.isoformat()
            ))
        
        return result
        
    except Exception as e:
        logger.error(f"Error getting breakout candidates: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/summary", response_model=PredictionSummaryResponse)
async def get_predictions_summary(
    season: int = Query(2025, description="Season year"),
    db: Session = Depends(get_db)
):
    """Get summary statistics for predictions"""
    
    try:
        from sqlalchemy import func
        
        # Get basic stats
        stats = db.query(
            func.count(PlayerPrediction.id).label('total'),
            func.avg(PlayerPrediction.confidence).label('avg_confidence'),
            func.count().filter(PlayerPrediction.confidence >= 0.8).label('high_confidence'),
            func.count().filter(PlayerPrediction.breakout_score >= 0.6).label('breakout_candidates'),
            func.count().filter(PlayerPrediction.bust_risk >= 0.5).label('bust_risks')
        ).filter(PlayerPrediction.season == season).first()
        
        return PredictionSummaryResponse(
            total_predictions=stats.total or 0,
            avg_confidence=round(stats.avg_confidence or 0, 3),
            high_confidence_count=stats.high_confidence or 0,
            breakout_candidates=stats.breakout_candidates or 0,
            bust_risks=stats.bust_risks or 0
        )
        
    except Exception as e:
        logger.error(f"Error getting prediction summary: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/position-rankings/{position}")
async def get_position_rankings(
    position: str,
    season: int = Query(2025, description="Season year"),
    db: Session = Depends(get_db)
):
    """Get players ranked by predicted points for a specific position"""
    
    predictions = db.query(PlayerPrediction).join(Player).filter(
        Player.position == position.upper(),
        PlayerPrediction.season == season
    ).order_by(PlayerPrediction.predicted_points.desc()).limit(50).all()
    
    if not predictions:
        raise HTTPException(status_code=404, detail=f"No predictions found for position {position}")
    
    result = []
    for rank, pred in enumerate(predictions, 1):
        result.append({
            "rank": rank,
            "player_name": pred.player.name,
            "team": pred.player.team,
            "predicted_points": pred.predicted_points,
            "confidence": pred.confidence,
            "breakout_score": pred.breakout_score,
            "reasoning": pred.reasoning[:100] + "..." if len(pred.reasoning) > 100 else pred.reasoning
        })
    
    return {
        "position": position.upper(),
        "season": season,
        "rankings": result
    }