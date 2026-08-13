export const AUDIO_RATES = [1, 1.25, 1.5, 2] as const;

export type AudioRate = (typeof AUDIO_RATES)[number];
export type AudioStatus = "idle" | "paused" | "playing";
