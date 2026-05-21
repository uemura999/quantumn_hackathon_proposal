import { create } from 'zustand';
import type { QaoaParams, QaoaResult, RouteCandidate } from '@/engine/types';

export interface BestScore {
  readonly distance: number;
  readonly route: ReadonlyArray<number>;
  readonly params: QaoaParams;
}

export interface AttemptRecord {
  readonly id: string;
  readonly timestamp: number;
  readonly params: QaoaParams;
  readonly bestValid: RouteCandidate | null;
  readonly isNewBest: boolean;
}

interface SessionState {
  readonly startedAt: number | null;
  readonly bestScore: BestScore | null;
  readonly history: ReadonlyArray<AttemptRecord>;
  startSession: () => void;
  recordAttempt: (result: QaoaResult) => { isNewBest: boolean };
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

  recordAttempt: (result) => {
    const candidate = result.bestValid;
    const current = get().bestScore;
    const isNewBest =
      candidate !== null &&
      (current === null || candidate.distance < current.distance);

    const nextBest: BestScore | null = isNewBest && candidate
      ? {
          distance: candidate.distance,
          route: candidate.order,
          params: result.params,
        }
      : current;

    const record: AttemptRecord = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: Date.now(),
      params: result.params,
      bestValid: candidate,
      isNewBest,
    };

    set((s) => ({
      ...s,
      bestScore: nextBest,
      history: [...s.history, record],
    }));

    return { isNewBest };
  },

  resetSession: () => {
    set(() => ({ startedAt: null, bestScore: null, history: [] }));
  },
}));

export const sessionDurationMs = SESSION_DURATION_MS;
