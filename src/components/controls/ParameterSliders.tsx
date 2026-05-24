'use client';

import {
  BETA_RANGE,
  GAMMA_RANGE,
  REPS_RANGE,
  useParamsStore,
} from '@/store/paramsStore';
import { useHintStore } from '@/store/hintStore';
import { GlossaryTooltip } from '@/components/hints/GlossaryTooltip';

interface SliderRowProps {
  readonly label: React.ReactNode;
  readonly value: number;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly format: (v: number) => string;
  readonly description: string;
  readonly onChange: (v: number) => void;
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  format,
  description,
  onChange,
}: SliderRowProps) {
  const recordInteraction = useHintStore((s) => s.recordInteraction);
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-sm font-medium" style={{ color: 'var(--color-ink)' }}>
          {label}
        </span>
        <span
          className="font-mono text-sm tabular-nums"
          style={{ color: 'var(--color-accent-strong)' }}
        >
          {format(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => {
          recordInteraction();
          onChange(Number(e.currentTarget.value));
        }}
        className="w-full accent-[color:var(--color-accent-strong)] cursor-pointer"
        style={{ height: '1.5rem' }}
      />
      <p className="mt-1 text-[11px]" style={{ color: 'var(--color-muted)' }}>
        {description}
      </p>
    </div>
  );
}

function describeGamma(value: number): string {
  if (value < 0.2) return '印なし: どの候補もほぼ同じ強さです。';
  if (value < 1.3) return '短い候補に印がつき、選ばれやすさが上がりやすい範囲です。';
  return '印が強い範囲です。候補の差が大きくなりますが、強すぎると偏りも出ます。';
}

function describeBeta(value: number): string {
  if (value < 0.05) return '混ぜない: 印をつけても候補バーに差が出にくい状態です。';
  if (value < 0.65) return 'ほどよく混ぜる: 印が候補バーの差として見えやすくなります。';
  return '強く混ぜる: 候補全体に大きく広がり、結果が変わりやすい範囲です。';
}

function describeReps(value: number): string {
  if (value <= 1) return '1回: まだ候補の差が小さく、迷いが残ります。';
  if (value === 2) return '2回: 印をつける/混ぜるをもう一度行い、差が見えやすくなります。';
  return '3回: さらに絞り込みます。計算時間も少し増えます。';
}

export function ParameterSliders() {
  const { gamma, beta, reps, setGamma, setBeta, setReps } = useParamsStore();

  return (
    <div className="space-y-5">
      <SliderRow
        label={<GlossaryTooltip k="gamma" />}
        value={gamma}
        min={GAMMA_RANGE.min}
        max={GAMMA_RANGE.max}
        step={0.05}
        format={(v) => v.toFixed(2)}
        description={describeGamma(gamma)}
        onChange={setGamma}
      />
      <SliderRow
        label={<GlossaryTooltip k="beta" />}
        value={beta}
        min={BETA_RANGE.min}
        max={BETA_RANGE.max}
        step={0.02}
        format={(v) => v.toFixed(2)}
        description={describeBeta(beta)}
        onChange={setBeta}
      />
      <SliderRow
        label={<GlossaryTooltip k="reps" />}
        value={reps}
        min={REPS_RANGE.min}
        max={REPS_RANGE.max}
        step={1}
        format={(v) => String(v)}
        description={describeReps(reps)}
        onChange={setReps}
      />
    </div>
  );
}
