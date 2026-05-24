'use client';

import { useMemo } from 'react';
import { runQaoa } from '@/engine/qaoa';
import type { CityProblem, QaoaParams, RouteCandidate } from '@/engine/types';
import { useParamsStore } from '@/store/paramsStore';
import { formatDistance } from '@/lib/animation';
import { analyzeDistributionShape } from '@/lib/distributionShape';

interface WavePanelProps {
  readonly problem: CityProblem;
  readonly mode?: 'live' | 'frozen';
  readonly frozenDistribution?: ReadonlyArray<RouteCandidate>;
  readonly params?: QaoaParams;
  readonly maxBars?: number;
  readonly title?: string;
  readonly showInterferenceHint?: boolean;
}

const TOP_COLORS = ['#3DD9C8', '#FFC557', '#B68CFF', '#7BB8FF'];
const DIM_COLOR = '#A5B0C9';
const FLAT_COLOR = '#8FB8C7';

export function WavePanel({
  problem,
  mode = 'live',
  frozenDistribution,
  params,
  maxBars = 12,
  title = '候補の強さ',
  showInterferenceHint = true,
}: WavePanelProps) {
  const storeGamma = useParamsStore((s) => s.gamma);
  const storeBeta = useParamsStore((s) => s.beta);
  const storeReps = useParamsStore((s) => s.reps);
  const displayParams = params ?? {
    gamma: storeGamma,
    beta: storeBeta,
    reps: storeReps,
  };

  const distribution = useMemo<ReadonlyArray<RouteCandidate>>(() => {
    if (mode === 'frozen' && frozenDistribution) {
      return frozenDistribution;
    }
    const result = runQaoa(problem, displayParams);
    return result.distribution;
  }, [problem, displayParams, mode, frozenDistribution]);

  const valid = useMemo(
    () => distribution.filter((c) => c.isValid),
    [distribution],
  );

  const bars = useMemo(() => {
    if (valid.length === 0) return [];
    const top = valid.slice(0, maxBars);
    const topAmp = Math.sqrt(top[0]?.probability ?? 1) || 1;
    return top.map((c, idx) => {
      const amp = Math.sqrt(c.probability);
      const ratio = amp / topAmp;
      return {
        idx,
        order: c.order,
        distance: c.distance,
        distanceRank: c.distanceRank,
        probability: c.probability,
        amplitude: amp,
        ratio,
        color: idx < TOP_COLORS.length ? TOP_COLORS[idx] : DIM_COLOR,
      };
    });
  }, [valid, maxBars]);

  const shape = useMemo(() => analyzeDistributionShape(valid), [valid]);
  const meanProb = shape.meanProbability;
  const amplification = shape.topAmplification;
  const flat = shape.flat;

  return (
    <section
      aria-label="候補の強さパネル"
      className="rounded-xl border p-4"
      style={{
        background:
          'linear-gradient(180deg, oklch(98% 0.006 80) 0%, oklch(95% 0.012 250 / 0.6) 100%)',
        borderColor: 'oklch(85% 0.012 80)',
      }}
    >
      <header className="mb-3 flex items-baseline justify-between gap-3">
        <h3
          className="text-sm font-semibold tracking-wide"
          style={{ color: 'var(--color-ink, oklch(20% 0.04 260))' }}
        >
          {title}
        </h3>
        <span
          className="font-mono text-[11px]"
          style={{ color: 'var(--color-muted)' }}
        >
          好み {displayParams.gamma.toFixed(2)} / 混ぜる{' '}
          {displayParams.beta.toFixed(2)} / {displayParams.reps}回
        </span>
      </header>

      {bars.length === 0 ? (
        <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
          まだ波がありません。
        </p>
      ) : (
        <ol
          className="space-y-1.5"
          aria-label={flat ? 'ルート候補例' : '上位ルート候補'}
        >
          {bars.map((b) => (
            <li key={b.idx} className="flex items-center gap-2 text-xs">
              <span
                className="w-8 font-mono"
                style={{ color: 'var(--color-muted)' }}
              >
                {flat ? `例${b.idx + 1}` : `${b.idx + 1}位`}
              </span>
              <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-[oklch(92%_0.01_80)]">
                <div
                  className="h-full rounded-full transition-all duration-200 ease-out"
                  style={{
                    width: `${Math.max(2, b.ratio * 100)}%`,
                    background: flat ? FLAT_COLOR : b.color,
                    boxShadow:
                      !flat && b.idx === 0
                        ? `0 0 8px ${b.color}80`
                        : '0 0 4px transparent',
                  }}
                />
              </div>
              <span
                className="w-14 text-right font-mono"
                style={{ color: 'var(--color-ink, oklch(20% 0.04 260))' }}
              >
                {(b.probability * 100).toFixed(1)}%
              </span>
              <span
                className="w-20 text-right font-mono"
                style={{ color: 'var(--color-muted)' }}
              >
                {formatDistance(b.distance)}
              </span>
              <span
                className="w-12 text-right font-mono"
                style={{ color: 'var(--color-muted)' }}
              >
                {flat ? '横並び' : `${b.distanceRank}位`}
              </span>
            </li>
          ))}
        </ol>
      )}

      <footer className="mt-3 border-t pt-2 text-[11px]" style={{ borderColor: 'oklch(90% 0.012 80)' }}>
        <p style={{ color: 'var(--color-muted)' }}>
          何も考えないと 1/{valid.length} ≈ {(meanProb * 100).toFixed(2)}%。
          {flat ? (
            <>
              まだ候補に差はありません。ここでは候補例を並べています。
            </>
          ) : (
            <>
              いまの 1 位候補は平均の <strong>{amplification.toFixed(1)}倍</strong>。
            </>
          )}
        </p>
        {showInterferenceHint && !flat && (
          <p className="mt-1" style={{ color: 'var(--color-muted)' }}>
            短さの好みを強めると、短い候補が
            <span style={{ color: TOP_COLORS[0] }}> 緑</span> に集まりやすくなります。
          </p>
        )}
      </footer>
    </section>
  );
}
