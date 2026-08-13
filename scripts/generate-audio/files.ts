import fs from "node:fs";
import path from "node:path";

export function hasAudioPair(directory: string): boolean {
  return (
    fs.existsSync(path.join(directory, "audio.mp3")) &&
    fs.existsSync(path.join(directory, "audio.json"))
  );
}
