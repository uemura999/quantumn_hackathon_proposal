'use client';

import { useMemo } from 'react';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { useTutorialStore } from '@/store/tutorialStore';
import { scoreManualRoute } from '@/lib/manualScoring';
import { formatDistance } from '@/lib/animation';
import type { StepBaseProps } from './stepShared';

export function Step1Manual({ problem, CityScene }: StepBaseProps) {
  const manualRoute = useTutorialStore((s) => s.manualRoute);
  const pickDelivery = useTutorialStore((s) => s.pickDelivery);
  const resetManualRoute = useTutorialStore((s) => s.resetManualRoute);

  const visitedIds = useMemo(() => new Set(manualRoute), [manualRoute]);
  const isComplete = manualRoute.length === problem.deliveries.length;
  const nextPickId = useMemo(() => {
    if (isComplete) return null;
    const remaining = problem.deliveries.find((d) => !visitedIds.has(d.id));
    return remaining?.id ?? null;
  }, [isComplete, problem.deliveries, visitedIds]);

  const score = useMemo(
    () => (isComplete ? scoreManualRoute(problem, manualRoute) : null),
    [problem, manualRoute, isComplete],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <Panel style={{ padding: 0 }} className="overflow-hidden">
        <div className="h-[52vh] min-h-[380px] w-full">
          <CityScene
            problem={problem}
            distribution={[]}
            truckRoute={null}
            truckRunning={false}
            pulsing={false}
            showLabels
            visitedIds={visitedIds}
            nextPickId={nextPickId}
            onPinClick={(id) => pickDelivery(id)}
            manualRouteOrder={manualRoute}
          />
        </div>
      </Panel>

      <Panel>
        <h2
          className="font-semibold mb-2"
          style={{ fontSize: '1.2rem', fontFamily: 'var(--font-display)' }}
        >
          自分で解いてみよう
        </h2>
        <p
          className="text-sm mb-4"
          style={{ color: 'var(--color-ink-soft)', lineHeight: 1.75 }}
        >
          配送先のピンを<strong>順番にクリック</strong>して、自分なりの最短ルートを作ってみてください。倉庫からスタートして、{problem.deliveries.length} つ全部を回って、倉庫に戻ります。<span style={{ color: 'var(--color-muted)' }}>渋滞道は重く採点されます。</span>
        </p>

        <ol className="mb-4 space-y-2">
          <li className="flex items-baseline gap-2 text-sm">
            <span
              className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
              style={{
                background: 'oklch(20% 0.04 260)',
                color: 'oklch(98% 0.005 80)',
              }}
            >
              0
            </span>
            <span>🏠 倉庫からスタート（固定）</span>
          </li>
          {problem.deliveries.map((d, idx) => {
            const order = manualRoute.indexOf(d.id);
            const picked = order >= 0;
            return (
              <li key={d.id} className="flex items-baseline gap-2 text-sm">
                <span
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
                  style={{
                    background: picked
                      ? 'oklch(70% 0.14 50)'
                      : 'oklch(85% 0.012 80)',
                    color: picked ? 'oklch(98% 0.005 80)' : 'var(--color-muted)',
                  }}
                >
                  {picked ? order + 1 : idx + 1}
                </span>
                <span
                  style={{
                    color: picked ? 'var(--color-ink)' : 'var(--color-muted)',
                  }}
                >
                  📦 {d.label}
                </span>
              </li>
            );
          })}
          <li className="flex items-baseline gap-2 text-sm">
            <span
              className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
              style={{
                background: 'oklch(20% 0.04 260)',
                color: 'oklch(98% 0.005 80)',
              }}
            >
              ↩
            </span>
            <span>🏠 倉庫に戻る（自動）</span>
          </li>
        </ol>

        {score ? (
          <div
            className="rounded-lg p-3 mb-3"
            style={{
              background: 'oklch(96% 0.012 80)',
              border: '1px solid oklch(70% 0.14 50 / 0.3)',
            }}
          >
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between">
                <dt style={{ color: 'var(--color-muted)' }}>あなたのルート</dt>
                <dd className="font-mono" style={{ color: 'var(--color-ink)' }}>
                  {formatDistance(score.distance)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt style={{ color: 'var(--color-muted)' }}>順位</dt>
                <dd
                  className="font-mono"
                  style={{ color: 'var(--color-accent-strong)' }}
                >
                  {score.rank} 位 / {score.totalRoutes}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt style={{ color: 'var(--color-muted)' }}>最短ルート</dt>
                <dd className="font-mono" style={{ color: 'var(--color-ink)' }}>
                  {formatDistance(score.bestDistance)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt style={{ color: 'var(--color-muted)' }}>最短との差</dt>
                <dd
                  className="font-mono"
                  style={{
                    color:
                      score.deltaFromBest < 0.5
                        ? 'oklch(60% 0.12 145)'
                        : 'var(--color-accent-strong)',
                  }}
                >
                  +{formatDistance(score.deltaFromBest)}
                </dd>
              </div>
            </dl>
            <p
              className="mt-3 text-xs"
              style={{ color: 'var(--color-ink-soft)', lineHeight: 1.7 }}
            >
              {score.rank === 1
                ? '🎉 一発で最短を当てました！すごい。'
                : '人が手で最短ルートを見つけるのは意外と難しい。次から量子コンピュータに手伝ってもらいます。'}
            </p>
          </div>
        ) : (
          <p
            className="text-xs rounded-lg p-3 mb-3"
            style={{
              color: 'var(--color-ink-soft)',
              background: 'oklch(98% 0.005 80)',
              border: '1px dashed oklch(78% 0.014 80)',
              lineHeight: 1.7,
            }}
          >
            🟡 ピンの上にカーソルを乗せて、クリックしてみよう。
            <br />
            残り <strong>{problem.deliveries.length - manualRoute.length}</strong>{' '}
            個。
          </p>
        )}

        <Button
          variant="ghost"
          className="w-full"
          onClick={resetManualRoute}
          disabled={manualRoute.length === 0}
        >
          リセット
        </Button>
      </Panel>
    </div>
  );
}
