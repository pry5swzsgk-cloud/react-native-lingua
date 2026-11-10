import * as Speech from "expo-speech";

import { LANGUAGES } from "@/data/languages";
import { LanguageCode } from "@/types/learning";

// Only one thing is read aloud at a time. This remembers which button
// started it, so that button can show the right icon again when the
// reading ends or is stopped.
let current: { id: number; onFinished: () => void } | null = null;
let lastId = 0;

// Reads text aloud with the device's built-in voice for that language.
// Free and on-device: no server, no API key.
// onFinished runs once, when the reading is done or was stopped.
export function speak(
  text: string,
  languageCode: LanguageCode | null,
  onFinished: () => void,
) {
  stopSpeaking(); // cut off anything still playing

  const id = ++lastId;
  current = { id, onFinished };

  // Browsers report "done", "stopped" and "error" differently, so any of
  // them counts as finished. Late reports of an older reading are ignored.
  const finish = () => {
    if (current?.id !== id) return;
    current = null;
    onFinished();
  };

  const language = LANGUAGES.find((l) => l.code === languageCode);
  Speech.speak(text, {
    language: language?.speechLocale,
    rate: 0.9, // slightly slower so learners can follow
    onDone: finish,
    onStopped: finish,
    onError: finish,
  });
}

// Stops whatever is being read and resets the button that started it.
export function stopSpeaking() {
  const reading = current;
  current = null;
  Speech.stop();
  reading?.onFinished();
}
