# Colab Notebook ハンドオフ ガイド

> ハッカソン本番で各チームが「Web アプリのつまみで決めた設定」を Qiskit + AerSimulator に持っていくための手順書。

`notebooks/` と `public/notebooks/` に同じ Notebook が 2 種類入っています:

| ファイル | 役割 |
|---|---|
| `qiskit_qaoa_handoff.ipynb` | **比較版** — Web アプリと同じ抽象都市の問題を Qiskit で再実行、JS と比較表で並べる |
| `qiskit_real_city_challenge.ipynb` | **実地図版** — 6 つの実在の場所 (geopy で位置検索) を入れ、本物の地図 (folium) に Qiskit の最適ルートを描画 |

`public/notebooks/` 配下は Next.js が静的配信するので、Web アプリのボタンから直接ダウンロードできます。

---

## 方法 1: Web アプリのボタンを押すだけ (本命・即動く)

GitHub への push が無くても **今すぐ** 動きます。Wi-Fi さえあれば OK。

### 各チームがする操作

1. **Web アプリの該当ページ** (`/tutorial` Step 6 / `/challenge` / `/story`) で「比較版を開く」または「実地図版を開く」をクリック
2. ボタンが**同時に 3 つ**実行します:
   - ✅ パラメータをクリップボードにコピー
   - ⬇️ Notebook (`qiskit_xxx_<TeamName>.ipynb`) を**自動ダウンロード**
   - 📤 **Colab の Upload タブ**を新しいタブで開く
3. Colab で **Upload** タブが選ばれているのを確認 → **ファイルを選択** → さっきダウンロードされた `.ipynb` を選ぶ
4. Notebook が開いたら、最初のコードセルに **Cmd/Ctrl+V** でパラメータを貼り付け
5. メニュー **ランタイム → すべて実行**
6. 3〜6 分待つ (pip install + Qiskit シミュレーション)
7. 結果セル (⑦ or ⑫) の地図 / 表 を **スクリーンショット** → ストーリーカードに貼る
8. Colab メニュー **共有 → リンクをコピー**で Notebook URL を保存

### 主催者がやること

- (Pre-event) 「Web アプリのボタンを押す → ダウンロード → Colab で Upload」の 3 ステップを口頭デモするスライドを用意
- (Day) チーム PC で `pnpm dev` (または `pnpm build && pnpm start`) を起動済みにする
- (Day) ブラウザのポップアップブロックがオフになっているか確認 (Colab タブを開く処理が止まらないように)

### トラブル時
- ダウンロードが始まらない → ボタン下の「.ipynb を直接ダウンロード」リンクを使う
- クリップボードが効かない → ボタン下の「スニペットを表示 / 手動コピー」で全選択 → Cmd+C
- Colab タブが開かない → ブラウザ右上のポップアップ警告を「許可」に

---

## 方法 2: GitHub Public で 1 クリック化 (任意, 摩擦さらに減らす)

ハッカソン直前にもう一段スムーズにしたい場合。Web アプリのボタンが**ダウンロードを介さず直接 Colab に notebook を読み込ませる**ようになります。

### セットアップ

1. このリポジトリを GitHub に push し、**Public** に切り替え
   ```bash
   git push -u origin feat/qiskit-handoff-hackathon
   gh repo edit <owner>/<repo> --visibility public
   ```

2. `src/lib/colabExport.ts` の `DEFAULT_CONFIG` を本物の owner/repo に書き換え
   ```ts
   const DEFAULT_CONFIG = {
     githubOwner: 'YOUR_GITHUB_OWNER',  // ← ここ
     githubRepo: 'YOUR_REPO_NAME',       // ← ここ
     githubBranch: 'main',               // 公開ブランチ名
   } as const;
   ```

3. 動作確認用 URL (ブラウザで直接アクセス):
   ```
   https://colab.research.google.com/github/<owner>/<repo>/blob/main/notebooks/qiskit_qaoa_handoff.ipynb
   https://colab.research.google.com/github/<owner>/<repo>/blob/main/notebooks/qiskit_real_city_challenge.ipynb
   ```

4. ColabButton は GitHub URL と Upload URL の両方を持っているので、必要なら以下のように切り替え可能 (現在は「ダウンロード + Upload タブ」がデフォルト):
   - `buildColabUrl({ notebook })` → GitHub URL 直接読み込み (1 クリック)
   - `buildColabUploadUrl()` → Upload タブ起動 (ダウンロード方式)

### Private リポジトリのまま使いたい場合
個人 OAuth 認可で Colab が読めますが、各参加者にも認可ダイアログが出ます。当日の摩擦が増えるので Public 推奨。

---

## 方法 3: 直接アップロード (オフラインバックアップ)

Wi-Fi 障害時の最終フォールバック。

1. https://colab.research.google.com を開く
2. メニュー: **ファイル → ノートブックをアップロード**
3. 事前配布した `.ipynb` を選択

### 配布パッケージの作り方
```bash
zip -j hackathon-notebooks.zip \
  notebooks/qiskit_qaoa_handoff.ipynb \
  notebooks/qiskit_real_city_challenge.ipynb
```

USB or Slack or メールでチームに送付。

---

## 方法 4: Google Drive 共有 (中間)

1. `notebooks/*.ipynb` を主催者の Google Drive にアップロード
2. **リンクの共有** で「リンクを知っている全員 — 閲覧者」に設定
3. ファイルを右クリック → **アプリで開く → Google Colaboratory**
4. Colab メニュー: **ファイル → ドライブにコピーを保存** で各チームの Drive に複製

---

## 当日の利用フロー (チーム視点)

### 実地図版 (`qiskit_real_city_challenge.ipynb`)

1. ストーリーカードで「私たちの街」を決める (例: 「水都・大阪」)
2. Web アプリ `/story` でチーム名 / 街名 / 6 ラベルを入力
3. 「🗺 実地図版を開く」をクリック → ダウンロード + クリップボード + Colab タブが**同時発動**
4. Colab の Upload タブで `.ipynb` を選択 → Notebook が開く
5. ②③⑧ セルにスニペット貼り付け (Cmd/Ctrl+V)
6. **ランタイム → すべて実行**
7. 3〜6 分待つ (pip install + geocoding + Qiskit)
8. ⑫ セルの地図を **スクリーンショット** → ストーリーカード PDF に貼る
9. **共有 → リンクをコピー** で Notebook URL → ストーリーカードに記入

### 比較版 (`qiskit_qaoa_handoff.ipynb`)

1. Web アプリの `/challenge` で「この設定で実行」を 1 回押す
2. 結果カード下の「📊 比較版を開く」をクリック
3. Colab Upload タブで `.ipynb` 選択 → Notebook が開く
4. ①パラメータ貼り付けセルにスニペットを貼り付け
5. **ランタイム → すべて実行**
6. 3〜5 分で完走、`⑦` 比較表で JS と Qiskit の上位 3 ルートが一致するか確認

---

## トラブルシューティング

| 症状 | 対応 |
|---|---|
| ボタン押してもダウンロード始まらない | ボタン下の「.ipynb を直接ダウンロード」リンクで救出 |
| Colab で「ファイルを選択」した後の Upload が遅い | 待つ (10-30 秒)。`.ipynb` は 17KB なので 1 分以内 |
| `pip install` が 3 分以上かかる | 待機。事前にスタッフが 30 分前にウォームアップしておくと当日は 1 分弱 |
| `geopy` で「場所が見つからない」 | 入力に「市」「区」を追加。例: 「清水寺」 → 「清水寺, 京都市」 |
| クリップボード貼り付けが効かない | ColabButton 下の「スニペットを表示」を押し、テキストを手動コピー |
| Qiskit と JS で結果が微妙にずれる | サンプリング誤差 (4096 shots) で ±2% 程度は正常 |
| ノートブックを書き換えたい | メニュー: **ファイル → ドライブにコピーを保存** で自分の Drive に複製してから |

---

## 主催者チェックリスト

### 1 週間前まで
- [ ] `pnpm dev` で `/challenge` ボタン押下を 1 回テスト (ダウンロード + Colab タブ + クリップボード 3 つ全部発火を確認)
- [ ] ダウンロードした `.ipynb` を Colab Upload → 「すべて実行」が成功するか確認 (実地図版 + 比較版両方)
- [ ] `pnpm build` で問題なしを確認
- [ ] 配布用 zip を作成 (`hackathon-notebooks.zip`) — Wi-Fi 落ちフォールバック用
- [ ] Wi-Fi 帯域 50Mbps 以上、人数分の余裕
- [ ] (任意) GitHub Public 化 → `colabExport.ts:DEFAULT_CONFIG` 更新

### イベント 30 分前
- [ ] 主催 PC で `qiskit_real_city_challenge.ipynb` を実行し、pip install キャッシュをウォームアップ
- [ ] 各テーブルの PC で Chrome / Edge を起動 + ポップアップブロック OFF
- [ ] Colab にスタッフの Google アカウントでログイン済み (実機 backup 用)
- [ ] `pnpm dev` を起動した Web アプリを各 PC で表示済み
