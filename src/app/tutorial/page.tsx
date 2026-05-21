'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { GlossaryTooltip } from '@/components/hints/GlossaryTooltip';
import { runQaoa } from '@/engine/qaoa';
import { defaultCityProblem } from '@/engine/tsp';
import type { QaoaResult } from '@/engine/types';

const CityScene = dynamic(
  () => import('@/components/city/CityScene').then((m) => m.CityScene),
  { ssr: false },
);

export default function TutorialPage() {
  const problem = useMemo(() => defaultCityProblem(), []);
  const [result, setResult] = useState<QaoaResult | null>(null);

  const run = (gamma: number, beta: number): void => {
    setResult(runQaoa(problem, { gamma, beta, reps: 2 }));
  };

  return (
    <section className="mx-auto max-w-screen-xl px-6 py-10 space-y-8">
      <header>
        <p
          className="mb-2 text-sm uppercase tracking-[0.3em]"
          style={{ color: 'var(--color-accent-strong)' }}
        >
          Step 1 / 2 — Tutorial
        </p>
        <h1
          className="font-bold leading-tight"
          style={{
            fontSize: 'clamp(1.6rem, 1rem + 2vw, 2.4rem)',
            fontFamily: 'var(--font-display)',
          }}
        >
          まず眺めてみよう、それから動かしてみよう。
        </h1>
      </header>

      <Panel style={{ padding: 0 }} className="overflow-hidden">
        <div className="h-[50vh] min-h-[360px] w-full">
          <CityScene
            problem={problem}
            distribution={result?.distribution ?? []}
            truckRoute={result?.bestValid ?? null}
            truckRunning={false}
            pulsing={false}
          />
        </div>
      </Panel>

      <div className="grid gap-4 md:grid-cols-3">
        <Panel>
          <h3 className="font-semibold mb-1">弱い <GlossaryTooltip k="gamma" /></h3>
          <p className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>
            様々なルートに薄い「もや」が広がる、まだ <GlossaryTooltip k="superposition" /> の状態。
          </p>
          <Button className="mt-3 w-full" variant="ghost" onClick={() => run(0.3, 0.3)}>
            実行 γ=0.3
          </Button>
        </Panel>
        <Panel>
          <h3 className="font-semibold mb-1">ちょうどよい設定</h3>
          <p className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>
            短いルートが少しずつ光ってきます。
          </p>
          <Button className="mt-3 w-full" variant="ghost" onClick={() => run(1.0, 0.4)}>
            実行 γ=1.0, β=0.4
          </Button>
        </Panel>
        <Panel>
          <h3 className="font-semibold mb-1">強すぎる <GlossaryTooltip k="gamma" /></h3>
          <p className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>
            <GlossaryTooltip k="interference" /> が暴れて、ルートがちらつきます。
          </p>
          <Button className="mt-3 w-full" variant="ghost" onClick={() => run(2.8, 0.6)}>
            実行 γ=2.8
          </Button>
        </Panel>
      </div>

      <div className="flex justify-end">
        <Link href="/challenge">
          <Button>本番チャレンジへ →</Button>
        </Link>
      </div>
    </section>
  );
}
