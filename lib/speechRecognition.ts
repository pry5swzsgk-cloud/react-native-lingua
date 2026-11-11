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

// True when the web version was opened from the iPad/iPhone Home Screen.
// Apple does not offer speech recognition there, only inside Safari.
function isHomeScreenWebApp(): boolean {
  if (Platform.OS !== "web" || typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return (
    nav.standalone === true ||
    window.matchMedia?.("(display-mode: standalone)").matches === true
  );
}

// Turns an error code of the recognizer into advice the learner can act on.
// The code is added in brackets so problems can be reported precisely.
function errorMessage(code: string): string {
  const isWeb = Platform.OS === "web";

  switch (code) {
    case "aborted":
      return ""; // the learner stopped listening, nothing went wrong
    case "not-allowed":
      // The microphone itself is blocked
      return isWeb
        ? "The microphone is blocked for this website. In Safari tap the button left of the address, then Website Settings → Microphone → Allow, and reload the page. [not-allowed]"
        : "Lingo may not use the microphone. Allow it in Settings → Lingo → Microphone. [not-allowed]";
    case "service-not-allowed":
      // The microphone is fine, but the speech recognition service is off
      if (isHomeScreenWebApp()) {
        return "Speech recognition does not work in the Home Screen app. Open Lingo in Safari to practice speaking. [service-not-allowed]";
      }
      return isWeb
        ? "Speech recognition is switched off on this device. On iPad or iPhone turn on Settings → General → Keyboard → Enable Dictation, then reload the page. [service-not-allowed]"
        : "Lingo may not use speech recognition. Allow it in Settings → Lingo → Speech Recognition. [service-not-allowed]";
    case "audio-capture":
      return "No working microphone was found. [audio-capture]";
    case "no-speech":
    case "speech-timeout":
      return "I didn't hear anything. Tap the mic and try again.";
    case "no-result":
      // The recognizer ended without understanding a single word
      return "I couldn't understand that. Speak a little louder and closer to the device, then try again. [no-result]";
    case "language-not-supported":
      return "Your device has no speech recognition for this language. [language-not-supported]";
    case "network":
      return "Speech recognition needs an internet connection on this device. [network]";
    default:
      return `Speech recognition didn't work. Please try again. [${code}]`;
  }
}

// Asks the browser for the microphone before recognition starts.
// Safari only shows its permission question for a request that comes
// straight from a tap, and it silently refuses later requests after one
// refusal. Asking here, inside the tap, makes the question appear.
// Returns an error code, or null when recognition may start.
// Remembers that the browser allowed the microphone in this visit, so later
// taps can start the recognizer right away, still inside the tap.
let webMicrophoneAllowed = false;

async function requestWebMicrophone(): Promise<string | null> {
  const media =
    typeof navigator !== "undefined" ? navigator.mediaDevices : undefined;
  // Very old browsers: let the recognizer ask on its own
  if (!media?.getUserMedia) return null;

  try {
    const stream = await media.getUserMedia({ audio: true });
    // Only the permission was needed. The recognizer opens the microphone
    // itself, and two open microphones would get in each other's way.
    stream.getTracks().forEach((track) => track.stop());
    webMicrophoneAllowed = true;
    return null;
  } catch (error) {
    const name = error instanceof Error ? error.name : "";
    if (name === "NotAllowedError" || name === "SecurityError") {
      return "not-allowed";
    }
    if (name === "NotFoundError" || name === "NotReadableError") {
      return "audio-capture";
    }
    return null; // unknown problem: still let the recognizer try
  }
}

interface ListenHandlers {
  // What has been understood so far, while the learner is still speaking
  onPartial?: (transcript: string) => void;
  // The final sentence, used to check the pronunciation (called once)
  onResult: (transcript: string) => void;
  onError: (message: string) => void;
  onEnd: () => void;
}

// If the recognizer has not reported "end" this long after stop(), cancel it.
// Some browsers (Safari) never end after stop() when nothing was said yet.
const STOP_GRACE_MS = 1500;
// Never listen forever, even if the learner forgets to tap again.
const MAX_LISTEN_MS = 15000;
// Once words were heard, this much silence means the sentence is finished.
const SILENCE_MS = 1500;
// After stop(), how long to wait for a final result before using the words
// already understood.
const RESULT_WAIT_MS = 700;

// Listens for one sentence in the given locale (e.g. "fr-FR").
// Returns right away; stop() works at any moment, even while the
// microphone permission is still being requested.
//
// Recognizers differ a lot: Chrome marks the last result as final, Safari
// often only sends "interim" results and then simply ends. So every result
// is remembered, and when listening ends the best text heard so far is
// used, whether or not it was marked as final.
export function listenOnce(
  locale: string,
  { onPartial, onResult, onError, onEnd }: ListenHandlers,
): { stop: () => void } {
  const recognition = loadModule();
  let stopRequested = false;
  let ended = false;
  let started = false;
  let delivered = false;
  let lastTranscript = "";
  let silenceTimer: ReturnType<typeof setTimeout> | null = null;
  const subscriptions: { remove: () => void }[] = [];
  const timers: ReturnType<typeof setTimeout>[] = [];

  // Hands the sentence to the screen, exactly once
  function deliver(transcript: string) {
    if (delivered) return;
    delivered = true;
    onResult(transcript);
  }

  // Runs exactly once, no matter how listening ends
  function finish() {
    if (ended) return;
    ended = true;
    timers.forEach(clearTimeout);
    if (silenceTimer) clearTimeout(silenceTimer);
    subscriptions.forEach((subscription) => subscription.remove());
    onEnd();
  }

  // Note: the web module keeps its browser listeners attached after
  // remove(), so events can still arrive once listening has finished.
  // Every handler below therefore ignores anything after the end.

  function fail(code: string) {
    if (ended) return;
    if (code === "not-allowed") webMicrophoneAllowed = false; // ask again next time
    // Words were understood before the problem: check those instead
    if (!delivered && lastTranscript && code !== "not-allowed") {
      deliver(lastTranscript);
    } else {
      const message = errorMessage(code);
      if (message) onError(message);
    }
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
    // Words were already understood: don't keep the learner waiting for a
    // final result that Safari may never send
    timers.push(
      setTimeout(() => {
        if (ended || !lastTranscript) return;
        deliver(lastTranscript);
        finish();
        recognition.abort();
      }, RESULT_WAIT_MS),
    );
    timers.push(setTimeout(() => recognition.abort(), STOP_GRACE_MS));
    // abort() should end things; make sure the screen recovers regardless
    timers.push(setTimeout(() => handleEnd(), STOP_GRACE_MS + 1000));
  }

  function handleResult(transcript: string, isFinal: boolean) {
    if (ended) return;
    const text = transcript.trim();
    if (!text) return;
    lastTranscript = text;

    if (isFinal) {
      deliver(text);
      return;
    }
    onPartial?.(text);
    // Restart the silence countdown with every new word
    if (silenceTimer) clearTimeout(silenceTimer);
    silenceTimer = setTimeout(stop, SILENCE_MS);
  }

  function handleEnd() {
    if (ended) return;
    if (!delivered) {
      if (lastTranscript) deliver(lastTranscript);
      else if (!stopRequested) onError(errorMessage("no-result"));
    }
    finish();
  }

  async function begin() {
    if (!recognition) return fail("unavailable");

    // Step 1: permission for the microphone. On the web this is skipped
    // once allowed, so the recognizer starts directly inside the tap.
    if (Platform.OS === "web") {
      if (!webMicrophoneAllowed) {
        const problem = await requestWebMicrophone();
        if (problem) return fail(problem);
      }
    } else {
      const permission = await recognition.requestPermissionsAsync();
      if (!permission.granted) return fail("not-allowed");
    }
    if (stopRequested) return; // the learner cancelled while we were waiting

    // Step 2: start the recognizer
    subscriptions.push(
      recognition.addListener("result", (event) => {
        const best = event.results[0];
        if (best) handleResult(best.transcript, event.isFinal);
      }),
      recognition.addListener("error", (event) => fail(event.error)),
      recognition.addListener("end", handleEnd),
    );

    try {
      recognition.start({
        lang: locale,
        interimResults: true,
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
