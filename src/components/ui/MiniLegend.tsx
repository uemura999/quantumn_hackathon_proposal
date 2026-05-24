interface LegendItem {
  readonly icon: string;
  readonly label: string;
  readonly desc: string;
  readonly swatch?: string;
}

const ITEMS: ReadonlyArray<LegendItem> = [
  { icon: '🏠', label: '倉庫', desc: 'スタート & ゴール地点' },
  { icon: '📦', label: '配送先', desc: '6 つ全部を回る' },
  { icon: '🚚', label: 'トラック', desc: '今回取り出したルートを走る' },
];

const ROUTE_COLORS: ReadonlyArray<LegendItem> = [
  { icon: '━', label: '1位候補', desc: '濃い緑 - 波が一番推している道', swatch: '#3DD9C8' },
  { icon: '━', label: '2位候補', desc: '琥珀 - 次に強い候補', swatch: '#FFC557' },
  { icon: '━', label: '3位候補', desc: '紫 - 3 番目の候補', swatch: '#B68CFF' },
  { icon: '━', label: '今回ルート', desc: '濃紺 - トラックが走る道', swatch: '#1F2A4E' },
  { icon: '━', label: 'その他', desc: '薄灰 - まだ弱い候補', swatch: '#9CA9C9' },
];

const FLAT_ROUTE_COLORS: ReadonlyArray<LegendItem> = [
  {
    icon: '━',
    label: '候補全体',
    desc: '薄い水色 - 720通りがまだ横並び',
    swatch: '#8FB8C7',
  },
  {
    icon: '━',
    label: '今回ルート',
    desc: '濃紺 - 実行後に取り出した道',
    swatch: '#1F2A4E',
  },
];

const SELECTED_ROUTE_COLORS: ReadonlyArray<LegendItem> = [
  {
    icon: '━',
    label: '今回ルート',
    desc: '濃紺 - トラックが走る道',
    swatch: '#142144',
  },
];

const TRAFFIC_LEVELS: ReadonlyArray<LegendItem> = [
  { icon: '━', label: '空き', desc: '渋滞なし', swatch: '#A6BFA8' },
  { icon: '━', label: '少し', desc: '×1.25 コスト', swatch: '#D7C76A' },
  { icon: '━', label: '混み', desc: '×1.7 コスト', swatch: '#E69B4B' },
  { icon: '━', label: '渋滞', desc: '×2.4 コスト', swatch: '#C8533C' },
];

interface MiniLegendProps {
  readonly routeMode?: 'flat' | 'ranked' | 'selected';
}

export function MiniLegend({ routeMode = 'ranked' }: MiniLegendProps) {
  const routeColors =
    routeMode === 'selected'
      ? SELECTED_ROUTE_COLORS
      : routeMode === 'flat'
        ? FLAT_ROUTE_COLORS
        : ROUTE_COLORS;

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
      <ul className="space-y-1.5 mb-3">
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

      <h4 className="text-[10px] uppercase tracking-widest mb-1.5" style={{ color: 'var(--color-muted)' }}>
        光っている道の色
      </h4>
      <ul className="space-y-1 mb-3">
        {routeColors.map((it) => (
          <li key={it.label} className="flex items-center gap-2 text-[11px]">
            <span
              className="inline-block h-1 w-5 rounded-full"
              style={{ background: it.swatch }}
              aria-hidden
            />
            <span className="font-semibold" style={{ color: 'var(--color-ink)' }}>
              {it.label}
            </span>
            <span style={{ color: 'var(--color-ink-soft)' }}>{it.desc}</span>
          </li>
        ))}
      </ul>

      <h4 className="text-[10px] uppercase tracking-widest mb-1.5" style={{ color: 'var(--color-muted)' }}>
        渋滞の色
      </h4>
      <ul className="space-y-1">
        {TRAFFIC_LEVELS.map((it) => (
          <li key={it.label} className="flex items-center gap-2 text-[11px]">
            <span
              className="inline-block h-1 w-5 rounded-full"
              style={{ background: it.swatch }}
              aria-hidden
            />
            <span className="font-semibold" style={{ color: 'var(--color-ink)' }}>
              {it.label}
            </span>
            <span style={{ color: 'var(--color-ink-soft)' }}>{it.desc}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
