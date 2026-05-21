'use client';

import Link from 'next/link';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { metaphors } from '@/lib/metaphors';

interface RecapCard {
  readonly num: string;
  readonly title: string;
  readonly body: string;
}

const CARDS: ReadonlyArray<RecapCard> = [
  { num: 'γ', title: metaphors.gamma.headline, body: metaphors.gamma.story },
  { num: 'β', title: metaphors.beta.headline, body: metaphors.beta.story },
  { num: 'r', title: metaphors.reps.headline, body: metaphors.reps.story },
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
          量子コンピュータを動かすには、3 つのパラメータを調整するだけ。それぞれの「意味」が体でわかれば、最短ルートを見つけるのは時間の問題です。
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
              style={{ fontSize: '1rem', lineHeight: 1.4 }}
            >
              {c.title}
            </h3>
            <p
              className="text-sm"
              style={{ color: 'var(--color-ink-soft)', lineHeight: 1.7 }}
            >
              {c.body}
            </p>
          </Panel>
        ))}
      </div>

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
