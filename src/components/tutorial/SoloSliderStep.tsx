'use client';

import { useEffect, useMemo, useState } from 'react';
import { Panel } from '@/components/ui/Panel';
import { runQaoa } from '@/engine/qaoa';
import type { QaoaParams, QaoaResult } from '@/engine/types';
import type { StepBaseProps } from './stepShared';
import type { Metaphor } from '@/lib/metaphors';

interface Preset {
  readonly value: number;
  readonly label: string;
}

interface SoloSliderStepProps extends StepBaseProps {
  readonly metaphor: Metaphor;
  readonly paramKey: 'gamma' | 'beta' | 'reps';
  readonly fixedParams: Omit<QaoaParams, 'gamma' | 'beta' | 'reps'> &
    Partial<QaoaParams>;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly initial: number;
  readonly presets: ReadonlyArray<Preset>;
  readonly formatValue: (v: number) => string;
}

export function SoloSliderStep({
  problem,
  CityScene,
  metaphor,
  paramKey,
  fixedParams,
  min,
  max,
  step,
  initial,
  presets,
  formatValue,
}: SoloSliderStepProps) {
  const [value, setValue] = useState(initial);
  const [result, setResult] = useState<QaoaResult | null>(null);

  const params = useMemo<QaoaParams>(
    () => ({
      gamma: fixedParams.gamma ?? 0,
      beta: fixedParams.beta ?? 0,
      reps: fixedParams.reps ?? 1,
      [paramKey]: value,
    }),
    [fixedParams, paramKey, value],
  );

  useEffect(() => {
    const id = window.setTimeout(() => {
      setResult(runQaoa(problem, params));
    }, 60);
    return () => window.clearTimeout(id);
  }, [problem, params]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <Panel style={{ padding: 0 }} className="overflow-hidden">
        <div className="h-[52vh] min-h-[380px] w-full">
          <CityScene
            problem={problem}
            distribution={result?.distribution ?? []}
            truckRoute={null}
            truckRunning={false}
            pulsing={false}
            showLabels
          />
        </div>
      </Panel>

      <Panel>
        <h2
          className="font-semibold mb-2"
          style={{ fontSize: '1.2rem', fontFamily: 'var(--font-display)' }}
        >
          {metaphor.headline}
        </h2>
        <p
          className="text-sm mb-4"
          style={{ color: 'var(--color-ink-soft)', lineHeight: 1.75 }}
        >
          {metaphor.story}
        </p>

        <div className="rounded-lg p-3 mb-4" style={{ background: 'oklch(96% 0.012 80)' }}>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">スライダー</span>
            <span
              className="font-mono text-sm tabular-nums"
              style={{ color: 'var(--color-accent-strong)' }}
            >
              {formatValue(value)}
            </span>
          </div>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => setValue(Number(e.currentTarget.value))}
            className="w-full accent-[color:var(--color-accent-strong)] cursor-pointer"
            aria-label={metaphor.headline}
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {presets.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setValue(p.value)}
                className="rounded-full px-3 py-1 text-xs font-medium transition-colors"
                style={{
                  background:
                    Math.abs(value - p.value) < step / 2
                      ? 'oklch(70% 0.14 50)'
                      : 'oklch(98% 0.005 80)',
                  color:
                    Math.abs(value - p.value) < step / 2
                      ? 'oklch(98% 0.005 80)'
                      : 'var(--color-ink-soft)',
                  border: '1px solid oklch(80% 0.012 80)',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <p
          className="text-xs rounded-lg p-3"
          style={{
            color: 'var(--color-ink)',
            background: 'oklch(98% 0.005 80)',
            border: '1px dashed oklch(78% 0.014 80)',
            lineHeight: 1.7,
          }}
        >
          <strong>試してみよう：</strong>
          <br />
          {metaphor.tryIt}
        </p>
      </Panel>
    </div>
  );
}
