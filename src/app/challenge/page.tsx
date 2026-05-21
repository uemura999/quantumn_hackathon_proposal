'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { ParameterSliders } from '@/components/controls/ParameterSliders';
import { ExecuteButton } from '@/components/controls/ExecuteButton';
import { HintPanel } from '@/components/hints/HintPanel';
import { MiniGuide } from '@/components/hints/MiniGuide';
import { GlossaryTooltip } from '@/components/hints/GlossaryTooltip';
import { Confetti } from '@/components/ui/Confetti';
import { runQaoa } from '@/engine/qaoa';
import { defaultCityProblem } from '@/engine/tsp';
import type { QaoaResult, RouteCandidate } from '@/engine/types';
import { useParamsStore } from '@/store/paramsStore';
import { useSessionStore } from '@/store/sessionStore';
import { formatDistance } from '@/lib/animation';

const CityScene = dynamic(
  () => import('@/components/city/CityScene').then((m) => m.CityScene),
  { ssr: false },
);

export default function ChallengePage() {
  const problem = useMemo(() => defaultCityProblem(), []);
  const params = useParamsStore();
  const recordAttempt = useSessionStore((s) => s.recordAttempt);
  const bestScore = useSessionStore((s) => s.bestScore);

  const [result, setResult] = useState<QaoaResult | null>(null);
  const [pulsing, setPulsing] = useState(false);
  const [truckRoute, setTruckRoute] = useState<RouteCandidate | null>(null);
  const [truckRunning, setTruckRunning] = useState(false);
  const [confettiTrigger, setConfettiTrigger] = useState(0);

  const onExecute = (): void => {
    setPulsing(true);
    setTruckRunning(false);
    // Defer to next tick to let the pulse render before the synchronous QAOA.
    window.setTimeout(() => {
      const next = runQaoa(problem, {
        gamma: params.gamma,
        beta: params.beta,
        reps: params.reps,
      });
      setResult(next);
      setTruckRoute(next.bestValid);
      const outcome = recordAttempt(next);
      if (outcome.isNewBest) {
        setConfettiTrigger((t) => t + 1);
      }
      setPulsing(false);
      window.setTimeout(() => setTruckRunning(true), 200);
    }, 350);
  };

  const onTruckComplete = (): void => {
    setTruckRunning(false);
  };

  return (
    <section className="mx-auto max-w-screen-2xl px-6 py-8">
      <Confetti trigger={confettiTrigger} />

      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p
            className="mb-1 text-sm uppercase tracking-[0.3em]"
            style={{ color: 'var(--color-accent-strong)' }}
          >
            Main Challenge
          </p>
          <h1
            className="font-bold leading-tight"
            style={{
              fontSize: 'clamp(1.6rem, 1rem + 2vw, 2.4rem)',
              fontFamily: 'var(--font-display)',
            }}
          >
            街を最短で巡る、<GlossaryTooltip k="qaoa" /> のチャレンジ。
          </h1>
        </div>
        <Link href="/result">
          <Button variant="ghost">結果画面を見る →</Button>
        </Link>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Panel className="overflow-hidden" style={{ padding: 0 }}>
          <div className="h-[60vh] min-h-[420px] w-full">
            <CityScene
              problem={problem}
              distribution={result?.distribution ?? []}
              truckRoute={truckRoute}
              truckRunning={truckRunning}
              pulsing={pulsing}
              onTruckComplete={onTruckComplete}
            />
          </div>
        </Panel>

        <div className="flex flex-col gap-4">
          <Panel>
            <h2 className="font-semibold mb-4">パラメータ</h2>
            <ParameterSliders />
            <ExecuteButton
              onExecute={onExecute}
              disabled={false}
              running={pulsing || truckRunning}
            />
          </Panel>

          <Panel>
            <h2 className="font-semibold mb-3">最新の結果</h2>
            {result?.bestValid ? (
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt style={{ color: 'var(--color-muted)' }}>最有力ルート距離</dt>
                  <dd className="font-mono">
                    {formatDistance(result.bestValid.distance)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt style={{ color: 'var(--color-muted)' }}>確率</dt>
                  <dd className="font-mono">
                    {(result.bestValid.probability * 100).toFixed(1)}%
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt style={{ color: 'var(--color-muted)' }}>計算時間</dt>
                  <dd className="font-mono">{result.elapsedMs.toFixed(1)} ms</dd>
                </div>
                {bestScore && (
                  <div className="flex justify-between pt-2 border-t border-[oklch(85%_0.01_80)]">
                    <dt style={{ color: 'var(--color-accent-strong)' }}>
                      セッションベスト
                    </dt>
                    <dd className="font-mono" style={{ color: 'var(--color-accent-strong)' }}>
                      {formatDistance(bestScore.distance)}
                    </dd>
                  </div>
                )}
              </dl>
            ) : (
              <p className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>
                まだ実行されていません。スライダーを動かして実行してみよう。
              </p>
            )}
          </Panel>

          <MiniGuide running={pulsing || truckRunning} />
          <HintPanel />
        </div>
      </div>
    </section>
  );
}
