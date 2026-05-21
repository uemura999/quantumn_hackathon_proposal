'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: Variant;
  readonly children: ReactNode;
}

export function Button({
  variant = 'primary',
  children,
  className = '',
  ...rest
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-[var(--radius-pill)] px-6 py-3 font-medium transition-all focus-visible:outline-none focus-visible:ring-2';

  const styles =
    variant === 'primary'
      ? {
          background: 'var(--color-ink)',
          color: 'var(--color-bg-soft)',
          boxShadow: 'var(--shadow-card)',
        }
      : {
          background: 'transparent',
          color: 'var(--color-ink)',
          border: '1px solid oklch(70% 0.02 260 / 0.4)',
        };

  return (
    <button
      {...rest}
      className={`${base} ${className}`}
      style={{
        ...styles,
        transition: 'transform var(--duration-fast) var(--ease-spring)',
      }}
      onMouseDown={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.97)';
      }}
      onMouseUp={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
      }}
    >
      {children}
    </button>
  );
}
