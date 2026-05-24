'use client';

import Link from 'next/link';
import { Timer } from './Timer';
import { ScoreCard } from './ScoreCard';

interface NavLink {
  readonly href: string;
  readonly label: string;
}

const NAV_LINKS: ReadonlyArray<NavLink> = [
  { href: '/', label: 'Intro' },
  { href: '/tutorial', label: 'Tutorial' },
  { href: '/challenge', label: 'Challenge' },
  { href: '/story', label: 'Story' },
  { href: '/result', label: 'Result' },
];

export function GlobalHUD() {
  return (
    <header
      className="sticky top-0 z-40 backdrop-blur-md"
      style={{
        background: 'oklch(96% 0.008 80 / 0.78)',
        borderBottom: '1px solid oklch(80% 0.012 80 / 0.6)',
      }}
    >
      <div
        className="mx-auto flex max-w-screen-2xl items-center justify-between gap-6"
        style={{ padding: 'var(--space-hud) clamp(1rem, 3vw, 2.5rem)' }}
      >
        <Timer />

        <nav
          aria-label="メインナビゲーション"
          className="hidden md:flex items-center gap-1 rounded-full px-2 py-1"
          style={{
            background: 'oklch(98% 0.005 80)',
            boxShadow: 'var(--shadow-hud)',
          }}
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-1.5 text-sm font-medium rounded-full transition-colors hover:bg-[oklch(94%_0.012_80)]"
              style={{ color: 'var(--color-ink-soft)' }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <ScoreCard />
      </div>
    </header>
  );
}
