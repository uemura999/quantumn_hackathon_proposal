'use client';

import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Panel } from '@/components/ui/Panel';
import { WavePanel } from '@/components/wave/WavePanel';
import { runQaoa } from '@/engine/qaoa';
import type { QaoaParams, QaoaResult } from '@/engine/types';
import type { StepBaseProps } from './stepShared';
import type { Metaphor } from '@/lib/metaphors';

interface Preset {
  readonly value: number;
  readonly label: string;
  readonly hint?: string;
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
  readonly extraWidget?: ReactNode | ((params: QaoaParams) => ReactNode);
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
  extraWidget,
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

  const activePreset = presets.find((p) => Math.abs(value - p.value) < step / 2);

  return (
    <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr_0.95fr]">
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

      <div className="flex flex-col gap-4">
        <WavePanel
          problem={problem}
          mode="frozen"
          frozenDistribution={result?.distribution ?? []}
          params={params}
          showInterferenceHint={false}
        />
        {typeof extraWidget === 'function' ? extraWidget(params) : extraWidget}
      </div>

      <Panel>
        <h2
          className="font-semibold mb-2"
          style={{ fontSize: '1.15rem', fontFamily: 'var(--font-display)' }}
        >
          {metaphor.headline}
        </h2>
        <p
          className="text-sm mb-3"
          style={{ color: 'var(--color-ink-soft)', lineHeight: 1.7 }}
        >
          {metaphor.story}
        </p>

        <div
          className="rounded-lg p-3 mb-3"
          style={{ background: 'oklch(96% 0.012 80)' }}
        >
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
          {activePreset?.hint && (
            <p className="mt-2 text-[11px]" style={{ color: 'var(--color-muted)' }}>
              💡 {activePreset.hint}
            </p>
          )}
        </div>

        <details
          className="rounded-lg p-3 mb-3 text-xs"
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
          <p className="mt-2">{metaphor.mechanism}</p>
          {metaphor.goldZone && (
            <p className="mt-2" style={{ color: 'var(--color-accent-strong)' }}>
              🟢 {metaphor.goldZone}
            </p>
          )}
        </details>

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
