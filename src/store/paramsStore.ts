import { create } from 'zustand';

export interface ParamsState {
  readonly gamma: number;
  readonly beta: number;
  readonly reps: number;
  setGamma: (v: number) => void;
  setBeta: (v: number) => void;
  setReps: (v: number) => void;
  reset: () => void;
}

const DEFAULTS = { gamma: 0.5, beta: 0.3, reps: 1 } as const;

export const GAMMA_RANGE = { min: 0, max: Math.PI } as const;
export const BETA_RANGE = { min: 0, max: Math.PI / 2 } as const;
export const REPS_RANGE = { min: 1, max: 3 } as const;

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

export const useParamsStore = create<ParamsState>((set) => ({
  ...DEFAULTS,
  setGamma: (v) =>
    set((s) => ({ ...s, gamma: clamp(v, GAMMA_RANGE.min, GAMMA_RANGE.max) })),
  setBeta: (v) =>
    set((s) => ({ ...s, beta: clamp(v, BETA_RANGE.min, BETA_RANGE.max) })),
  setReps: (v) =>
    set((s) => ({
      ...s,
      reps: clamp(Math.round(v), REPS_RANGE.min, REPS_RANGE.max),
    })),
  reset: () => set(() => ({ ...DEFAULTS })),
}));
