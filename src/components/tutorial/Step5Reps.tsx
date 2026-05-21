'use client';

import { SoloSliderStep } from './SoloSliderStep';
import { metaphors } from '@/lib/metaphors';
import type { StepBaseProps } from './stepShared';

export function Step5Reps(props: StepBaseProps) {
  return (
    <SoloSliderStep
      {...props}
      metaphor={metaphors.reps}
      paramKey="reps"
      fixedParams={{ gamma: 1.0, beta: 0.4 }}
      min={1}
      max={3}
      step={1}
      initial={2}
      formatValue={(v) => `${Math.round(v)} 回`}
      presets={[
        { value: 1, label: '1 回（ぼんやり）' },
        { value: 2, label: '2 回（ちょうど）' },
        { value: 3, label: '3 回（はっきり）' },
      ]}
    />
  );
}
