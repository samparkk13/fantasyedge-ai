from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean, JSON, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Player(Base):
    __tablename__ = "players"
    
    id = Column(String, primary_key=True)
    nfl_id = Column(String, unique=True, index=True)
    name = Column(String, index=True)
    position = Column(String, index=True)
    team = Column(String, index=True)
    age = Column(Integer)
    experience = Column(Integer)
    height = Column(String)
    weight = Column(Integer)
    college = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    stats = relationship("PlayerStat", back_populates="player", cascade="all, delete-orphan")
    predictions = relationship("PlayerPrediction", back_populates="player", cascade="all, delete-orphan")

class PlayerStat(Base):
    __tablename__ = "player_stats"
    
    id = Column(String, primary_key=True)
    player_id = Column(String, ForeignKey("players.id"), index=True)
    season = Column(Integer, index=True)
    week = Column(Integer)
    
    # Passing stats
    passing_yards = Column(Integer)
    passing_tds = Column(Integer)
    interceptions = Column(Integer)
    passing_attempts = Column(Integer)
    passing_completions = Column(Integer)
    
    # Rushing stats
    rushing_yards = Column(Integer)
    rushing_tds = Column(Integer)
    rushing_attempts = Column(Integer)
    
    # Receiving stats
    receptions = Column(Integer)
    receiving_yards = Column(Integer)
    receiving_tds = Column(Integer)
    targets = Column(Integer)
    
    # Fantasy stats
    fantasy_points = Column(Float)
    fantasy_points_ppr = Column(Float)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    player = relationship("Player", back_populates="stats")

class PlayerPrediction(Base):
    __tablename__ = "player_predictions"
    
    id = Column(String, primary_key=True)
    player_id = Column(String, ForeignKey("players.id"), index=True)
    season = Column(Integer, index=True)
    
    predicted_points = Column(Float)
    confidence = Column(Float)
    reasoning = Column(String)
    
    # Prediction components
    projected_stats = Column(JSON)
    breakout_score = Column(Float)
    bust_risk = Column(Float)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    player = relationship("Player", back_populates="predictions")

# Create all tables
def create_tables():
    Base.metadata.create_all(bind=engine)

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()