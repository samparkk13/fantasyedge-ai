'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import DashboardStats from '@/components/dashboard/DashboardStats';
import PlayersList from '@/components/players/PlayersList';
import BreakoutCandidates from '@/components/predictions/BreakoutCandidates';
import { usePredictionSummary } from '@/lib/hooks/usePredictions';

export default function HomePage() {
  const { summary } = usePredictionSummary();
  const hasPredictions = summary && summary.total_predictions > 0;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">
            Welcome to FantasyEdge AI
          </h1>
          <p className="text-blue-100 text-lg">
            AI-powered fantasy football analytics to help you dominate your league
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="bg-white/20 rounded-lg p-4">
              <h3 className="font-semibold mb-1">Player Analysis</h3>
              <p className="text-sm text-blue-100">
                Comprehensive player database with detailed stats
              </p>
            </div>
            <div className="bg-white/20 rounded-lg p-4">
              <h3 className="font-semibold mb-1">Breakout Predictions</h3>
              <p className="text-sm text-blue-100">
                AI-powered predictions for upcoming season performance
              </p>
            </div>
            <div className="bg-white/20 rounded-lg p-4">
              <h3 className="font-semibold mb-1">Draft Assistance</h3>
              <p className="text-sm text-blue-100">
                Get the edge you need for draft day success
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard Stats */}
        <DashboardStats />

        {/* Breakout Candidates Section (only show if predictions exist) */}
        {hasPredictions && <BreakoutCandidates />}

        {/* Players Section */}
        <PlayersList />
      </div>
    </DashboardLayout>
  );
}