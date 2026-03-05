import { spawn } from "child_process";

export const speaker = spawn("play", [
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
