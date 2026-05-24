'use client';

import { useMemo } from 'react';
import type { QaoaParams } from '@/engine/types';
import { useParamsStore } from '@/store/paramsStore';

interface InterferenceDemoProps {
  readonly width?: number;
  readonly height?: number;
  readonly samples?: number;
  readonly params?: Pick<QaoaParams, 'gamma'>;
  readonly hint?: string;
}

const SHORT_ROUTE_COLOR = '#3DD9C8';
const LONG_ROUTE_COLOR = '#C8533C';
const SUM_COLOR = '#1F2A4E';
const AXIS_COLOR = 'oklch(80% 0.015 80)';

interface WaveSample {
  readonly x: number;
  readonly waveA: number;
  readonly waveB: number;
  readonly sum: number;
}

export function InterferenceDemo({
  width = 320,
  height = 140,
  samples = 64,
  params,
  hint,
}: InterferenceDemoProps) {
  const storeGamma = useParamsStore((s) => s.gamma);
  const gamma = params?.gamma ?? storeGamma;

  const data = useMemo<ReadonlyArray<WaveSample>>(() => {
    const out: WaveSample[] = [];
    const shortFreq = 1;
    const longFreq = 1.1;
    const shortPhase = gamma * 0.05;
    const longPhase = gamma * 1.0;
    for (let i = 0; i < samples; i++) {
      const x = i / (samples - 1);
      const tau = x * Math.PI * 2;
      const waveA = Math.sin(tau * shortFreq + shortPhase);
      const waveB = Math.sin(tau * longFreq + longPhase);
      out.push({ x, waveA, waveB, sum: waveA + waveB });
    }
    return out;
  }, [gamma, samples]);

  const cancellation = useMemo(() => {
    const minSum = Math.min(...data.map((d) => Math.abs(d.sum)));
    const maxIndividual = Math.max(
      ...data.map((d) => Math.max(Math.abs(d.waveA), Math.abs(d.waveB))),
    );
    return 1 - minSum / Math.max(maxIndividual, 1e-6);
  }, [data]);

  const toPath = (points: ReadonlyArray<WaveSample>, key: keyof WaveSample): string => {
    return points
      .map((p, i) => {
        const x = p.x * width;
        const yValue = p[key] as number;
        const y = height / 2 - (yValue * height) / 4.4;
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  };

  return (
    <figure
      className="rounded-lg border p-3"
      style={{
        background: 'oklch(99% 0.004 80)',
        borderColor: 'oklch(88% 0.012 80)',
      }}
    >
      <figcaption className="mb-2 flex items-baseline justify-between gap-2">
        <span className="text-xs font-semibold" style={{ color: 'var(--color-ink)' }}>
          🌊 干渉のデモ
        </span>
        <span className="font-mono text-[11px]" style={{ color: 'var(--color-muted)' }}>
          短さの好み {gamma.toFixed(2)}
        </span>
      </figcaption>
      <svg
        width={width}
        height={height}
        role="img"
        aria-label="2つの波の干渉パターン"
      >
        <line
          x1="0"
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke={AXIS_COLOR}
          strokeDasharray="4 4"
        />
        <path
          d={toPath(data, 'waveA')}
          stroke={SHORT_ROUTE_COLOR}
          strokeWidth="1.5"
          fill="none"
          opacity="0.85"
        />
        <path
          d={toPath(data, 'waveB')}
          stroke={LONG_ROUTE_COLOR}
          strokeWidth="1.5"
          fill="none"
          opacity="0.85"
        />
        <path
          d={toPath(data, 'sum')}
          stroke={SUM_COLOR}
          strokeWidth="2.4"
          fill="none"
        />
      </svg>
      <div className="mt-2 flex gap-3 text-[11px]">
        <span style={{ color: SHORT_ROUTE_COLOR }}>● 短ルートの波</span>
        <span style={{ color: LONG_ROUTE_COLOR }}>● 長ルートの波</span>
        <span style={{ color: SUM_COLOR }}>● 合成</span>
      </div>
      <p className="mt-2 text-[11px]" style={{ color: 'var(--color-muted)' }}>
        {hint ??
          '短さの好みを上げると、2つの波が強め合う場所と消える場所が変わります。'}
        <span className="ml-1" style={{ color: 'var(--color-ink)' }}>
          打ち消し率 {(cancellation * 100).toFixed(0)}%
        </span>
      </p>
    </figure>
  );
}
