'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { defaultCityProblem } from '@/engine/tsp';
import {
  STEP_TITLES,
  TOTAL_STEPS,
  useTutorialStore,
} from '@/store/tutorialStore';
import { Step0Welcome } from './Step0Welcome';
import { Step1Manual } from './Step1Manual';
import { Step2Superposition } from './Step2Superposition';
import { Step3Gamma } from './Step3Gamma';
import { Step4Beta } from './Step4Beta';
import { Step5Reps } from './Step5Reps';
import { Step6Recap } from './Step6Recap';

const CityScene = dynamic(
  () => import('@/components/city/CityScene').then((m) => m.CityScene),
  { ssr: false },
);

export function TutorialWizard() {
  const currentStep = useTutorialStore((s) => s.currentStep);
  const next = useTutorialStore((s) => s.next);
  const back = useTutorialStore((s) => s.back);
  const goTo = useTutorialStore((s) => s.goTo);
  const problem = useMemo(() => defaultCityProblem(), []);

  return (
    <section className="mx-auto max-w-screen-xl px-6 py-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p
            className="mb-1 text-sm uppercase tracking-[0.3em]"
            style={{ color: 'var(--color-accent-strong)' }}
          >
            Tutorial {currentStep + 1} / {TOTAL_STEPS}
          </p>
          <h1
            className="font-bold leading-tight"
            style={{
              fontSize: 'clamp(1.5rem, 1rem + 1.6vw, 2.2rem)',
              fontFamily: 'var(--font-display)',
            }}
          >
            {STEP_TITLES[currentStep]}
          </h1>
        </div>
        <Link
          href="/challenge"
          className="text-sm underline"
          style={{ color: 'var(--color-muted)' }}
        >
          スキップしてチャレンジへ →
        </Link>
      </header>

      <StepProgress current={currentStep} onJump={(s) => goTo(s)} />

      <div className="mt-6">
        {currentStep === 0 && <Step0Welcome problem={problem} CityScene={CityScene} />}
        {currentStep === 1 && <Step1Manual problem={problem} CityScene={CityScene} />}
        {currentStep === 2 && (
          <Step2Superposition problem={problem} CityScene={CityScene} />
        )}
        {currentStep === 3 && <Step3Gamma problem={problem} CityScene={CityScene} />}
        {currentStep === 4 && <Step4Beta problem={problem} CityScene={CityScene} />}
        {currentStep === 5 && <Step5Reps problem={problem} CityScene={CityScene} />}
        {currentStep === 6 && <Step6Recap />}
      </div>

      <nav className="mt-8 flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          onClick={back}
          disabled={currentStep === 0}
        >
          ← 戻る
        </Button>
        {currentStep < TOTAL_STEPS - 1 ? (
          <Button onClick={next}>次へ →</Button>
        ) : (
          <Link href="/challenge">
            <Button>チャレンジを始める →</Button>
          </Link>
        )}
      </nav>
    </section>
  );
}

interface StepProgressProps {
  readonly current: number;
  readonly onJump: (step: 0 | 1 | 2 | 3 | 4 | 5 | 6) => void;
}

function StepProgress({ current, onJump }: StepProgressProps) {
  return (
    <ol className="flex items-center gap-1.5" aria-label="ステップ進行">
      {STEP_TITLES.map((title, i) => {
        const state = i < current ? 'done' : i === current ? 'active' : 'next';
        const bg =
          state === 'done'
            ? 'oklch(70% 0.14 50)'
            : state === 'active'
              ? 'oklch(20% 0.04 260)'
              : 'oklch(85% 0.012 80)';
        return (
          <li key={i} className="flex-1">
            <button
              type="button"
              onClick={() => onJump(i as 0 | 1 | 2 | 3 | 4 | 5 | 6)}
              className="block h-1.5 w-full rounded-full transition-all"
              style={{
                background: bg,
                cursor: 'pointer',
                opacity: state === 'next' ? 0.6 : 1,
              }}
              aria-label={`Step ${i + 1}: ${title}`}
              aria-current={state === 'active' ? 'step' : undefined}
            />
          </li>
        );
      })}
    </ol>
  );
}
