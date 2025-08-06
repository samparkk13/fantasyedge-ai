import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Player {
  id: string;
  nfl_id: string;
  name: string;
  position: string;
  team: string;
  age?: number;
  experience?: number;
  height?: string;
  weight?: number;
  college?: string;
}

export interface PlayersResponse {
  players: Player[];
  total: number;
  page: number;
  limit: number;
}

export interface PositionStats {
  position: string;
  count: number;
}

export function usePlayers(options?: {
  position?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const [data, setData] = useState<PlayersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        
        if (options?.position) params.append('position', options.position);
        if (options?.search) params.append('search', options.search);
        if (options?.page) params.append('page', options.page.toString());
        if (options?.limit) params.append('limit', options.limit.toString());

        const response = await axios.get(`${API_URL}/api/players?${params}`);
        setData(response.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch players');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [options?.position, options?.search, options?.page, options?.limit]);

  return { data, loading, error, refetch: () => setLoading(true) };
}

export function usePositionStats() {
  const [stats, setStats] = useState<{
    position_stats: PositionStats[];
    total_players: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/players/positions/stats`);
        setStats(response.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
}

export async function createSamplePlayers() {
  try {
    const response = await axios.post(`${API_URL}/api/players/create-sample`);
    return response.data;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to create sample players');
  }
}