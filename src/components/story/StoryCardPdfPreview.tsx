'use client';

import { useLabelStore, DEFAULT_LABELS } from '@/store/labelStore';
import { useSessionStore } from '@/store/sessionStore';
import { useParamsStore } from '@/store/paramsStore';
import { formatDistance } from '@/lib/animation';

const TRAFFIC_LABEL: Record<string, string> = {
  midday: '昼',
  morning_rush: '朝ラッシュ',
  evening_rush: '夕方ラッシュ',
};

export function StoryCardPdfPreview() {
  const teamName = useLabelStore((s) => s.teamName);
  const cityName = useLabelStore((s) => s.cityName);
  const labels = useLabelStore((s) => s.labels);
  const story = useLabelStore((s) => s.story);
  const bestScore = useSessionStore((s) => s.bestScore);
  const history = useSessionStore((s) => s.history);
  const gamma = useParamsStore((s) => s.gamma);
  const beta = useParamsStore((s) => s.beta);
  const reps = useParamsStore((s) => s.reps);

  const lastAttempt = history[history.length - 1] ?? null;
  const displayedParams = bestScore?.params ?? { gamma, beta, reps };
  const recordedSample = bestScore?.sampledRoute ?? lastAttempt?.sampledRoute ?? null;
  const trafficLabel = bestScore
    ? TRAFFIC_LABEL[bestScore.trafficProfile] ?? bestScore.trafficProfile
    : lastAttempt
      ? TRAFFIC_LABEL[lastAttempt.trafficProfile] ?? lastAttempt.trafficProfile
      : '未実行';

  const handlePrint = () => {
    if (typeof window === 'undefined') return;
    window.print();
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2 print:hidden">
        <h3
          className="text-sm font-semibold"
          style={{ color: 'var(--color-ink)' }}
        >
          📄 印刷プレビュー (A4)
        </h3>
        <button
          type="button"
          onClick={handlePrint}
          className="rounded-full px-4 py-1.5 text-xs font-semibold"
          style={{
            background: 'var(--color-ink)',
            color: 'var(--color-bg-soft)',
          }}
        >
          🖨 印刷 / PDF 保存
        </button>
      </div>

      <article
        id="story-card-print"
        className="rounded-lg"
        style={{
          width: '210mm',
          minHeight: '297mm',
          padding: '14mm 16mm',
          background: 'white',
          color: 'oklch(20% 0.04 260)',
          fontFamily: 'var(--font-display, "Noto Sans JP")',
          boxShadow: '0 8px 32px -10px oklch(40% 0.05 260 / 0.3)',
          margin: '0 auto',
          fontSize: '11pt',
          lineHeight: 1.55,
        }}
      >
        <header className="border-b-2 pb-3 mb-4" style={{ borderColor: 'oklch(70% 0.14 50)' }}>
          <p
            className="uppercase tracking-[0.3em]"
            style={{ color: 'oklch(60% 0.02 260)', fontSize: '8pt' }}
          >
            Opening Urban Challenges with Q — Hackathon Story Card
          </p>
          <h1
            className="font-bold mt-1"
            style={{ fontSize: '20pt', lineHeight: 1.2 }}
          >
            {cityName || '私たちの街'}
          </h1>
          <p
            className="mt-1"
            style={{ fontSize: '10pt', color: 'oklch(50% 0.02 260)' }}
          >
            チーム: <strong>{teamName || '___________'}</strong>
          </p>
        </header>

        <section className="mb-4">
          <h2
            className="font-semibold mb-2"
            style={{ fontSize: '13pt', color: 'oklch(40% 0.06 260)' }}
          >
            🗺 私たちの街にある 6 つの場所
          </h2>
          <table className="w-full" style={{ fontSize: '10pt' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid oklch(85% 0.012 80)' }}>
                <th align="left" style={{ padding: '2pt 4pt' }}>#</th>
                <th align="left" style={{ padding: '2pt 4pt' }}>名前</th>
                <th align="left" style={{ padding: '2pt 4pt', color: 'oklch(60% 0.02 260)' }}>元の場所</th>
              </tr>
            </thead>
            <tbody>
              {labels.map((label, i) => (
                <tr key={i} style={{ borderBottom: '1px solid oklch(92% 0.012 80)' }}>
                  <td style={{ padding: '2pt 4pt' }}>{i + 1}</td>
                  <td style={{ padding: '2pt 4pt', fontWeight: 500 }}>
                    {label || '_____________'}
                  </td>
                  <td style={{ padding: '2pt 4pt', color: 'oklch(60% 0.02 260)', fontSize: '9pt' }}>
                    {DEFAULT_LABELS[i]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mb-4">
          <h2
            className="font-semibold mb-2"
            style={{ fontSize: '13pt', color: 'oklch(40% 0.06 260)' }}
          >
            📖 私たちの物語
          </h2>
          <p
            className="rounded p-2"
            style={{
              background: 'oklch(98% 0.005 80)',
              border: '1px solid oklch(85% 0.012 80)',
              minHeight: '60pt',
              whiteSpace: 'pre-wrap',
              fontSize: '10.5pt',
            }}
          >
            {story || '(物語をここに書きます)'}
          </p>
        </section>

        <section className="mb-4">
          <h2
            className="font-semibold mb-2"
            style={{ fontSize: '13pt', color: 'oklch(40% 0.06 260)' }}
          >
            ⚛️ 量子のつまみと結果
          </h2>
          <div className="grid grid-cols-2 gap-3" style={{ fontSize: '10pt' }}>
            <dl className="space-y-1">
              <FlexRow term="短さの好み (γ)" value={displayedParams.gamma.toFixed(2)} />
              <FlexRow term="混ぜる強さ (β)" value={displayedParams.beta.toFixed(2)} />
              <FlexRow term="考え直す回数" value={`${displayedParams.reps} 回`} />
              <FlexRow term="交通状況" value={trafficLabel} />
            </dl>
            <dl className="space-y-1">
              <FlexRow
                term="ベスト期待距離"
                value={
                  bestScore
                    ? formatDistance(bestScore.expectedDistance)
                    : lastAttempt
                      ? formatDistance(lastAttempt.expectedDistance)
                      : '— u'
                }
                strong
              />
              <FlexRow
                term="同実行の走行距離"
                value={
                  recordedSample
                    ? formatDistance(recordedSample.distance)
                    : '—'
                }
              />
              <FlexRow
                term="最有力候補の確信度 (参考)"
                value={
                  bestScore
                    ? `${bestScore.topAmplification.toFixed(1)} 倍`
                    : lastAttempt
                      ? `${lastAttempt.topAmplification.toFixed(1)} 倍`
                    : '—'
                }
              />
              <FlexRow
                term="試行回数"
                value={`${history.length} 回`}
              />
            </dl>
          </div>
        </section>

        <section className="mb-4">
          <h2
            className="font-semibold mb-2"
            style={{ fontSize: '13pt', color: 'oklch(40% 0.06 260)' }}
          >
            🐍 Qiskit 検証
          </h2>
          <p style={{ fontSize: '10pt' }}>
            Notebook URL:
            <span style={{ marginLeft: '0.5em', color: 'oklch(50% 0.02 260)' }}>
              _____________________________________
            </span>
          </p>
          <p style={{ fontSize: '10pt', marginTop: '4pt' }}>
            上位 1 位 (Qiskit) の距離:
            <span style={{ marginLeft: '0.5em', color: 'oklch(50% 0.02 260)' }}>
              _________ u
            </span>
          </p>
          <p style={{ fontSize: '10pt', marginTop: '4pt' }}>
            JS と Qiskit が一致した?: ☐ はい  ☐ 違う (理由: ___________ )
          </p>
        </section>

        <footer className="mt-6 pt-3" style={{ borderTop: '1px solid oklch(85% 0.012 80)' }}>
          <p style={{ fontSize: '9pt', color: 'oklch(55% 0.02 260)' }}>
            NTT 西日本 × 電通 — 量子で都市の配送ルートを最適化するハッカソン
          </p>
        </footer>
      </article>
    </div>
  );
}

function FlexRow({
  term,
  value,
  strong,
}: {
  readonly term: string;
  readonly value: string;
  readonly strong?: boolean;
}) {
  return (
    <div
      className="flex justify-between"
      style={{
        borderBottom: '1px dotted oklch(85% 0.012 80)',
        paddingBottom: '2pt',
      }}
    >
      <dt style={{ color: 'oklch(50% 0.02 260)' }}>{term}</dt>
      <dd
        className="font-mono"
        style={{
          color: strong ? 'oklch(40% 0.14 50)' : 'oklch(20% 0.04 260)',
          fontWeight: strong ? 700 : 400,
        }}
      >
        {value}
      </dd>
    </div>
  );
}
