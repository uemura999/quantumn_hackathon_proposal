import { create } from 'zustand';

export type HintLevel = 0 | 1 | 2 | 3;

interface HintState {
  readonly currentLevel: HintLevel;
  readonly autoTriggered: boolean;
  readonly lastInteractionAt: number;
  bumpLevel: () => void;
  resetHints: () => void;
  recordInteraction: () => void;
  triggerAutoHint: () => void;
}

export const useHintStore = create<HintState>((set, get) => ({
  currentLevel: 0,
  autoTriggered: false,
  lastInteractionAt: Date.now(),

  bumpLevel: () => {
    const { currentLevel } = get();
    const next = Math.min(3, currentLevel + 1) as HintLevel;
    set((s) => ({ ...s, currentLevel: next }));
  },

  resetHints: () =>
    set(() => ({
      currentLevel: 0,
      autoTriggered: false,
      lastInteractionAt: Date.now(),
    })),

  recordInteraction: () =>
    set((s) => ({ ...s, lastInteractionAt: Date.now() })),

  triggerAutoHint: () => {
    const { currentLevel, autoTriggered } = get();
    if (autoTriggered || currentLevel >= 1) return;
    set((s) => ({ ...s, currentLevel: 1, autoTriggered: true }));
  },
}));
