import React from 'react';
import { Player } from '@/lib/hooks/usePlayers';
import { PlayerPrediction } from '@/lib/hooks/usePredictions';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';
import { TrendingUp, Target, Activity, AlertTriangle, Zap, Brain } from 'lucide-react';

interface PlayerPredictionAnalysisProps {
  player: Player;
  prediction?: PlayerPrediction | null;
}

export default function PlayerPredictionAnalysis({ player, prediction }: PlayerPredictionAnalysisProps) {
  if (!prediction) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No AI Analysis Available</h3>
        <p className="text-gray-600">
          Generate predictions to see detailed AI analysis for {player.name}
        </p>
      </div>
    );
  }

  // Generate comparison data for charts
  const positionAverages = {
    QB: { avg: 18.5, range: [12, 28] },
    RB: { avg: 12.8, range: [6, 24] },
    WR: { avg: 11.2, range: [4, 22] },
    TE: { avg: 8.4, range: [3, 16] },
    K: { avg: 7.5, range: [5, 12] },
    DST: { avg: 8.2, range: [4, 14] }
  };

  const positionAvg = positionAverages[player.position as keyof typeof positionAverages]?.avg || 10;
  
  const comparisonData = [
    {
      name: `Position Avg (${player.position})`,
      points: positionAvg,
      fill: '#E5E7EB'
    },
    {
      name: player.name,
      points: prediction.predicted_points,
      fill: prediction.predicted_points > positionAvg ? '#10B981' : '#F59E0B'
    }
  ];

  // Generate confidence breakdown
  const confidenceFactors = [
    {
      factor: 'Age Profile',
      score: player.age && player.age <= 27 ? 0.8 : player.age && player.age <= 30 ? 0.6 : 0.4,
      description: player.age ? `${player.age} years old` : 'Age unknown'
    },
    {
      factor: 'Experience',
      score: player.experience && player.experience >= 2 && player.experience <= 5 ? 0.9 : 0.6,
      description: `${player.experience || 0} NFL seasons`
    },
    {
      factor: 'Team Context', 
      score: ['BUF', 'KC', 'SF', 'MIA'].includes(player.team) ? 0.8 : 0.6,
      description: `${player.team} offensive system`
    },
    {
      factor: 'Position Value',
      score: ['QB', 'RB', 'WR'].includes(player.position) ? 0.8 : 0.6,
      description: `${player.position} fantasy relevance`
    }
  ];

  // Generate risk assessment data
  const riskFactors = [
    {
      name: 'Injury Risk',
      value: player.position === 'RB' ? 0.7 : player.position === 'QB' ? 0.3 : 0.5,
      color: '#EF4444'
    },
    {
      name: 'Age Decline',
      value: player.age && player.age >= 30 ? 0.8 : player.age && player.age >= 28 ? 0.4 : 0.2,
      color: '#F59E0B'
    },
    {
      name: 'Competition',
      value: 0.4,
      color: '#8B5CF6'
    },
    {
      name: 'Team Changes',
      value: 0.3,
      color: '#06B6D4'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Prediction Overview */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">AI Prediction Analysis</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{prediction.predicted_points}</div>
            <div className="text-sm text-blue-700">Predicted PPG</div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">{Math.round(prediction.confidence * 100)}%</div>
            <div className="text-sm text-green-700">Confidence</div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">{Math.round(prediction.breakout_score * 100)}%</div>
            <div className="text-sm text-purple-700">Breakout Score</div>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-600">{Math.round(prediction.bust_risk * 100)}%</div>
            <div className="text-sm text-orange-700">Bust Risk</div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2">Key Insights</h4>
          <p className="text-gray-700">{prediction.reasoning}</p>
        </div>
      </div>

      {/* Performance Comparison */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Position Comparison</h3>
        </div>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="points" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>
            {prediction.predicted_points > positionAvg ? 
              `${(((prediction.predicted_points - positionAvg) / positionAvg) * 100).toFixed(1)}% above position average` :
              `${(((positionAvg - prediction.predicted_points) / positionAvg) * 100).toFixed(1)}% below position average`
            }
          </span>
        </div>
      </div>

      {/* Confidence Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Confidence Factors</h3>
        </div>

        <div className="space-y-4">
          {confidenceFactors.map((factor, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900">{factor.factor}</span>
                  <span className="text-sm text-gray-600">{Math.round(factor.score * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      factor.score >= 0.8 ? 'bg-green-500' :
                      factor.score >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${factor.score * 100}%` }}
                  />
                </div>
                <div className="text-sm text-gray-600 mt-1">{factor.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-900">Risk Assessment</h3>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={riskFactors} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 1]} />
              <YAxis type="category" dataKey="name" width={100} />
              <Tooltip formatter={(value: any) => `${Math.round(value * 100)}%`} />
              <Bar dataKey="value" fill="#F59E0B" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <span className="font-medium text-yellow-900">Risk Summary</span>
          </div>
          <p className="text-sm text-yellow-800">
            Overall risk level: <strong>{
              prediction.bust_risk >= 0.6 ? 'High' :
              prediction.bust_risk >= 0.3 ? 'Moderate' : 'Low'
            }</strong>
            {prediction.bust_risk >= 0.5 && 
              ` - Consider handcuff options or backup plans at this position.`
            }
          </p>
        </div>
      </div>
    </div>
  );
}