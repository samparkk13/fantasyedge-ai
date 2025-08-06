import React from 'react';
import { useBreakoutCandidates } from '@/lib/hooks/usePredictions';
import PredictionCard from './PredictionCard';
import { TrendingUp, Zap, Target } from 'lucide-react';

export default function BreakoutCandidates() {
  const { candidates, loading, error } = useBreakoutCandidates();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-900">Breakout Candidates</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm border animate-pulse">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-900">Breakout Candidates</h2>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error: {error}</p>
          <p className="text-sm text-red-500 mt-1">
            Make sure you have generated predictions first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Breakout Candidates</h2>
            <p className="text-gray-600">
              Players with high breakout potential for 2025
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span>{candidates.length} candidates found</span>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            <h3 className="font-medium text-green-900">High Breakout Score</h3>
          </div>
          <p className="text-sm text-green-700 mt-1">
            Players with 60%+ breakout probability based on AI analysis
          </p>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <h3 className="font-medium text-blue-900">Prime Candidates</h3>
          </div>
          <p className="text-sm text-blue-700 mt-1">
            Young players entering their statistical prime years
          </p>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-600" />
            <h3 className="font-medium text-purple-900">Value Plays</h3>
          </div>
          <p className="text-sm text-purple-700 mt-1">
            Potential league-winners being drafted below their ceiling
          </p>
        </div>
      </div>

      {/* Candidates Grid */}
      {candidates.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <TrendingUp className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No breakout candidates found</h3>
          <p className="text-gray-600 mb-4">
            Generate predictions first to see potential breakout players.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((prediction) => (
            <div key={prediction.id} className="relative">
              {/* Breakout Badge */}
              {prediction.breakout_score >= 0.8 && (
                <div className="absolute -top-2 -right-2 z-10">
                  <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    HOT
                  </div>
                </div>
              )}
              <PredictionCard prediction={prediction} />
            </div>
          ))}
        </div>
      )}

      {/* Footer Info */}
      {candidates.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">How We Identify Breakouts</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• <strong>Age Analysis:</strong> Players entering their statistical prime (typically 24-28)</p>
            <p>• <strong>Experience Windows:</strong> Years 2-4 when players typically break out</p>
            <p>• <strong>Team Context:</strong> Improved offensive situations and opportunity</p>
            <p>• <strong>Historical Patterns:</strong> Similar player archetypes who broke out</p>
          </div>
        </div>
      )}
    </div>
  );
}