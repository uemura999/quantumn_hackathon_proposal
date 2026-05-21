import type { HTMLAttributes, ReactNode } from 'react';

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  readonly children: ReactNode;
}

export function Panel({ children, className = '', ...rest }: PanelProps) {
  return (
    <div
      {...rest}
      className={`rounded-[var(--radius-card)] ${className}`}
      style={{
        background: 'var(--color-surface)',
        boxShadow: 'var(--shadow-card)',
        border: '1px solid oklch(85% 0.01 80 / 0.6)',
        padding: '1.5rem',
      }}
    >
      {children}
    </div>
  );
}
