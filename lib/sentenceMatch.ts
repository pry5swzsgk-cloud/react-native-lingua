import {
  type AnswerStatus,
  checkTypedAnswer,
  getAcceptedAnswers,
} from "@/lib/answers";

// Checks a typed English translation of a sentence.
// Word order does not matter, and common synonyms and short forms are accepted.

// Words with the same meaning are mapped to one word.
// Example: "movie" and "film" both become "film".
const SYNONYMS: Record<string, string> = {
  movie: "film",
  apartment: "flat",
  cellphone: "phone",
  mobile: "phone",
  hi: "hello",
  ok: "okay",
  favorite: "favourite",
  color: "colour",
  center: "centre",
  theater: "theatre",
  traveling: "travelling",
  fall: "autumn",
};

// Small words that do not change the meaning. They are ignored.
// Example: "I like the house" is the same as "I like house".
const FILLER_WORDS = new Set(["the", "a", "an", "some", "very", "really", "just"]);

// Turns short forms into long forms. Both sides get the same treatment.
// Example: "I'm" -> "i am", "don't" -> "do not", "let's" -> "let us".
// A possessive "'s" ("Ana's") also becomes "ana is". This is fine because
// the expected sentence and the typed sentence are treated the same way.
function expandShortForms(text: string): string {
  return text
    .replace(/['’]/g, "'")
    .replace(/\blet's\b/g, "let us")
    .replace(/\bwon't\b/g, "will not")
    .replace(/\bcan't\b/g, "can not")
    .replace(/\bcannot\b/g, "can not")
    .replace(/\bi'm\b/g, "i am")
    .replace(/n't\b/g, " not")
    .replace(/'re\b/g, " are")
    .replace(/'ve\b/g, " have")
    .replace(/'ll\b/g, " will")
    .replace(/'d\b/g, " would")
    .replace(/'s\b/g, " is");
}

// Lower case, no accents, short forms written out, no punctuation.
// Then split into words, map synonyms and drop filler words.
function toWords(text: string): string[] {
  const plain = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
  return expandShortForms(plain)
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 0)
    .map((word) => SYNONYMS[word] ?? word)
    .filter((word) => !FILLER_WORDS.has(word));
}

// Counts how often each word appears (order does not matter).
function countWords(words: string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const word of words) counts.set(word, (counts.get(word) ?? 0) + 1);
  return counts;
}

// True if the words differ by exactly one letter (changed, missing or extra).
// Example: "wher" vs "where".
function isOneLetterOff(a: string, b: string): boolean {
  if (a === b || Math.abs(a.length - b.length) > 1) return false;
  const [short, long] = a.length <= b.length ? [a, b] : [b, a];
  let i = 0;
  while (i < short.length && short[i] === long[i]) i++;
  if (short.length === long.length) return short.slice(i + 1) === long.slice(i + 1);
  return short.slice(i) === long.slice(i + 1);
}

// Compares the words of one expected sentence with the typed sentence.
function compareWords(expected: string, typed: string): AnswerStatus {
  const expectedWords = toWords(expected);
  const typedWords = toWords(typed);
  if (expectedWords.length === 0 || typedWords.length === 0) return "wrong";

  // Remove every typed word from the expected words. Leftovers are the differences.
  const missing = countWords(expectedWords);
  const extra: string[] = [];
  for (const word of typedWords) {
    const left = missing.get(word) ?? 0;
    if (left > 0) missing.set(word, left - 1);
    else extra.push(word);
  }
  const missingWords: string[] = [];
  missing.forEach((count, word) => {
    for (let i = 0; i < count; i++) missingWords.push(word);
  });

  // Same words in any order. Example: "Today I go" vs "I go today".
  if (missingWords.length === 0 && extra.length === 0) return "correct";

  // Exactly one typo in a long word. Example: "wher" vs "where".
  if (
    missingWords.length === 1 &&
    extra.length === 1 &&
    missingWords[0].length >= 5 &&
    isOneLetterOff(missingWords[0], extra[0])
  ) {
    return "almost";
  }

  // Missing or extra words (for example "not") are wrong.
  return "wrong";
}

// All sentences that count as the expected one.
// Example: "I eat rice/a meal." -> "I eat rice", "a meal" and "I eat a meal".
// Hints in brackets like "(formal)" are removed.
function getAlternatives(expected: string): string[] {
  const alternatives = getAcceptedAnswers(expected, true);
  // "rice/a meal" also means: replace the word before the slash
  const slash = expected.match(/^(.*\S)\s*[/／]\s*(\S.*)$/);
  if (slash) {
    const before = slash[1].split(/\s+/);
    if (before.length > 1) {
      alternatives.push(`${before.slice(0, -1).join(" ")} ${slash[2]}`);
    }
  }
  return alternatives.map((text) => text.replace(/\s*\([^)]*\)/g, ""));
}

export function checkTranslatedSentence(
  expected: string,
  typed: string,
): { status: AnswerStatus; exact: boolean } {
  // Step 1: the normal check first. Example: "I like it." vs "i like it".
  const direct = checkTypedAnswer(expected, typed, true);
  if (direct === "correct") return { status: "correct", exact: true };

  // Step 2: word check against every alternative. The best result counts.
  const results = getAlternatives(expected).map((text) =>
    compareWords(text, typed),
  );
  if (results.includes("correct")) return { status: "correct", exact: false };
  if (results.includes("almost")) return { status: "almost", exact: false };

  // Step 3: keep an "almost" from step 1 (for example a lost apostrophe)
  if (direct === "almost") return { status: "almost", exact: true };
  return { status: "wrong", exact: false };
}
