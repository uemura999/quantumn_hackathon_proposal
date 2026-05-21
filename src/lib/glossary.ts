export interface GlossaryEntry {
  readonly label: string;
  readonly summary: string;
  readonly detail?: string;
}

export const glossary: Record<string, GlossaryEntry> = {
  qaoa: {
    label: 'QAOA',
    summary:
      '量子コンピュータで「ベストな答え」を近づけて見つける方法。γ で「短いルートが好き」と伝え、β で「いろんな解を混ぜる」を繰り返します。',
    detail:
      '正式名: Quantum Approximate Optimization Algorithm。古典では難しい組合せ最適化を、量子の重ね合わせと干渉を使って近似的に解く。',
  },
  superposition: {
    label: '重ね合わせ',
    summary:
      'コインを箱の中で振って、まだ蓋を開けていない状態。表でも裏でもなく「両方の可能性」が同時に存在しています。量子は 24 通りのルートを同時に考えられます。',
    detail:
      '複数の固有状態の線形結合で表される量子状態。測定するまで一意の値に決まらない。',
  },
  gamma: {
    label: 'γ (ガンマ)',
    summary:
      '「短いルートが好き」の強さ。磁石みたいに、強くするほど短いルートに引き寄せられます。強すぎると波がぶつかってちらつきます。',
    detail:
      'コスト Hamiltonian の作用の強さ。U_C(γ) = exp(-i γ H_C)。',
  },
  beta: {
    label: 'β (ベータ)',
    summary:
      '「いろんなアイデアを混ぜる」強さ。ブレストの活発さみたいなもの。β=0 だと固まったまま、ちょうど混ぜると γ で伝えた好みが浮かび上がります。',
    detail:
      'mixer Hamiltonian の作用の強さ。U_M(β) = exp(-i β H_M)、H_M = Σ X_j。',
  },
  reps: {
    label: 'reps (考え直す回数)',
    summary:
      '「γ で好き → β で混ぜる」を 1 セットとして、何回繰り返すか。1 回だとぼんやり、2-3 回でハッキリ答えが見えます。',
    detail:
      'QAOA レイヤー数 p。p が大きいほど近似精度が上がるが計算コストも増える。',
  },
  hamiltonian: {
    label: 'Hamiltonian',
    summary:
      '「採点ルール」を表す数式。QAOA ではコスト用と混ぜる用の 2 種類を用意して、γ と β で強さを調整します。',
    detail:
      'システムのエネルギーを表す演算子。QAOA では H_C（コスト）と H_M（mixer）の 2 つを交互に作用させる。',
  },
  interference: {
    label: '干渉',
    summary:
      '波がぶつかって強まる所と消える所ができる現象。水面に石を 2 つ落とした時の波と同じ。量子はこの仕組みで「悪い解」を消して「良い解」を残します。',
    detail:
      '量子の確率振幅どうしが複素数の位相に応じて強め合ったり打ち消し合ったりする。',
  },
  measurement: {
    label: '測定',
    summary:
      '箱を開けて、コインの表か裏かを決める瞬間。重ね合わせの状態から、確率にしたがって 1 つのルートが選び出されます。',
    detail:
      '量子状態の射影。確率は |⟨x|ψ⟩|² で与えられる。',
  },
  tsp: {
    label: 'TSP (巡回セールスマン問題)',
    summary:
      '「全部の地点を 1 回ずつ訪れて出発地に戻る、最短ルートは？」という問題。4 地点なら 24 通り、地点が増えると爆発的に増えます。',
    detail:
      'Traveling Salesman Problem。NP-困難な組合せ最適化問題の代表例。',
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
