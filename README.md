# FantasyEdge AI

AI-powered fantasy football analytics platform that predicts which NFL players will significantly outperform their historical stats in the upcoming season.

## Features

- 🤖 AI-powered player performance predictions
- 📊 Interactive analytics dashboard
- 🎯 Breakout player identification
- 📈 Historical accuracy tracking
- 👥 User watchlists and alerts

## Tech Stack

**Frontend:**
- Next.js 14 with TypeScript
- Tailwind CSS
- Prisma ORM
- NextAuth.js

**Backend:**
- Python FastAPI
- PostgreSQL
- Redis
- Scikit-learn/TensorFlow

**Infrastructure:**
- Docker & Docker Compose
- Apache Airflow (coming soon)

## Quick Start

1. **Clone and setup:**
   ```bash
   git clone <your-repo-url>
   cd fantasyedge-ai
   ```

2. **Start databases:**
   ```bash
   cd docker
   docker-compose up postgres redis -d
   ```

3. **Setup frontend:**
   ```bash
   cd frontend
   npm install
   npx prisma generate
   npx prisma db push
   npm run dev
   ```

4. **Setup backend:**
   ```bash
   cd backend
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

5. **Access applications:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## Development

See individual README files in `/frontend` and `/backend` directories for detailed development instructions.

## Environment Setup

Copy `.env.example` files to `.env` in both frontend and backend directories and update with your API keys.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request