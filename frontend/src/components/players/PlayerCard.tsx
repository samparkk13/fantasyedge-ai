import React from 'react';
import { Player } from '@/lib/hooks/usePlayers';
import { User, MapPin, Calendar, GraduationCap } from 'lucide-react';

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
  const positionColor = positionColors[player.position as keyof typeof positionColors] || positionColors.DST;

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
          </div>
        </div>
        <div className="text-right">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
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

      {/* Action Button */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <button className="w-full bg-blue-50 text-blue-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors">
          View Details
        </button>
      </div>
    </div>
  );
}