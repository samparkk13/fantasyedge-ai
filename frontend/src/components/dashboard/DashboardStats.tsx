import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { usePositionStats } from '@/lib/hooks/usePlayers';
import { usePredictionSummary, generateAllPredictions } from '@/lib/hooks/usePredictions';
import { Users, TrendingUp, Target, Activity, Zap, AlertTriangle } from 'lucide-react';

export default function DashboardStats() {
  const { stats, loading: playersLoading, error: playersError } = usePositionStats();
  const { summary, loading: predictionsLoading, error: predictionsError } = usePredictionSummary();
  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleGeneratePredictions = async () => {
    try {
      setIsGenerating(true);
      await generateAllPredictions();
      // Reload page to show updated stats
      window.location.reload();
    } catch (error) {
      console.error('Failed to generate predictions:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (playersLoading || predictionsLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm border animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (playersError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
        <p className="text-red-600">Error loading stats: {playersError}</p>
      </div>
    );
  }

  const chartData = stats?.position_stats?.map(stat => ({
    position: stat.position,
    count: stat.count
  })) || [];

  // Show generate predictions button if no predictions exist
  const showGenerateButton = summary?.total_predictions === 0;

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
        <StatCard
          title="Total Players"
          value={stats?.total_players || 0}
          icon={<Users className="h-6 w-6" />}
          color="blue"
        />
        
        <StatCard
          title="Positions"
          value={stats?.position_stats?.length || 0}
          icon={<Target className="h-6 w-6" />}
          color="green"
        />
        
        <StatCard
          title="Predictions"
          value={summary?.total_predictions || 0}
          icon={<Activity className="h-6 w-6" />}
          color="purple"
        />
        
        <StatCard
          title="Avg Confidence"
          value={summary?.avg_confidence ? `${Math.round(summary.avg_confidence * 100)}%` : 'N/A'}
          icon={<TrendingUp className="h-6 w-6" />}
          color="orange"
          isString
        />

        <StatCard
          title="Breakout Candidates"
          value={summary?.breakout_candidates || 0}
          icon={<Zap className="h-6 w-6" />}
          color="green"
        />

        <StatCard
          title="Bust Risks"
          value={summary?.bust_risks || 0}
          icon={<AlertTriangle className="h-6 w-6" />}
          color="red"
        />
      </div>

      {/* Generate Predictions CTA */}
      {showGenerateButton && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">Ready to See AI Predictions?</h3>
              <p className="text-blue-100">
                Generate AI-powered breakout predictions for all {stats?.total_players || 0} players
              </p>
            </div>
            <button
              onClick={handleGeneratePredictions}
              disabled={isGenerating}
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Activity className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Generate Predictions
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Position Distribution Chart */}
        {chartData.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Player Distribution by Position
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="position" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Prediction Confidence Distribution */}
        {summary && summary.total_predictions > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Prediction Confidence
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'High Confidence', value: summary.high_confidence_count, color: '#10B981' },
                      { name: 'Medium Confidence', value: summary.total_predictions - summary.high_confidence_count, color: '#F59E0B' }
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    <Cell fill="#10B981" />
                    <Cell fill="#F59E0B" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  isString?: boolean;
}

function StatCard({ title, value, icon, color, isString = false }: StatCardProps) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    purple: 'text-purple-600 bg-purple-100',
    orange: 'text-orange-600 bg-orange-100',
    red: 'text-red-600 bg-red-100',
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">
            {isString ? value : typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        </div>
      </div>
    </div>
  );
}
// import React from 'react';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// import { usePositionStats } from '@/lib/hooks/usePlayers';
// import { Users, TrendingUp, Target, Activity } from 'lucide-react';

// export default function DashboardStats() {
//   const { stats, loading, error } = usePositionStats();

//   if (loading) {
//     return (
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//         {[...Array(4)].map((_, i) => (
//           <div key={i} className="bg-white p-6 rounded-lg shadow-sm border animate-pulse">
//             <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
//             <div className="h-8 bg-gray-200 rounded w-1/2"></div>
//           </div>
//         ))}
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
//         <p className="text-red-600">Error loading stats: {error}</p>
//       </div>
//     );
//   }

//   const chartData = stats?.position_stats?.map(stat => ({
//     position: stat.position,
//     count: stat.count
//   })) || [];

//   return (
//     <>
//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//         <StatCard
//           title="Total Players"
//           value={stats?.total_players || 0}
//           icon={<Users className="h-6 w-6" />}
//           color="blue"
//         />
        
//         <StatCard
//           title="Positions"
//           value={stats?.position_stats?.length || 0}
//           icon={<Target className="h-6 w-6" />}
//           color="green"
//         />
        
//         <StatCard
//           title="Predictions Ready"
//           value="Coming Soon"
//           icon={<TrendingUp className="h-6 w-6" />}
//           color="purple"
//           isString
//         />
        
//         <StatCard
//           title="Data Quality"
//           value="98%"
//           icon={<Activity className="h-6 w-6" />}
//           color="orange"
//           isString
//         />
//       </div>

//       {/* Position Distribution Chart */}
//       {chartData.length > 0 && (
//         <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
//           <h3 className="text-lg font-semibold text-gray-900 mb-4">
//             Player Distribution by Position
//           </h3>
//           <div className="h-64">
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart data={chartData}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="position" />
//                 <YAxis />
//                 <Tooltip />
//                 <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

// interface StatCardProps {
//   title: string;
//   value: number | string;
//   icon: React.ReactNode;
//   color: 'blue' | 'green' | 'purple' | 'orange';
//   isString?: boolean;
// }

// function StatCard({ title, value, icon, color, isString = false }: StatCardProps) {
//   const colorClasses = {
//     blue: 'text-blue-600 bg-blue-100',
//     green: 'text-green-600 bg-green-100',
//     purple: 'text-purple-600 bg-purple-100',
//     orange: 'text-orange-600 bg-orange-100',
//   };

//   return (
//     <div className="bg-white p-6 rounded-lg shadow-sm border">
//       <div className="flex items-center">
//         <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
//           {icon}
//         </div>
//         <div className="ml-4">
//           <p className="text-sm font-medium text-gray-600">{title}</p>
//           <p className="text-2xl font-semibold text-gray-900">
//             {isString ? value : typeof value === 'number' ? value.toLocaleString() : value}
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }