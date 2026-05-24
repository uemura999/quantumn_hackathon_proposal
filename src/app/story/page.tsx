'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ColabButton } from '@/components/handoff/ColabButton';
import { StoryCardForm } from '@/components/story/StoryCardForm';
import { StoryCardPdfPreview } from '@/components/story/StoryCardPdfPreview';
import { useLabelStore } from '@/store/labelStore';
import { useParamsStore } from '@/store/paramsStore';
import { useSessionStore } from '@/store/sessionStore';
import type { TrafficProfileName } from '@/engine/city-layout';

const KNOWN_PROFILES: ReadonlyArray<TrafficProfileName> = [
  'midday',
  'morning_rush',
  'evening_rush',
];

function asProfile(value: string | undefined): TrafficProfileName {
  return KNOWN_PROFILES.find((p) => p === value) ?? 'midday';
}

export default function StoryPage() {
  const labels = useLabelStore((s) => s.labels);
  const gamma = useParamsStore((s) => s.gamma);
  const beta = useParamsStore((s) => s.beta);
  const reps = useParamsStore((s) => s.reps);
  const bestScore = useSessionStore((s) => s.bestScore);
  const profile = asProfile(bestScore?.trafficProfile);

  return (
    <section className="mx-auto max-w-screen-2xl px-6 py-8 print:px-0 print:py-0">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4 print:hidden">
        <div>
          <p
            className="mb-1 text-sm uppercase tracking-[0.3em]"
            style={{ color: 'var(--color-accent-strong)' }}
          >
            Hackathon Story Card
          </p>
          <h1
            className="font-bold leading-tight"
            style={{
              fontSize: 'clamp(1.5rem, 1rem + 2vw, 2.2rem)',
              fontFamily: 'var(--font-display)',
            }}
          >
            私たちの街を、私たちの言葉で。
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/challenge">
            <Button variant="ghost">← チャレンジに戻る</Button>
          </Link>
          <Link href="/result">
            <Button variant="ghost">結果を見る →</Button>
          </Link>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.05fr] print:grid-cols-1">
        <div className="flex flex-col gap-4 print:hidden">
          <StoryCardForm />
          <div
            className="rounded-xl border p-4"
            style={{
              background: 'oklch(96% 0.018 200 / 0.4)',
              borderColor: 'oklch(80% 0.04 200)',
            }}
          >
            <h3
              className="font-semibold mb-2 text-sm"
              style={{ color: 'var(--color-ink)' }}
            >
              🐍 Qiskit にもチームの名前を持っていく
            </h3>
            <p
              className="text-xs mb-3"
              style={{ color: 'var(--color-ink-soft)', lineHeight: 1.65 }}
            >
              いま入力した 6 つのラベルとチーム名を含めて Colab に送ります。Qiskit 側でも自分たちの言葉で結果が出力されます。
            </p>
            <div className="space-y-3">
              <div>
                <p
                  className="text-[11px] mb-1 font-semibold"
                  style={{ color: 'var(--color-ink)' }}
                >
                  🗺 実地図版 (推奨) — 自分の街の 6 箇所で
                </p>
                <ColabButton
                  payload={{
                    params: { gamma, beta, reps },
                    profile,
                    labels,
                    teamName: useLabelStore.getState().teamName,
                    cityName: useLabelStore.getState().cityName,
                    notebook: 'real_city',
                  }}
                  label="実地図版を開く"
                  variant="primary"
                />
              </div>
              <div>
                <p
                  className="text-[11px] mb-1 font-semibold"
                  style={{ color: 'var(--color-ink)' }}
                >
                  📊 比較版 — JS の結果と並べる
                </p>
                <ColabButton
                  payload={{
                    params: { gamma, beta, reps },
                    profile,
                    labels,
                    teamName: useLabelStore.getState().teamName,
                    notebook: 'handoff',
                  }}
                  label="比較版を開く"
                  variant="ghost"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto print:overflow-visible">
          <StoryCardPdfPreview />
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          header,
          nav,
          footer.app-footer {
            display: none !important;
          }
          #story-card-print {
            box-shadow: none !important;
            margin: 0 !important;
            width: 100% !important;
          }
          @page {
            size: A4 portrait;
            margin: 0;
          }
        }
      `}</style>
    </section>
  );
}
