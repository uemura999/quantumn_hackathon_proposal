'use client';

import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { useLabelStore, DEFAULT_LABELS } from '@/store/labelStore';

const FIELD_STYLE: React.CSSProperties = {
  background: 'oklch(99% 0.004 80)',
  border: '1px solid oklch(85% 0.012 80)',
  borderRadius: '0.5rem',
  padding: '0.5rem 0.75rem',
  fontSize: '0.875rem',
  width: '100%',
  color: 'var(--color-ink)',
};

export function StoryCardForm() {
  const teamName = useLabelStore((s) => s.teamName);
  const cityName = useLabelStore((s) => s.cityName);
  const labels = useLabelStore((s) => s.labels);
  const story = useLabelStore((s) => s.story);
  const setTeamName = useLabelStore((s) => s.setTeamName);
  const setCityName = useLabelStore((s) => s.setCityName);
  const setLabel = useLabelStore((s) => s.setLabel);
  const setStory = useLabelStore((s) => s.setStory);
  const resetLabels = useLabelStore((s) => s.resetLabels);

  return (
    <Panel>
      <h2
        className="font-semibold mb-3"
        style={{ fontSize: '1.15rem', fontFamily: 'var(--font-display)' }}
      >
        ストーリーカードを書く
      </h2>
      <p
        className="text-xs mb-4"
        style={{ color: 'var(--color-ink-soft)', lineHeight: 1.65 }}
      >
        配送先 6 つに名前を付け、「私たちの街では何が起きていて、どう解いたか」を書きます。書いた内容は 3D シーンのラベルにも反映されます。
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold mb-1" htmlFor="team">
            チーム名
          </label>
          <input
            id="team"
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.currentTarget.value)}
            placeholder="例: ○○高校チーム"
            style={FIELD_STYLE}
            maxLength={40}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1" htmlFor="city">
            私たちの街の名前
          </label>
          <input
            id="city"
            type="text"
            value={cityName}
            onChange={(e) => setCityName(e.currentTarget.value)}
            placeholder="例: 台風直撃時の○○市"
            style={FIELD_STYLE}
            maxLength={40}
          />
        </div>

        <div>
          <p className="block text-xs font-semibold mb-2">
            配送先 6 つ (元の名前 → 自分たちの言葉に書き換え)
          </p>
          <div className="space-y-2">
            {labels.map((label, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span
                  className="w-6 font-mono"
                  style={{ color: 'var(--color-muted)' }}
                >
                  #{i + 1}
                </span>
                <span
                  className="w-24"
                  style={{ color: 'var(--color-muted)' }}
                  aria-hidden
                >
                  {DEFAULT_LABELS[i]}
                </span>
                <span style={{ color: 'var(--color-muted)' }}>→</span>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(i, e.currentTarget.value)}
                  placeholder={DEFAULT_LABELS[i]}
                  style={{ ...FIELD_STYLE, flex: 1 }}
                  maxLength={20}
                  aria-label={`配送先 ${i + 1} のラベル`}
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={resetLabels}
            className="mt-2 text-[11px] underline"
            style={{ color: 'var(--color-muted)' }}
          >
            元の名前に戻す
          </button>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1" htmlFor="story">
            物語 (200 字程度)
          </label>
          <textarea
            id="story"
            value={story}
            onChange={(e) => setStory(e.currentTarget.value)}
            placeholder="例: 台風直撃の夜、○○市の 6 つの避難所に懐中電灯と水を最短で届けたい。倉庫を出て…"
            style={{ ...FIELD_STYLE, minHeight: '120px', resize: 'vertical' }}
            maxLength={400}
          />
          <p
            className="mt-1 text-[10px] text-right"
            style={{ color: 'var(--color-muted)' }}
          >
            {story.length} / 400 文字
          </p>
        </div>

        <p
          className="text-xs rounded-lg p-3"
          style={{
            background: 'oklch(96% 0.018 200 / 0.4)',
            border: '1px solid oklch(82% 0.04 200)',
            color: 'var(--color-ink)',
            lineHeight: 1.6,
          }}
        >
          💡 困ったら <strong>質問プロンプトカード</strong>{' '}
          を 1 枚もらって、そこに書かれた問題で物語を始めるのもおすすめ。
        </p>
      </div>
    </Panel>
  );
}
