interface LegendItem {
  readonly icon: string;
  readonly label: string;
  readonly desc: string;
}

const ITEMS: ReadonlyArray<LegendItem> = [
  { icon: '🏠', label: '倉庫', desc: 'スタート & ゴール地点' },
  { icon: '📦', label: '配送先', desc: '4つ全部を回る' },
  { icon: '🚚', label: 'トラック', desc: '最も可能性の高いルートを走る' },
  { icon: '✨', label: '光のもや', desc: '明るいほど「正解の可能性が高い」' },
];

export function MiniLegend() {
  return (
    <section
      aria-label="マップの凡例"
      className="rounded-lg p-3"
      style={{
        background: 'oklch(98% 0.005 80)',
        border: '1px solid oklch(85% 0.012 80)',
      }}
    >
      <h3
        className="text-xs uppercase tracking-widest mb-2"
        style={{ color: 'var(--color-muted)' }}
      >
        マップの見方
      </h3>
      <ul className="space-y-1.5">
        {ITEMS.map((it) => (
          <li key={it.label} className="flex items-baseline gap-2 text-xs">
            <span className="text-base leading-none">{it.icon}</span>
            <span
              className="font-semibold"
              style={{ color: 'var(--color-ink)' }}
            >
              {it.label}
            </span>
            <span style={{ color: 'var(--color-ink-soft)' }}>{it.desc}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
