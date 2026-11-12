import { useEffect, useRef, useState } from "react";

import { stopSpeaking } from "@/lib/speech";
import { isSpeechRecognitionSupported, listenOnce } from "@/lib/speechRecognition";

// Speech input for a chat field: listens for one sentence, shows the words
// while they are understood and hands over the finished sentence.
export function useVoiceInput() {
  // Stays false in browsers without speech recognition: no mic button then
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [liveText, setLiveText] = useState("");
  const [error, setError] = useState("");
  const stopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    setIsSupported(isSpeechRecognitionSupported());
    // Switch the microphone off when the screen goes away
    return () => stopRef.current?.();
  }, []);

  // Starts listening in the given locale ("es-ES", "de-DE").
  // Calling it again while listening stops early.
  function toggle(locale: string, onResult: (transcript: string) => void) {
    if (isListening) {
      stopRef.current?.();
      return;
    }

    stopSpeaking(); // the microphone must not hear the teacher's voice
    setIsListening(true);
    setLiveText("");
    setError("");
    stopRef.current = listenOnce(locale, {
      onPartial: setLiveText,
      onResult,
      onError: setError,
      onEnd: () => {
        setIsListening(false);
        setLiveText("");
      },
    }).stop;
  }

  return { isSupported, isListening, liveText, error, toggle };
}
