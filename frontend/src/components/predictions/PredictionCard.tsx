import React from 'react';
import { PlayerPrediction } from '@/lib/hooks/usePredictions';
import { TrendingUp, TrendingDown, Target, AlertTriangle, Activity } from 'lucide-react';

interface PredictionCardProps {
  prediction: PlayerPrediction;
}

const positionColors = {
  QB: 'bg-red-100 text-red-800 border-red-200',
  RB: 'bg-green-100 text-green-800 border-green-200',
  WR: 'bg-blue-100 text-blue-800 border-blue-200',
  TE: 'bg-purple-100 text-purple-800 border-purple-200',
  K: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  DST: 'bg-gray-100 text-gray-800 border-gray-200',
};

export default function PredictionCard({ prediction }: PredictionCardProps) {
  const positionColor = positionColors[prediction.player_position as keyof typeof positionColors] || positionColors.DST;

  const getBreakoutColor = (score: number) => {
    if (score >= 0.7) return 'text-green-600 bg-green-50';
    if (score >= 0.4) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getBustRiskColor = (risk: number) => {
    if (risk >= 0.6) return 'text-red-600 bg-red-50';
    if (risk >= 0.3) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{prediction.player_name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${positionColor}`}>
              {prediction.player_position}
            </span>
            <span className="text-sm text-gray-600">{prediction.player_team}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">
            {prediction.predicted_points}
          </div>
          <div className="text-xs text-gray-500">PPG</div>
        </div>
      </div>

      {/* Prediction Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Confidence */}
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-gray-400" />
          <div>
            <div className="text-xs text-gray-500">Confidence</div>
            <div className={`text-sm font-medium ${getConfidenceColor(prediction.confidence)}`}>
              {Math.round(prediction.confidence * 100)}%
            </div>
          </div>
        </div>

        {/* Breakout Score */}
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-gray-400" />
          <div>
            <div className="text-xs text-gray-500">Breakout</div>
            <div className={`text-sm font-medium px-2 py-1 rounded ${getBreakoutColor(prediction.breakout_score)}`}>
              {Math.round(prediction.breakout_score * 100)}%
            </div>
          </div>
        </div>
      </div>

      {/* Bust Risk */}
      {prediction.bust_risk > 0.3 && (
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-gray-400" />
            <div className="flex-1">
              <div className="text-xs text-gray-500">Bust Risk</div>
              <div className={`text-sm font-medium px-2 py-1 rounded inline-block ${getBustRiskColor(prediction.bust_risk)}`}>
                {Math.round(prediction.bust_risk * 100)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reasoning */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-xs text-gray-500 mb-1">AI Analysis</div>
        <p className="text-sm text-gray-700 leading-relaxed">
          {prediction.reasoning}
        </p>
      </div>

      {/* Projected Stats */}
      {prediction.projected_stats && (
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-2">Projected Stats</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(prediction.projected_stats).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-gray-600 capitalize">
                  {key.replace(/_/g, ' ')}:
                </span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4 border-t border-gray-100">
        <button className="flex-1 bg-blue-50 text-blue-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors">
          View Details
        </button>
        {prediction.breakout_score >= 0.6 && (
          <button className="px-3 py-2 bg-green-50 text-green-700 rounded-md text-sm font-medium hover:bg-green-100 transition-colors">
            <Target className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}