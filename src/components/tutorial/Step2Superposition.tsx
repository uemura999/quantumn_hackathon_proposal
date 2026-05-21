'use client';

import { useMemo } from 'react';
import { Panel } from '@/components/ui/Panel';
import { runQaoa } from '@/engine/qaoa';
import { metaphors } from '@/lib/metaphors';
import type { StepBaseProps } from './stepShared';

export function Step2Superposition({ problem, CityScene }: StepBaseProps) {
  const result = useMemo(
    () => runQaoa(problem, { gamma: 0, beta: 0, reps: 1 }),
    [problem],
  );

  // Show ALL 24 valid routes by passing the full distribution
  const distribution = result.distribution;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
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

      <Panel>
        <h2
          className="font-semibold mb-2"
          style={{ fontSize: '1.2rem', fontFamily: 'var(--font-display)' }}
        >
          {metaphors.superposition.headline}
        </h2>
        <p
          className="text-sm mb-4"
          style={{ color: 'var(--color-ink-soft)', lineHeight: 1.75 }}
        >
          {metaphors.superposition.story}
        </p>
        <p
          className="text-sm rounded-lg p-3"
          style={{
            color: 'var(--color-ink)',
            background: 'oklch(96% 0.012 80)',
            border: '1px solid oklch(80% 0.012 80)',
            lineHeight: 1.7,
          }}
        >
          👀 マップに広がる「もや」は、<strong>24 通りのルート全部</strong>
          が同時に浮かんでいる状態。まだどれが「答え」とは決まっていません。
        </p>
        <p
          className="mt-4 text-xs"
          style={{ color: 'var(--color-muted)', lineHeight: 1.7 }}
        >
          次のステップで、量子に「短いルートが好き」というルールを少しずつ伝えていきます。
        </p>
      </Panel>
    </div>
  );
}
