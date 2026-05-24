'use client';

import { useMemo } from 'react';
import { Panel } from '@/components/ui/Panel';
import { WavePanel } from '@/components/wave/WavePanel';
import { runQaoa } from '@/engine/qaoa';
import { numPermutations } from '@/engine/tsp';
import { metaphors } from '@/lib/metaphors';
import type { StepBaseProps } from './stepShared';

export function Step2Superposition({ problem, CityScene }: StepBaseProps) {
  const result = useMemo(
    () => runQaoa(problem, { gamma: 0, beta: 0, reps: 1 }),
    [problem],
  );

  const distribution = result.distribution;
  const total = numPermutations(problem.deliveries.length);

  return (
    <div className="grid gap-5 lg:grid-cols-[1.2fr_0.85fr_1fr]">
      <Panel style={{ padding: 0 }} className="overflow-hidden">
        <div className="h-[52vh] min-h-[380px] w-full">
          <CityScene
            problem={problem}
            distribution={distribution}
            truckRoute={null}
            truckRunning={false}
            pulsing
            showLabels
          />
        </div>
      </Panel>

      <WavePanel
        problem={problem}
        mode="frozen"
        frozenDistribution={distribution}
        params={{ gamma: 0, beta: 0, reps: 1 }}
        title="最初の候補の強さ"
        showInterferenceHint={false}
      />

      <Panel>
        <h2
          className="font-semibold mb-2"
          style={{ fontSize: '1.2rem', fontFamily: 'var(--font-display)' }}
        >
          {metaphors.superposition.headline}
        </h2>
        <p
          className="text-sm mb-3"
          style={{ color: 'var(--color-ink-soft)', lineHeight: 1.75 }}
        >
          {metaphors.superposition.story}
        </p>
        <p
          className="text-sm rounded-lg p-3 mb-3"
          style={{
            color: 'var(--color-ink)',
            background: 'oklch(96% 0.012 80)',
            border: '1px solid oklch(80% 0.012 80)',
            lineHeight: 1.7,
          }}
        >
          マップに薄く光っている道は、<strong>{total} 通りのルート候補</strong>
          をまとめて見せています。この時点では「この1本が良い」という意味ではありません。右の候補バーがほぼ同じ高さなら、まだどの候補にも差がついていない状態です。
        </p>
        <details
          className="rounded-lg p-3 text-xs"
          style={{
            background: 'oklch(96% 0.018 200 / 0.4)',
            border: '1px solid oklch(80% 0.04 200)',
            color: 'var(--color-ink)',
            lineHeight: 1.7,
          }}
        >
          <summary
            className="cursor-pointer font-semibold"
            style={{ color: 'oklch(48% 0.12 230)' }}
          >
            なぜそうなる？(仕組みを見る)
          </summary>
          <p className="mt-2">{metaphors.superposition.mechanism}</p>
        </details>
        <p
          className="mt-3 text-xs"
          style={{ color: 'var(--color-muted)', lineHeight: 1.7 }}
        >
          次のステップで、「短いルートが好き」という印を少しずつ強めます。
        </p>
      </Panel>
    </div>
  );
}
