# OpenAI Realtime API (Node.js/TypeScript)

Node.js環境からOpenAIのRealtime API にWebSocketで接続し、マイクからの音声入力とスピーカーからの音声出力をリアルタイムで行うサンプルプロジェクトです。

## 前提条件

このプロジェクトを実行するには、以下のインストールが必要です。

- **Node.js**
- **pnpm**
- **SoX (Sound eXchange)**: 音声の録音(`rec`)および再生(`play`)コマンドを使用するため、OSへのインストールが必須です。

## セットアップ

1. **リポジトリのクローンと依存パッケージのインストール**

   ```bash
   pnpm install
   ```

2. **環境変数の設定**
   プロジェクトのルートディレクトリに `.env` ファイルを作成し、以下の変数を設定してください。

   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   OPENAI_MODEL=gpt-realtime-mini # オプション: デフォルトでは gpt-realtime-mini が使用されます
   ```

## 実行方法

以下のコマンドを実行すると、マイク経由での録音とOpenAI Realtime APIへのストリーミング接続が開始されます。

```bash
pnpm start
```

## 型チェック

TypeScriptの型エラーを確認する場合は以下を実行してください。

```bash
pnpm typecheck
```

## 仕組み

- `index.ts`: WebSocketクライアントとしてOpenAI APIに接続し、音声の送受信およびストリームの制御を行います。
  - AIの返答テキスト（文字起こし）をターミナルに逐次出力します。
  - 新しい応答生成時（ユーザーの割り込み時など）にスピーカーバッファをクリア（プロセスの再生成）し、AIの発話を瞬時に中断させます。
  - エラー時および `SIGINT` 受信時にリソースを適切にクリーンアップして終了します。
- `audio.ts`: `child_process` の `spawn` を利用してOS標準の `rec` および `play` プロセスを起動し、マイク入力とスピーカー出力を管理します。
  - 割り込み処理などでプロセスを再生成する際に発生しうる `EPIPE` エラーを安全に無視し、クラッシュを防ぎます。
  - サンプリングレート: 24,000Hz
  - フォーマット: raw (16-bit signed integer, モノラル)

## 停止方法

プログラムを実行中に `Ctrl + C` を押すことで停止できます。
