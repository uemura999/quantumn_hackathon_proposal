'use client';

import { SoloSliderStep } from './SoloSliderStep';
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
        { value: 0, label: 'フラット (0)' },
        { value: 1.0, label: 'いい感じ (1.0)' },
        { value: 2.8, label: '暴走 (2.8)' },
      ]}
    />
  );
}
