import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface PlayerPrediction {
  id: string;
  player_id: string;
  player_name: string;
  player_position: string;
  player_team: string;
  season: number;
  predicted_points: number;
  confidence: number;
  reasoning: string;
  projected_stats: Record<string, any> | null;
  breakout_score: number;
  bust_risk: number;
  created_at: string;
}

export interface PredictionSummary {
  total_predictions: number;
  avg_confidence: number;
  high_confidence_count: number;
  breakout_candidates: number;
  bust_risks: number;
}

export interface PositionRanking {
  rank: number;
  player_name: string;
  team: string;
  predicted_points: number;
  confidence: number;
  breakout_score: number;
  reasoning: string;
}

export function usePredictions(options?: {
  season?: number;
  position?: string;
  min_confidence?: number;
  min_breakout_score?: number;
  limit?: number;
}) {
  const [data, setData] = useState<PlayerPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        
        if (options?.season) params.append('season', options.season.toString());
        if (options?.position) params.append('position', options.position);
        if (options?.min_confidence !== undefined) params.append('min_confidence', options.min_confidence.toString());
        if (options?.min_breakout_score !== undefined) params.append('min_breakout_score', options.min_breakout_score.toString());
        if (options?.limit) params.append('limit', options.limit.toString());

        const response = await axios.get(`${API_URL}/api/predictions?${params}`);
        setData(response.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch predictions');
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, [options?.season, options?.position, options?.min_confidence, options?.min_breakout_score, options?.limit]);

  return { data, loading, error, refetch: () => setLoading(true) };
}

export function usePlayerPrediction(playerId: string, season: number = 2025) {
  const [prediction, setPrediction] = useState<PlayerPrediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!playerId) return;

    const fetchPrediction = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/predictions/player/${playerId}?season=${season}`);
        setPrediction(response.data);
        setError(null);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setPrediction(null);
          setError(null);
        } else {
          setError(err instanceof Error ? err.message : 'Failed to fetch prediction');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPrediction();
  }, [playerId, season]);

  return { prediction, loading, error };
}

export function useBreakoutCandidates(season: number = 2025, minScore: number = 0.6, limit: number = 20) {
  const [candidates, setCandidates] = useState<PlayerPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/predictions/breakout-candidates?season=${season}&min_score=${minScore}&limit=${limit}`);
        setCandidates(response.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch breakout candidates');
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, [season, minScore, limit]);

  return { candidates, loading, error };
}

export function usePredictionSummary(season: number = 2025) {
  const [summary, setSummary] = useState<PredictionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/predictions/summary?season=${season}`);
        setSummary(response.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch prediction summary');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [season]);

  return { summary, loading, error };
}

export function usePositionRankings(position: string, season: number = 2025) {
  const [rankings, setRankings] = useState<PositionRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!position) return;

    const fetchRankings = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/api/predictions/position-rankings/${position}?season=${season}`);
        setRankings(response.data.rankings);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch position rankings');
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, [position, season]);

  return { rankings, loading, error };
}

// API functions for generating predictions
export async function generatePlayerPrediction(playerId: string, season: number = 2025) {
  try {
    const response = await axios.post(`${API_URL}/api/predictions/generate/${playerId}?season=${season}`);
    return response.data;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to generate prediction');
  }
}

export async function generateAllPredictions(season: number = 2025) {
  try {
    const response = await axios.post(`${API_URL}/api/predictions/generate-all?season=${season}`);
    return response.data;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to generate predictions');
  }
}