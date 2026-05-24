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
import { MiniLegend } from '@/components/ui/MiniLegend';
import { ExecutionNarration } from '@/components/challenge/ExecutionNarration';
import { WavePanel } from '@/components/wave/WavePanel';
import { ColabButton } from '@/components/handoff/ColabButton';
import { runQaoa, sampleRouteCandidate } from '@/engine/qaoa';
import { buildCityProblem, numPermutations } from '@/engine/tsp';
import type { TrafficProfileName } from '@/engine/city-layout';
import type { QaoaParams, QaoaResult, RouteCandidate } from '@/engine/types';
import { useParamsStore } from '@/store/paramsStore';
import { useSessionStore } from '@/store/sessionStore';
import { formatDistance } from '@/lib/animation';
import {
  compareRouteOutcome,
  describeRouteOrder,
  estimateDeliveryMinutes,
  formatDeliveryMinutes,
  type RouteOutcomeDelta,
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
    readonly previousBestValid: RouteCandidate | null;
    readonly previousAmplification: number;
    readonly sameTrafficProfile: boolean;
  } | null>(null);
  const [pulsing, setPulsing] = useState(false);
  const [truckRoute, setTruckRoute] = useState<RouteCandidate | null>(null);
  const [truckRunning, setTruckRunning] = useState(false);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [narrationTrigger, setNarrationTrigger] = useState(0);

  const onExecute = (): void => {
    const paramsForRun = currentParams;
    const previousAttempt = history[history.length - 1] ?? null;
    const previousBestValid = previousAttempt?.bestValid ?? null;
    const previousAmplification = previousAttempt?.topAmplification ?? 0;
    const sameTrafficProfile =
      previousAttempt?.trafficProfile === problem.layout.trafficProfile;
    setPulsing(true);
    setTruckRunning(false);
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
        previousBestValid,
        previousAmplification,
        sameTrafficProfile,
      });
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
  const hasDisplayedRoute =
    displayTruckRoute !== null || displayedSampledRoute !== null;
  const routeDisplayMode = hasDisplayedRoute
    ? 'selected'
    : isFlatDistribution(displayResult.distribution)
      ? 'flat'
      : 'ranked';
  const previousForDelta =
    lastOutcome?.sameTrafficProfile === true
      ? lastOutcome.previousBestValid
      : null;
  const outcomeDelta = compareRouteOutcome(
    result?.bestValid ?? null,
    previousForDelta,
    result?.topAmplification ?? 0,
    lastOutcome?.previousAmplification ?? 0,
  );

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
        outcomeDelta={outcomeDelta}
        previousRoute={previousForDelta}
        previousWasComparable={lastOutcome?.sameTrafficProfile ?? true}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px_320px]">
        <Panel className="overflow-hidden" style={{ padding: 0 }}>
          <div className="h-[60vh] min-h-[420px] w-full">
            <CityScene
              problem={problem}
              distribution={displayResult.distribution}
              truckRoute={displayTruckRoute}
              selectedRoute={displayedSampledRoute}
              truckRunning={truckRunning}
              pulsing={pulsing}
              onTruckComplete={onTruckComplete}
              showLabels
              candidateVisibility="hideWhenSelected"
            />
          </div>
        </Panel>

        <div className="flex flex-col gap-4">
          <WavePanel
            problem={problem}
            mode="frozen"
            frozenDistribution={displayResult.distribution}
            params={displayResult.params}
            title={resultStale ? '調整中の候補' : result ? '実行結果の候補' : '調整中の候補'}
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
                <RouteResultBlock
                  title="波が推している1位候補"
                  route={result.bestValid}
                  totalRoutes={totalRoutes}
                />
                {sampledRoute && (
                  <RouteResultBlock
                    title="今回取り出したルート"
                    route={sampledRoute}
                    totalRoutes={totalRoutes}
                  />
                )}
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
                        ベスト更新
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
                        セッションベスト
                      </dt>
                      <dd className="font-mono" style={{ color: 'var(--color-accent-strong)' }}>
                        {formatDistance(bestScore.distance)}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            ) : (
              <p className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>
                左のマップと候補バーは、いまのスライダーでのプレビューです。実行すると今回のルートが取り出されます。
              </p>
            )}
          </Panel>

          <MiniGuide running={pulsing || truckRunning} />
          <MechanismPanel />
          <HintPanel />

          <Panel>
            <h3
              className="font-semibold mb-2"
              style={{ fontSize: '1rem' }}
            >
              🐍 本物の Qiskit で確かめる
            </h3>
            <p
              className="text-xs mb-3"
              style={{ color: 'var(--color-ink-soft)', lineHeight: 1.7 }}
            >
              いまのパラメータを Colab に持っていって、本物の量子フレームワーク (Qiskit + AerSimulator) でもう一度解きます。
            </p>
            <div className="space-y-2">
              <div>
                <p
                  className="text-[11px] mb-1 font-semibold"
                  style={{ color: 'var(--color-ink)' }}
                >
                  📊 比較版 — JS の結果と並べる
                </p>
                <ColabButton
                  payload={{
                    params: currentParams,
                    profile: trafficProfile,
                    topRoutes: result?.distribution?.slice(0, 3) ?? [],
                    notebook: 'handoff',
                  }}
                  label="比較版を開く"
                  variant="ghost"
                />
              </div>
              <div>
                <p
                  className="text-[11px] mb-1 font-semibold"
                  style={{ color: 'var(--color-ink)' }}
                >
                  🗺 実地図版 — 自分の街でやる
                </p>
                <ColabButton
                  payload={{
                    params: currentParams,
                    profile: trafficProfile,
                    notebook: 'real_city',
                  }}
                  label="実地図版を開く"
                  variant="primary"
                />
              </div>
            </div>
            {!result && (
              <p
                className="mt-2 text-[11px]"
                style={{ color: 'var(--color-muted)' }}
              >
                💡 先に「この設定で実行」を 1 回押すと、JS の結果が比較版 Notebook の比較表に乗ります。
              </p>
            )}
          </Panel>
        </div>
      </div>
    </section>
  );
}

interface RouteResultBlockProps {
  readonly title: string;
  readonly route: RouteCandidate;
  readonly totalRoutes: number;
}

function RouteResultBlock({
  title,
  route,
  totalRoutes,
}: RouteResultBlockProps) {
  return (
    <section
      className="rounded-lg p-3"
      style={{
        background: 'oklch(98% 0.005 80)',
        border: '1px solid oklch(85% 0.012 80)',
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
          <dt style={{ color: 'var(--color-muted)' }}>配送時間</dt>
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
  readonly outcomeDelta: RouteOutcomeDelta | null;
  readonly previousRoute: RouteCandidate | null;
  readonly previousWasComparable: boolean;
}

function OutcomeDashboard({
  result,
  sampledRoute,
  resultStale,
  staleReason,
  totalRoutes,
  outcomeDelta,
  previousRoute,
  previousWasComparable,
}: OutcomeDashboardProps) {
  const top = result?.bestValid ?? null;
  const topAmplification = result?.topAmplification ?? 0;
  const uniformProbability = result?.uniformProbability ?? 0;
  const deliveryMinutes = top
    ? estimateDeliveryMinutes(top.distance)
    : null;
  const routeChangedText = outcomeDelta
    ? outcomeDelta.routeChanged
      ? '訪問順が変わりました'
      : '訪問順は同じです'
    : previousWasComparable
      ? '最初の実行を待っています'
      : '交通状況が変わったため前回比較なし';

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
            今回の成果
          </h2>
          <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
            ルートが同じでも、選ばれやすさが上がれば計算は前に進んでいます。
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

      {top ? (
        <>
          <div className="grid gap-3 md:grid-cols-5">
            <MetricCard
              label="距離"
              value={formatDistance(top.distance)}
              detail={`${top.distanceRank}位 / ${totalRoutes}`}
            />
            <MetricCard
              label="最短との差"
              value={formatSignedDistance(top.deltaFromOptimal)}
              detail="0.00 が理論上の最短"
            />
            <MetricCard
              label="配送時間"
              value={deliveryMinutes ? formatDeliveryMinutes(deliveryMinutes) : '—'}
              detail="同じ速度で走った場合"
            />
            <MetricCard
              label="確信度"
              value={`${topAmplification.toFixed(1)}倍`}
              detail={`平均 ${(uniformProbability * 100).toFixed(2)}% 比`}
            />
            <MetricCard
              label="前回との差"
              value={
                outcomeDelta
                  ? formatSignedDistance(outcomeDelta.distanceDelta)
                  : previousWasComparable
                    ? '初回'
                    : '条件変更'
              }
              detail={
                outcomeDelta
                  ? `${formatSignedAmplification(outcomeDelta.amplificationDelta)}`
                  : '比較対象なし'
              }
            />
          </div>

          <div
            className="mt-3 rounded-lg p-3 text-sm"
            style={{
              background: outcomeDelta?.routeChanged
                ? 'oklch(94% 0.03 170 / 0.55)'
                : 'oklch(96% 0.012 80)',
              color: 'var(--color-ink-soft)',
            }}
          >
            <strong style={{ color: 'var(--color-ink)' }}>{routeChangedText}</strong>
            {outcomeDelta && !outcomeDelta.routeChanged && (
              <span>
                。今回は距離よりも、1位候補の選ばれやすさが
                {formatSignedAmplification(outcomeDelta.amplificationDelta)}
                変わっています。
              </span>
            )}
            {outcomeDelta?.routeChanged && previousRoute && (
              <div className="mt-2 grid gap-1 text-xs md:grid-cols-2">
                <div>前回: {describeRouteOrder(previousRoute)}</div>
                <div>今回: {describeRouteOrder(top)}</div>
              </div>
            )}
            {sampledRoute && !sameRouteForDisplay(sampledRoute, top) && (
              <p className="mt-2 text-xs">
                取り出したルートは確率に従って選ばれるため、1位候補と違う場合があります。
              </p>
            )}
          </div>
        </>
      ) : (
        <p className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>
          まだ実行されていません。まず「この設定で実行」を押すと、距離・配送時間・確信度がここに出ます。
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

function formatSignedAmplification(value: number): string {
  if (Math.abs(value) < 0.05) return '+0.0倍';
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}倍`;
}

function sameRouteForDisplay(a: RouteCandidate, b: RouteCandidate): boolean {
  return a.order.join(',') === b.order.join(',');
}
