'use client';

import { Html } from '@react-three/drei';
import type { CityProblem } from '@/engine/types';
import { useLabelStore } from '@/store/labelStore';

interface CityLabelsProps {
  readonly problem: CityProblem;
  readonly highlightedIds?: ReadonlySet<number>;
  readonly nextPickId?: number | null;
  readonly nextLabelSuffix?: string;
}

const DEPOT_ID = -1;

interface LabelProps {
  readonly icon: string;
  readonly text: string;
  readonly variant: 'depot' | 'delivery' | 'next';
}

function Label({ icon, text, variant }: LabelProps) {
  const palette =
    variant === 'depot'
      ? { bg: 'oklch(20% 0.04 260 / 0.92)', fg: 'oklch(94% 0.012 80)' }
      : variant === 'next'
        ? { bg: 'oklch(70% 0.14 50 / 0.95)', fg: 'oklch(98% 0.005 80)' }
        : { bg: 'oklch(98% 0.005 80 / 0.92)', fg: 'oklch(20% 0.04 260)' };

  return (
    <div
      className="pointer-events-none whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium shadow-md"
      style={{
        background: palette.bg,
        color: palette.fg,
        border:
          variant === 'depot'
            ? '1px solid oklch(70% 0.14 50 / 0.5)'
            : '1px solid oklch(80% 0.02 80 / 0.7)',
        transform: 'translate(-50%, -100%)',
        letterSpacing: '0.02em',
      }}
    >
      <span className="mr-1">{icon}</span>
      {text}
    </div>
  );
}

export function CityLabels({
  problem,
  highlightedIds,
  nextPickId,
  nextLabelSuffix = ' (次にクリック)',
}: CityLabelsProps) {
  const labelOverrides = useLabelStore((s) => s.labels);
  return (
    <group>
      <Html
        position={[problem.depot.x, 1.6, problem.depot.y]}
        center
        distanceFactor={10}
        zIndexRange={[100, 0]}
      >
        <Label icon="🏠" text="倉庫 (スタート & ゴール)" variant="depot" />
      </Html>

      {problem.deliveries.map((d) => {
        const isHighlighted = highlightedIds?.has(d.id) ?? false;
        const isNext = nextPickId === d.id;
        const variant: LabelProps['variant'] = isNext
          ? 'next'
          : isHighlighted
            ? 'depot'
            : 'delivery';
        const icon = isHighlighted ? '✓' : isNext ? '👉' : '📦';
        const suffix = isHighlighted ? ' (済)' : isNext ? nextLabelSuffix : '';
        const customLabel = labelOverrides[d.id];
        const effectiveLabel =
          customLabel && customLabel.trim().length > 0
            ? customLabel
            : d.label;
        return (
          <Html
            key={d.id}
            position={[d.x, 1.5, d.y]}
            center
            distanceFactor={10}
            zIndexRange={[100, 0]}
          >
            <Label icon={icon} text={`${effectiveLabel}${suffix}`} variant={variant} />
          </Html>
        );
      })}
    </group>
  );
}

export const CITY_LABEL_DEPOT_ID = DEPOT_ID;
