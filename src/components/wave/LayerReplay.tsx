'use client';

import { useEffect, useMemo, useState } from 'react';
import { runQaoa } from '@/engine/qaoa';
import type { CityProblem, QaoaParams } from '@/engine/types';
import { useParamsStore } from '@/store/paramsStore';

interface LayerReplayProps {
  readonly problem: CityProblem;
  readonly params?: QaoaParams;
  readonly maxBars?: number;
}

const BAR_COLOR = '#3DD9C8';
const DIM_COLOR = '#A5B0C9';

function describeStep(i: number, reps: number): string {
  if (i === 0) return '最初: どのルートも同じくらい';
  const cycle = Math.floor((i - 1) / 2);
  const phase = (i - 1) % 2;
  if (cycle >= reps) return '取り出す直前';
  const layer = cycle + 1;
  if (phase === 0) return `${layer}回目: 短い道に印をつける`;
  return `${layer}回目: 候補どうしを混ぜる`;
}

export function LayerReplay({ problem, params, maxBars = 10 }: LayerReplayProps) {
  const storeGamma = useParamsStore((s) => s.gamma);
  const storeBeta = useParamsStore((s) => s.beta);
  const storeReps = useParamsStore((s) => s.reps);
  const displayParams = params ?? {
    gamma: storeGamma,
    beta: storeBeta,
    reps: storeReps,
  };

  const history = useMemo(() => {
    const result = runQaoa(problem, displayParams);
    return result.probabilityHistory;
  }, [problem, displayParams]);

  const [stepIdx, setStepIdx] = useState(0);
  useEffect(() => {
    setStepIdx(history.length - 1);
  }, [history]);

  const snapshot = history[Math.min(stepIdx, history.length - 1)] ?? [];
  const sortedIndices = useMemo(() => {
    const indices = snapshot.map((_, i) => i);
    indices.sort((a, b) => snapshot[b] - snapshot[a]);
    return indices.slice(0, maxBars);
  }, [snapshot, maxBars]);

  const topAmp = Math.sqrt(snapshot[sortedIndices[0] ?? 0] ?? 0) || 1;

  return (
    <section
      className="rounded-xl border p-4"
      style={{
        background: 'oklch(98% 0.006 80)',
        borderColor: 'oklch(85% 0.012 80)',
      }}
      aria-label="QAOA レイヤーごとの確率変化"
    >
      <header className="mb-2 flex items-baseline justify-between">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--color-ink)' }}>
          考え直しの流れ
        </h3>
        <span className="font-mono text-[11px]" style={{ color: 'var(--color-muted)' }}>
          step {stepIdx + 1}/{history.length}
        </span>
      </header>

      <p className="mb-2 text-xs" style={{ color: 'var(--color-ink)' }}>
        {describeStep(stepIdx, displayParams.reps)}
      </p>

      <input
        type="range"
        min={0}
        max={Math.max(0, history.length - 1)}
        step={1}
        value={stepIdx}
        onChange={(e) => setStepIdx(Number(e.target.value))}
        className="w-full"
        aria-label="QAOA レイヤー位置"
      />

      <ol className="mt-3 space-y-1" aria-label="上位ルート候補">
        {sortedIndices.map((idx, rank) => {
          const prob = snapshot[idx];
          const amp = Math.sqrt(prob);
          const ratio = amp / topAmp;
          return (
            <li key={idx} className="flex items-center gap-2 text-[11px]">
              <span className="w-6 font-mono" style={{ color: 'var(--color-muted)' }}>
                #{rank + 1}
              </span>
              <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-[oklch(92%_0.01_80)]">
                <div
                  className="h-full rounded-full transition-all duration-200"
                  style={{
                    width: `${Math.max(2, ratio * 100)}%`,
                    background: rank === 0 ? BAR_COLOR : DIM_COLOR,
                  }}
                />
              </div>
              <span
                className="w-12 text-right font-mono"
                style={{ color: 'var(--color-ink)' }}
              >
                {(prob * 100).toFixed(1)}%
              </span>
            </li>
          );
        })}
      </ol>

      <div className="mt-3 flex justify-between text-[11px]">
        <button
          type="button"
          onClick={() => setStepIdx(0)}
          className="underline"
          style={{ color: 'var(--color-muted)' }}
        >
          ⏮ 最初へ
        </button>
        <button
          type="button"
          onClick={() => setStepIdx((s) => Math.min(history.length - 1, s + 1))}
          className="underline"
          style={{ color: 'var(--color-muted)' }}
        >
          次の手 →
        </button>
        <button
          type="button"
          onClick={() => setStepIdx(history.length - 1)}
          className="underline"
          style={{ color: 'var(--color-muted)' }}
        >
          最後へ ⏭
        </button>
      </div>
    </section>
  );
}
