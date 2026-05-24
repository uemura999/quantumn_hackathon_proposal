import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const DEFAULT_LABELS: ReadonlyArray<string> = [
  '北西工場',
  '北東病院',
  '東モール',
  '西駅',
  '南西商店街',
  '南東スタジアム',
];

export interface LabelState {
  readonly teamName: string;
  readonly labels: ReadonlyArray<string>;
  readonly story: string;
  readonly cityName: string;
  setTeamName: (v: string) => void;
  setLabel: (index: number, value: string) => void;
  setStory: (v: string) => void;
  setCityName: (v: string) => void;
  resetLabels: () => void;
  hasCustomLabels: () => boolean;
}

export const useLabelStore = create<LabelState>()(
  persist(
    (set, get) => ({
      teamName: '',
      labels: [...DEFAULT_LABELS],
      story: '',
      cityName: '',

      setTeamName: (v) => set((s) => ({ ...s, teamName: v })),
      setLabel: (index, value) =>
        set((s) => {
          if (index < 0 || index >= s.labels.length) return s;
          const next = [...s.labels];
          next[index] = value;
          return { ...s, labels: next };
        }),
      setStory: (v) => set((s) => ({ ...s, story: v })),
      setCityName: (v) => set((s) => ({ ...s, cityName: v })),
      resetLabels: () => set((s) => ({ ...s, labels: [...DEFAULT_LABELS] })),
      hasCustomLabels: () => {
        const { labels } = get();
        return labels.some((l, i) => l !== DEFAULT_LABELS[i]);
      },
    }),
    {
      name: 'quantum-hackathon-labels',
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => undefined,
            removeItem: () => undefined,
          };
        }
        return window.localStorage;
      }),
      partialize: (state) => ({
        teamName: state.teamName,
        labels: state.labels,
        story: state.story,
        cityName: state.cityName,
      }),
    },
  ),
);

export function useEffectiveLabel(
  defaultLabel: string,
  index: number,
): string {
  const labels = useLabelStore((s) => s.labels);
  return labels[index] ?? defaultLabel;
}
