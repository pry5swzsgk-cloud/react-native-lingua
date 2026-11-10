// Compares what the speech recognizer heard with the sentence the learner
// was asked to say. Works word by word, or character by character for
// languages written without spaces (Japanese).

export interface PronunciationResult {
  words: { text: string; ok: boolean }[];
  score: number; // 0..1, share of words that were recognized
  passed: boolean;
}

const PASS_SCORE = 0.7;

// "¿Cómo estás?" -> "como estas": lowercase, no accents, no punctuation
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text: string, byWord: boolean): string[] {
  const clean = normalize(text);
  if (!clean) return [];
  return byWord ? clean.split(" ") : Array.from(clean.replace(/ /g, ""));
}

export function comparePronunciation(
  expected: string,
  heard: string,
): PronunciationResult {
  const byWord = expected.trim().includes(" ");
  const parts = byWord ? expected.trim().split(/\s+/) : Array.from(expected);

  // Words we heard, each can be used once
  const available = tokenize(heard, byWord);

  let counted = 0;
  let correct = 0;
  const words = parts.map((part) => {
    const tokens = tokenize(part, byWord);
    // Pure punctuation ("?", "。") is shown but not scored
    if (tokens.length === 0) return { text: part, ok: true };

    const ok = tokens.every((token) => available.includes(token));
    if (ok) {
      tokens.forEach((token) => available.splice(available.indexOf(token), 1));
      correct += 1;
    }
    counted += 1;
    return { text: part, ok };
  });

  const score = counted === 0 ? 0 : correct / counted;
  return { words, score, passed: score >= PASS_SCORE };
}
