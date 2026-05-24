'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { useSessionStore } from '@/store/sessionStore';

export default function IntroPage() {
  const startSession = useSessionStore((s) => s.startSession);
  const startedAt = useSessionStore((s) => s.startedAt);

  useEffect(() => {
    if (startedAt === null) startSession();
  }, [startedAt, startSession]);

  return (
    <section
      className="mx-auto max-w-screen-xl px-6 py-12 lg:py-20"
      aria-labelledby="intro-title"
    >
      <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <div>
          <p
            className="mb-4 text-sm font-medium uppercase tracking-[0.3em]"
            style={{ color: 'var(--color-accent-strong)' }}
          >
            NTT West × Dentsu — Quantum Workshop
          </p>
          <h1
            id="intro-title"
            className="font-bold leading-[1.05]"
            style={{
              fontSize: 'var(--text-hero)',
              fontFamily: 'var(--font-display)',
              color: 'var(--color-ink)',
              letterSpacing: '-0.02em',
            }}
          >
            Opening
            <br />
            Urban Challenges
            <br />
            <span style={{ color: 'var(--color-accent-strong)' }}>with Q.</span>
          </h1>
          <p
            className="mt-6 max-w-xl text-lg"
            style={{ color: 'var(--color-ink-soft)', lineHeight: 1.7 }}
          >
            街を走る配送トラックの最短ルートを、
            <br className="hidden md:inline" />
            <strong>たくさんの候補を同時に比べる考え方</strong>で探す2時間。
            <br />
            3つのつまみを動かすと、良さそうなルートが浮かび上がります。
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link href="/tutorial">
              <Button>👋 ハンズオンで始める →</Button>
            </Link>
            <Link
              href="/challenge"
              className="text-sm underline"
              style={{ color: 'var(--color-muted)' }}
            >
              知ってる人はここから（チャレンジ）
            </Link>
          </div>
          <p
            className="mt-4 text-xs"
            style={{ color: 'var(--color-muted)', lineHeight: 1.7 }}
          >
            初めての人向けに、短さの好み・混ぜる強さ・考え直す回数を体で覚える 7 ステップを用意しました。所要 10〜15 分。
          </p>
        </div>

        <Panel>
          <h2
            className="mb-4 text-sm font-medium uppercase tracking-widest"
            style={{ color: 'var(--color-muted)' }}
          >
            今日の流れ
          </h2>
          <ol className="space-y-4">
            {[
              ['01', '街と問題に触れる', '配送先と渋滞を見る'],
              ['02', '手で解く × 計算で解く', '手動ルートと候補バーを比較'],
              [
                '03',
                'チームでスコアを縮める',
                '3つのつまみを調整して最短ルートを探す',
              ],
              ['04', '結果発表', 'ベストルートと工夫を共有'],
            ].map(([num, title, sub]) => (
              <li key={num} className="flex gap-4">
                <span
                  className="font-mono text-2xl"
                  style={{ color: 'var(--color-accent)' }}
                >
                  {num}
                </span>
                <div>
                  <div
                    className="font-semibold"
                    style={{ color: 'var(--color-ink)' }}
                  >
                    {title}
                  </div>
                  <div
                    className="text-sm"
                    style={{ color: 'var(--color-ink-soft)' }}
                  >
                    {sub}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </Panel>
      </div>
    </section>
  );
}
