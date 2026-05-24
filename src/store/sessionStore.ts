import { create } from 'zustand';
import type { QaoaParams, QaoaResult, RouteCandidate } from '@/engine/types';

export interface BestScore {
  readonly distance: number;
  readonly route: ReadonlyArray<number>;
  readonly params: QaoaParams;
  readonly distanceRank: number;
  readonly trafficProfile: string;
}

export interface AttemptRecord {
  readonly id: string;
  readonly timestamp: number;
  readonly params: QaoaParams;
  readonly bestValid: RouteCandidate | null;
  readonly sampledRoute: RouteCandidate | null;
  readonly isNewBest: boolean;
  readonly deltaFromBest: number | null;
  readonly topAmplification: number;
  readonly uniformProbability: number;
  readonly trafficProfile: string;
}

interface SessionState {
  readonly startedAt: number | null;
  readonly bestScore: BestScore | null;
  readonly history: ReadonlyArray<AttemptRecord>;
  startSession: () => void;
  recordAttempt: (
    result: QaoaResult,
    sampledRoute?: RouteCandidate | null,
  ) => { isNewBest: boolean; deltaFromBest: number | null };
  resetSession: () => void;
}

const SESSION_DURATION_MS = 2 * 60 * 60 * 1000;

export const useSessionStore = create<SessionState>((set, get) => ({
  startedAt: null,
  bestScore: null,
  history: [],

  startSession: () => {
    set((s) => ({ ...s, startedAt: Date.now() }));
  },

  recordAttempt: (result, sampledRoute = null) => {
    const candidate = result.bestValid;
    const current = get().bestScore;
    const isNewBest =
      candidate !== null &&
      (current === null || candidate.distance < current.distance);
    const comparisonBest = current?.distance ?? candidate?.distance ?? null;
    const deltaFromBest =
      candidate !== null && comparisonBest !== null
        ? candidate.distance - comparisonBest
        : null;

    const nextBest: BestScore | null = isNewBest && candidate
      ? {
          distance: candidate.distance,
          route: candidate.order,
          params: result.params,
          distanceRank: candidate.distanceRank,
          trafficProfile: result.trafficProfile,
        }
      : current;

    const record: AttemptRecord = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: Date.now(),
      params: result.params,
      bestValid: candidate,
      sampledRoute,
      isNewBest,
      deltaFromBest,
      topAmplification: result.topAmplification,
      uniformProbability: result.uniformProbability,
      trafficProfile: result.trafficProfile,
    };

    set((s) => ({
      ...s,
      bestScore: nextBest,
      history: [...s.history, record],
    }));

    return { isNewBest, deltaFromBest };
  },

  resetSession: () => {
    set(() => ({ startedAt: null, bestScore: null, history: [] }));
  },
}));

export const sessionDurationMs = SESSION_DURATION_MS;
