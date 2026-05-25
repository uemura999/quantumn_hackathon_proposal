'use client';

import type { CityProblem, RouteCandidate } from '@/engine/types';
import { DEPOT_INDEX } from '@/engine/tsp';
import { useLabelStore } from '@/store/labelStore';
import type { TruckJourneyProgress } from '@/components/city/Truck';

interface RouteJourneyStatusProps {
  readonly problem: CityProblem;
  readonly route: RouteCandidate | null;
  readonly progress: TruckJourneyProgress;
  readonly running: boolean;
}

type StopState = 'done' | 'active' | 'pending';

export function RouteJourneyStatus({
  problem,
  route,
  progress,
  running,
}: RouteJourneyStatusProps) {
  const labelOverrides = useLabelStore((s) => s.labels);
  if (!route) return null;

  const deliveryById = new Map(problem.deliveries.map((delivery) => [delivery.id, delivery]));
  const orderedDeliveryIds = route.order.filter((id) => id !== DEPOT_INDEX);
  const completedDeliveries = Math.min(
    progress.completedDeliveries,
    orderedDeliveryIds.length,
  );
  const percentage = Math.round(progress.fraction * 100);
  const deliveryLabel = (id: number): string => {
    const customLabel = labelOverrides[id];
    return customLabel && customLabel.trim().length > 0
      ? customLabel
      : deliveryById.get(id)?.label ?? `配送先 ${id + 1}`;
  };
  const nextDeliveryId = orderedDeliveryIds[completedDeliveries] ?? null;
  const status =
    percentage === 100
      ? '配送完了: van は倉庫へ帰着しました'
      : !running
        ? `出発準備中: 最初の配送先は ${deliveryLabel(orderedDeliveryIds[0])}`
        : nextDeliveryId === null
          ? '全配送先を通過: 倉庫へ戻っています'
          : `配送中: ${deliveryLabel(nextDeliveryId)} へ向かっています`;

  return (
    <section
      aria-label="van の走行進捗"
      className="absolute inset-x-3 bottom-3 z-10 rounded-xl border px-4 pb-3 pt-3"
      style={{
        background: 'oklch(98% 0.005 80 / 0.94)',
        borderColor: 'oklch(85% 0.012 80 / 0.9)',
        boxShadow: 'var(--shadow-hud)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.22em]"
            style={{ color: 'var(--color-accent-strong)' }}
          >
            Van Route
          </p>
          <p
            className="text-sm font-medium"
            style={{ color: 'var(--color-ink)' }}
            aria-live="polite"
          >
            {status}
          </p>
        </div>
        <p className="font-mono text-sm" style={{ color: 'var(--color-ink-soft)' }}>
          {completedDeliveries} / {orderedDeliveryIds.length} 配送済み · {percentage}%
        </p>
      </div>

      <div
        className="h-1.5 overflow-hidden rounded-full"
        role="progressbar"
        aria-label="走行完了率"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentage}
        style={{ background: 'oklch(89% 0.012 80)' }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${percentage}%`,
            background: 'var(--color-accent)',
            transition: running ? 'width 140ms linear' : 'none',
          }}
        />
      </div>

      <ol
        aria-label="配送順"
        className="mt-3 flex gap-2 overflow-x-auto pb-1"
      >
        <JourneyStop label="倉庫" marker="発" state={running || percentage > 0 ? 'done' : 'active'} />
        {orderedDeliveryIds.map((id, index) => {
          const state: StopState =
            index < completedDeliveries
              ? 'done'
              : index === completedDeliveries && percentage < 100
                ? 'active'
                : 'pending';
          return (
            <JourneyStop
              key={id}
              label={deliveryLabel(id)}
              marker={String(index + 1)}
              state={state}
            />
          );
        })}
        <JourneyStop
          label="倉庫へ帰着"
          marker="着"
          state={
            percentage === 100
              ? 'done'
              : completedDeliveries === orderedDeliveryIds.length
                ? 'active'
                : 'pending'
          }
        />
      </ol>
    </section>
  );
}

interface JourneyStopProps {
  readonly label: string;
  readonly marker: string;
  readonly state: StopState;
}

function JourneyStop({ label, marker, state }: JourneyStopProps) {
  const palette =
    state === 'done'
      ? {
          background: 'oklch(93% 0.035 165)',
          border: 'oklch(77% 0.05 165)',
          markerBackground: 'oklch(63% 0.095 165)',
          markerColor: 'white',
        }
      : state === 'active'
        ? {
            background: 'oklch(96% 0.045 72)',
            border: 'oklch(78% 0.095 65)',
            markerBackground: 'var(--color-accent)',
            markerColor: 'white',
          }
        : {
            background: 'var(--color-surface)',
            border: 'oklch(88% 0.012 80)',
            markerBackground: 'oklch(91% 0.012 80)',
            markerColor: 'var(--color-muted)',
          };

  return (
    <li
      className="flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-1 text-xs"
      style={{
        background: palette.background,
        borderColor: palette.border,
        color: state === 'pending' ? 'var(--color-muted)' : 'var(--color-ink)',
      }}
    >
      <span
        className="flex h-5 min-w-5 items-center justify-center rounded-full px-1 font-mono text-[10px] font-semibold"
        style={{
          background: palette.markerBackground,
          color: palette.markerColor,
        }}
      >
        {state === 'done' ? '✓' : marker}
      </span>
      <span>{label}</span>
    </li>
  );
}
