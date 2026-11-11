import complete from "@/assets/sounds/complete.wav";
import correct from "@/assets/sounds/correct.wav";
import tick from "@/assets/sounds/tick.wav";
import wrong from "@/assets/sounds/wrong.wav";

// Sound files for the iOS/Android app (made by scripts/generate-sounds.py).
// In the browser lib/sounds.ts synthesizes the same sounds instead.
export const sounds = {
  correct,
  wrong,
  tick,
  complete,
} as const;
