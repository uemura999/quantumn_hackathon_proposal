'use client';

import Link from 'next/link';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { ColabButton } from '@/components/handoff/ColabButton';
import { metaphors } from '@/lib/metaphors';
import { glossary } from '@/lib/glossary';
import { useParamsStore } from '@/store/paramsStore';

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
  const gamma = useParamsStore((s) => s.gamma);
  const beta = useParamsStore((s) => s.beta);
  const reps = useParamsStore((s) => s.reps);
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
        <h3
          className="font-semibold mb-2"
          style={{ fontSize: '1.05rem' }}
        >
          🐍 次のステップ — 本物の Qiskit で動かす
        </h3>
        <p
          className="text-sm mb-3"
          style={{ color: 'var(--color-ink-soft)', lineHeight: 1.7 }}
        >
          Tutorial で触ったつまみと**同じ計算**を、本物の量子フレームワーク Qiskit (Google Colab) で動かせます。2 つの Notebook から選べます。
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          <div
            className="rounded-xl border p-3"
            style={{
              background: 'oklch(98% 0.005 80)',
              borderColor: 'oklch(85% 0.012 80)',
            }}
          >
            <h4 className="font-semibold text-sm mb-1">📊 比較版 (5×5 グリッド)</h4>
            <p className="text-[11px] mb-2" style={{ color: 'var(--color-muted)', lineHeight: 1.5 }}>
              Tutorial と同じ抽象都市の問題を Qiskit で解き、JS の結果と比較表で並べる。すぐ走る。
            </p>
            <ColabButton
              payload={{
                params: { gamma, beta, reps },
                profile: 'midday',
                notebook: 'handoff',
              }}
              label="比較版を開く"
              variant="ghost"
            />
          </div>
          <div
            className="rounded-xl border p-3"
            style={{
              background:
                'linear-gradient(180deg, oklch(96% 0.018 200 / 0.5) 0%, oklch(94% 0.025 260 / 0.4) 100%)',
              borderColor: 'oklch(80% 0.04 240)',
            }}
          >
            <h4 className="font-semibold text-sm mb-1">🗺 実地図版 (自分の街)</h4>
            <p className="text-[11px] mb-2" style={{ color: 'var(--color-muted)', lineHeight: 1.5 }}>
              6 つの実在の場所 (例: 京都 6 選) を入れて、本物の地図に Qiskit の最適ルートを描画。ストーリー重視。
            </p>
            <ColabButton
              payload={{
                params: { gamma, beta, reps },
                profile: 'midday',
                notebook: 'real_city',
              }}
              label="実地図版を開く"
              variant="primary"
            />
          </div>
        </div>
        <p
          className="mt-3 text-[11px]"
          style={{ color: 'var(--color-muted)', lineHeight: 1.6 }}
        >
          所要時間 各 5 分。Notebook の指示通りペースト → メニュー「ランタイム → すべて実行」。
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
