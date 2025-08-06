'use client';

import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PlayerDetailHeader from '@/components/players/PlayerDetailHeader';
import PlayerPredictionAnalysis from '@/components/players/PlayerPredictionAnalysis';
import PlayerProjectedStats from '@/components/players/PlayerProjectedStats';
import PlayerInsights from '@/components/players/PlayerInsights';
import { usePlayers } from '@/lib/hooks/usePlayers';
import { usePlayerPrediction } from '@/lib/hooks/usePredictions';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function PlayerDetailPage() {
  const params = useParams();
  const playerId = params?.id as string;
  
  const { data: playersData, loading: playersLoading } = usePlayers();
  const { prediction, loading: predictionLoading } = usePlayerPrediction(playerId);
  
  const player = playersData?.players.find(p => p.id === playerId);

  if (playersLoading || predictionLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading player analysis...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!player) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Player Not Found</h2>
          <p className="text-gray-600 mb-6">The requested player could not be found.</p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Back Navigation */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        {/* Player Header */}
        <PlayerDetailHeader player={player} prediction={prediction} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Prediction Analysis */}
          <div className="lg:col-span-2 space-y-8">
            <PlayerPredictionAnalysis player={player} prediction={prediction} />
          </div>

          {/* Right Column - Stats and Insights */}
          <div className="space-y-8">
            <PlayerProjectedStats player={player} prediction={prediction} />
            <PlayerInsights player={player} prediction={prediction} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}