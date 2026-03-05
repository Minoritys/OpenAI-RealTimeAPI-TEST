# OpenAI Realtime API (Node.js/TypeScript)

Node.js環境からOpenAIのRealtime API (`gpt-realtime-mini`) にWebSocketで接続し、マイクからの音声入力とスピーカーからの音声出力をリアルタイムで行うサンプルプロジェクトです。

## 前提条件

このプロジェクトを実行するには、以下のインストールが必要です。

- **Node.js** (v18以降推奨)
- **pnpm**
- **SoX (Sound eXchange)**: 音声の録音(`rec`)および再生(`play`)コマンドを使用するため、OSへのインストールが必須です。
  - macOS (Homebrew): `brew install sox`
  - Windows: SoXをダウンロードし、環境変数(PATH)を通してください。

## セットアップ

1. **リポジトリのクローンと依存パッケージのインストール**

   ```bash
   pnpm install
   ```

2. **環境変数の設定**
   プロジェクトのルートディレクトリに `.env` ファイルを作成し、OpenAIのAPIキーを設定してください。
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

## 実行方法

以下のコマンドを実行すると、マイク経由での録音とOpenAI Realtime APIへのストリーミング接続が開始されます。

```bash
pnpm start
```

## 仕組み

- `index.ts`: WebSocketクライアントとしてOpenAI APIに接続し、音声の送受信およびストリームの制御を行います。
- `audio.ts`: `child_process` の `spawn` を利用してOS標準の `rec` および `play` プロセスを起動し、マイク入力とスピーカー出力を管理します。
  - サンプリングレート: 24,000Hz
  - フォーマット: raw (16-bit signed integer, モノラル)

## 停止方法

プログラムを実行中に `Ctrl + C` を押すことで停止できます。自動的にマイクとスピーカーのプロセスは終了し、APIとの接続が切断されます。
