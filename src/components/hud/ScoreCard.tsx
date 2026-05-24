'use client';

import { useSessionStore } from '@/store/sessionStore';
import { formatDistance } from '@/lib/animation';

export function ScoreCard() {
  const bestScore = useSessionStore((s) => s.bestScore);
  const attempts = useSessionStore((s) => s.history.length);

  return (
    <div className="flex flex-col items-end leading-tight">
      <span className="text-[0.7rem] uppercase tracking-[0.18em] text-[color:var(--color-muted)]">
        Best Route
      </span>
      <span
        className="font-mono tabular-nums"
        style={{
          fontSize: 'var(--text-score)',
          color: bestScore
            ? 'var(--color-accent-strong)'
            : 'var(--color-ink-soft)',
        }}
      >
        {bestScore ? formatDistance(bestScore.distance) : '— 距離pt'}
      </span>
      <span className="text-[0.75rem] text-[color:var(--color-muted)] mt-0.5">
        試行 {attempts} 回
      </span>
    </div>
  );
}
