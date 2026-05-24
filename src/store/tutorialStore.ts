import { create } from 'zustand';

export type TutorialStep = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const STEP_TITLES: ReadonlyArray<string> = [
  '街に着いた',
  '自分で解いてみる',
  '全部の候補を並べる',
  '短さの好みを動かす',
  '混ぜる強さを動かす',
  '考え直す回数を動かす',
  '本番に行こう',
];

export const TOTAL_STEPS = STEP_TITLES.length;

interface TutorialState {
  readonly currentStep: TutorialStep;
  readonly manualRoute: ReadonlyArray<number>;
  goTo: (step: TutorialStep) => void;
  next: () => void;
  back: () => void;
  pickDelivery: (deliveryId: number) => void;
  resetManualRoute: () => void;
  reset: () => void;
}

export const useTutorialStore = create<TutorialState>((set, get) => ({
  currentStep: 0,
  manualRoute: [],

  goTo: (step) => set((s) => ({ ...s, currentStep: step })),

  next: () => {
    const { currentStep } = get();
    if (currentStep >= TOTAL_STEPS - 1) return;
    set((s) => ({ ...s, currentStep: (currentStep + 1) as TutorialStep }));
  },

  back: () => {
    const { currentStep } = get();
    if (currentStep <= 0) return;
    set((s) => ({ ...s, currentStep: (currentStep - 1) as TutorialStep }));
  },

  pickDelivery: (deliveryId) => {
    const { manualRoute } = get();
    if (manualRoute.includes(deliveryId)) return;
    set((s) => ({ ...s, manualRoute: [...manualRoute, deliveryId] }));
  },

  resetManualRoute: () => set((s) => ({ ...s, manualRoute: [] })),

  reset: () =>
    set(() => ({
      currentStep: 0,
      manualRoute: [],
    })),
}));
