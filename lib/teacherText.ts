// Small text helpers shared by Dax's dictionary, intent detection and engine.

// "¿Cómo estás, Dax?" -> "cómo estás dax": lowercase, no punctuation.
// Accents and umlauts stay, apostrophes are dropped ("geht's" -> "gehts").
export function normalizeText(text: string): string {
  return text
    .normalize("NFC")
    .toLowerCase()
    .replace(/['’`´]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// "música" -> "musica" (this also turns ñ into n and ü into u)
export function stripAccents(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .normalize("NFC");
}

// The words of a text, lowercase and without punctuation
export function getWords(text: string): string[] {
  const normalized = normalizeText(text);
  return normalized ? normalized.split(" ") : [];
}

// True when the text contains the word or phrase as whole words:
// "no me gusta" contains "me gusta", but "comida" does not contain "mi".
// Accents are ignored on both sides.
export function containsPhrase(text: string, phrase: string): boolean {
  const haystack = ` ${stripAccents(normalizeText(text))} `;
  const needle = stripAccents(normalizeText(phrase));
  return needle !== "" && haystack.includes(` ${needle} `);
}

// Emojis and quote marks look nice but should not be read aloud
export function cleanForSpeech(text: string): string {
  return text
    .replace(
      /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}\u{1F1E6}-\u{1F1FF}]/gu,
      "",
    )
    .replace(/[«»„“”"]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
