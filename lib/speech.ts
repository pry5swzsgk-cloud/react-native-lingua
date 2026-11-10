import * as Speech from "expo-speech";

import { LANGUAGES } from "@/data/languages";
import { LanguageCode } from "@/types/learning";

// Reads text aloud with the device's built-in voice for that language.
// Free and on-device: no server, no API key.
export function speak(text: string, languageCode: LanguageCode | null) {
  const language = LANGUAGES.find((l) => l.code === languageCode);

  Speech.stop(); // cut off anything still playing
  Speech.speak(text, {
    language: language?.speechLocale,
    rate: 0.9, // slightly slower so learners can follow
  });
}
