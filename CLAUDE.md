@AGENTS.md

# プロジェクトの約束ごと（番頭さん）

## 番頭さんのキャラクター
- 番頭さんの人物設定・セリフは [lib/bantou.ts](lib/bantou.ts) が正本。[docs/bantou-voice-script.md](docs/bantou-voice-script.md) と内容を一致させること。
- 新しい番頭さんや取り次ぎルールを追加するときは、`BANTOU_LIST`（lib/bantou.ts）や `RELAY_RULES`（lib/relay.ts）に配列の要素を1件足すだけにする。個別のif分岐をコンポーネント側に増やさない。

## UIテキストのルール
- 読者は高齢の居住者。難しい熟語・カタカナ語を避け、短い文で書く（[app/api/generate/route.ts](app/api/generate/route.ts) のプロンプトと同じ基準）。
- ボタン・入力欄は最低 `min-h-[44px]`、主要な操作ボタンは `min-h-[52px]`以上にする。

## ディレクトリ構成
- `app/_components/` : 画面固有のUIコンポーネント
- `lib/` : フレームワークに依存しない純粋なロジック・データ定義
- `lib/supabase/client.ts` はブラウザ用、`lib/supabase/server.ts` はサーバー用。混同しない。

## データの保存
- Supabaseへの `insert`/`update` は、失敗時に `error` を握りつぶさない。ユーザーには保存の成否が伝わるようにする（現状 [NoticeDetailPanel.tsx](app/_components/NoticeDetailPanel.tsx) と [DueDatePicker.tsx](app/_components/DueDatePicker.tsx) の保存処理はこれができていないので、触る際は直すこと）。
- 外部API（Gemini等）呼び出しは失敗しても入力データが消えないよう、先にDBへ下書き保存してから生成を呼ぶ（[lib/notices.ts](lib/notices.ts) の `saveMemoDraft` のパターンに倣う）。

## 重複させない
- お知らせの型定義・タブ定義（signage/poster/circular）は [ResultCard.tsx](app/_components/ResultCard.tsx) と [NoticeDetailPanel.tsx](app/_components/NoticeDetailPanel.tsx) に同じものが2箇所ある。どちらかを直すときは両方確認するか、共通化を検討する。

## コミット
- 1コミット1トピック。数分〜数時間で読めるサイズに保つ（このリポジトリの既存コミット履歴が模範）。

## 作業完了前に必ず実行する
- `npm run lint`
- `npm run typecheck`
- 両方エラーが出ないことを確認してから完了とする（GitHub Actions のCIでも同じ2つを自動チェックする）。

## 環境変数
- `NEXT_PUBLIC_` 接頭辞の変数はブラウザに公開される前提（Supabase anon keyはこれでよい）。
- `GEMINI_API_KEY` は接頭辞なし。サーバー側（app/api配下）以外から参照しない。
