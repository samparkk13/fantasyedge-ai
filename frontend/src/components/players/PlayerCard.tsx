import React from 'react';
import Link from 'next/link';
import { Player } from '@/lib/hooks/usePlayers';
import { usePlayerPrediction } from '@/lib/hooks/usePredictions';
import { User, MapPin, Calendar, GraduationCap, TrendingUp, Activity, Zap, AlertTriangle, ArrowRight } from 'lucide-react';

interface PlayerCardProps {
  player: Player;
}

const positionColors = {
  QB: 'bg-red-100 text-red-800 border-red-200',
  RB: 'bg-green-100 text-green-800 border-green-200',
  WR: 'bg-blue-100 text-blue-800 border-blue-200',
  TE: 'bg-purple-100 text-purple-800 border-purple-200',
  K: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  DST: 'bg-gray-100 text-gray-800 border-gray-200',
};

export default function PlayerCard({ player }: PlayerCardProps) {
  const { prediction, loading: predictionLoading } = usePlayerPrediction(player.id);
  const positionColor = positionColors[player.position as keyof typeof positionColors] || positionColors.DST;

  const getBreakoutColor = (score: number) => {
    if (score >= 0.7) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 0.4) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getBustRiskColor = (risk: number) => {
    if (risk >= 0.6) return 'text-red-600 bg-red-50 border-red-200';
    if (risk >= 0.3) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
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
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{player.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${positionColor}`}>
              {player.position}
            </span>
            <span className="text-sm text-gray-600">{player.team}</span>
            {/* Breakout Badge */}
            {prediction && prediction.breakout_score >= 0.7 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                <Zap className="h-3 w-3 mr-1" />
                BREAKOUT
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          {prediction ? (
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {prediction.predicted_points}
              </div>
              <div className="text-xs text-gray-500">PPG</div>
            </div>
          ) : (
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-gray-600" />
            </div>
          )}
        </div>
      </div>

      {/* AI Prediction Section */}
      {prediction && !predictionLoading && (
        <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">AI Analysis</span>
            <span className={`text-xs font-medium ${getConfidenceColor(prediction.confidence)}`}>
              {Math.round(prediction.confidence * 100)}% confidence
            </span>
          </div>
          
          <p className="text-sm text-gray-700 mb-2">
            {prediction.reasoning}
          </p>

          <div className="flex items-center gap-4">
            {prediction.breakout_score > 0.3 && (
              <div className={`px-2 py-1 rounded text-xs font-medium border ${getBreakoutColor(prediction.breakout_score)}`}>
                <TrendingUp className="h-3 w-3 inline mr-1" />
                {Math.round(prediction.breakout_score * 100)}% Breakout
              </div>
            )}
            
            {prediction.bust_risk > 0.3 && (
              <div className={`px-2 py-1 rounded text-xs font-medium border ${getBustRiskColor(prediction.bust_risk)}`}>
                <AlertTriangle className="h-3 w-3 inline mr-1" />
                {Math.round(prediction.bust_risk * 100)}% Risk
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading state for predictions */}
      {predictionLoading && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      )}

      {/* Player Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {player.age && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">Age: {player.age}</span>
          </div>
        )}
        
        {player.experience !== undefined && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">Exp: {player.experience}y</span>
          </div>
        )}
        
        {player.college && (
          <div className="flex items-center gap-2 col-span-2">
            <GraduationCap className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">{player.college}</span>
          </div>
        )}
        
        {player.height && player.weight && (
          <div className="col-span-2">
            <span className="text-sm text-gray-600">
              {player.height}, {player.weight} lbs
            </span>
          </div>
        )}
      </div>

      {/* Projected Stats */}
      {prediction && prediction.projected_stats && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500 mb-2">2025 Projections</div>
          <div className="grid grid-cols-2 gap-1 text-xs">
            {Object.entries(prediction.projected_stats)
              .slice(0, 4) // Show only first 4 stats
              .map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-gray-600 capitalize">
                  {key.replace(/_/g, ' ').replace('tds', 'TDs')}:
                </span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Button - Now links to detail page */}
      <div className="pt-4 border-t border-gray-100">
        <Link 
          href={`/players/${player.id}`}
          className="w-full bg-blue-50 text-blue-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
        >
          View Full Analysis
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
// import React from 'react';
// import { Player } from '@/lib/hooks/usePlayers';
// import { usePlayerPrediction } from '@/lib/hooks/usePredictions';
// import { User, MapPin, Calendar, GraduationCap, TrendingUp, Activity, Zap, AlertTriangle } from 'lucide-react';

// interface PlayerCardProps {
//   player: Player;
// }

// const positionColors = {
//   QB: 'bg-red-100 text-red-800 border-red-200',
//   RB: 'bg-green-100 text-green-800 border-green-200',
//   WR: 'bg-blue-100 text-blue-800 border-blue-200',
//   TE: 'bg-purple-100 text-purple-800 border-purple-200',
//   K: 'bg-yellow-100 text-yellow-800 border-yellow-200',
//   DST: 'bg-gray-100 text-gray-800 border-gray-200',
// };

// export default function PlayerCard({ player }: PlayerCardProps) {
//   const { prediction, loading: predictionLoading } = usePlayerPrediction(player.id);
//   const positionColor = positionColors[player.position as keyof typeof positionColors] || positionColors.DST;

//   const getBreakoutColor = (score: number) => {
//     if (score >= 0.7) return 'text-green-600 bg-green-50 border-green-200';
//     if (score >= 0.4) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
//     return 'text-gray-600 bg-gray-50 border-gray-200';
//   };

//   const getBustRiskColor = (risk: number) => {
//     if (risk >= 0.6) return 'text-red-600 bg-red-50 border-red-200';
//     if (risk >= 0.3) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
//     return 'text-green-600 bg-green-50 border-green-200';
//   };

//   const getConfidenceColor = (confidence: number) => {
//     if (confidence >= 0.8) return 'text-green-600';
//     if (confidence >= 0.6) return 'text-yellow-600';
//     return 'text-red-600';
//   };

//   return (
//     <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
//       {/* Header */}
//       <div className="flex items-start justify-between mb-4">
//         <div>
//           <h3 className="text-lg font-semibold text-gray-900">{player.name}</h3>
//           <div className="flex items-center gap-2 mt-1">
//             <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${positionColor}`}>
//               {player.position}
//             </span>
//             <span className="text-sm text-gray-600">{player.team}</span>
//             {/* Breakout Badge */}
//             {prediction && prediction.breakout_score >= 0.7 && (
//               <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
//                 <Zap className="h-3 w-3 mr-1" />
//                 BREAKOUT
//               </span>
//             )}
//           </div>
//         </div>
//         <div className="text-right">
//           {prediction ? (
//             <div>
//               <div className="text-2xl font-bold text-gray-900">
//                 {prediction.predicted_points}
//               </div>
//               <div className="text-xs text-gray-500">PPG</div>
//             </div>
//           ) : (
//             <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
//               <User className="h-6 w-6 text-gray-600" />
//             </div>
//           )}
//         </div>
//       </div>

//       {/* AI Prediction Section */}
//       {prediction && !predictionLoading && (
//         <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
//           <div className="flex items-center gap-2 mb-2">
//             <TrendingUp className="h-4 w-4 text-blue-600" />
//             <span className="text-sm font-medium text-blue-900">AI Analysis</span>
//             <span className={`text-xs font-medium ${getConfidenceColor(prediction.confidence)}`}>
//               {Math.round(prediction.confidence * 100)}% confidence
//             </span>
//           </div>
          
//           <p className="text-sm text-gray-700 mb-2">
//             {prediction.reasoning}
//           </p>

//           <div className="flex items-center gap-4">
//             {prediction.breakout_score > 0.3 && (
//               <div className={`px-2 py-1 rounded text-xs font-medium border ${getBreakoutColor(prediction.breakout_score)}`}>
//                 <TrendingUp className="h-3 w-3 inline mr-1" />
//                 {Math.round(prediction.breakout_score * 100)}% Breakout
//               </div>
//             )}
            
//             {prediction.bust_risk > 0.3 && (
//               <div className={`px-2 py-1 rounded text-xs font-medium border ${getBustRiskColor(prediction.bust_risk)}`}>
//                 <AlertTriangle className="h-3 w-3 inline mr-1" />
//                 {Math.round(prediction.bust_risk * 100)}% Risk
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Loading state for predictions */}
//       {predictionLoading && (
//         <div className="mb-4 p-3 bg-gray-50 rounded-lg animate-pulse">
//           <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
//           <div className="h-3 bg-gray-200 rounded w-1/2"></div>
//         </div>
//       )}

//       {/* Player Stats Grid */}
//       <div className="grid grid-cols-2 gap-4 mb-4">
//         {player.age && (
//           <div className="flex items-center gap-2">
//             <Calendar className="h-4 w-4 text-gray-400" />
//             <span className="text-sm text-gray-600">Age: {player.age}</span>
//           </div>
//         )}
        
//         {player.experience !== undefined && (
//           <div className="flex items-center gap-2">
//             <MapPin className="h-4 w-4 text-gray-400" />
//             <span className="text-sm text-gray-600">Exp: {player.experience}y</span>
//           </div>
//         )}
        
//         {player.college && (
//           <div className="flex items-center gap-2 col-span-2">
//             <GraduationCap className="h-4 w-4 text-gray-400" />
//             <span className="text-sm text-gray-600">{player.college}</span>
//           </div>
//         )}
        
//         {player.height && player.weight && (
//           <div className="col-span-2">
//             <span className="text-sm text-gray-600">
//               {player.height}, {player.weight} lbs
//             </span>
//           </div>
//         )}
//       </div>

//       {/* Projected Stats */}
//       {prediction && prediction.projected_stats && (
//         <div className="mb-4 p-3 bg-gray-50 rounded-lg">
//           <div className="text-xs text-gray-500 mb-2">2025 Projections</div>
//           <div className="grid grid-cols-2 gap-1 text-xs">
//             {Object.entries(prediction.projected_stats)
//               .slice(0, 4) // Show only first 4 stats
//               .map(([key, value]) => (
//               <div key={key} className="flex justify-between">
//                 <span className="text-gray-600 capitalize">
//                   {key.replace(/_/g, ' ').replace('tds', 'TDs')}:
//                 </span>
//                 <span className="font-medium">{value}</span>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Action Button */}
//       <div className="pt-4 border-t border-gray-100">
//         <button className="w-full bg-blue-50 text-blue-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors">
//           View Full Analysis
//         </button>
//       </div>
//     </div>
//   );
// }