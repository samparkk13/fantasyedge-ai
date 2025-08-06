import requests
import uuid
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from app.models.database import Player, PlayerStat
import logging

logger = logging.getLogger(__name__)

class PlayerService:
    """Service for fetching and managing NFL player data"""
    
    def __init__(self):
        # We'll use a free API for now - ESPN's public API
        self.base_url = "https://site.api.espn.com/apis/site/v2/sports/football/nfl"
    
    async def fetch_current_players(self, db: Session) -> List[Dict]:
        """Fetch current NFL players from ESPN API"""
        try:
            # Get all NFL teams first
            teams_response = requests.get(f"{self.base_url}/teams")
            teams_data = teams_response.json()
            
            all_players = []
            
            for team in teams_data.get('sports', [{}])[0].get('leagues', [{}])[0].get('teams', []):
                team_id = team['team']['id']
                team_abbr = team['team']['abbreviation']
                
                # Get roster for each team
                roster_url = f"{self.base_url}/teams/{team_id}/roster"
                roster_response = requests.get(roster_url)
                
                if roster_response.status_code == 200:
                    roster_data = roster_response.json()
                    
                    for athlete in roster_data.get('athletes', []):
                        player_data = self._parse_player_data(athlete, team_abbr)
                        if player_data:
                            all_players.append(player_data)
            
            # Save to database
            saved_count = await self._save_players_to_db(db, all_players)
            logger.info(f"Fetched and saved {saved_count} players")
            
            return all_players
            
        except Exception as e:
            logger.error(f"Error fetching players: {str(e)}")
            raise
    
    def _parse_player_data(self, athlete_data: Dict, team: str) -> Optional[Dict]:
        """Parse ESPN athlete data into our player format"""
        try:
            athlete = athlete_data
            
            # Get position
            position = athlete.get('position', {}).get('abbreviation', 'N/A')
            
            # Skip non-fantasy relevant positions
            if position not in ['QB', 'RB', 'WR', 'TE', 'K', 'DST']:
                return None
            
            return {
                'nfl_id': str(athlete.get('id')),
                'name': athlete.get('displayName', ''),
                'position': position,
                'team': team,
                'age': athlete.get('age'),
                'experience': athlete.get('experience', {}).get('years'),
                'height': athlete.get('displayHeight'),
                'weight': athlete.get('weight'),
                'college': athlete.get('college', {}).get('name') if athlete.get('college') else None
            }
        except Exception as e:
            logger.error(f"Error parsing player data: {str(e)}")
            return None
    
    async def _save_players_to_db(self, db: Session, players_data: List[Dict]) -> int:
        """Save players to database"""
        saved_count = 0
        
        for player_data in players_data:
            try:
                # Check if player already exists
                existing_player = db.query(Player).filter(
                    Player.nfl_id == player_data['nfl_id']
                ).first()
                
                if not existing_player:
                    # Create new player
                    player = Player(
                        id=str(uuid.uuid4()),
                        **player_data
                    )
                    db.add(player)
                    saved_count += 1
                else:
                    # Update existing player
                    for key, value in player_data.items():
                        if hasattr(existing_player, key):
                            setattr(existing_player, key, value)
                
            except Exception as e:
                logger.error(f"Error saving player {player_data.get('name')}: {str(e)}")
                continue
        
        db.commit()
        return saved_count
    
    async def get_players_by_position(self, db: Session, position: str) -> List[Player]:
        """Get players filtered by position"""
        return db.query(Player).filter(Player.position == position).all()
    
    async def search_players(self, db: Session, query: str) -> List[Player]:
        """Search players by name"""
        return db.query(Player).filter(
            Player.name.ilike(f"%{query}%")
        ).limit(50).all()
    
    async def get_player_by_id(self, db: Session, player_id: str) -> Optional[Player]:
        """Get player by ID"""
        return db.query(Player).filter(Player.id == player_id).first()

# Create sample data for development
async def create_sample_players(db: Session) -> List[Player]:
    """Create sample players for development/testing"""
    sample_players = [
        {
            'nfl_id': '1001',
            'name': 'Josh Allen',
            'position': 'QB',
            'team': 'BUF',
            'age': 28,
            'experience': 6,
            'height': '6-5',
            'weight': 237,
            'college': 'Wyoming'
        },
        {
            'nfl_id': '1002',
            'name': 'Christian McCaffrey',
            'position': 'RB',
            'team': 'SF',
            'age': 28,
            'experience': 7,
            'height': '5-11',
            'weight': 205,
            'college': 'Stanford'
        },
        {
            'nfl_id': '1003',
            'name': 'Tyreek Hill',
            'position': 'WR',
            'team': 'MIA',
            'age': 30,
            'experience': 8,
            'height': '5-10',
            'weight': 185,
            'college': 'West Alabama'
        },
        {
            'nfl_id': '1004',
            'name': 'Travis Kelce',
            'position': 'TE',
            'team': 'KC',
            'age': 35,
            'experience': 11,
            'height': '6-5',
            'weight': 250,
            'college': 'Cincinnati'
        }
    ]
    
    created_players = []
    for player_data in sample_players:
        # Check if player already exists
        existing = db.query(Player).filter(Player.nfl_id == player_data['nfl_id']).first()
        if not existing:
            player = Player(id=str(uuid.uuid4()), **player_data)
            db.add(player)
            created_players.append(player)
    
    db.commit()
    return created_players