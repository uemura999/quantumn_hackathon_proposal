export interface Metaphor {
  readonly headline: string;
  readonly story: string;
  readonly tryIt: string;
}

export const metaphors = {
  gamma: {
    headline: 'γ（ガンマ）= 「短いルートが好き」の強さ',
    story:
      'γ は磁石の強さみたいなものです。強くするほど、短いルートに引き寄せられます。でも強すぎると、波がぶつかってちらついてしまいます（量子の世界の「干渉」）。',
    tryIt:
      'γ=0 でフラット、γ=1.0 でいい感じ、γ=2.8 で暴走。スライダーを動かしながら街を見てみよう。',
  },
  beta: {
    headline: 'β（ベータ）= 「アイデアを混ぜる」強さ',
    story:
      'β はブレストの活発さです。β=0 だとアイデアが固まったまま、ちょうど混ぜると γ で「好き」と伝えたルートが本当に浮かび上がってきます。',
    tryIt:
      'γ を 1.0 に固定して β を動かしてみると、ちょうどよい混ぜ加減がわかります。',
  },
  reps: {
    headline: 'reps = 「考え直す回数」',
    story:
      '1 回考えるとぼんやり、2-3 回考え直すとハッキリと答えが見えてきます。「γで好き → βで混ぜる」を 1 セットとして、何セット繰り返すかが reps です。',
    tryIt: 'reps=1 → 2 → 3 でフォグの収束ぐあいを見比べてみよう。',
  },
  superposition: {
    headline: '重ね合わせ = 全部のルートを同時に考えている状態',
    story:
      'コインを箱の中で振って、まだ蓋を開けていない状態。表でも裏でもなく、両方の「可能性」が同時に存在しています。量子はこの状態で 24 通りのルートを「同時に」考えられます。',
    tryIt:
      '全部のルートが薄く同時に光っているのを見てみよう。これが「答えを選ぶ前」の世界です。',
  },
  measurement: {
    headline: '測定 = 箱を開けて答えを取り出す',
    story:
      '重ね合わせの状態から、最終的にひとつのルートを選び出す操作が「測定」です。確率が高いルートが選ばれやすくなります。',
    tryIt: 'トラックが実際に走るのが「測定の結果」です。',
  },
} as const satisfies Record<string, Metaphor>;

export type MetaphorKey = keyof typeof metaphors;
