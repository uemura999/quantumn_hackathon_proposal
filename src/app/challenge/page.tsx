'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { ParameterSliders } from '@/components/controls/ParameterSliders';
import { ExecuteButton } from '@/components/controls/ExecuteButton';
import { HintPanel } from '@/components/hints/HintPanel';
import { MiniGuide } from '@/components/hints/MiniGuide';
import { GlossaryTooltip } from '@/components/hints/GlossaryTooltip';
import { Confetti } from '@/components/ui/Confetti';
import { MiniLegend } from '@/components/ui/MiniLegend';
import { ExecutionNarration } from '@/components/challenge/ExecutionNarration';
import { RouteJourneyStatus } from '@/components/challenge/RouteJourneyStatus';
import { WavePanel } from '@/components/wave/WavePanel';
import type { TruckJourneyProgress } from '@/components/city/Truck';
import { runQaoa, sampleRouteCandidate } from '@/engine/qaoa';
import { buildCityProblem, numPermutations } from '@/engine/tsp';
import type { TrafficProfileName } from '@/engine/city-layout';
import type { QaoaParams, QaoaResult, RouteCandidate } from '@/engine/types';
import { useParamsStore } from '@/store/paramsStore';
import { useSessionStore } from '@/store/sessionStore';
import { formatDistance } from '@/lib/animation';
import {
  estimateDeliveryMinutes,
  formatDeliveryMinutes,
} from '@/lib/routeMetrics';
import { isFlatDistribution } from '@/lib/distributionShape';

const CityScene = dynamic(
  () => import('@/components/city/CityScene').then((m) => m.CityScene),
  { ssr: false },
);

const TRAFFIC_PROFILES: ReadonlyArray<{
  readonly value: TrafficProfileName;
  readonly label: string;
}> = [
  { value: 'midday', label: '昼' },
  { value: 'morning_rush', label: '朝ラッシュ' },
  { value: 'evening_rush', label: '夕方ラッシュ' },
];

const INITIAL_TRUCK_PROGRESS: TruckJourneyProgress = {
  fraction: 0,
  completedDeliveries: 0,
};

export default function ChallengePage() {
  const [trafficProfile, setTrafficProfile] =
    useState<TrafficProfileName>('midday');
  const problem = useMemo(
    () => buildCityProblem(trafficProfile),
    [trafficProfile],
  );
  const params = useParamsStore();
  const recordAttempt = useSessionStore((s) => s.recordAttempt);
  const bestScore = useSessionStore((s) => s.bestScore);
  const history = useSessionStore((s) => s.history);

  const currentParams = useMemo<QaoaParams>(
    () => ({
      gamma: params.gamma,
      beta: params.beta,
      reps: params.reps,
    }),
    [params.gamma, params.beta, params.reps],
  );
  const previewResult = useMemo(
    () => runQaoa(problem, currentParams),
    [problem, currentParams],
  );

  const [result, setResult] = useState<QaoaResult | null>(null);
  const [sampledRoute, setSampledRoute] = useState<RouteCandidate | null>(null);
  const [lastOutcome, setLastOutcome] = useState<{
    readonly isNewBest: boolean;
    readonly deltaFromBest: number | null;
    readonly previousExpectedDistance: number | null;
    readonly sameTrafficProfile: boolean;
  } | null>(null);
  const [pulsing, setPulsing] = useState(false);
  const [truckRoute, setTruckRoute] = useState<RouteCandidate | null>(null);
  const [truckRunning, setTruckRunning] = useState(false);
  const [truckProgress, setTruckProgress] = useState<TruckJourneyProgress>(
    INITIAL_TRUCK_PROGRESS,
  );
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [narrationTrigger, setNarrationTrigger] = useState(0);

  const onExecute = (): void => {
    const paramsForRun = currentParams;
    const previousAttempt = history[history.length - 1] ?? null;
    const sameTrafficProfile =
      previousAttempt === null ||
      previousAttempt.trafficProfile === problem.layout.trafficProfile;
    const previousExpectedDistance =
      previousAttempt !== null && sameTrafficProfile
        ? previousAttempt.expectedDistance
        : null;
    setPulsing(true);
    setTruckRunning(false);
    setTruckProgress(INITIAL_TRUCK_PROGRESS);
    setNarrationTrigger((t) => t + 1);
    // Defer to next tick to let the pulse render before the synchronous QAOA.
    window.setTimeout(() => {
      const next = runQaoa(problem, {
        gamma: paramsForRun.gamma,
        beta: paramsForRun.beta,
        reps: paramsForRun.reps,
      });
      const measured = sampleRouteCandidate(next.distribution);
      setResult(next);
      setSampledRoute(measured);
      setTruckRoute(measured ?? next.bestValid);
      const outcome = recordAttempt(next, measured);
      setLastOutcome({
        ...outcome,
        previousExpectedDistance,
        sameTrafficProfile,
      });
      if (outcome.isNewBest) {
        setConfettiTrigger((t) => t + 1);
      }
      setPulsing(false);
      window.setTimeout(() => setTruckRunning(true), 200);
    }, 350);
  };

  const onTruckProgress = useCallback((progress: TruckJourneyProgress): void => {
    setTruckProgress(progress);
  }, []);

  const onTruckComplete = useCallback((): void => {
    setTruckRunning(false);
  }, []);

  const totalRoutes = numPermutations(problem.deliveries.length);
  const paramsChanged =
    result !== null && paramsKey(result.params) !== paramsKey(currentParams);
  const trafficChanged =
    result !== null && result.trafficProfile !== problem.layout.trafficProfile;
  const resultStale = paramsChanged || trafficChanged;
  const staleReason = trafficChanged
    ? '交通状況変更中: 表示は新しい交通状況のプレビュー'
    : 'スライダー変更中: 表示は新しい設定のプレビュー';
  const displayResult = resultStale || result === null ? previewResult : result;
  const displayTruckRoute = resultStale ? null : truckRoute;
  const displayedSampledRoute = resultStale ? null : sampledRoute;
  const deliveryOrder = useMemo(
    () => displayTruckRoute?.order.filter((id) => id >= 0) ?? [],
    [displayTruckRoute],
  );
  const visitedDeliveryIds = useMemo(
    () => new Set(deliveryOrder.slice(0, truckProgress.completedDeliveries)),
    [deliveryOrder, truckProgress.completedDeliveries],
  );
  const nextDeliveryId =
    truckProgress.fraction < 1
      ? deliveryOrder[truckProgress.completedDeliveries] ?? null
      : null;
  const hasDisplayedRoute =
    displayTruckRoute !== null || displayedSampledRoute !== null;
  const routeDisplayMode = hasDisplayedRoute
    ? 'selected'
    : isFlatDistribution(displayResult.distribution)
      ? 'flat'
      : 'ranked';
  const expectedDistanceDelta =
    result !== null && lastOutcome?.previousExpectedDistance !== null &&
    lastOutcome?.previousExpectedDistance !== undefined
      ? result.expectedDistance - lastOutcome.previousExpectedDistance
      : null;

  return (
    <section className="mx-auto max-w-screen-2xl px-6 py-8">
      <Confetti trigger={confettiTrigger} />
      <ExecutionNarration
        trigger={narrationTrigger}
        gamma={currentParams.gamma}
        beta={currentParams.beta}
        reps={currentParams.reps}
        totalRoutes={totalRoutes}
      />

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

      <OutcomeDashboard
        result={result}
        sampledRoute={sampledRoute}
        resultStale={resultStale}
        staleReason={staleReason}
        totalRoutes={totalRoutes}
        isNewBest={lastOutcome?.isNewBest ?? false}
        expectedDistanceDelta={expectedDistanceDelta}
        previousWasComparable={lastOutcome?.sameTrafficProfile ?? true}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px_320px]">
        <Panel className="overflow-hidden" style={{ padding: 0 }}>
          <div className="relative h-[60vh] min-h-[420px] w-full">
            <CityScene
              problem={problem}
              distribution={displayResult.distribution}
              truckRoute={displayTruckRoute}
              selectedRoute={displayedSampledRoute}
              truckRunning={truckRunning}
              pulsing={pulsing}
              onTruckProgress={onTruckProgress}
              onTruckComplete={onTruckComplete}
              showLabels
              visitedIds={
                !pulsing && displayTruckRoute ? visitedDeliveryIds : undefined
              }
              nextPickId={
                !pulsing && displayTruckRoute ? nextDeliveryId : null
              }
              nextLabelSuffix=" (次の配送先)"
              candidateVisibility="hideWhenSelected"
            />
            <RouteJourneyStatus
              problem={problem}
              route={pulsing ? null : displayTruckRoute}
              progress={truckProgress}
              running={truckRunning}
            />
          </div>
        </Panel>

        <div className="flex flex-col gap-4">
          <WavePanel
            problem={problem}
            mode="frozen"
            frozenDistribution={displayResult.distribution}
            params={displayResult.params}
            title={resultStale ? '調整中の候補' : result ? '実行結果の候補 (参考)' : '調整中の候補'}
          />
          <MiniLegend routeMode={routeDisplayMode} />
        </div>

        <div className="flex flex-col gap-4">
          <Panel>
            <h2 className="font-semibold mb-4">パラメータ</h2>
            <TrafficProfileControl
              value={trafficProfile}
              onChange={setTrafficProfile}
            />
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
              <div className="space-y-3 text-sm">
                {resultStale && (
                  <p
                    className="rounded-lg p-2 text-xs"
                    style={{
                      background: 'oklch(96% 0.012 80)',
                      color: 'var(--color-ink-soft)',
                    }}
                  >
                    {staleReason}です。左のマップと候補バーはプレビュー、下の結果は最後に実行した記録です。
                  </p>
                )}
                <section
                  className="rounded-lg p-3"
                  style={{
                    background: 'oklch(94% 0.025 80)',
                    border: '1px solid oklch(82% 0.04 80)',
                  }}
                >
                  <p className="text-xs font-semibold" style={{ color: 'var(--color-muted)' }}>
                    今回の期待距離スコア
                  </p>
                  <p
                    className="mt-1 font-mono text-xl"
                    style={{ color: 'var(--color-accent-strong)' }}
                  >
                    {formatDistance(result.expectedDistance)}
                  </p>
                  <p className="mt-1 text-xs" style={{ color: 'var(--color-ink-soft)' }}>
                    全候補の距離を選ばれやすさで平均。小さいほど良いスコアです。
                  </p>
                </section>
                {sampledRoute && (
                  <RouteResultBlock
                    title="今回 van が走ったルート (観測)"
                    route={sampledRoute}
                    totalRoutes={totalRoutes}
                  />
                )}
                <RouteResultBlock
                  title="波の最有力候補 (参考・スコア対象外)"
                  route={result.bestValid}
                  totalRoutes={totalRoutes}
                  supplemental
                />
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt style={{ color: 'var(--color-muted)' }}>
                      ブラウザ計算時間
                    </dt>
                    <dd className="font-mono">{result.elapsedMs.toFixed(1)} ms</dd>
                  </div>
                  {lastOutcome && (
                    <div className="flex justify-between">
                      <dt style={{ color: 'var(--color-muted)' }}>
                        期待距離ベスト更新
                      </dt>
                      <dd
                        className="font-mono"
                        style={{
                          color: lastOutcome.isNewBest
                            ? 'var(--color-accent-strong)'
                            : 'var(--color-muted)',
                        }}
                      >
                        {lastOutcome.isNewBest
                          ? '更新'
                          : lastOutcome.deltaFromBest === null
                            ? 'なし'
                            : `${formatSignedDistance(lastOutcome.deltaFromBest)}`}
                      </dd>
                    </div>
                  )}
                  {bestScore && (
                    <div className="flex justify-between pt-2 border-t border-[oklch(85%_0.01_80)]">
                      <dt style={{ color: 'var(--color-accent-strong)' }}>
                        セッションベスト期待距離
                      </dt>
                      <dd className="font-mono" style={{ color: 'var(--color-accent-strong)' }}>
                        {formatDistance(bestScore.expectedDistance)}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            ) : (
          <p className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>
                左のマップと候補バーは、いまのスライダーでのプレビューです。実行すると期待距離スコアと、van が走る観測ルートが記録されます。
              </p>
            )}
          </Panel>

          <MiniGuide running={pulsing || truckRunning} />
          <MechanismPanel />
          <HintPanel />

        </div>
      </div>
    </section>
  );
}

interface RouteResultBlockProps {
  readonly title: string;
  readonly route: RouteCandidate;
  readonly totalRoutes: number;
  readonly supplemental?: boolean;
}

function RouteResultBlock({
  title,
  route,
  totalRoutes,
  supplemental = false,
}: RouteResultBlockProps) {
  return (
    <section
      className="rounded-lg p-3"
      style={{
        background: supplemental ? 'oklch(98% 0.003 80)' : 'oklch(98% 0.005 80)',
        border: supplemental
          ? '1px dashed oklch(86% 0.01 80)'
          : '1px solid oklch(85% 0.012 80)',
        opacity: supplemental ? 0.88 : 1,
      }}
    >
      <h3 className="mb-2 text-xs font-semibold" style={{ color: 'var(--color-muted)' }}>
        {title}
      </h3>
      <dl className="space-y-1.5">
        <div className="flex justify-between">
          <dt style={{ color: 'var(--color-muted)' }}>距離</dt>
          <dd className="font-mono">{formatDistance(route.distance)}</dd>
        </div>
        <div className="flex justify-between">
          <dt style={{ color: 'var(--color-muted)' }}>選ばれやすさ</dt>
          <dd className="font-mono">{(route.probability * 100).toFixed(1)}%</dd>
        </div>
        <div className="flex justify-between">
          <dt style={{ color: 'var(--color-muted)' }}>距離順位</dt>
          <dd className="font-mono">
            {route.distanceRank}位 / {totalRoutes}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt style={{ color: 'var(--color-muted)' }}>最短との差</dt>
          <dd className="font-mono">{formatSignedDistance(route.deltaFromOptimal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt style={{ color: 'var(--color-muted)' }}>配送時間 (参考)</dt>
          <dd className="font-mono">
            {formatDeliveryMinutes(estimateDeliveryMinutes(route.distance))}
          </dd>
        </div>
      </dl>
    </section>
  );
}

interface OutcomeDashboardProps {
  readonly result: QaoaResult | null;
  readonly sampledRoute: RouteCandidate | null;
  readonly resultStale: boolean;
  readonly staleReason: string;
  readonly totalRoutes: number;
  readonly isNewBest: boolean;
  readonly expectedDistanceDelta: number | null;
  readonly previousWasComparable: boolean;
}

function OutcomeDashboard({
  result,
  sampledRoute,
  resultStale,
  staleReason,
  totalRoutes,
  isNewBest,
  expectedDistanceDelta,
  previousWasComparable,
}: OutcomeDashboardProps) {
  const topAmplification = result?.topAmplification ?? 0;
  const uniformProbability = result?.uniformProbability ?? 0;
  const deliveryMinutes = result
    ? estimateDeliveryMinutes(result.expectedDistance)
    : null;
  const outcomeText = !previousWasComparable
    ? '交通状況が変わったため、前回の期待距離とは比較しません。'
    : expectedDistanceDelta === null
      ? isNewBest
        ? '最初の期待距離スコアを記録しました。'
        : '最初の実行を待っています。'
      : isNewBest
        ? `セッションベスト期待距離を更新しました。前回より ${formatDistance(Math.abs(expectedDistanceDelta))} 縮まりました。`
        : expectedDistanceDelta > 1e-9
          ? `期待距離は前回より ${formatDistance(expectedDistanceDelta)} 長くなりました。`
          : '期待距離は前回と同じです。';

  return (
    <section
      className="mb-6 rounded-xl border p-4"
      aria-label="今回の成果"
      style={{
        background: 'oklch(98% 0.005 80)',
        borderColor: 'oklch(84% 0.018 80)',
      }}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-semibold" style={{ color: 'var(--color-ink)' }}>
            今回のスコア
          </h2>
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
            候補全体の距離を選ばれやすさで平均した期待距離。小さいほど良いスコアです。
          </p>
        </div>
        {resultStale && (
          <span
            className="rounded-full px-3 py-1 text-xs font-medium"
            style={{
              background: 'oklch(96% 0.012 80)',
              color: 'var(--color-ink-soft)',
            }}
          >
            {staleReason}
          </span>
        )}
      </div>

      {result ? (
        <>
          <div className="grid gap-3 md:grid-cols-5">
            <MetricCard
              label="期待距離スコア"
              value={formatDistance(result.expectedDistance)}
              detail="採点対象"
            />
            <MetricCard
              label="前回との期待差"
              value={
                expectedDistanceDelta !== null
                  ? formatSignedDistance(expectedDistanceDelta)
                  : previousWasComparable
                    ? '初回'
                    : '条件変更'
              }
              detail="マイナスなら改善"
            />
            <MetricCard
              label="期待配送時間 (参考)"
              value={deliveryMinutes ? formatDeliveryMinutes(deliveryMinutes) : '—'}
              detail="固定速度で換算"
            />
            <MetricCard
              label="最有力候補の確信度"
              value={`${topAmplification.toFixed(1)}倍`}
              detail={`参考・対象外 / 平均 ${(uniformProbability * 100).toFixed(2)}% 比`}
            />
            <MetricCard
              label="今回走った距離"
              value={
                sampledRoute ? formatDistance(sampledRoute.distance) : '—'
              }
              detail={
                sampledRoute
                  ? `${sampledRoute.distanceRank}位 / ${totalRoutes} (観測)`
                  : '抽選待ち'
              }
            />
          </div>

          <div
            className="mt-3 rounded-lg p-3 text-sm"
            style={{
              background: isNewBest
                ? 'oklch(94% 0.03 170 / 0.55)'
                : 'oklch(96% 0.012 80)',
              color: 'var(--color-ink-soft)',
            }}
          >
            <strong style={{ color: 'var(--color-ink)' }}>{outcomeText}</strong>
            <p className="mt-2 text-xs">
              van が走る1本は確率に従って取り出した観測例です。スコアは候補全体の期待距離で評価します。
            </p>
          </div>
        </>
      ) : (
        <p className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>
          まだ実行されていません。まず「この設定で実行」を押すと、期待距離スコアと観測ルートがここに出ます。
        </p>
      )}
    </section>
  );
}

interface MetricCardProps {
  readonly label: string;
  readonly value: string;
  readonly detail: string;
}

function MetricCard({ label, value, detail }: MetricCardProps) {
  return (
    <div
      className="rounded-lg p-3"
      style={{
        background: 'oklch(96% 0.008 80)',
        border: '1px solid oklch(88% 0.012 80)',
      }}
    >
      <div className="text-[11px] font-medium" style={{ color: 'var(--color-muted)' }}>
        {label}
      </div>
      <div className="mt-1 font-mono text-lg" style={{ color: 'var(--color-ink)' }}>
        {value}
      </div>
      <div className="mt-1 text-[11px]" style={{ color: 'var(--color-muted)' }}>
        {detail}
      </div>
    </div>
  );
}

interface TrafficProfileControlProps {
  readonly value: TrafficProfileName;
  readonly onChange: (value: TrafficProfileName) => void;
}

function TrafficProfileControl({ value, onChange }: TrafficProfileControlProps) {
  return (
    <div className="mb-5">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-sm font-medium" style={{ color: 'var(--color-ink)' }}>
          交通状況
        </span>
        <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
          問題そのものを変える
        </span>
      </div>
      <div
        className="grid grid-cols-3 rounded-lg p-1"
        style={{ background: 'oklch(94% 0.01 80)' }}
      >
        {TRAFFIC_PROFILES.map((profile) => {
          const active = profile.value === value;
          return (
            <button
              key={profile.value}
              type="button"
              onClick={() => onChange(profile.value)}
              className="rounded-md px-2 py-1.5 text-xs font-medium transition-colors"
              style={{
                background: active ? 'oklch(20% 0.04 260)' : 'transparent',
                color: active ? 'oklch(98% 0.005 80)' : 'var(--color-ink-soft)',
              }}
            >
              {profile.label}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-[11px]" style={{ color: 'var(--color-muted)' }}>
        交通状況を変えると道の重さが変わるため、最短ルート自体が変わることがあります。
      </p>
    </div>
  );
}

function MechanismPanel() {
  const steps = [
    ['1', '720通りを並べる', '最初は全部のルート候補を同じ強さで置きます。'],
    ['2', '短い道に印をつける', '短さの好みで、短い候補ほど後で残りやすい印を付けます。'],
    ['3', '候補を混ぜる', '混ぜる強さで、その印をバーの高さや順位の差に変換します。'],
    ['4', '考え直す', '印をつける/混ぜるを繰り返し、強い候補を絞ります。'],
  ] as const;

  return (
    <section
      className="rounded-lg p-4"
      style={{
        background: 'oklch(98% 0.005 80)',
        border: '1px solid oklch(85% 0.012 80)',
      }}
    >
      <h3 className="mb-2 text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>
        なぜ3つのつまみでルートが決まる？
      </h3>
      <ol className="space-y-2">
        {steps.map(([num, title, body]) => (
          <li key={num} className="flex gap-2 text-xs" style={{ color: 'var(--color-ink-soft)' }}>
            <span
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono"
              style={{
                background: 'oklch(70% 0.14 50 / 0.18)',
                color: 'var(--color-accent-strong)',
              }}
            >
              {num}
            </span>
            <span>
              <strong style={{ color: 'var(--color-ink)' }}>{title}</strong>
              <br />
              {body}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function paramsKey(params: QaoaParams): string {
  return `${params.gamma.toFixed(4)}:${params.beta.toFixed(4)}:${params.reps}`;
}

function formatSignedDistance(value: number): string {
  if (Math.abs(value) < 1e-9) return '+0.00 距離pt';
  return `${value > 0 ? '+' : ''}${value.toFixed(2)} 距離pt`;
}
