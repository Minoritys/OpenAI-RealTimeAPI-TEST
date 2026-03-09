import "dotenv/config";
import { WebSocket } from "ws";
import { speaker, recorder } from "./audio";

// APIキーの検証
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("❌ 環境変数 OPENAI_API_KEY が設定されていません");
  process.exit(1);
}

// OpenAI Realtime API の接続先
const MODEL = process.env.OPENAI_MODEL ?? "gpt-realtime-mini";
const url = `wss://api.openai.com/v1/realtime?model=${MODEL}`;

const ws = new WebSocket(url, {
  headers: {
    Authorization: `Bearer ${apiKey}`,
  },
});

let isStopping = false;
const stopProcess = (exitCode = 0) => {
  if (isStopping) return;
  isStopping = true;

  recorder.kill();
  speaker.kill();
  ws.once("close", () => process.exit(exitCode));
  ws.close();
  // フォールバック: 3秒後に強制終了
  setTimeout(() => process.exit(exitCode), 3000).unref();
};

const startStreaming = () => {
  recorder.stdout!.on("data", (chunk) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: "input_audio_buffer.append",
          audio: chunk.toString("base64"),
        }),
      );
    }
  });
};

ws.on("open", () => {
  console.log("✅ 接続成功！音声を送信開始します");
  const sessionUpdate = {
    type: "session.update",
    session: {
      type: "realtime",
      audio: {
        input: {
          transcription: {
            model: "whisper-1",
            language: "ja",
          },
        },
      },
    },
  };
  ws.send(JSON.stringify(sessionUpdate));
  startStreaming();
});

ws.on("message", (data) => {
  const event = JSON.parse(data.toString());
  //   console.log(event);

  switch (event.type) {
    case "conversation.item.input_audio_transcription.delta":
      process.stdout.write(event.delta ?? "");
      break;

    case "conversation.item.input_audio_transcription.completed":
      process.stdout.write("\n");
      break;

    case "response.output_audio_transcript.delta":
      process.stdout.write(event.delta ?? "");
      break;

    case "response.output_audio_transcript.done":
      process.stdout.write("\n");
      break;

    case "response.output_audio.delta": {
      const audioBuffer = Buffer.from(event.delta ?? "", "base64");
      speaker.stdin!.write(audioBuffer);
      break;
    }

    case "error":
      console.error("❌ エラー発生:", event.error);
      stopProcess(1);
      break;
  }
});

ws.on("error", (err) => {
  console.error("❌ 接続エラー:", err);
  stopProcess(1);
});

speaker.on("error", (err) => {
  console.error("❌ speaker エラー:", err);
  stopProcess(1);
});
recorder.on("error", (err) => {
  console.error("❌ recorder エラー:", err);
  stopProcess(1);
});

process.on("SIGINT", () => {
  stopProcess(0);
});
