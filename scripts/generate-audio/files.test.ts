import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { hasAudioPair } from "./files";

let directory: string;

beforeEach(() => {
  directory = fs.mkdtempSync(path.join(os.tmpdir(), "audio-pair-"));
});

afterEach(() => {
  fs.rmSync(directory, { force: true, recursive: true });
});

describe("hasAudioPair", () => {
  it("requires both the audio and timing files", () => {
    expect(hasAudioPair(directory)).toBe(false);

    fs.writeFileSync(path.join(directory, "audio.mp3"), "audio");
    expect(hasAudioPair(directory)).toBe(false);

    fs.writeFileSync(path.join(directory, "audio.json"), "[]");
    expect(hasAudioPair(directory)).toBe(true);
  });
});
