export interface GlossaryEntry {
  readonly label: string;
  readonly summary: string;
  readonly detail?: string;
}

export const glossary: Record<string, GlossaryEntry> = {
  qaoa: {
    label: 'QAOA',
    summary:
      '量子近似最適化アルゴリズム (Quantum Approximate Optimization Algorithm)。古典では難しい組合せ最適化を、量子の重ね合わせを使って近似的に解く手法。',
    detail:
      'パラメータ γ と β を交互に作用させ、「良い解」の確率を増幅させていく。',
  },
  superposition: {
    label: '重ね合わせ',
    summary:
      '複数の状態が同時に存在している量子の状態。観測するまでは一つに決まっていない。',
  },
  gamma: {
    label: 'γ (ガンマ)',
    summary:
      'コスト Hamiltonian の作用の強さ。大きくすると「短いルート」の確率が鋭くなる。',
  },
  beta: {
    label: 'β (ベータ)',
    summary:
      'mixer Hamiltonian の作用の強さ。状態どうしを混ぜ合わせて新しい解を探す。',
  },
  reps: {
    label: 'reps (繰り返し回数)',
    summary:
      'γ と β のセットを何回適用するか。多いほど精度が上がるが計算が重くなる。',
  },
  hamiltonian: {
    label: 'Hamiltonian',
    summary:
      'システムのエネルギーを表す演算子。QAOAでは「コストの低さ=良い解」を符号化する。',
  },
  interference: {
    label: '干渉',
    summary:
      '量子の確率振幅どうしが強め合ったり打ち消し合ったりする現象。良い解だけを残す仕組み。',
  },
  measurement: {
    label: '測定',
    summary:
      '重ね合わせ状態から一つの古典ビット列を取り出す操作。確率に従って結果が決まる。',
  },
  tsp: {
    label: 'TSP (巡回セールスマン問題)',
    summary:
      'すべての地点を一度ずつ訪れて出発地に戻る、最短ルートを求める問題。',
  },
};

export type GlossaryKey =
  | 'qaoa'
  | 'superposition'
  | 'gamma'
  | 'beta'
  | 'reps'
  | 'hamiltonian'
  | 'interference'
  | 'measurement'
  | 'tsp';
