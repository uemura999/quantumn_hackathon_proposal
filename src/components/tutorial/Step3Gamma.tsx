'use client';

import { SoloSliderStep } from './SoloSliderStep';
import { InterferenceDemo } from '@/components/wave/InterferenceDemo';
import { metaphors } from '@/lib/metaphors';
import type { StepBaseProps } from './stepShared';

export function Step3Gamma(props: StepBaseProps) {
  return (
    <SoloSliderStep
      {...props}
      metaphor={metaphors.gamma}
      paramKey="gamma"
      fixedParams={{ beta: 0.4, reps: 2 }}
      min={0}
      max={Math.PI}
      step={0.05}
      initial={1.0}
      formatValue={(v) => v.toFixed(2)}
      presets={[
        {
          value: 0,
          label: '好みなし (0)',
          hint: '短い道への印がないので、候補の差がほぼありません。',
        },
        {
          value: 1.0,
          label: 'ほどよい (1.0)',
          hint: '短い候補に強さが集まりやすい設定です。',
        },
        {
          value: 2.8,
          label: '強すぎ (2.8)',
          hint: '印が強すぎて、別の候補にも強さが流れます。',
        },
      ]}
      extraWidget={(params) => (
        <InterferenceDemo
          params={params}
          hint="短さの好みを 0 → 1.0 → 2.8 と変えると、波が強め合う場所と消える場所が変わります。"
        />
      )}
    />
  );
}
