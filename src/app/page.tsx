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
            <strong>量子の重ね合わせ</strong>でひらく2時間。
            <br />
            QAOAのパラメータを動かすと、最適なルートが浮かび上がります。
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
            初めての人向けに、γ・β・reps の意味を体で覚える 7 ステップを用意しました。所要 10〜15 分。
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
              ['01', '街と量子に触れる', 'タイトル + 30秒の量子コイン投げ'],
              ['02', '手で解く × 量子で解く', '手動ルートとQAOAを比較'],
              [
                '03',
                'チームでスコアを縮める',
                'γ / β / reps を調整して最短ルートを探す',
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
