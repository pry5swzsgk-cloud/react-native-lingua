import { normalizeText, stripAccents } from "@/lib/teacherText";
import { DictionaryEntry } from "@/types/teacher";

// Looks words up in Dax's built-in dictionary (German ↔ the language being
// learned). It is forgiving: capital letters, articles and common German
// endings are ignored, so "die Hunde" still finds "Hund".

export interface DictionaryMatch {
  german: string;
  target: string;
}

interface DictionaryIndex {
  fromGerman: Map<string, DictionaryMatch>;
  fromTarget: Map<string, DictionaryMatch>;
}

const MAX_MATCHES = 4;

const GERMAN_ARTICLES = new Set([
  "der", "die", "das", "den", "dem", "des", "ein", "eine", "einen", "einem",
  "einer", "mein", "meine", "meinen", "meinem", "meiner", "dein", "deine",
  "deinen", "kein", "keine", "keinen",
]);

// Little words that are not worth translating inside a longer sentence
const GERMAN_FILLERS = new Set([
  "ich", "du", "er", "sie", "es", "wir", "ihr", "und", "oder", "aber", "auch",
  "sehr", "nicht", "zu", "im", "am", "in", "an", "auf", "mit", "für", "von",
  "bei", "nach", "aus", "um", "dass", "weil", "wenn", "man", "mal", "doch",
  "so", "da", "noch", "schon", "nur", "sich", "mich", "dich", "mir", "dir",
  "ist", "bin", "bist", "sind", "war", "hat", "habe", "hast", "haben", "wie",
  "was", "sagt", "heißt", "heisst", "spanisch", "bitte", "wort", "seine",
  "seinen", "seiner", "ihre", "ihren", "unser", "unsere", "gern", "gerne",
]);

// German endings that are cut off to find the basic form of a word
const GERMAN_ENDINGS = ["en", "em", "er", "es", "st", "te", "e", "n", "s", "t"];

// "Mädchen" and "Maedchen" should find the same entry
function germanKey(text: string): string {
  return normalizeText(text)
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss");
}

// "el perro" -> "perro", "¿Cómo estás?" -> "como estas"
function targetKey(text: string, articles: string[]): string {
  const tokens = stripAccents(normalizeText(text)).split(" ");
  if (tokens.length > 1 && articles.includes(tokens[0])) tokens.shift();
  return tokens.join(" ");
}

// Building the lookup tables takes a moment, so it is done once per dictionary
const indexes = new WeakMap<DictionaryEntry[], DictionaryIndex>();

function getIndex(entries: DictionaryEntry[], articles: string[]): DictionaryIndex {
  const existing = indexes.get(entries);
  if (existing) return existing;

  const index: DictionaryIndex = {
    fromGerman: new Map(),
    fromTarget: new Map(),
  };

  for (const [germanWords, target] of entries) {
    const alternatives = germanWords.split("|");
    for (const german of alternatives) {
      const key = germanKey(german);
      if (!index.fromGerman.has(key)) index.fromGerman.set(key, { german, target });
    }
    // "el pescado / el pez" can be found by either word
    for (const translation of target.split(" / ")) {
      const key = targetKey(translation, articles);
      if (key && !index.fromTarget.has(key)) {
        index.fromTarget.set(key, { german: alternatives[0], target: translation });
      }
    }
  }

  indexes.set(entries, index);
  return index;
}

// Forms a German word could have in the dictionary: "Hunde" -> "Hund",
// "gehst" -> "gehen", "Bücher" -> "Buch"
function getGermanForms(word: string): string[] {
  const forms = [word];
  for (const ending of GERMAN_ENDINGS) {
    if (word.endsWith(ending) && word.length - ending.length >= 3) {
      const stem = word.slice(0, -ending.length);
      forms.push(stem, stem + "e", stem + "en", stem + "n");
    }
  }
  const withoutUmlauts = forms.map((form) =>
    form.replace(/ä/g, "a").replace(/ö/g, "o").replace(/ü/g, "u"),
  );
  return [...forms, ...withoutUmlauts];
}

function findGermanWord(index: DictionaryIndex, word: string): DictionaryMatch | null {
  for (const form of getGermanForms(word)) {
    const match = index.fromGerman.get(germanKey(form));
    if (match) return match;
  }
  return null;
}

// The translation of a whole German word or phrase, or null.
// "der Hund" -> el perro, "guten Morgen" -> buenos días
export function translateGermanPhrase(
  entries: DictionaryEntry[],
  articles: string[],
  text: string,
): DictionaryMatch | null {
  const index = getIndex(entries, articles);
  let tokens = normalizeText(text).split(" ").filter(Boolean);
  if (tokens.length === 0) return null;

  const whole = index.fromGerman.get(germanKey(tokens.join(" ")));
  if (whole) return whole;

  if (tokens.length > 1 && GERMAN_ARTICLES.has(tokens[0])) {
    tokens = tokens.slice(1);
    const withoutArticle = index.fromGerman.get(germanKey(tokens.join(" ")));
    if (withoutArticle) return withoutArticle;
  }
  return tokens.length === 1 ? findGermanWord(index, tokens[0]) : null;
}

// Everything in a German text that the dictionary knows, in reading order.
// Whole phrases win over single words: "ich habe Hunger" -> tengo hambre.
export function lookupGerman(
  entries: DictionaryEntry[],
  articles: string[],
  text: string,
): DictionaryMatch[] {
  const whole = translateGermanPhrase(entries, articles, text);
  if (whole) return [whole];

  const index = getIndex(entries, articles);
  const tokens = normalizeText(text).split(" ").filter(Boolean);
  const used = tokens.map(() => false);
  const found: { position: number; match: DictionaryMatch }[] = [];

  // Phrases of 4, 3 and 2 words first
  for (let size = Math.min(4, tokens.length); size >= 2; size--) {
    for (let start = 0; start + size <= tokens.length; start++) {
      if (used.slice(start, start + size).some(Boolean)) continue;
      const match = index.fromGerman.get(
        germanKey(tokens.slice(start, start + size).join(" ")),
      );
      if (match) {
        found.push({ position: start, match });
        used.fill(true, start, start + size);
      }
    }
  }

  // Then the remaining single words
  tokens.forEach((token, position) => {
    if (used[position]) return;
    if (GERMAN_ARTICLES.has(token) || GERMAN_FILLERS.has(token)) return;
    const match = findGermanWord(index, token);
    if (match) found.push({ position, match });
  });

  const matches: DictionaryMatch[] = [];
  for (const { match } of found.sort((a, b) => a.position - b.position)) {
    if (!matches.some((m) => m.target === match.target)) matches.push(match);
  }
  return matches.slice(0, MAX_MATCHES);
}

// The other direction: what a word of the learned language means in German.
// "perros" -> Hund
export function lookupTarget(
  entries: DictionaryEntry[],
  articles: string[],
  text: string,
): DictionaryMatch[] {
  const index = getIndex(entries, articles);
  const whole = index.fromTarget.get(targetKey(text, articles));
  if (whole) return [whole];

  const matches: DictionaryMatch[] = [];
  for (const token of stripAccents(normalizeText(text)).split(" ")) {
    if (token.length < 3 || articles.includes(token)) continue;
    // also try without a plural ending: "perros" -> "perro"
    const forms = [token, token.replace(/s$/, ""), token.replace(/es$/, "")];
    const match = forms.map((form) => index.fromTarget.get(form)).find(Boolean);
    if (match && !matches.some((m) => m.german === match.german)) matches.push(match);
  }
  return matches.slice(0, MAX_MATCHES);
}

// True when the word exists in the learned language's side of the dictionary
export function isTargetWord(
  entries: DictionaryEntry[],
  articles: string[],
  word: string,
): boolean {
  return getIndex(entries, articles).fromTarget.has(targetKey(word, articles));
}
