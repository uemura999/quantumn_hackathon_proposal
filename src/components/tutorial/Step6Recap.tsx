'use client';

import Link from 'next/link';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { metaphors } from '@/lib/metaphors';
import { glossary } from '@/lib/glossary';

interface RecapCard {
  readonly num: string;
  readonly title: string;
  readonly body: string;
  readonly mechanism: string;
}

const CARDS: ReadonlyArray<RecapCard> = [
  {
    num: 'γ',
    title: metaphors.gamma.headline,
    body: metaphors.gamma.story,
    mechanism: metaphors.gamma.mechanism,
  },
  {
    num: 'β',
    title: metaphors.beta.headline,
    body: metaphors.beta.story,
    mechanism: metaphors.beta.mechanism,
  },
  {
    num: 'p',
    title: metaphors.reps.headline,
    body: metaphors.reps.story,
    mechanism: metaphors.reps.mechanism,
  },
];

export function Step6Recap() {
  return (
    <div className="space-y-6">
      <Panel>
        <h2
          className="font-semibold mb-2"
          style={{ fontSize: '1.3rem', fontFamily: 'var(--font-display)' }}
        >
          今日学んだこと
        </h2>
        <p
          className="text-sm"
          style={{ color: 'var(--color-ink-soft)', lineHeight: 1.7 }}
        >
          今日使うつまみは 3 つだけです。短い道に印をつける、候補を混ぜる、考え直す。この 3 つで、たくさんのルート候補から良さそうな道を探します。
        </p>
      </Panel>

      <div className="grid gap-4 md:grid-cols-3">
        {CARDS.map((c) => (
          <Panel key={c.num}>
            <div
              className="font-mono mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full text-base font-bold"
              style={{
                background: 'oklch(70% 0.14 50)',
                color: 'oklch(98% 0.005 80)',
              }}
            >
              {c.num}
            </div>
            <h3
              className="font-semibold mb-1"
              style={{ fontSize: '0.95rem', lineHeight: 1.4 }}
            >
              {c.title}
            </h3>
            <p
              className="text-xs mb-2"
              style={{ color: 'var(--color-ink-soft)', lineHeight: 1.7 }}
            >
              {c.body}
            </p>
            <details
              className="rounded-md p-2 text-[11px]"
              style={{
                background: 'oklch(96% 0.018 200 / 0.35)',
                border: '1px solid oklch(82% 0.04 200)',
                color: 'var(--color-ink)',
                lineHeight: 1.65,
              }}
            >
              <summary
                className="cursor-pointer font-semibold"
                style={{ color: 'oklch(48% 0.12 230)' }}
              >
                なぜそうなる？
              </summary>
              <p className="mt-1">{c.mechanism}</p>
            </details>
          </Panel>
        ))}
      </div>

      <Panel>
        <h3
          className="font-semibold mb-2"
          style={{ fontSize: '1.05rem' }}
        >
          🚦 渋滞があるとどうなる？
        </h3>
        <p
          className="text-sm"
          style={{ color: 'var(--color-ink-soft)', lineHeight: 1.7 }}
        >
          {glossary.traffic.summary}
        </p>
        <p
          className="mt-2 text-xs"
          style={{ color: 'var(--color-muted)', lineHeight: 1.7 }}
        >
          チャレンジ画面では渋滞のある道(<span style={{ color: '#E69B4B' }}>黄</span>/<span style={{ color: '#C8533C' }}>赤</span>) を避ける形でルートが選ばれるはずです。同じつまみでも、道の混み方が変わると答えが変わります。
        </p>
      </Panel>

      <Panel>
        <p
          className="text-sm mb-4"
          style={{ color: 'var(--color-ink-soft)', lineHeight: 1.75 }}
        >
          いよいよ本番です。チームで一番短いルートを探しに行こう。
          チャレンジ画面ではタイマーが動き、ベストスコアが記録されます。
        </p>
        <Link href="/challenge">
          <Button className="w-full md:w-auto">チャレンジを始める →</Button>
        </Link>
      </Panel>
    </div>
  );
}
