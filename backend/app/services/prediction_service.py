import uuid
import numpy as np
import pandas as pd
from typing import List, Dict, Optional, Tuple
from sqlalchemy.orm import Session
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import logging
from datetime import datetime

from app.models.database import Player, PlayerStat, PlayerPrediction

logger = logging.getLogger(__name__)

class PredictionService:
    """Service for generating AI-powered fantasy football predictions"""
    
    def __init__(self):
        self.model = None
        self.feature_columns = []
        self.current_season = 2025
        
    async def generate_player_prediction(
        self, 
        db: Session, 
        player_id: str, 
        season: int = None
    ) -> Optional[PlayerPrediction]:
        """Generate a prediction for a specific player"""
        
        if not season:
            season = self.current_season
            
        player = db.query(Player).filter(Player.id == player_id).first()
        if not player:
            raise ValueError(f"Player with id {player_id} not found")
        
        # Check if prediction already exists
        existing_prediction = db.query(PlayerPrediction).filter(
            PlayerPrediction.player_id == player_id,
            PlayerPrediction.season == season
        ).first()
        
        if existing_prediction:
            return existing_prediction
        
        # Generate features for this player
        features = await self._generate_player_features(db, player, season)
        
        # Calculate prediction using rule-based system (we'll upgrade to ML later)
        prediction_result = await self._calculate_prediction(player, features)
        
        # Create prediction record
        prediction = PlayerPrediction(
            id=str(uuid.uuid4()),
            player_id=player_id,
            season=season,
            predicted_points=prediction_result['predicted_points'],
            confidence=prediction_result['confidence'],
            reasoning=prediction_result['reasoning'],
            projected_stats=prediction_result['projected_stats'],
            breakout_score=prediction_result['breakout_score'],
            bust_risk=prediction_result['bust_risk']
        )
        
        db.add(prediction)
        db.commit()
        
        return prediction
    
    async def _generate_player_features(
        self, 
        db: Session, 
        player: Player, 
        season: int
    ) -> Dict:
        """Generate feature set for a player"""
        
        features = {
            # Basic player info
            'age': player.age or 25,  # Default age if missing
            'experience': player.experience or 0,
            'position': player.position,
            
            # Positional factors
            'is_qb': 1 if player.position == 'QB' else 0,
            'is_rb': 1 if player.position == 'RB' else 0,
            'is_wr': 1 if player.position == 'WR' else 0,
            'is_te': 1 if player.position == 'TE' else 0,
            
            # Team factors (simplified for now)
            'team_strength': self._get_team_strength(player.team),
            
            # Age curve factors
            'age_prime': self._calculate_age_curve_factor(player.age, player.position),
            
            # Experience factors
            'breakout_window': self._calculate_breakout_window(
                player.experience, 
                player.position
            ),
        }
        
        # Get historical stats if available
        historical_stats = db.query(PlayerStat).filter(
            PlayerStat.player_id == player.id
        ).all()
        
        if historical_stats:
            features.update(await self._calculate_historical_features(historical_stats))
        else:
            # Default values for players without historical data
            features.update({
                'avg_fantasy_points': self._get_position_baseline(player.position),
                'consistency_score': 0.5,
                'trend_score': 0.5,
                'ceiling_score': 0.5
            })
        
        return features
    
    async def _calculate_prediction(
        self, 
        player: Player, 
        features: Dict
    ) -> Dict:
        """Calculate prediction using rule-based system"""
        
        # Base fantasy points by position
        position_baselines = {
            'QB': 18.5,
            'RB': 12.8,
            'WR': 11.2,
            'TE': 8.4,
            'K': 7.5,
            'DST': 8.2
        }
        
        base_points = position_baselines.get(player.position, 10.0)
        
        # Apply modifiers
        age_modifier = features.get('age_prime', 1.0)
        team_modifier = features.get('team_strength', 1.0)
        breakout_modifier = features.get('breakout_window', 1.0)
        
        # Calculate predicted points
        predicted_points = base_points * age_modifier * team_modifier * breakout_modifier
        
        # Add some variance based on player-specific factors
        if features.get('avg_fantasy_points', 0) > 0:
            historical_weight = 0.7
            predicted_points = (
                historical_weight * features['avg_fantasy_points'] + 
                (1 - historical_weight) * predicted_points
            )
        
        # Calculate breakout score (0-1, higher = more likely to break out)
        breakout_factors = []
        
        # Young player entering prime
        if features.get('age', 30) <= 26 and features.get('experience', 10) >= 2:
            breakout_factors.append(0.3)
            
        # Breakout window for position
        if features.get('breakout_window', 0) > 1.1:
            breakout_factors.append(0.4)
            
        # Strong team context
        if features.get('team_strength', 1.0) > 1.1:
            breakout_factors.append(0.2)
            
        breakout_score = min(sum(breakout_factors), 1.0)
        
        # Calculate bust risk (inverse relationship with some factors)
        bust_risk = max(0.0, min(1.0, 
            0.3 - (features.get('consistency_score', 0.5) - 0.5) * 0.5 +
            (features.get('age', 25) - 25) * 0.02
        ))
        
        # Calculate confidence (higher for established players)
        confidence = 0.6 + min(0.4, features.get('experience', 0) * 0.05)
        
        # Generate reasoning
        reasoning = self._generate_reasoning(player, features, {
            'predicted_points': predicted_points,
            'breakout_score': breakout_score,
            'bust_risk': bust_risk
        })
        
        # Generate projected stats
        projected_stats = self._generate_projected_stats(player, predicted_points)
        
        return {
            'predicted_points': round(predicted_points, 1),
            'confidence': round(confidence, 2),
            'reasoning': reasoning,
            'projected_stats': projected_stats,
            'breakout_score': round(breakout_score, 2),
            'bust_risk': round(bust_risk, 2)
        }
    
    def _get_team_strength(self, team: str) -> float:
        """Get team offensive strength modifier"""
        # Simplified team rankings (in reality, this would be updated annually)
        strong_offenses = ['BUF', 'KC', 'SF', 'MIA', 'CIN', 'DAL', 'PHI']
        weak_offenses = ['NYJ', 'NE', 'WAS', 'CAR', 'CHI']
        
        if team in strong_offenses:
            return 1.15
        elif team in weak_offenses:
            return 0.9
        else:
            return 1.0
    
    def _calculate_age_curve_factor(self, age: Optional[int], position: str) -> float:
        """Calculate age curve factor for different positions"""
        if not age:
            return 1.0
            
        # Peak ages by position
        peak_ages = {
            'QB': 29,
            'RB': 25,
            'WR': 27,
            'TE': 28,
            'K': 30,
            'DST': 27
        }
        
        peak_age = peak_ages.get(position, 27)
        
        # Calculate distance from peak
        distance_from_peak = abs(age - peak_age)
        
        # Apply age curve
        if age <= peak_age:
            # Ascending to peak
            return min(1.2, 1.0 + (peak_age - age) * 0.02)
        else:
            # Declining from peak
            return max(0.7, 1.0 - (age - peak_age) * 0.04)
    
    def _calculate_breakout_window(self, experience: Optional[int], position: str) -> float:
        """Calculate breakout potential based on experience"""
        if not experience:
            return 1.0
            
        # Typical breakout years by position
        breakout_years = {
            'QB': [2, 3, 4],
            'RB': [1, 2],
            'WR': [2, 3],
            'TE': [3, 4, 5],
            'K': [],
            'DST': []
        }
        
        position_breakouts = breakout_years.get(position, [])
        
        if experience in position_breakouts:
            return 1.3
        elif experience == max(position_breakouts) + 1 if position_breakouts else False:
            return 1.1
        else:
            return 1.0
    
    def _get_position_baseline(self, position: str) -> float:
        """Get baseline fantasy points for position"""
        return {
            'QB': 16.5,
            'RB': 10.8,
            'WR': 9.2,
            'TE': 6.8,
            'K': 7.0,
            'DST': 7.5
        }.get(position, 8.0)
    
    async def _calculate_historical_features(self, stats: List[PlayerStat]) -> Dict:
        """Calculate features from historical stats"""
        if not stats:
            return {}
            
        fantasy_points = [stat.fantasy_points for stat in stats if stat.fantasy_points]
        
        if not fantasy_points:
            return {}
            
        return {
            'avg_fantasy_points': np.mean(fantasy_points),
            'consistency_score': 1.0 - (np.std(fantasy_points) / np.mean(fantasy_points)) if np.mean(fantasy_points) > 0 else 0.5,
            'trend_score': 0.6 if len(fantasy_points) > 1 and fantasy_points[-1] > fantasy_points[0] else 0.4,
            'ceiling_score': max(fantasy_points) / np.mean(fantasy_points) if np.mean(fantasy_points) > 0 else 1.0
        }
    
    def _generate_reasoning(self, player: Player, features: Dict, prediction: Dict) -> str:
        """Generate human-readable reasoning for the prediction"""
        reasons = []
        
        # Age factors
        age = features.get('age')
        if age and age <= 25:
            reasons.append(f"Young player ({age}yo) entering prime years")
        elif age and age >= 30:
            reasons.append(f"Veteran player ({age}yo) past typical peak")
        
        # Experience factors
        exp = features.get('experience', 0)
        breakout_window = features.get('breakout_window', 1.0)
        if breakout_window > 1.2:
            reasons.append(f"In typical breakout window for {player.position} (Year {exp})")
        
        # Team factors
        team_strength = features.get('team_strength', 1.0)
        if team_strength > 1.1:
            reasons.append(f"Benefits from strong {player.team} offensive system")
        elif team_strength < 0.95:
            reasons.append(f"Limited by weaker {player.team} offensive context")
        
        # Breakout/bust assessment
        if prediction['breakout_score'] > 0.6:
            reasons.append("High breakout potential identified")
        elif prediction['bust_risk'] > 0.5:
            reasons.append("Some bust risk due to age/consistency factors")
        
        return "; ".join(reasons) if reasons else f"Standard projection for {player.position} with current profile"
    
    def _generate_projected_stats(self, player: Player, predicted_points: float) -> Dict:
        """Generate projected counting stats based on fantasy points"""
        # Very simplified stat projections
        if player.position == 'QB':
            return {
                'passing_yards': int(predicted_points * 18),
                'passing_tds': max(1, int(predicted_points * 1.4)),
                'interceptions': max(0, int(predicted_points * 0.7)),
                'rushing_yards': int(predicted_points * 2.5),
                'rushing_tds': max(0, int(predicted_points * 0.15))
            }
        elif player.position == 'RB':
            return {
                'rushing_yards': int(predicted_points * 5.2),
                'rushing_tds': max(0, int(predicted_points * 0.6)),
                'receptions': max(0, int(predicted_points * 2.1)),
                'receiving_yards': int(predicted_points * 2.8),
                'receiving_tds': max(0, int(predicted_points * 0.25))
            }
        elif player.position == 'WR':
            return {
                'receptions': int(predicted_points * 4.2),
                'receiving_yards': int(predicted_points * 6.8),
                'receiving_tds': max(0, int(predicted_points * 0.45)),
                'targets': int(predicted_points * 6.5)
            }
        elif player.position == 'TE':
            return {
                'receptions': int(predicted_points * 3.8),
                'receiving_yards': int(predicted_points * 5.2),
                'receiving_tds': max(0, int(predicted_points * 0.5)),
                'targets': int(predicted_points * 5.8)
            }
        else:
            return {'fantasy_points': predicted_points}

    async def generate_all_predictions(self, db: Session, season: int = None) -> List[PlayerPrediction]:
        """Generate predictions for all players"""
        if not season:
            season = self.current_season
            
        players = db.query(Player).all()
        predictions = []
        
        for player in players:
            try:
                prediction = await self.generate_player_prediction(db, player.id, season)
                if prediction:
                    predictions.append(prediction)
            except Exception as e:
                logger.error(f"Failed to generate prediction for {player.name}: {str(e)}")
                continue
        
        return predictions

    async def get_breakout_candidates(
        self, 
        db: Session, 
        season: int = None, 
        min_breakout_score: float = 0.6
    ) -> List[PlayerPrediction]:
        """Get players with high breakout potential"""
        if not season:
            season = self.current_season
            
        predictions = db.query(PlayerPrediction).filter(
            PlayerPrediction.season == season,
            PlayerPrediction.breakout_score >= min_breakout_score
        ).all()
        
        return predictions