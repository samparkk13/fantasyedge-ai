import React from 'react';
import { Player } from '@/lib/hooks/usePlayers';
import { PlayerPrediction } from '@/lib/hooks/usePredictions';
import { User, MapPin, Calendar, GraduationCap, TrendingUp, Activity, Zap, AlertTriangle, Target } from 'lucide-react';

interface PlayerDetailHeaderProps {
  player: Player;
  prediction?: PlayerPrediction | null;
}

const positionColors = {
  QB: 'bg-red-500',
  RB: 'bg-green-500', 
  WR: 'bg-blue-500',
  TE: 'bg-purple-500',
  K: 'bg-yellow-500',
  DST: 'bg-gray-500',
};

const teamColors: Record<string, string> = {
  BUF: 'bg-blue-600',
  KC: 'bg-red-600',
  SF: 'bg-red-500',
  MIA: 'bg-teal-500',
  // Add more teams as needed
};

export default function PlayerDetailHeader({ player, prediction }: PlayerDetailHeaderProps) {
  const positionColor = positionColors[player.position as keyof typeof positionColors] || positionColors.DST;
  const teamColor = teamColors[player.team] || 'bg-gray-600';

  const getGradeFromScore = (score: number) => {
    if (score >= 0.8) return { grade: 'A+', color: 'text-green-600' };
    if (score >= 0.7) return { grade: 'A', color: 'text-green-600' };
    if (score >= 0.6) return { grade: 'B+', color: 'text-green-500' };
    if (score >= 0.5) return { grade: 'B', color: 'text-yellow-600' };
    if (score >= 0.4) return { grade: 'C+', color: 'text-yellow-500' };
    return { grade: 'C', color: 'text-red-500' };
  };

  return (
    <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8 text-white">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        {/* Left Side - Player Info */}
        <div className="flex items-center gap-6 mb-6 lg:mb-0">
          {/* Player Avatar */}
          <div className={`w-24 h-24 rounded-full ${teamColor} flex items-center justify-center text-white text-2xl font-bold shadow-lg`}>
            {player.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>

          {/* Player Details */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{player.name}</h1>
              {prediction && prediction.breakout_score >= 0.7 && (
                <div className="bg-green-500 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                  <Zap className="h-4 w-4" />
                  BREAKOUT CANDIDATE
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              <span className={`${positionColor} px-4 py-2 rounded-lg text-white font-semibold text-lg`}>
                {player.position}
              </span>
              <span className="text-xl font-semibold text-gray-300">{player.team}</span>
            </div>

            <div className="flex items-center gap-6 text-gray-300">
              {player.age && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{player.age} years old</span>
                </div>
              )}
              {player.experience !== undefined && (
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  <span>{player.experience} years exp</span>
                </div>
              )}
              {player.college && (
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  <span>{player.college}</span>
                </div>
              )}
            </div>

            {player.height && player.weight && (
              <div className="mt-2 text-gray-300">
                <span>{player.height}, {player.weight} lbs</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Prediction Summary */}
        {prediction && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 lg:min-w-96">
            <div className="text-center mb-4">
              <div className="text-4xl font-bold text-white mb-1">
                {prediction.predicted_points}
              </div>
              <div className="text-gray-300">Predicted PPG</div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* Confidence */}
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {Math.round(prediction.confidence * 100)}%
                </div>
                <div className="text-xs text-gray-300">Confidence</div>
              </div>

              {/* Breakout Score */}
              <div className="text-center">
                <div className={`text-2xl font-bold ${getGradeFromScore(prediction.breakout_score).color}`}>
                  {getGradeFromScore(prediction.breakout_score).grade}
                </div>
                <div className="text-xs text-gray-300">Breakout Grade</div>
              </div>

              {/* Risk Level */}
              <div className="text-center">
                <div className={`text-2xl font-bold ${
                  prediction.bust_risk >= 0.6 ? 'text-red-400' :
                  prediction.bust_risk >= 0.3 ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {prediction.bust_risk >= 0.6 ? 'HIGH' :
                   prediction.bust_risk >= 0.3 ? 'MED' : 'LOW'}
                </div>
                <div className="text-xs text-gray-300">Risk</div>
              </div>
            </div>

            {/* Quick Analysis */}
            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium">AI Analysis</span>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                {prediction.reasoning}
              </p>
            </div>
          </div>
        )}

        {/* No Prediction State */}
        {!prediction && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Prediction Available</h3>
            <p className="text-gray-300 text-sm">
              Generate predictions to see AI analysis for this player
            </p>
          </div>
        )}
      </div>
    </div>
  );
}