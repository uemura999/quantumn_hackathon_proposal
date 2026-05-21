'use client';

import { useEffect, useState } from 'react';
import { useSessionStore, sessionDurationMs } from '@/store/sessionStore';
import { formatTimeLeft } from '@/lib/animation';

export function Timer() {
  const startedAt = useSessionStore((s) => s.startedAt);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (startedAt === null) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [startedAt]);

  const elapsed = startedAt === null ? 0 : now - startedAt;
  const remaining = sessionDurationMs - elapsed;
  const label = startedAt === null ? '--:--' : formatTimeLeft(remaining);
  const warning = startedAt !== null && remaining < 10 * 60 * 1000;

  return (
    <div className="flex flex-col items-start leading-tight">
      <span className="text-[0.7rem] uppercase tracking-[0.18em] text-[color:var(--color-muted)]">
        Time Left
      </span>
      <span
        className="font-mono tabular-nums"
        style={{
          fontSize: 'var(--text-score)',
          color: warning ? 'var(--color-accent-strong)' : 'var(--color-ink)',
          letterSpacing: '0.02em',
        }}
      >
        {label}
      </span>
    </div>
  );
}
