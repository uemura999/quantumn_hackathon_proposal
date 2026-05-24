'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import { glossary, type GlossaryKey } from '@/lib/glossary';

interface GlossaryTooltipProps {
  readonly k: GlossaryKey;
  readonly children?: ReactNode;
}

export function GlossaryTooltip({ k, children }: GlossaryTooltipProps) {
  const [open, setOpen] = useState(false);
  const entry = glossary[k];

  return (
    <span
      className="relative inline-flex items-baseline"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <button
        type="button"
        className="cursor-help underline decoration-dotted underline-offset-4 focus:outline-none focus-visible:ring-2 rounded"
        style={{ color: 'var(--color-accent-strong)' }}
        aria-describedby={`glossary-${k}`}
        onClick={() => setOpen((v) => !v)}
      >
        {children ?? entry.label}
      </button>
      {open && (
        <span
          id={`glossary-${k}`}
          role="tooltip"
          className="absolute left-1/2 z-50 mt-2 w-64 -translate-x-1/2 translate-y-full rounded-lg p-3 text-sm shadow-lg"
          style={{
            top: '100%',
            background: 'var(--color-ink)',
            color: 'var(--color-bg-soft)',
            lineHeight: 1.5,
          }}
        >
          <strong className="block mb-1">{entry.label}</strong>
          {entry.summary}
          {(entry.mechanism || entry.detail) && (
            <details
              className="mt-2 text-xs"
              style={{ color: 'oklch(82% 0.04 180)' }}
            >
              <summary className="cursor-pointer font-semibold">
                もう少し詳しく
              </summary>
              {entry.mechanism && <span className="mt-1 block">{entry.mechanism}</span>}
              {entry.detail && (
                <span
                  className="mt-1 block text-[11px]"
                  style={{ color: 'oklch(70% 0.02 260)' }}
                >
                  {entry.detail}
                </span>
              )}
            </details>
          )}
        </span>
      )}
    </span>
  );
}
