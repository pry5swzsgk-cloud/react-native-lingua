import { BASE_LESSONS } from "@/data/lessons";
import { ExerciseSource } from "@/lib/exercises";
import { getUnitOfLesson } from "@/lib/progress";
import { LanguageCode, Phrase, VocabularyItem } from "@/types/learning";

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

// The saved mistakes of one language: [itemKey, count], most often first
function getLanguageMistakes(
  languageCode: LanguageCode | null,
  mistakes: Record<string, number>,
): [string, number][] {
  const prefix = `${languageCode ?? ""}|`;
  return Object.entries(mistakes)
    .filter(([key]) => key.startsWith(prefix))
    .map(([key, count]): [string, number] => [key.slice(prefix.length), count])
    .sort((a, b) => b[1] - a[1]);
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

// The words and sentences behind the saved mistakes, as material for a
// practice session. Items that cannot be found any more are skipped.
export function getMistakeSource(
  languageCode: LanguageCode | null,
  mistakes: Record<string, number>,
): ExerciseSource {
  const lessons = BASE_LESSONS.filter(
    (lesson) => getUnitOfLesson(lesson)?.languageCode === languageCode,
  );
  const entries = getLanguageMistakes(languageCode, mistakes).slice(
    0,
    MAX_MISTAKE_ITEMS,
  );

  const vocabulary: VocabularyItem[] = [];
  const phrases: Phrase[] = [];
  const sourceLessonIds = new Set<string>();

  for (const [itemKey] of entries) {
    for (const lesson of lessons) {
      const word = lesson.vocabulary.find((item) => item.word === itemKey);
      const phrase = lesson.phrases.find((item) => item.text === itemKey);
      if (!word && !phrase) continue;
      sourceLessonIds.add(lesson.id);
      if (word && !vocabulary.some((item) => item.word === word.word)) {
        vocabulary.push(word);
      }
      if (phrase && !phrases.some((item) => item.text === phrase.text)) {
        phrases.push(phrase);
      }
      break;
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
