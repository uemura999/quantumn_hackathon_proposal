'use client';

import { useHintStore } from '@/store/hintStore';
import { GlossaryTooltip } from './GlossaryTooltip';

interface HintLine {
  readonly level: 1 | 2 | 3;
  readonly node: React.ReactNode;
}

const HINTS: ReadonlyArray<HintLine> = [
  {
    level: 1,
    node: (
      <>
        <GlossaryTooltip k="gamma" /> を増やすと「短いルートを選ぶ強さ」が上がります。
      </>
    ),
  },
  {
    level: 2,
    node: (
      <>
        <GlossaryTooltip k="gamma" /> は <strong>0.8〜1.2</strong> くらいがよく効きます。
        <GlossaryTooltip k="beta" /> は <strong>0.3〜0.5</strong>。
      </>
    ),
  },
  {
    level: 3,
    node: (
      <>
        <strong>reps=2</strong> ・ γ≈1.0 ・ β≈0.4 から始めて、少しずつ動かしてみよう。
      </>
    ),
  },
];

export function HintPanel() {
  const currentLevel = useHintStore((s) => s.currentLevel);
  const bumpLevel = useHintStore((s) => s.bumpLevel);

  const visible = HINTS.filter((h) => h.level <= currentLevel);

  return (
    <section
      aria-label="ヒント"
      className="rounded-lg p-4"
      style={{
        background: 'oklch(96% 0.012 80)',
        border: '1px solid oklch(80% 0.012 80)',
      }}
    >
      <header className="flex items-center justify-between mb-2">
        <h3
          className="text-sm font-semibold uppercase tracking-widest"
          style={{ color: 'var(--color-muted)' }}
        >
          ヒント ({currentLevel} / 3)
        </h3>
        {currentLevel < 3 && (
          <button
            type="button"
            onClick={bumpLevel}
            className="text-xs font-medium underline"
            style={{ color: 'var(--color-accent-strong)' }}
          >
            もっと詳しく
          </button>
        )}
      </header>
      {visible.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--color-ink-soft)' }}>
          困ったら「もっと詳しく」を押してください。
        </p>
      ) : (
        <ul className="space-y-2">
          {visible.map((h) => (
            <li
              key={h.level}
              className="text-sm"
              style={{ color: 'var(--color-ink-soft)', lineHeight: 1.65 }}
            >
              <span
                className="font-mono mr-2"
                style={{ color: 'var(--color-accent)' }}
              >
                {`L${h.level}`}
              </span>
              {h.node}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
