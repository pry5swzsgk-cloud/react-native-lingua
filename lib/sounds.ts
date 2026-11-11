import { Platform } from "react-native";

import { sounds } from "@/constants/sounds";

// Short feedback sounds that work offline:
//   - in the browser they are synthesized with the Web Audio API
//   - in the iOS/Android app expo-audio plays the files in assets/sounds

export type SoundName = "correct" | "wrong" | "tick" | "complete";

interface Note {
  frequency: number; // pitch in Hz
  start: number; // seconds after the sound begins
  duration: number; // seconds until the note has faded out
  volume?: number; // 0..1, default 0.2
  wave?: OscillatorType; // "sine" is soft, "triangle" a bit fuller
}

// Note pitches (Hz)
const A3 = 220;
const D4 = 293.66;
const G4 = 392;
const C5 = 523.25;
const E5 = 659.25;
const G5 = 783.99;
const C6 = 1046.5;
const E6 = 1318.51;
const G6 = 1567.98;
const C7 = 2093;

const SOUNDS: Record<SoundName, Note[]> = {
  // Euphoric: a quick rising major chord with a sparkle on top
  correct: [
    { frequency: C5, start: 0, duration: 0.25, wave: "triangle" },
    { frequency: E5, start: 0.07, duration: 0.25, wave: "triangle" },
    { frequency: G5, start: 0.14, duration: 0.3, wave: "triangle" },
    { frequency: C6, start: 0.21, duration: 0.6, wave: "triangle" },
    { frequency: E6, start: 0.28, duration: 0.5, volume: 0.1 },
    { frequency: G6, start: 0.34, duration: 0.5, volume: 0.08 },
  ],
  // Gentle "not quite": two soft falling notes, never harsh
  wrong: [
    { frequency: D4, start: 0, duration: 0.22, wave: "triangle" },
    { frequency: A3, start: 0.16, duration: 0.42, wave: "triangle" },
  ],
  // A tiny blip for each matched pair
  tick: [
    { frequency: G5, start: 0, duration: 0.09, volume: 0.14 },
    { frequency: C6, start: 0.05, duration: 0.14, volume: 0.14 },
  ],
  // Lesson finished: a little fanfare
  complete: [
    { frequency: G4, start: 0, duration: 0.2, wave: "triangle" },
    { frequency: C5, start: 0.12, duration: 0.2, wave: "triangle" },
    { frequency: E5, start: 0.24, duration: 0.2, wave: "triangle" },
    { frequency: G5, start: 0.36, duration: 0.25, wave: "triangle" },
    { frequency: C6, start: 0.5, duration: 1.1, wave: "triangle" },
    { frequency: E5, start: 0.5, duration: 1.1, volume: 0.12 },
    { frequency: G5, start: 0.5, duration: 1.1, volume: 0.12 },
    { frequency: G6, start: 0.66, duration: 0.7, volume: 0.08 },
    { frequency: C7, start: 0.8, duration: 0.8, volume: 0.06 },
  ],
};

// Older Safari versions only know the prefixed name
type AudioWindow = Window & { webkitAudioContext?: typeof AudioContext };

let context: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (Platform.OS !== "web" || typeof window === "undefined") return null;
  if (!context) {
    const Context =
      window.AudioContext ?? (window as AudioWindow).webkitAudioContext;
    if (!Context) return null;
    context = new Context();
  }
  return context;
}

function schedule(audio: AudioContext, notes: Note[]) {
  const now = audio.currentTime;

  for (const note of notes) {
    const start = now + note.start;
    const end = start + note.duration;

    const oscillator = audio.createOscillator();
    oscillator.type = note.wave ?? "sine";
    oscillator.frequency.setValueAtTime(note.frequency, start);

    // Fade in within 10 ms and fade out smoothly, so nothing clicks
    const gain = audio.createGain();
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(note.volume ?? 0.2, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);

    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start(start);
    oscillator.stop(end + 0.02);
  }
}

// One player per sound, created the first time it is needed
type NativePlayer = { seekTo: (seconds: number) => Promise<void>; play: () => void };
const nativePlayers: Partial<Record<SoundName, NativePlayer>> = {};
let nativeReady = false;

function playNative(name: SoundName) {
  // Loaded only in the app: expo-audio is not needed in the browser
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const audio = require("expo-audio") as typeof import("expo-audio");

  if (!nativeReady) {
    nativeReady = true;
    // Feedback sounds should also be heard when the iPhone's silent switch
    // is on, and must not stop music the learner is playing.
    audio
      .setAudioModeAsync({ playsInSilentMode: true, interruptionMode: "mixWithOthers" })
      .catch(() => {});
  }

  const player = (nativePlayers[name] ??= audio.createAudioPlayer(sounds[name]));
  // Rewind first, so the sound also plays when it is triggered again quickly
  player
    .seekTo(0)
    .catch(() => {})
    .finally(() => player.play());
}

// Plays a feedback sound. Never throws: if the device has no audio or
// blocks it, the app simply stays quiet.
export function playSound(name: SoundName) {
  try {
    if (Platform.OS !== "web") {
      playNative(name);
      return;
    }

    const audio = getContext();
    if (!audio) return;

    if (audio.state === "running") {
      schedule(audio, SOUNDS[name]);
      return;
    }

    // Browsers start audio "suspended" until the first tap. Wake it up,
    // but drop the sound if that takes long: late feedback is confusing.
    const requestedAt = Date.now();
    audio
      .resume()
      .then(() => {
        if (Date.now() - requestedAt < 500) schedule(audio, SOUNDS[name]);
      })
      .catch(() => {});
  } catch {
    // no sound is better than a broken exercise
  }
}
