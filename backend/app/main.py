from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from app.models.database import create_tables
from app.routers.players import router as players_router
from app.routers.predictions import router as predictions_router

# Load environment variables
load_dotenv()

app = FastAPI(
    title="FantasyEdge AI API",
    description="AI-powered fantasy football analytics platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables on startup
@app.on_event("startup")
async def startup_event():
    create_tables()

# Include routers
app.include_router(players_router, prefix="/api")
app.include_router(predictions_router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "FantasyEdge AI API is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}

@app.get("/api")
async def api_root():
    return {"message": "FantasyEdge AI API v1.0.0", "docs": "/docs"}