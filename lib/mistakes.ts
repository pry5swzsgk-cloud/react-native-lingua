import { BASE_LESSONS } from "@/data/lessons";
import { ExerciseResult, ExerciseSource } from "@/lib/exercises";
import { getUnitOfLesson } from "@/lib/progress";
import { LanguageCode, Lesson, Phrase, VocabularyItem } from "@/types/learning";

const MAX_MISTAKE_ITEMS = 12;
const MIN_WORDS = 4;
const FILL_WORDS_TO = 5;

// Mistakes are saved as "<language>|<word or sentence>"
export function getMistakeKey(
  languageCode: LanguageCode | null,
  itemKey: string,
): string {
  return `${languageCode ?? ""}|${itemKey}`;
}

// The lessons of one language
function getLanguageLessons(languageCode: LanguageCode | null) {
  return BASE_LESSONS.filter(
    (lesson) => getUnitOfLesson(lesson)?.languageCode === languageCode,
  );
}

// The saved mistakes of one language that still exist in the lessons:
// [itemKey, count, lesson], most often first
function getLanguageMistakes(
  languageCode: LanguageCode | null,
  mistakes: Record<string, number>,
): [string, number, Lesson][] {
  const prefix = `${languageCode ?? ""}|`;
  const lessons = getLanguageLessons(languageCode);
  const found: [string, number, Lesson][] = [];

  for (const [key, count] of Object.entries(mistakes)) {
    if (!key.startsWith(prefix)) continue;
    const itemKey = key.slice(prefix.length);
    const lesson = lessons.find(
      (item) =>
        item.vocabulary.some((word) => word.word === itemKey) ||
        item.phrases.some((phrase) => phrase.text === itemKey),
    );
    if (lesson) found.push([itemKey, count, lesson]);
  }

  return found.sort((a, b) => b[1] - a[1]);
}

// How many mistakes are saved for this language
export function countMistakes(
  languageCode: LanguageCode | null,
  mistakes: Record<string, number>,
): number {
  return getLanguageMistakes(languageCode, mistakes).reduce(
    (sum, [, count]) => sum + count,
    0,
  );
}

// Decides what one answer means for the saved mistakes.
// `wrongKeys` remembers the items answered wrong in this session.
export function getMistakeAction(
  result: ExerciseResult,
  key: string,
  wrongKeys: Set<string>,
  canResolve: boolean,
): "record" | "resolve" | "none" {
  if (result === "wrong") {
    if (wrongKeys.has(key)) return "none";
    wrongKeys.add(key);
    return "record";
  }
  if (result === "correct" && canResolve && !wrongKeys.has(key)) {
    return "resolve";
  }
  return "none";
}

// The words and sentences behind the saved mistakes, as material for a
// practice session. Items that cannot be found any more are skipped.
export function getMistakeSource(
  languageCode: LanguageCode | null,
  mistakes: Record<string, number>,
): ExerciseSource {
  const lessons = getLanguageLessons(languageCode);
  const entries = getLanguageMistakes(languageCode, mistakes).slice(
    0,
    MAX_MISTAKE_ITEMS,
  );

  const vocabulary: VocabularyItem[] = [];
  const phrases: Phrase[] = [];
  const sourceLessonIds = new Set<string>();

  for (const [itemKey, , lesson] of entries) {
    const word = lesson.vocabulary.find((item) => item.word === itemKey);
    const phrase = lesson.phrases.find((item) => item.text === itemKey);
    sourceLessonIds.add(lesson.id);
    if (word && !vocabulary.some((item) => item.word === word.word)) {
      vocabulary.push(word);
    }
    if (phrase && !phrases.some((item) => item.text === phrase.text)) {
      phrases.push(phrase);
    }
  }

  // Choice exercises need wrong options: fill up with words from the
  // lessons the mistakes came from
  if (vocabulary.length < MIN_WORDS) {
    for (const lesson of lessons) {
      if (!sourceLessonIds.has(lesson.id)) continue;
      for (const item of lesson.vocabulary) {
        if (vocabulary.length >= FILL_WORDS_TO) break;
        if (!vocabulary.some((known) => known.word === item.word)) {
          vocabulary.push(item);
        }
      }
    }
  }

  return { id: "mistakes", vocabulary, phrases };
}
