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
  readonly onChange: (v: number) => void;
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  format,
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
    </div>
  );
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
        onChange={setGamma}
      />
      <SliderRow
        label={<GlossaryTooltip k="beta" />}
        value={beta}
        min={BETA_RANGE.min}
        max={BETA_RANGE.max}
        step={0.02}
        format={(v) => v.toFixed(2)}
        onChange={setBeta}
      />
      <SliderRow
        label={<GlossaryTooltip k="reps" />}
        value={reps}
        min={REPS_RANGE.min}
        max={REPS_RANGE.max}
        step={1}
        format={(v) => String(v)}
        onChange={setReps}
      />
    </div>
  );
}
