import "dotenv/config";
import { WebSocket } from "ws";
import { speaker, recorder } from "./audio";

const url = "wss://api.openai.com/v1/realtime?model=gpt-realtime-mini";
const ws = new WebSocket(url, {
  headers: {
    Authorization: "Bearer " + process.env.OPENAI_API_KEY,
  },
});

const startStreaming = () => {
  recorder.stdout.on("data", (chunk) => {
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
      process.stdout.write(event.delta);
      break;

    case "conversation.item.input_audio_transcription.completed":
      process.stdout.write("\n");
      break;

    case "response.output_audio_transcript.delta":
      process.stdout.write(event.delta);
      break;

    case "response.output_audio_transcript.done":
      process.stdout.write("\n");
      break;

    case "response.output_audio.delta":
      const audioBuffer = Buffer.from(event.delta, "base64");
      speaker.stdin.write(audioBuffer);
      break;

    case "error":
      console.error("❌ エラー発生:", event.error);
      recorder.kill();
      speaker.kill();
      ws.close();
      process.exit();
      break;
  }
});

ws.on("error", (err) => {
  console.error("❌ 接続エラー:", err);
  recorder.kill();
  speaker.kill();
  ws.close();
  process.exit();
});

process.on("SIGINT", () => {
  recorder.kill();
  speaker.kill();
  ws.close();
  process.exit();
});
