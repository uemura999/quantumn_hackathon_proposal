'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { StoryCardForm } from '@/components/story/StoryCardForm';
import { StoryCardPdfPreview } from '@/components/story/StoryCardPdfPreview';

export default function StoryPage() {
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
