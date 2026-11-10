import { Platform } from "react-native";

// Speech recognition with the engine built into the device or browser
// (free, no API key). The native module is missing in Expo Go, so the
// package is loaded lazily and every function copes with it being absent.

type RecognitionPackage = typeof import("expo-speech-recognition");

function loadModule() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pkg = require("expo-speech-recognition") as RecognitionPackage;
    return pkg.ExpoSpeechRecognitionModule;
  } catch {
    return null;
  }
}

export function isSpeechRecognitionSupported(): boolean {
  if (Platform.OS === "web") {
    return (
      typeof window !== "undefined" &&
      ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    );
  }
  const recognition = loadModule();
  return recognition ? recognition.isRecognitionAvailable() : false;
}

function errorMessage(code: string): string {
  switch (code) {
    case "not-allowed":
    case "service-not-allowed":
      return "Microphone access is off. Allow it in your settings to practice speaking.";
    case "no-speech":
    case "speech-timeout":
      return "I didn't hear anything. Tap the mic and try again.";
    case "language-not-supported":
      return "Your device has no speech recognition for this language.";
    case "network":
      return "Speech recognition needs an internet connection on this device.";
    default:
      return "Speech recognition didn't work. Please try again.";
  }
}

interface ListenHandlers {
  onResult: (transcript: string) => void;
  onError: (message: string) => void;
  onEnd: () => void;
}

// Listens for one sentence in the given locale (e.g. "fr-FR").
// Returns a function that stops listening early.
export async function listenOnce(
  locale: string,
  { onResult, onError, onEnd }: ListenHandlers,
): Promise<() => void> {
  const recognition = loadModule();
  if (!recognition) {
    onError(errorMessage("unavailable"));
    onEnd();
    return () => {};
  }

  // Browsers ask for the microphone themselves when recognition starts
  if (Platform.OS !== "web") {
    const permission = await recognition.requestPermissionsAsync();
    if (!permission.granted) {
      onError(errorMessage("not-allowed"));
      onEnd();
      return () => {};
    }
  }

  const subscriptions = [
    recognition.addListener("result", (event) => {
      const best = event.results[0];
      if (event.isFinal && best) onResult(best.transcript);
    }),
    recognition.addListener("error", (event) => {
      onError(errorMessage(event.error));
    }),
    recognition.addListener("end", () => {
      subscriptions.forEach((subscription) => subscription.remove());
      onEnd();
    }),
  ];

  try {
    recognition.start({
      lang: locale,
      interimResults: false,
      maxAlternatives: 1,
      continuous: false,
    });
  } catch {
    subscriptions.forEach((subscription) => subscription.remove());
    onError(errorMessage("unavailable"));
    onEnd();
    return () => {};
  }

  return () => recognition.stop();
}
