'use client';

import { SoloSliderStep } from './SoloSliderStep';
import { LayerReplay } from '@/components/wave/LayerReplay';
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
        {
          value: 1,
          label: '1 回（ぼんやり）',
          hint: 'まだ候補の差が小さく、迷いが残ります。',
        },
        {
          value: 2,
          label: '2 回（ちょうど）',
          hint: '候補の差が見えやすくなります。',
        },
        {
          value: 3,
          label: '3 回（はっきり）',
          hint: 'さらに強く出ることがありますが、毎回必ず良くなるとは限りません。',
        },
      ]}
      extraWidget={(params) => (
        <LayerReplay problem={props.problem} params={params} />
      )}
    />
  );
}
