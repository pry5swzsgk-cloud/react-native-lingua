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
    case "aborted":
      return ""; // the learner stopped listening, nothing went wrong
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

// If the recognizer has not reported "end" this long after stop(), cancel it.
// Some browsers (Safari) never end after stop() when nothing was said yet.
const STOP_GRACE_MS = 1500;
// Never listen forever, even if the learner forgets to tap again.
const MAX_LISTEN_MS = 15000;

// Listens for one sentence in the given locale (e.g. "fr-FR").
// Returns right away; stop() works at any moment, even while the
// microphone permission is still being requested.
export function listenOnce(
  locale: string,
  { onResult, onError, onEnd }: ListenHandlers,
): { stop: () => void } {
  const recognition = loadModule();
  let stopRequested = false;
  let ended = false;
  let started = false;
  const subscriptions: { remove: () => void }[] = [];
  const timers: ReturnType<typeof setTimeout>[] = [];

  // Runs exactly once, no matter how listening ends
  function finish() {
    if (ended) return;
    ended = true;
    timers.forEach(clearTimeout);
    subscriptions.forEach((subscription) => subscription.remove());
    onEnd();
  }

  function fail(code: string) {
    const message = errorMessage(code);
    if (message) onError(message);
    finish();
  }

  function stop() {
    if (ended || stopRequested) return;
    stopRequested = true;
    if (!recognition || !started) {
      finish(); // nothing is running yet, just cancel the start
      return;
    }
    recognition.stop(); // finishes the sentence and reports what it heard
    timers.push(setTimeout(() => recognition.abort(), STOP_GRACE_MS));
    // abort() should end things; make sure the screen recovers regardless
    timers.push(setTimeout(finish, STOP_GRACE_MS + 1000));
  }

  async function begin() {
    if (!recognition) return fail("unavailable");

    // Browsers ask for the microphone themselves when recognition starts
    if (Platform.OS !== "web") {
      const permission = await recognition.requestPermissionsAsync();
      if (!permission.granted) return fail("not-allowed");
    }
    if (stopRequested) return; // the learner cancelled while we were waiting

    subscriptions.push(
      recognition.addListener("result", (event) => {
        const best = event.results[0];
        if (event.isFinal && best) onResult(best.transcript);
      }),
      recognition.addListener("error", (event) => fail(event.error)),
      recognition.addListener("end", finish),
    );

    try {
      recognition.start({
        lang: locale,
        interimResults: false,
        maxAlternatives: 1,
        continuous: false,
      });
      started = true;
      timers.push(setTimeout(stop, MAX_LISTEN_MS));
    } catch {
      fail("unavailable");
    }
  }

  begin().catch(() => fail("unavailable"));
  return { stop };
}
