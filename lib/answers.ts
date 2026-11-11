// Checks answers the learner typed. The check is forgiving on purpose:
// upper/lower case and punctuation never matter, and a missing accent or a
// single typo still counts, but the learner is shown the exact spelling.

export type AnswerStatus = "correct" | "almost" | "wrong";

// "¿Cómo estás?" -> "cómo estás" (or "como estas" without accents)
function clean(text: string, keepAccents: boolean): string {
  let result = text.toLowerCase();
  if (!keepAccents) {
    result = result.normalize("NFD").replace(/[̀-ͯ]/g, "");
  }
  return result
    .normalize("NFC")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// All spellings we accept for one expected answer, for example:
//   "Hello / Good day" -> "Hello", "Good day"
//   "Encantado/a"      -> "Encantado", "Encantada"
//   "Enchanté(e)"      -> "Enchanté", "Enchantée"
//   "1 — One"          -> "1", "One"
//   "The mother"       -> "The mother", "mother"   (English answers only)
export function getAcceptedAnswers(
  expected: string,
  isEnglish: boolean,
): string[] {
  const parts = expected.split(/\s*[/／—]\s*/).filter(Boolean);
  const alternatives: string[] = [];

  parts.forEach((part, index) => {
    const first = parts[0];
    // A short part after a slash is an ending: "Encantado/a" -> "Encantada"
    const isEnding = index > 0 && part.length <= 2 && first.length > 3;
    alternatives.push(
      isEnding ? first.slice(0, first.length - part.length) + part : part,
    );
  });

  // Typing the answer exactly as shown ("Encantado/a") is fine too
  const accepted = new Set<string>([expected]);
  for (const alternative of alternatives) {
    const withoutBrackets = alternative.replace(/\s*\([^)]*\)/g, "");
    const withBracketText = alternative.replace(/[()]/g, "");
    for (const variant of [withoutBrackets, withBracketText]) {
      accepted.add(variant.trim());
      if (isEnglish) {
        accepted.add(variant.replace(/^(the|a|an|to)\s+/i, "").trim());
      }
    }
  }
  return [...accepted].filter(Boolean);
}

// True when the two words differ by one changed, missing or extra letter
function isOneTypoAway(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  const restA = a.slice(i);
  const restB = b.slice(i);
  return (
    restA.slice(1) === restB.slice(1) || // one letter changed
    restA.slice(1) === restB || // one letter too many
    restA === restB.slice(1) // one letter missing
  );
}

export function checkTypedAnswer(
  expected: string,
  typed: string,
  isEnglish = false,
): AnswerStatus {
  const accepted = getAcceptedAnswers(expected, isEnglish);
  const exact = clean(typed, true);
  if (!exact) return "wrong";

  if (accepted.some((answer) => clean(answer, true) === exact)) {
    return "correct";
  }

  const plain = clean(typed, false);
  const isClose = accepted.some((answer) => {
    const target = clean(answer, false);
    // Typos are only forgiven in longer answers; "si" vs "no" must not pass
    return target === plain || (target.length >= 5 && isOneTypoAway(target, plain));
  });

  return isClose ? "almost" : "wrong";
}
