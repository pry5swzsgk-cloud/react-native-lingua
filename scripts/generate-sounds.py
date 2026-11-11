"""Creates Lingo's feedback sounds as small WAV files (for iOS/Android).

Run from the project root:  python3 scripts/generate-sounds.py
Uses only Python's standard library. The notes are the same ones lib/sounds.ts
plays in the browser, so the web and the app sound alike.
"""

import math
import struct
import wave

RATE = 22050

# (frequency in Hz, start in seconds, duration, volume, wave)
A3, D4, G4, C5, E5, G5, C6, E6, G6, C7 = 220, 293.66, 392, 523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98, 2093
T = "triangle"
S = "sine"

SOUNDS = {
    "correct": [
        (C5, 0, 0.25, 0.2, T), (E5, 0.07, 0.25, 0.2, T), (G5, 0.14, 0.3, 0.2, T),
        (C6, 0.21, 0.6, 0.2, T), (E6, 0.28, 0.5, 0.1, S), (G6, 0.34, 0.5, 0.08, S),
    ],
    "wrong": [(D4, 0, 0.22, 0.2, T), (A3, 0.16, 0.42, 0.2, T)],
    "tick": [(G5, 0, 0.09, 0.14, S), (C6, 0.05, 0.14, 0.14, S)],
    "complete": [
        (G4, 0, 0.2, 0.2, T), (C5, 0.12, 0.2, 0.2, T), (E5, 0.24, 0.2, 0.2, T),
        (G5, 0.36, 0.25, 0.2, T), (C6, 0.5, 1.1, 0.2, T), (E5, 0.5, 1.1, 0.12, S),
        (G5, 0.5, 1.1, 0.12, S), (G6, 0.66, 0.7, 0.08, S), (C7, 0.8, 0.8, 0.06, S),
    ],
}


def oscillator(kind, phase):
    if kind == "triangle":
        return 2 * abs(2 * (phase % 1) - 1) - 1
    return math.sin(2 * math.pi * phase)


def render(notes):
    length = max(start + duration for _, start, duration, _, _ in notes) + 0.05
    samples = [0.0] * int(length * RATE)
    for frequency, start, duration, volume, kind in notes:
        first = int(start * RATE)
        for i in range(int(duration * RATE)):
            t = i / RATE
            # 10 ms fade in, then a smooth fade out, so nothing clicks
            attack = min(1.0, t / 0.01)
            decay = math.exp(-5 * t / duration)
            samples[first + i] += volume * attack * decay * oscillator(kind, frequency * t)
    return samples


def save(name, samples):
    peak = max(1.0, max(abs(s) for s in samples))
    with wave.open(f"assets/sounds/{name}.wav", "wb") as file:
        file.setnchannels(1)
        file.setsampwidth(2)
        file.setframerate(RATE)
        file.writeframes(b"".join(struct.pack("<h", int(s / peak * 0.9 * 32767)) for s in samples))


for name, notes in SOUNDS.items():
    save(name, render(notes))
