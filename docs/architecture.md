# Architecture — Quantum Hackathon Web System

> "Opening Urban Challenges with Q" — NTT West × Dentsu, 2026

このドキュメントは実装の単一の真実 (Single Source of Truth)。実装中に判断が変わった場合は**必ず**ここを更新する。

---

## 1. プロジェクトの一行定義

> ブラウザ単独で動作する、2時間体験型・QAOAによる配送ルート最適化ハッカソンWebシステム

---

## 2. 不変の設計原則 (Invariants)

| # | 原則 | 理由 |
|---|------|------|
| 1 | **JS量子エンジンが常に主** | イベント当日にネット/Qiskit が落ちても継続できる必要があるため |
| 2 | **サーバ/DB なし**（リーダーボード含む） | スコア集計はオーガナイザが手動。各デバイス完結 |
| 3 | **世界観: 都市 + 配送トラック**（暖かい俯瞰ミニチュア） | 「社会実装感」を伝えるため。サイバーパンク禁止 |
| 4 | **信頼性 > 機能数** | 不安定な会場 Wi-Fi 環境 |
| 5 | **初心者を圧倒しない** | 全ての技術用語にツールチップ。3段階ヒント |

---

## 3. 技術スタック

| 領域 | 採用 | 理由 |
|------|------|------|
| Framework | Next.js 15 (App Router) | SSR/SSG 両対応、Vercel 1-click デプロイ |
| Language | TypeScript (strict) | 量子エンジンの型安全性が体験品質に直結 |
| 3D | Three.js + `@react-three/fiber` + `@react-three/drei` | 宣言的 3D、コミュニティ実績 |
| Shader | 生 GLSL | 確率フォグの emissive 強度制御に必要 |
| State | Zustand | 軽量、SSR非依存、3ストア分離が容易 |
| Style | Tailwind CSS + CSS Custom Properties | デザイントークンを `tokens.css` に集約 |
| Test | Vitest + Testing Library | Vite 互換、量子エンジンの単体テスト高速 |
| Quantum Engine | 自前実装 (`Float64Array` real/imag) | 外部量子ライブラリなし、4配送地点程度なら十分 |
| Deploy | Vercel + ローカル `npm start` | 両対応で会場ネット切断に耐える |

---

## 4. ディレクトリ構成

```
src/
├── app/                    # App Router pages + layout
│   ├── layout.tsx          # ルート + GlobalHUD
│   ├── page.tsx            # Screen 1: Intro
│   ├── tutorial/page.tsx   # Screen 2: Tutorial
│   ├── challenge/page.tsx  # Screen 3: Main Challenge ★
│   ├── result/page.tsx     # Screen 4: Result
│   └── api/qaoa/route.ts   # Phase 5 用スタブ
├── components/
│   ├── hud/                # GlobalHUD, Timer, ScoreCard
│   ├── city/               # CityScene, CityGrid, DeliveryPin, Truck, ProbabilityFog
│   ├── controls/           # ParameterSliders, ExecuteButton
│   ├── hints/              # MiniGuide, HintPanel, GlossaryTooltip
│   └── ui/                 # Button, Panel, Confetti
├── engine/                 # ★ 純粋 TS、DOM/React 依存なし
│   ├── statevector.ts
│   ├── qaoa.ts
│   ├── tsp.ts
│   ├── scoring.ts
│   └── types.ts
├── store/                  # Zustand
│   ├── sessionStore.ts
│   ├── paramsStore.ts
│   └── hintStore.ts
├── shaders/                # *.glsl をテキストインポート
├── lib/                    # animation, glossary, reducedMotion
└── styles/                 # tokens.css, globals.css
```

**ルール**:
- feature/domain で整理（型別ではない）
- 1ファイル 200-400 行を目安、800 行上限
- `engine/` は React/DOM を import しない（テスト容易性）

---

## 5. 状態管理アーキテクチャ

Zustand ストアを **3つに分離**。クロスストアの依存禁止（読みは selector 経由のみ）。

### 5.1 `sessionStore`

```ts
type AttemptRecord = {
  id: string;
  timestamp: number;
  params: QaoaParams;
  bestValid: RouteCandidate | null;
  isNewBest: boolean;
};

interface SessionState {
  startedAt: number | null;
  bestScore: { distance: number; route: number[]; params: QaoaParams } | null;
  history: ReadonlyArray<AttemptRecord>;

  startSession(): void;
  recordAttempt(result: QaoaResult): { isNewBest: boolean };
  resetSession(): void;
}
```

### 5.2 `paramsStore`

```ts
interface ParamsState {
  gamma: number;   // 0..π
  beta: number;    // 0..π/2
  reps: number;    // 1..3
  setGamma(v: number): void;
  setBeta(v: number): void;
  setReps(v: number): void;
  reset(): void;
}
```

### 5.3 `hintStore`

```ts
interface HintState {
  currentLevel: 0 | 1 | 2 | 3;
  autoTriggered: boolean;
  lastInteractionAt: number;
  bumpLevel(): void;
  recordInteraction(): void;
}
```

**イミュータブル更新を徹底**: `set((s) => ({ ...s, ... }))`。配列は `concat` / spread で新規生成。

---

## 6. 量子エンジン型定義 (Core)

`src/engine/types.ts`:

```ts
export interface QaoaParams {
  gamma: number;
  beta: number;
  reps: number;
}

export interface CityProblem {
  depot: { x: number; y: number };
  deliveries: ReadonlyArray<{ id: number; x: number; y: number }>;
}

export interface RouteCandidate {
  order: ReadonlyArray<number>;   // depot を端に含む訪問順
  distance: number;
  probability: number;            // 0..1
  isValid: boolean;
}

export interface QaoaResult {
  distribution: ReadonlyArray<RouteCandidate>; // probability 降順
  bestValid: RouteCandidate | null;
  elapsedMs: number;
  params: QaoaParams;
}

export interface QaoaRunner {
  run(problem: CityProblem, params: QaoaParams): QaoaResult;
}
```

### 6.1 パイプライン

```
CityProblem
   ↓ tsp.ts:problemToIsing
Ising/QUBO 表現 (Pauli sum)
   ↓ statevector.ts:initSuperposition (Hadamard 全 qubit)
均等な重ね合わせ状態
   ↓ qaoa.ts:applyCostHamiltonian(γ) → applyMixerHamiltonian(β)
   ↓ × reps
最終状態
   ↓ statevector.ts:probabilities
P(|x⟩)[]
   ↓ tsp.ts:bitstringToRoute + scoring.ts:totalDistance
RouteCandidate[]
   ↓ 確率降順 sort
QaoaResult
```

### 6.2 表現

- 状態は `{ real: Float64Array; imag: Float64Array }` で長さ `2^n`
- 4配送地点 + depot の TSP は **one-hot 符号化**で `n_qubits = 4 * 4 = 16`、配列長 65536（メモリ 1MB 程度、ブラウザで余裕）
- ただし MVP では計算負荷を抑えるため **訪問順だけを並び替える 4! = 24 通り**を直接列挙する簡易モードも用意し、QAOA 結果を「24 個の順列に対する確率分布」へマッピングする実装を併用する（実装が単純で、教育目的に十分）

> **判断**: 真の one-hot QAOA はメモリ・計算量とも MVP には過剰。**順列ベースの簡易 QAOA**（4! 状態の cost Hamiltonian と mixer を 16qubits 相当の virtual state で表現）で「パラメータを動かすと最短ルートに収束する」体験を確実に再現する。Phase 4-5 で本格 one-hot 版へ拡張可能な型を維持。

---

## 7. 画面構成

| Screen | Route | 所要 | 目的 |
|--------|-------|------|------|
| 1. Intro | `/` | ~10 min | タイトル + 都市が立ち上がる演出 + 30秒の重ね合わせデモ |
| 2. Tutorial | `/tutorial` | ~20 min | 手動ルート → 初 QAOA 操作 |
| 3. Challenge ★ | `/challenge` | ~50 min | コア体験ループ |
| 4. Result | `/result` | ~40 min | プレゼン用結果画面 |

**GlobalHUD** は `app/layout.tsx` で固定配置（残り時間 + 現在ベストスコア）。

---

## 8. WebGL 設計

### カメラ・シーン
- 角度付き俯瞰、`PerspectiveCamera`、`OrbitControls` は **回転制限** あり（pan 禁止、polar 0.3-1.0rad）
- ライティング: `AmbientLight` 0.4 + `DirectionalLight` 1.0（街灯っぽい暖色）

### オブジェクト
- **道路**: グリッド、`Line` または薄い `Plane`
- **建物**: `InstancedMesh`（数百個でも軽い）、低ポリ
- **配送ピン**: 発光カプセル × 4 + depot
- **トラック**: 低ポリ車両（drei `Box` 簡易版で十分）

### 確率フォグ ★ コアビジュアル
- 各 `RouteCandidate.order` を道路セグメントに展開
- 各セグメントの emissive 強度 = `Σ probability` for routes containing it
- `ShaderMaterial` で `uniforms.time` を `useFrame` で更新、柔らかいノイズパルス
- 重畳ブレンド（`AdditiveBlending`）

### パフォーマンス制約
- 30fps を **最優先**（Lighthouse Perf 70+）
- Bloom は `gl.capabilities.maxTextureSize > 8192` などで動的判定
- `prefers-reduced-motion: reduce` 時はパルス停止、confetti を簡略化

---

## 9. デザイントークン

`src/styles/tokens.css`:

```css
:root {
  /* Color */
  --color-bg: oklch(94% 0.01 80);           /* off-white #F5F1EA */
  --color-ink: oklch(20% 0.03 260);          /* deep navy #0F1B3D */
  --color-accent: oklch(70% 0.14 50);        /* warm orange #D97757 */
  --color-glow: oklch(85% 0.18 90);          /* 街灯黄 */
  --color-surface: oklch(98% 0.005 80);
  --color-muted: oklch(60% 0.02 260);

  /* Typography */
  --font-sans: 'Noto Sans JP', system-ui, sans-serif;
  --font-display: 'Zen Kaku Gothic Antique', var(--font-sans);
  --text-hud: clamp(1.5rem, 1rem + 1vw, 2rem);
  --text-hero: clamp(2.5rem, 1rem + 5vw, 5rem);

  /* Spacing & Motion */
  --space-hud: 1.5rem;
  --radius-card: 0.75rem;
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --duration-fast: 150ms;
  --duration-normal: 300ms;
}
```

紫グラデ・cyber blue 禁止。AI スタートアップ感を意図的に避ける。

---

## 10. ヒント＆Glossary

### 3段階ヒント
| Level | 例 |
|-------|---|
| 1 | "γ を増やすと分布が鋭くなります" |
| 2 | "γ は 0.8〜1.2 あたりがよく効きます" |
| 3 | "reps=2, γ≈1.0, β≈0.4 を試してみよう" |

操作なしが **90秒** 続いたら自動で Level 1 を表示。

### Glossary（`src/lib/glossary.ts`）

```ts
export const glossary = {
  qaoa: {
    label: 'QAOA',
    summary: 'Quantum Approximate Optimization Algorithm。最適化問題を量子で解く近似手法。'
  },
  superposition: {
    label: '重ね合わせ',
    summary: '複数の状態が同時に存在している量子の状態。'
  },
  gamma: { label: 'γ (ガンマ)', summary: 'cost Hamiltonian の強さ。' },
  beta: { label: 'β (ベータ)', summary: 'mixer Hamiltonian の強さ。' },
  // ...
} as const;
```

すべての技術用語は `<GlossaryTooltip k="qaoa">QAOA</GlossaryTooltip>` で包む。

---

## 11. 検証戦略

| 種別 | ツール | 対象 |
|------|--------|------|
| Unit | Vitest | 量子エンジン全関数（カバレッジ 80%+） |
| Component | Vitest + RTL | HUD, スライダー, ヒント |
| 手動 | ブラウザ | Challenge ループ、確率フォグ、Confetti |
| パフォ | Lighthouse + DevTools throttling | 30fps 維持 |
| A11y | axe DevTools | キーボード操作、reduced-motion |
| オフライン | DevTools "Offline" | ローカル動作確認 |

---

## 12. デプロイ

| ターゲット | コマンド |
|----------|---------|
| Vercel | `git push` でプレビュー、`main` で本番 |
| ローカル | `npm install && npm run build && npm start` |
| 開発 | `npm run dev` |

`/api/qaoa` ルートは Phase 5 まで 501 を返すスタブ。

---

## 13. Phase スコープ（現在 = Phase 1-3 MVP）

| Phase | 範囲 | ステータス |
|-------|------|----------|
| 1 | Foundation: setup + HUD + 4画面骨格 | ✅ 完了 |
| 2 | 量子エンジン TDD（32 tests / 96% coverage） | ✅ 完了 |
| 3 | WebGL 都市 + コアループ + Glossary + 3段階ヒント | ✅ 完了 |
| 4-edu | 教育レイヤー: 7ステップウィザード + 手動ルートモード + マップラベル + 実行ナレーション | ✅ 完了 |
| 5 | Qiskit `/api/qaoa` 連携 | 今回スコープ外 |

### Phase 4-edu の学習設計
- **比喩 → 体験 → 言葉** の順で 1 ステップ 1 概念
- `src/lib/metaphors.ts` に高校生向けストーリー（γ=磁石、β=ブレスト、reps=考え直す回数）
- Step 1 で手動ルートモード（24 通り全列挙して順位算出は `src/lib/manualScoring.ts`）
- マップ上の `drei <Html>` ラベルで物体が常時識別可能
- Challenge 実行時に 3 ステップオーバーレイ（重ね合わせ → 採点 → 測定）

---

## 14. オープン質問

なし（着手時点）。実装中に発生したら本セクションに追記。
