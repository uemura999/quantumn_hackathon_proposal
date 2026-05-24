'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  buildColabUploadUrl,
  buildHandoffSnippet,
  buildNotebookFilename,
  copyHandoffToClipboard,
  downloadNotebook,
  getNotebookAssetPath,
  type ColabHandoffPayload,
} from '@/lib/colabExport';

interface ColabButtonProps {
  readonly payload: ColabHandoffPayload;
  readonly variant?: 'primary' | 'ghost';
  readonly label?: string;
}

type ActionStatus = 'idle' | 'busy' | 'done' | 'partial';

interface StepResult {
  readonly download: 'pending' | 'ok' | 'failed';
  readonly clipboard: 'pending' | 'ok' | 'failed';
  readonly colab: 'pending' | 'ok' | 'failed';
  readonly filename: string;
}

const INITIAL_STEPS: StepResult = {
  download: 'pending',
  clipboard: 'pending',
  colab: 'pending',
  filename: '',
};

export function ColabButton({
  payload,
  variant = 'primary',
  label = 'Qiskit でも試す',
}: ColabButtonProps) {
  const [status, setStatus] = useState<ActionStatus>('idle');
  const [steps, setSteps] = useState<StepResult>(INITIAL_STEPS);
  const [snippetVisible, setSnippetVisible] = useState(false);

  const notebookKind = payload.notebook ?? 'handoff';

  const handleClick = useCallback(async () => {
    setStatus('busy');
    const filename = buildNotebookFilename(notebookKind, payload.teamName);

    const [downloadResult, clipboardResult] = await Promise.all([
      downloadNotebook(notebookKind, filename),
      copyHandoffToClipboard(payload),
    ]);

    let colabStatus: 'ok' | 'failed' = 'failed';
    if (typeof window !== 'undefined') {
      const win = window.open(buildColabUploadUrl(), '_blank', 'noopener,noreferrer');
      colabStatus = win ? 'ok' : 'failed';
    }

    const nextSteps: StepResult = {
      download: downloadResult.ok ? 'ok' : 'failed',
      clipboard: clipboardResult.ok ? 'ok' : 'failed',
      colab: colabStatus,
      filename,
    };
    setSteps(nextSteps);

    const allOk =
      downloadResult.ok && clipboardResult.ok && colabStatus === 'ok';
    setStatus(allOk ? 'done' : 'partial');
    if (!clipboardResult.ok || !downloadResult.ok) {
      setSnippetVisible(true);
    }
  }, [payload, notebookKind]);

  const reset = useCallback(() => {
    setStatus('idle');
    setSteps(INITIAL_STEPS);
  }, []);

  const baseStyle = useMemo(
    () =>
      variant === 'primary'
        ? {
            background:
              'linear-gradient(135deg, oklch(68% 0.16 248) 0%, oklch(58% 0.18 270) 100%)',
            color: 'oklch(98% 0.005 80)',
            boxShadow: '0 6px 20px -8px oklch(58% 0.18 270 / 0.6)',
          }
        : {
            background: 'transparent',
            color: 'var(--color-ink)',
            border: '1px solid oklch(70% 0.02 260 / 0.4)',
          },
    [variant],
  );

  const busy = status === 'busy';
  const showSteps = status !== 'idle';

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 disabled:opacity-60"
        style={baseStyle}
        aria-label={`${label}: Notebook ダウンロード + パラメータコピー + Colab 起動`}
      >
        <span aria-hidden="true">🐍</span>
        {busy ? '準備中…' : label}
        <span aria-hidden="true">↗</span>
      </button>

      {showSteps && (
        <ol
          className="rounded-md p-2 text-[11px] space-y-0.5"
          style={{
            background: 'oklch(98% 0.005 80)',
            border: '1px solid oklch(85% 0.012 80)',
            color: 'var(--color-ink)',
            lineHeight: 1.55,
          }}
          aria-live="polite"
        >
          <StepLine
            state={steps.download}
            doneText={`Notebook を Downloads に保存 (${steps.filename})`}
            failedText="Notebook ダウンロードに失敗 — 下のリンクから手動で"
            pendingText="Notebook をダウンロード中…"
          />
          <StepLine
            state={steps.clipboard}
            doneText="パラメータをクリップボードへコピー (Cmd/Ctrl+V で貼り付け)"
            failedText="クリップボード書き込み不可 — 下のスニペットを手動コピー"
            pendingText="クリップボードへコピー中…"
          />
          <StepLine
            state={steps.colab}
            doneText="Colab タブを開きました — 「Upload」タブで .ipynb を選択"
            failedText="新しいタブが開けません (ポップアップブロック中?)"
            pendingText="Colab タブを開いています…"
          />
          {!busy && (
            <li className="pt-1 text-[10px]" style={{ color: 'var(--color-muted)' }}>
              📋 Notebook を開いたら最初のセルに Cmd/Ctrl+V → メニュー「ランタイム → すべて実行」
              <button
                type="button"
                onClick={reset}
                className="ml-2 underline"
                style={{ color: 'var(--color-muted)' }}
              >
                やり直す
              </button>
            </li>
          )}
        </ol>
      )}

      <div className="flex flex-wrap items-center gap-2 text-[10px]">
        <button
          type="button"
          onClick={() => setSnippetVisible((v) => !v)}
          className="underline"
          style={{ color: 'var(--color-muted)' }}
        >
          {snippetVisible ? 'スニペットを隠す' : 'スニペットを表示 / 手動コピー'}
        </button>
        <a
          href={getNotebookAssetPath(notebookKind)}
          download={steps.filename || undefined}
          className="underline"
          style={{ color: 'var(--color-muted)' }}
        >
          .ipynb を直接ダウンロード
        </a>
      </div>

      {snippetVisible && (
        <pre
          className="overflow-auto rounded-md p-3 text-[11px]"
          style={{
            background: 'oklch(96% 0.01 80)',
            border: '1px solid oklch(85% 0.012 80)',
            color: 'var(--color-ink)',
            maxHeight: '180px',
          }}
        >
          {buildHandoffSnippet(payload)}
        </pre>
      )}
    </div>
  );
}

interface StepLineProps {
  readonly state: 'pending' | 'ok' | 'failed';
  readonly doneText: string;
  readonly failedText: string;
  readonly pendingText: string;
}

function StepLine({ state, doneText, failedText, pendingText }: StepLineProps) {
  const icon = state === 'ok' ? '✅' : state === 'failed' ? '⚠️' : '⏳';
  const color =
    state === 'ok'
      ? 'oklch(48% 0.14 145)'
      : state === 'failed'
        ? 'oklch(52% 0.18 30)'
        : 'var(--color-muted)';
  const text =
    state === 'ok' ? doneText : state === 'failed' ? failedText : pendingText;
  return (
    <li className="flex gap-1.5" style={{ color }}>
      <span aria-hidden="true">{icon}</span>
      <span>{text}</span>
    </li>
  );
}
