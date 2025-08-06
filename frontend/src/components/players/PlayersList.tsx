import React, { useState } from 'react';
import { usePlayers, createSamplePlayers } from '@/lib/hooks/usePlayers';
import PlayerCard from './PlayerCard';
import { Search, Filter, Plus, RefreshCw } from 'lucide-react';

export default function PlayersList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const { data, loading, error, refetch } = usePlayers({
    search: searchTerm || undefined,
    position: selectedPosition || undefined,
    limit: 20
  });

  const handleCreateSample = async () => {
    try {
      setIsCreating(true);
      await createSamplePlayers();
      refetch();
    } catch (error) {
      console.error('Failed to create sample players:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const positions = ['QB', 'RB', 'WR', 'TE', 'K', 'DST'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Players</h2>
          <p className="text-gray-600 mt-1">
            {data?.total ? `${data.total} players available` : 'Loading players...'}
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleCreateSample}
            disabled={isCreating}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isCreating ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Create Sample Data
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search players..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Position Filter */}
          <div className="relative">
            <Filter className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">All Positions</option>
              {positions.map(pos => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Players Grid */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm border animate-pulse">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error: {error}</p>
          <button 
            onClick={refetch}
            className="mt-2 text-red-700 hover:text-red-900 font-medium"
          >
            Try again
          </button>
        </div>
      )}

      {data && data.players.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No players found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedPosition 
              ? 'Try adjusting your search or filters'
              : 'Get started by creating some sample player data'
            }
          </p>
          {!searchTerm && !selectedPosition && (
            <button
              onClick={handleCreateSample}
              disabled={isCreating}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Sample Players
            </button>
          )}
        </div>
      )}

      {data && data.players.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data.players.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
      )}

      {/* Pagination Info */}
      {data && data.total > data.limit && (
        <div className="flex justify-center">
          <p className="text-gray-600">
            Showing {data.players.length} of {data.total} players
          </p>
        </div>
      )}
    </div>
  );
}