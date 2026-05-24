'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from '@/lib/reducedMotion';

interface ExecutionNarrationProps {
  readonly trigger: number;
  readonly gamma: number;
  readonly beta: number;
  readonly reps: number;
  readonly totalRoutes?: number;
}

interface Step {
  readonly icon: string;
  readonly title: string;
  readonly body: (ctx: { gamma: number; beta: number; reps: number; totalRoutes: number }) => string;
}

const STEPS: ReadonlyArray<Step> = [
  {
    icon: '⚛️',
    title: '候補を広げる',
    body: ({ totalRoutes }) =>
      `${totalRoutes} 通りのルート候補を同じ土台に並べています。`,
  },
  {
    icon: '🎯',
    title: '短い道に印をつける',
    body: ({ gamma }) =>
      `短さの好み ${gamma.toFixed(2)} で候補の強さを変えています。`,
  },
  {
    icon: '↔',
    title: '候補を混ぜる',
    body: ({ beta }) =>
      `混ぜる強さ ${beta.toFixed(2)} で、印をバーの差に変えています。`,
  },
  {
    icon: '🎲',
    title: '1本取り出す',
    body: ({ reps }) =>
      `${reps} 回考え直したあと、今回のルートを取り出します。`,
  },
];

const STEP_MS = 320;

export function ExecutionNarration({
  trigger,
  gamma,
  beta,
  reps,
  totalRoutes = 720,
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
      timers.push(window.setTimeout(() => setActive(3), 150));
      timers.push(window.setTimeout(() => setActive(-1), STEP_MS * 4));
    } else {
      timers.push(window.setTimeout(() => setActive(1), STEP_MS));
      timers.push(window.setTimeout(() => setActive(2), STEP_MS * 2));
      timers.push(window.setTimeout(() => setActive(3), STEP_MS * 3));
      timers.push(window.setTimeout(() => setActive(-1), STEP_MS * 4 + 400));
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
                {step.body({ gamma, beta, reps, totalRoutes })}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
