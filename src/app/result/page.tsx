'use client';

import Link from 'next/link';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { useSessionStore } from '@/store/sessionStore';
import { formatDistance } from '@/lib/animation';

export default function ResultPage() {
  const bestScore = useSessionStore((s) => s.bestScore);
  const history = useSessionStore((s) => s.history);
  const resetSession = useSessionStore((s) => s.resetSession);

  return (
    <section className="mx-auto max-w-screen-xl px-6 py-12">
      <header className="mb-8">
        <p
          className="mb-2 text-sm uppercase tracking-[0.3em]"
          style={{ color: 'var(--color-accent-strong)' }}
        >
          Result
        </p>
        <h1
          className="font-bold leading-tight"
          style={{
            fontSize: 'clamp(1.8rem, 1rem + 2vw, 2.8rem)',
            fontFamily: 'var(--font-display)',
          }}
        >
          {bestScore ? '今日のベストルート' : 'まだ挑戦が記録されていません'}
        </h1>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Panel>
          <h2 className="font-semibold mb-4">ベストスコア</h2>
          {bestScore ? (
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-xs uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>距離</dt>
                <dd className="font-mono text-3xl" style={{ color: 'var(--color-accent-strong)' }}>
                  {formatDistance(bestScore.distance)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>距離順位</dt>
                <dd className="font-mono text-lg">
                  {bestScore.distanceRank} 位
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>好み / 混ぜる / 回数</dt>
                <dd className="font-mono text-lg">
                  {bestScore.params.gamma.toFixed(2)} / {bestScore.params.beta.toFixed(2)} / {bestScore.params.reps}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-xs uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>訪問順</dt>
                <dd className="font-mono mt-1">{bestScore.route.join(' → ')}</dd>
              </div>
            </dl>
          ) : (
            <p style={{ color: 'var(--color-ink-soft)' }}>
              チャレンジ画面で実行ボタンを押すと、ここに結果が出ます。
            </p>
          )}
        </Panel>

        <Panel>
          <h2 className="font-semibold mb-4">これまでの試行</h2>
          <p style={{ color: 'var(--color-ink-soft)' }}>
            合計 <strong>{history.length}</strong> 回 実行
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link href="/challenge">
              <Button className="w-full">もう一度挑戦する</Button>
            </Link>
            <Button variant="ghost" onClick={resetSession}>
              セッションをリセット
            </Button>
          </div>
        </Panel>
      </div>
    </section>
  );
}
