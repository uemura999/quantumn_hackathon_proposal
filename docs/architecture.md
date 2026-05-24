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
  sampledRoute: RouteCandidate | null;
  isNewBest: boolean;
  deltaFromBest: number | null;
  topAmplification: number;
  uniformProbability: number;
  trafficProfile: string;
};

interface SessionState {
  startedAt: number | null;
  bestScore: { distance: number; route: number[]; params: QaoaParams; distanceRank: number; trafficProfile: string } | null;
  history: ReadonlyArray<AttemptRecord>;

  startSession(): void;
  recordAttempt(result: QaoaResult, sampledRoute?: RouteCandidate | null): { isNewBest: boolean; deltaFromBest: number | null };
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
  distanceRank: number;           // 1..n!
  deltaFromOptimal: number;
  isValid: boolean;
}

export interface QaoaResult {
  distribution: ReadonlyArray<RouteCandidate>; // probability 降順
  bestValid: RouteCandidate | null;
  elapsedMs: number;
  params: QaoaParams;
  trafficProfile: string;
  uniformProbability: number;
  topAmplification: number;
  probabilityHistory: ReadonlyArray<ReadonlyArray<number>>;
}

export interface QaoaRunner {
  run(problem: CityProblem, params: QaoaParams): QaoaResult;
}
```

### 6.1 パイプライン

```
CityProblem
   ↓ tsp.ts:indexToPermutation
720 通りの有効な訪問順だけを列挙
   ↓ qaoa.ts:createUniformState
均等な候補状態
   ↓ qaoa.ts:applyPhaseDiagonal(γ) → applyPermutationMixer(β)
   ↓ × reps
最終状態
   ↓ 確率に変換 + distanceRank / deltaFromOptimal を付与
RouteCandidate[]
   ↓ 確率降順 sort (同率は短い距離を優先)
QaoaResult
```

### 6.2 表現

- 状態は `{ real: Float64Array; imag: Float64Array }` で長さ `6! = 720`
- MVP では無効ビット列を作らず、**訪問順だけを並び替える順列ベースの簡易 QAOA**で、すべての表示を有効ルート候補にそろえる
- `sampleRouteCandidate()` は分布から今回取り出したルートをサンプリングし、セッションベスト判定は `bestValid`（波が推す 1 位候補）の距離で行う

> **判断**: 真の one-hot QAOA は教育用 MVP には過剰。順列ベースにすることで、「調整中プレビュー」「実行結果」「今回取り出したルート」の表示を 720 個の有効候補だけで説明できる。

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
| 1 | "短さの好みを少し増やすと、短い候補に印がつきます" |
| 2 | "短さの好みは 0.8〜1.2、混ぜる強さは 0.3〜0.5 あたりから試す" |
| 3 | "考え直す回数=2、短さの好み≈1.0、混ぜる強さ≈0.4 から動かす" |

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
  gamma: { label: '短さの好み (γ)', summary: '短いルートをどれくらい強く好きと伝えるか。' },
  beta: { label: '混ぜる強さ (β)', summary: '候補どうしをどれくらい混ぜるか。' },
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

## 13. Phase スコープ（現在 = Phase 1-3 MVP + 5-quality）

| Phase | 範囲 | ステータス |
|-------|------|----------|
| 1 | Foundation: setup + HUD + 4画面骨格 | ✅ 完了 |
| 2 | 量子エンジン TDD（32 tests / 96% coverage） | ✅ 完了 |
| 3 | WebGL 都市 + コアループ + Glossary + 3段階ヒント | ✅ 完了 |
| 4-edu | 教育レイヤー: 7ステップウィザード + 手動ルートモード + マップラベル + 実行ナレーション | ✅ 完了 |
| 5-quality | 道路グラフ + 6 配送先 + 渋滞 + 候補バー + 成果ダッシュボード + 機構説明 | ✅ 完了 |
| 6 | Qiskit `/api/qaoa` 連携 | スコープ外 |

### Phase 4-edu の学習設計
- **比喩 → 体験 → 言葉** の順で 1 ステップ 1 概念
- `src/lib/metaphors.ts` に高校生向けストーリー（短さの好み、混ぜる強さ、考え直す回数）
- Step 1 で手動ルートモード（720 通り全列挙して順位算出は `src/lib/manualScoring.ts`）
- マップ上の `drei <Html>` ラベルで物体が常時識別可能
- Challenge 実行時に 4 ステップオーバーレイ（候補を広げる → 短い道に印をつける → 候補を混ぜる → 1本取り出す）

### Phase 5-quality の追加要素 (今回の改修)

1. **道路グラフ + 6 配送先** (`src/engine/city-layout.ts`)
   - 5×5 グリッド (25 ノード) + 40 エッジ
   - 6 配送先を非中央ノードに配置、倉庫(中央)と道路で全連結
   - `assertNoCollisions(layout)` で全オブジェクト 1.2u 以上分離を保証
   - 距離は **Floyd-Warshall** で計算した道路最短経路 (`scoring.ts`)
2. **渋滞モデル** (`TrafficLevel`: clear / light / moderate / heavy)
   - エッジ毎に決定論的な渋滞レベル + 倍率 (1.0 / 1.25 / 1.7 / 2.4)
   - 3 つの交通プロファイル (morning_rush / midday / evening_rush)
   - `RoadNetwork.tsx` で色オーバーレイ表示
   - Challenge では `昼 / 朝ラッシュ / 夕方ラッシュ` を切り替え可能
3. **候補バー** (`src/components/wave/`)
   - `WavePanel.tsx`: 候補の強さバー (√P で表現、差を強調)
   - `InterferenceDemo.tsx`: 2 波の合成を SVG で可視化 (高校物理アナロジー)
   - `LayerReplay.tsx`: QAOA レイヤー毎の確率履歴を再生
4. **QAOA エンジン拡張**
   - `runQaoa()` の戻り値に `probabilityHistory: number[][]` 追加
   - `RouteCandidate` に `distanceRank` / `deltaFromOptimal` 追加
   - `QaoaResult` に `uniformProbability` / `topAmplification` / `trafficProfile` 追加
   - `sampleRouteCandidate()` で「今回取り出したルート」を表現
   - レイヤー毎・位相付け/混ぜそれぞれのスナップショット
5. **成果表示 + 教育の機構説明**
   - Challenge 上部に「今回の成果」ダッシュボードを表示
   - 距離、距離順位、最短との差、配送時間、確信度、前回との差を表示
   - ルートが同じ場合は「訪問順は同じ、選ばれやすさが変化」と明示
   - `glossary.ts` の `GlossaryEntry.mechanism` 追加
   - `metaphors.ts` の `Metaphor.mechanism` / `goldZone` 追加
   - `SoloSliderStep` に `<details>` 折りたたみの「なぜそうなる？」
   - Step3 (γ) に `InterferenceDemo`、Step5 (reps) に `LayerReplay` 埋込

### 衝突回避ルール
- Pin (倉庫/配送先) は全て交差点に配置 → 道路と完全に整合
- 建物は 4×4 = 16 ブロックの中心点に配置、`MIN_PIN_SEPARATION=1.5` 以下なら除外
- 建物同士は `MIN_BUILDING_SEPARATION=1.2` 未満禁止
- `city-layout.test.ts` で自動検証

---

## 14. オープン質問

なし（着手時点）。実装中に発生したら本セクションに追記。
