from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.database import get_db, Player
from app.services.player_service import PlayerService, create_sample_players
from pydantic import BaseModel

router = APIRouter(prefix="/players", tags=["players"])
player_service = PlayerService()

# Pydantic models for API responses
class PlayerResponse(BaseModel):
    id: str
    nfl_id: str
    name: str
    position: str
    team: str
    age: Optional[int] = None
    experience: Optional[int] = None
    height: Optional[str] = None
    weight: Optional[int] = None
    college: Optional[str] = None
    
    class Config:
        from_attributes = True

class PlayersListResponse(BaseModel):
    players: List[PlayerResponse]
    total: int
    page: int
    limit: int

@router.get("/", response_model=PlayersListResponse)
async def get_players(
    position: Optional[str] = Query(None, description="Filter by position (QB, RB, WR, TE, K, DST)"),
    search: Optional[str] = Query(None, description="Search players by name"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(50, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db)
):
    """Get players with optional filtering and pagination"""
    
    query = db.query(Player)
    
    # Apply filters
    if position:
        query = query.filter(Player.position == position.upper())
    
    if search:
        query = query.filter(Player.name.ilike(f"%{search}%"))
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * limit
    players = query.offset(offset).limit(limit).all()
    
    return PlayersListResponse(
        players=players,
        total=total,
        page=page,
        limit=limit
    )

@router.get("/{player_id}", response_model=PlayerResponse)
async def get_player(player_id: str, db: Session = Depends(get_db)):
    """Get a specific player by ID"""
    player = await player_service.get_player_by_id(db, player_id)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    return player

@router.post("/fetch-current")
async def fetch_current_players(db: Session = Depends(get_db)):
    """Fetch current NFL players from external API and save to database"""
    try:
        players = await player_service.fetch_current_players(db)
        return {
            "message": f"Successfully fetched {len(players)} players",
            "count": len(players)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching players: {str(e)}")

@router.post("/create-sample")
async def create_sample_data(db: Session = Depends(get_db)):
    """Create sample player data for development"""
    try:
        players = await create_sample_players(db)
        return {
            "message": f"Created {len(players)} sample players",
            "players": [{"id": p.id, "name": p.name, "position": p.position} for p in players]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating sample data: {str(e)}")

@router.get("/positions/stats")
async def get_position_stats(db: Session = Depends(get_db)):
    """Get player count by position"""
    from sqlalchemy import func
    
    stats = db.query(
        Player.position,
        func.count(Player.id).label('count')
    ).group_by(Player.position).all()
    
    return {
        "position_stats": [{"position": stat.position, "count": stat.count} for stat in stats],
        "total_players": sum(stat.count for stat in stats)
    }