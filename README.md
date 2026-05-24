# Opening Urban Challenges with Q

> NTT 西日本 × 電通 — 量子技術で都市の配送ルートを最適化する、2 時間体験型ハッカソン

ブラウザ単独で動作する、QAOA (Quantum Approximate Optimization Algorithm) による配送ルート最適化シミュレータ + 高校生向け教育コンテンツ。

## Quick Start

```bash
# Node 20+ 推奨 (vitest 4 の rolldown が要件)
nvm use 22.22.1   # or any Node 20+

# install
pnpm install     # or npm install

# dev server
pnpm dev         # http://localhost:3000

# tests (50 ユニット/統合テスト)
pnpm test

# production build
pnpm build
```

## 構成

- `/` (Intro) — 都市の立ち上げ演出
- `/tutorial` — 7 ステップのルート最適化チュートリアル
- `/challenge` — メイン体験ループ (3D シーン + 候補バー + 3つのつまみ)
- `/result` — プレゼン用結果画面

## 設計ドキュメント

- [`docs/architecture.md`](docs/architecture.md) — 実装の単一の真実 (SSOT)
- [`docs/educational-design.md`](docs/educational-design.md) — 高校生向け教育設計

## 手動スモークテスト

E2E 自動化は未導入。リリース前に以下を目視確認してください。

1. `pnpm dev` で起動
2. `/` を開いてタイトル + 都市シーン表示を確認
3. `/tutorial` Step 0 〜 6 を順に踏破
   - Step 2: 候補バーの全バーが ≈ 0.14% (1/720) で均等
   - Step 3: 「短さの好み」スライダー操作で短ルートの緑バーが伸び縮みする
   - Step 3: 強すぎプリセットで InterferenceDemo の打ち消し率が大きく変動
   - Step 5: LayerReplay で「最初 → 印をつける → 混ぜる」の確率推移が再生できる
4. `/challenge` で:
   - 3D シーンに建物・道路・渋滞色・配送ピン・倉庫が**重ならず**配置されている
   - 右側の候補バーがスライダーに即座に追従する
   - 「この設定で実行」でトラックが**道路に沿って**走る (建物を貫通しない)
   - 上部の「今回の成果」に距離・配送時間・確信度・前回との差が出る
   - 交通状況 (昼/朝ラッシュ/夕方ラッシュ) を変えると渋滞色と候補バーが更新される
5. `prefers-reduced-motion: reduce` を有効にしてアニメ短縮を確認

## アーキテクチャ概要

- **エンジン** (`src/engine/`): 純粋 TypeScript、React/DOM 依存なし、Float64Array で量子状態を表現
- **道路グラフ** (`src/engine/city-layout.ts`): 5×5 = 25 ノード、40 エッジ、6 配送先、渋滞 4 段階
- **R3F シーン** (`src/components/city/`): CityGrid + RoadNetwork + DeliveryPins + Truck + ProbabilityFog
- **候補バー** (`src/components/wave/`): WavePanel (常時表示) + InterferenceDemo (Step3 専用) + LayerReplay (Step5 専用)
- **状態管理**: Zustand 4 ストア (params / session / hint / tutorial)

## ライセンス

非公開ハッカソン教材。社内/教育用途のみ。

# quantumn_hackathon_proposal
