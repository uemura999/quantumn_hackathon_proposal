'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from '@/lib/reducedMotion';

interface ExecutionNarrationProps {
  readonly trigger: number;
  readonly gamma: number;
  readonly reps: number;
}

interface Step {
  readonly icon: string;
  readonly title: string;
  readonly body: (ctx: { gamma: number; reps: number }) => string;
}

const STEPS: ReadonlyArray<Step> = [
  {
    icon: '⚛️',
    title: '重ね合わせ中…',
    body: () => '24 通りのルートを「全部同時」に考えています。',
  },
  {
    icon: '🎯',
    title: '採点ルールを適用…',
    body: ({ gamma }) =>
      `γ=${gamma.toFixed(2)} で「短いルートが好き」を伝えました。`,
  },
  {
    icon: '🎲',
    title: '測定…',
    body: ({ reps }) =>
      `${reps} 回考え直して、一番可能性が高いルートを取り出します。`,
  },
];

const STEP_MS = 320;

export function ExecutionNarration({
  trigger,
  gamma,
  reps,
}: ExecutionNarrationProps) {
  const prefersReduced = useReducedMotion();
  const [active, setActive] = useState<number>(-1);

  useEffect(() => {
    if (trigger === 0) return;
    setActive(0);
    const timers: number[] = [];
    if (prefersReduced) {
      timers.push(window.setTimeout(() => setActive(1), 50));
      timers.push(window.setTimeout(() => setActive(2), 100));
      timers.push(window.setTimeout(() => setActive(-1), STEP_MS * 3));
    } else {
      timers.push(window.setTimeout(() => setActive(1), STEP_MS));
      timers.push(window.setTimeout(() => setActive(2), STEP_MS * 2));
      timers.push(window.setTimeout(() => setActive(-1), STEP_MS * 3 + 400));
    }
    return () => {
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [trigger, prefersReduced]);

  if (active < 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-8 z-40 flex justify-center px-4"
    >
      <div
        className="flex w-full max-w-xl gap-2 rounded-2xl p-3"
        style={{
          background: 'oklch(20% 0.04 260 / 0.92)',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 12px 40px -8px oklch(20% 0.04 260 / 0.6)',
          border: '1px solid oklch(70% 0.14 50 / 0.3)',
        }}
      >
        {STEPS.map((step, i) => {
          const state = i < active ? 'done' : i === active ? 'active' : 'pending';
          return (
            <div
              key={i}
              className="flex-1 rounded-xl px-3 py-2 transition-all"
              style={{
                background:
                  state === 'active'
                    ? 'oklch(70% 0.14 50 / 0.25)'
                    : 'transparent',
                opacity: state === 'pending' ? 0.45 : 1,
                transform:
                  state === 'active' ? 'translateY(-2px)' : 'translateY(0)',
              }}
            >
              <div className="flex items-baseline gap-2">
                <span className="text-base">{step.icon}</span>
                <span
                  className="text-xs font-semibold"
                  style={{ color: 'oklch(94% 0.012 80)' }}
                >
                  {step.title}
                </span>
              </div>
              <p
                className="mt-1 text-[0.7rem] leading-snug"
                style={{ color: 'oklch(80% 0.02 80)' }}
              >
                {step.body({ gamma, reps })}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
