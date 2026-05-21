import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';

export default function ChallengePage() {
  return (
    <section className="mx-auto max-w-screen-2xl px-6 py-10">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p
            className="mb-1 text-sm uppercase tracking-[0.3em]"
            style={{ color: 'var(--color-accent-strong)' }}
          >
            Main Challenge
          </p>
          <h1
            className="font-bold"
            style={{
              fontSize: 'clamp(1.8rem, 1rem + 2vw, 2.8rem)',
              fontFamily: 'var(--font-display)',
            }}
          >
            街を最短で巡る、量子のチャレンジ。
          </h1>
        </div>
        <Link href="/result">
          <Button variant="ghost">結果画面を見る →</Button>
        </Link>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Panel className="min-h-[420px] flex items-center justify-center">
          <div className="text-center">
            <p
              className="text-sm uppercase tracking-widest"
              style={{ color: 'var(--color-muted)' }}
            >
              City Canvas (Phase 3 で実装)
            </p>
            <p
              className="mt-3 text-lg max-w-md mx-auto"
              style={{ color: 'var(--color-ink-soft)' }}
            >
              ここに3D都市、確率フォグ、トラック走行アニメーションが描かれます。
            </p>
          </div>
        </Panel>

        <Panel>
          <h2 className="font-semibold mb-3">パラメータ</h2>
          <div className="space-y-3" style={{ color: 'var(--color-ink-soft)' }}>
            <div className="flex justify-between">
              <span>γ (ガンマ)</span>
              <span className="font-mono">—</span>
            </div>
            <div className="flex justify-between">
              <span>β (ベータ)</span>
              <span className="font-mono">—</span>
            </div>
            <div className="flex justify-between">
              <span>reps</span>
              <span className="font-mono">—</span>
            </div>
          </div>
          <Button className="mt-6 w-full" disabled>
            実行 (Phase 3 で有効化)
          </Button>
        </Panel>
      </div>
    </section>
  );
}
