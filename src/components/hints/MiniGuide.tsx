'use client';

import { useEffect } from 'react';
import { useSessionStore } from '@/store/sessionStore';
import { useHintStore } from '@/store/hintStore';

const AUTO_HINT_AFTER_MS = 90 * 1000;

interface MiniGuideProps {
  readonly running: boolean;
}

export function MiniGuide({ running }: MiniGuideProps) {
  const attempts = useSessionStore((s) => s.history.length);
  const bestScore = useSessionStore((s) => s.bestScore);
  const lastInteraction = useHintStore((s) => s.lastInteractionAt);
  const triggerAutoHint = useHintStore((s) => s.triggerAutoHint);

  useEffect(() => {
    const id = window.setInterval(() => {
      const idle = Date.now() - lastInteraction;
      if (idle > AUTO_HINT_AFTER_MS) {
        triggerAutoHint();
      }
    }, 5000);
    return () => window.clearInterval(id);
  }, [lastInteraction, triggerAutoHint]);

  let message: string;
  if (running) {
    message = '量子計算中… 重ね合わせが収束しています。';
  } else if (attempts === 0) {
    message = 'γ・β・reps を動かして「量子で実行」を押してみよう。';
  } else if (!bestScore) {
    message = 'もう一度、パラメータを変えて実行してみよう。';
  } else {
    message = `現在のベスト ${bestScore.distance.toFixed(2)}u。さらに縮められる？`;
  }

  return (
    <aside
      aria-live="polite"
      className="rounded-lg p-3"
      style={{
        background: 'oklch(98% 0.005 80)',
        border: '1px dashed oklch(78% 0.014 80)',
      }}
    >
      <p
        className="text-xs uppercase tracking-widest mb-1"
        style={{ color: 'var(--color-muted)' }}
      >
        Now
      </p>
      <p className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>
        {message}
      </p>
    </aside>
  );
}
