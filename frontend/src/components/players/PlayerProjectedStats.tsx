import React from 'react';
import { Player } from '@/lib/hooks/usePlayers';
import { PlayerPrediction } from '@/lib/hooks/usePredictions';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Activity, Target } from 'lucide-react';

interface PlayerProjectedStatsProps {
  player: Player;
  prediction?: PlayerPrediction | null;
}

export default function PlayerProjectedStats({ player, prediction }: PlayerProjectedStatsProps) {
  if (!prediction?.projected_stats) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Projected Stats</h3>
        </div>
        <div className="text-center py-8">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No projected stats available</p>
        </div>
      </div>
    );
  }

  // Format stats based on position
  const formatStatName = (statKey: string): string => {
    return statKey
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .replace('Tds', 'TDs');
  };

  // Get relevant stats for charts
  const getChartData = () => {
    const stats = prediction.projected_stats;
    if (!stats) return [];

    // Convert stats to chart format, excluding fantasy_points
    return Object.entries(stats)
      .filter(([key]) => key !== 'fantasy_points')
      .map(([key, value]) => ({
        name: formatStatName(key),
        value: Number(value) || 0,
        shortName: key.replace(/_/g, ' ')
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // Show top 6 stats
  };

  const chartData = getChartData();

  // Calculate stat distribution for position
  const getStatDistribution = () => {
    const stats = prediction.projected_stats;
    if (!stats) return [];

    if (player.position === 'QB') {
      const passingYards = Number(stats.passing_yards) || 0;
      const rushingYards = Number(stats.rushing_yards) || 0;
      const total = passingYards + rushingYards;
      
      return [
        { name: 'Passing', value: passingYards, percentage: total > 0 ? (passingYards / total * 100).toFixed(1) : 0 },
        { name: 'Rushing', value: rushingYards, percentage: total > 0 ? (rushingYards / total * 100).toFixed(1) : 0 }
      ].filter(item => item.value > 0);
    } 
    
    if (player.position === 'RB') {
      const rushing = Number(stats.rushing_yards) || 0;
      const receiving = Number(stats.receiving_yards) || 0;
      const total = rushing + receiving;
      
      return [
        { name: 'Rushing', value: rushing, percentage: total > 0 ? (rushing / total * 100).toFixed(1) : 0 },
        { name: 'Receiving', value: receiving, percentage: total > 0 ? (receiving / total * 100).toFixed(1) : 0 }
      ].filter(item => item.value > 0);
    }
    
    if (['WR', 'TE'].includes(player.position)) {
      const yards = Number(stats.receiving_yards) || 0;
      const tds = (Number(stats.receiving_tds) || 0) * 20; // Weight TDs as 20 yards each for visualization
      const total = yards + tds;
      
      return [
        { name: 'Yards', value: yards, percentage: total > 0 ? (yards / total * 100).toFixed(1) : 0 },
        { name: 'TDs (x20)', value: tds, percentage: total > 0 ? (tds / total * 100).toFixed(1) : 0 }
      ].filter(item => item.value > 0);
    }

    return [];
  };

  const distributionData = getStatDistribution();

  // Position-specific stat highlights
  const getKeyStats = () => {
    const stats = prediction.projected_stats;
    if (!stats) return [];

    const keyStats = [];

    if (player.position === 'QB') {
      keyStats.push(
        { label: 'Passing Yards', value: stats.passing_yards || 0, icon: '🎯' },
        { label: 'Pass TDs', value: stats.passing_tds || 0, icon: '🏈' },
        { label: 'Interceptions', value: stats.interceptions || 0, icon: '❌' },
        { label: 'Rush Yards', value: stats.rushing_yards || 0, icon: '🏃' }
      );
    } else if (player.position === 'RB') {
      keyStats.push(
        { label: 'Rush Yards', value: stats.rushing_yards || 0, icon: '🏃' },
        { label: 'Rush TDs', value: stats.rushing_tds || 0, icon: '🏈' },
        { label: 'Receptions', value: stats.receptions || 0, icon: '🙌' },
        { label: 'Rec Yards', value: stats.receiving_yards || 0, icon: '📡' }
      );
    } else if (player.position === 'WR' || player.position === 'TE') {
      keyStats.push(
        { label: 'Receptions', value: stats.receptions || 0, icon: '🙌' },
        { label: 'Rec Yards', value: stats.receiving_yards || 0, icon: '📡' },
        { label: 'Rec TDs', value: stats.receiving_tds || 0, icon: '🏈' },
        { label: 'Targets', value: stats.targets || 0, icon: '🎯' }
      );
    }

    return keyStats;
  };

  const keyStats = getKeyStats();

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  return (
    <div className="space-y-6">
      {/* Key Stats Grid */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">2025 Projections</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {keyStats.map((stat, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <h4 className="text-md font-semibold text-gray-900">Statistical Breakdown</h4>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Distribution Chart */}
      {distributionData.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Production Split</h4>
          
          <div className="flex items-center justify-center">
            <div className="h-48 w-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                  >
                    {distributionData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value} yards`, name]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-4">
            {distributionData.map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span>{item.name}: {item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fantasy Scoring Breakdown */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-6">
        <h4 className="text-md font-semibold text-purple-900 mb-4">Fantasy Impact</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{prediction.predicted_points}</div>
            <div className="text-sm text-purple-700">PPG Projection</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(prediction.predicted_points * 17)}
            </div>
            <div className="text-sm text-blue-700">Season Total</div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-white rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Weekly Range Estimate</div>
          <div className="text-lg font-semibold text-gray-900">
            {Math.max(0, Math.round(prediction.predicted_points * 0.6))} - {Math.round(prediction.predicted_points * 1.4)} points
          </div>
        </div>
      </div>
    </div>
  );
}