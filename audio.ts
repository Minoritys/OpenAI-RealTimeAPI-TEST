import { spawn } from "child_process";

const speakerArgs = [
  "-t",
  "raw",
  "-r",
  "24000",
  "-e",
  "signed-integer",
  "-b",
  "16",
  "-c",
  "1",
  "-",
];

export let speaker = spawn("play", speakerArgs);

speaker.stdin?.on("error", (err: any) => {
  if (err.code !== "EPIPE") console.error("❌ speaker stdin エラー:", err);
});

let speakerErrorHandler: ((err: Error) => void) | null = null;

export const onSpeakerError = (callback: (err: Error) => void) => {
  speakerErrorHandler = callback;
  speaker.on("error", callback);
};

export const clearSpeakerBuffer = () => {
  speaker.kill();
  speaker = spawn("play", speakerArgs);

  speaker.stdin?.on("error", (err: any) => {
    if (err.code !== "EPIPE") console.error("❌ speaker stdin エラー:", err);
  });

  if (speakerErrorHandler) {
    speaker.on("error", speakerErrorHandler);
  }
};

export const recorder = spawn("rec", [
  "-q",
  "-t",
  "raw",
  "-r",
  "24000",
  "-e",
  "signed-integer",
  "-b",
  "16",
  "-c",
  "1",
  "-",
]);
