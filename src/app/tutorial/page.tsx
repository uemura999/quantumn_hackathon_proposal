import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';

export default function TutorialPage() {
  return (
    <section className="mx-auto max-w-screen-xl px-6 py-12">
      <header className="mb-8">
        <p
          className="mb-2 text-sm uppercase tracking-[0.3em]"
          style={{ color: 'var(--color-accent-strong)' }}
        >
          Step 1 / 2 — Tutorial
        </p>
        <h1
          className="font-bold leading-tight"
          style={{
            fontSize: 'clamp(1.8rem, 1rem + 2vw, 2.8rem)',
            fontFamily: 'var(--font-display)',
          }}
        >
          まず手で解いてみよう、それから量子に渡そう。
        </h1>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <h2 className="font-semibold text-lg mb-2">手動ルートモード</h2>
          <p
            className="text-sm"
            style={{ color: 'var(--color-ink-soft)', lineHeight: 1.7 }}
          >
            配送地点をクリックして、自分の手で最短ルートを探してみます。
            「人間が最適化するのは意外と難しい」ことに気付くのがゴール。
          </p>
          <p className="mt-4 text-xs" style={{ color: 'var(--color-muted)' }}>
            ※ Phase 3 で 3D マップとして実装されます。
          </p>
        </Panel>
        <Panel>
          <h2 className="font-semibold text-lg mb-2">初めての QAOA</h2>
          <p
            className="text-sm"
            style={{ color: 'var(--color-ink-soft)', lineHeight: 1.7 }}
          >
            γ と β のスライダーを動かすと、街に確率の「もや」が浮かびます。
            良いパラメータを見つけると、最短ルートが鮮やかに光ります。
          </p>
          <p className="mt-4 text-xs" style={{ color: 'var(--color-muted)' }}>
            ※ Phase 3 で確率フォグ + トラック走行が動きます。
          </p>
        </Panel>
      </div>

      <div className="mt-10 flex justify-end">
        <Link href="/challenge">
          <Button>本番チャレンジへ →</Button>
        </Link>
      </div>
    </section>
  );
}
