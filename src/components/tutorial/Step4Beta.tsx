'use client';

import { SoloSliderStep } from './SoloSliderStep';
import { metaphors } from '@/lib/metaphors';
import type { StepBaseProps } from './stepShared';

export function Step4Beta(props: StepBaseProps) {
  return (
    <SoloSliderStep
      {...props}
      metaphor={metaphors.beta}
      paramKey="beta"
      fixedParams={{ gamma: 1.0, reps: 2 }}
      min={0}
      max={Math.PI / 2}
      step={0.02}
      initial={0.4}
      formatValue={(v) => v.toFixed(2)}
      presets={[
        { value: 0, label: '混ぜない (0)' },
        { value: 0.4, label: 'いい感じ (0.4)' },
        { value: 1.4, label: '混ぜすぎ (1.4)' },
      ]}
    />
  );
}
