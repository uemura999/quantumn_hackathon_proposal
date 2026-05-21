'use client';

import { Panel } from '@/components/ui/Panel';
import type { StepBaseProps } from './stepShared';

export function Step0Welcome({ problem, CityScene }: StepBaseProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <Panel style={{ padding: 0 }} className="overflow-hidden">
        <div className="h-[52vh] min-h-[380px] w-full">
          <CityScene
            problem={problem}
            distribution={[]}
            truckRoute={null}
            truckRunning={false}
            pulsing={false}
            showLabels
          />
        </div>
      </Panel>

      <Panel>
        <h2
          className="font-semibold mb-2"
          style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)' }}
        >
          ようこそ、街へ。
        </h2>
        <p
          className="text-sm mb-4"
          style={{ color: 'var(--color-ink-soft)', lineHeight: 1.75 }}
        >
          ここは小さな配送の街。
          <br />
          <strong>🏠 倉庫</strong> からトラックがスタートして、
          <br />
          <strong>📦 4つの配送先</strong> を全部回って、
          <br />
          倉庫に戻ってきます。
        </p>
        <p
          className="text-sm rounded-lg p-3"
          style={{
            color: 'var(--color-ink)',
            background: 'oklch(96% 0.012 80)',
            border: '1px solid oklch(80% 0.012 80)',
            lineHeight: 1.7,
          }}
        >
          <strong>👉 ゴール：</strong>
          <br />
          <span style={{ color: 'var(--color-accent-strong)' }}>
            一番短いルート
          </span>
          を見つけよう。
        </p>
        <p
          className="mt-4 text-xs"
          style={{ color: 'var(--color-muted)', lineHeight: 1.7 }}
        >
          マップをドラッグして角度を変えたり、ホイールでズームできます。次のステップで、まずあなた自身で解いてみましょう。
        </p>
      </Panel>
    </div>
  );
}
