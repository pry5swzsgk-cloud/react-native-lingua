import { getDialogs } from "@/data/dialogs";
import { Exercise, ExerciseKind, ExerciseSource, buildSession } from "@/lib/exercises";
import { KINDS, shuffle } from "@/lib/exerciseBuilders";
import type { ExerciseGroup } from "@/lib/exerciseBuilders";
import { countMistakes, getMistakeSource } from "@/lib/mistakes";
import { getUnitLessons, getUnits } from "@/lib/progress";
import { LanguageCode, Lesson, Phrase, VocabularyItem } from "@/types/learning";

export type TrainingMode = "vocabulary" | "mistakes" | "speaking" | "listening" | "personal" | "mastery";

export interface TrainingInfo {
  mode: TrainingMode;
  title: string;
  emoji: string;
  description: string;
  xp: number;
}

export const TRAININGS: TrainingInfo[] = [
  { mode: "vocabulary", title: "Vocabulary training", emoji: "🧠", description: "Review the words you have learned.", xp: 10 },
  { mode: "mistakes", title: "Mistakes training", emoji: "🩹", description: "Practise what went wrong before.", xp: 10 },
  { mode: "speaking", title: "Speaking training", emoji: "🎤", description: "Say words and sentences out loud.", xp: 10 },
  { mode: "listening", title: "Listening training", emoji: "🎧", description: "Train your ear with what you hear.", xp: 10 },
  { mode: "personal", title: "Personal training", emoji: "🎯", description: "A mix made for you: mistakes and recent lessons.", xp: 10 },
];

const VOCABULARY_KINDS: ExerciseKind[] = ["match", "choice", "picture", "write-word", "listen", "true-false"];
const MAX_LESSONS = 6;
const RECENT_LESSONS = 3;
const OLDER_LESSONS = 2;

export const MASTERY_XP = 40;
const SIZES = { vocabulary: 10, mistakes: 10, speaking: 8, listening: 8, personal: 12 };

// Completed normal lessons of the language in course order.
// If there are none: the first lesson of the language.
export function getLearnedLessons(languageCode: LanguageCode | null, completedLessonIds: string[]): Lesson[] {
  const all = getUnits(languageCode)
    .flatMap(getUnitLessons)
    .filter((lesson) => !lesson.boss);
  const learned = all.filter((lesson) => completedLessonIds.includes(lesson.id));
  if (learned.length > 0) return learned;
  return all.length > 0 ? [all[0]] : [];
}

function kindsOfGroup(group: ExerciseGroup): ExerciseKind[] {
  return KINDS.filter((spec) => spec.group === group).map((spec) => spec.kind);
}

// Joins lessons into one pool of content, without duplicates
function sourceFromLessons(id: string, lessons: Lesson[], base?: ExerciseSource): ExerciseSource {
  const vocabulary: VocabularyItem[] = [...(base?.vocabulary ?? [])];
  const phrases: Phrase[] = [...(base?.phrases ?? [])];
  for (const lesson of lessons) {
    for (const item of lesson.vocabulary) {
      if (!vocabulary.some((known) => known.word === item.word)) vocabulary.push(item);
    }
    for (const item of lesson.phrases) {
      if (!phrases.some((known) => known.text === item.text)) phrases.push(item);
    }
  }
  return { id, vocabulary, phrases };
}

export function buildTraining(
  mode: TrainingMode,
  input: {
    languageCode: LanguageCode | null;
    completedLessonIds: string[];
    mistakes: Record<string, number>;
    canSpeak: boolean;
    unitId?: string;
    random?: () => number;
  },
): Exercise[] {
  const { languageCode, canSpeak } = input;
  const random = input.random ?? Math.random;

  if (mode === "mastery") {
    // Words and sentences of all normal lessons of the unit, hard exercises
    const unit = getUnits(languageCode).find((entry) => entry.id === input.unitId);
    if (!unit) return [];
    const lessons = getUnitLessons(unit).filter((lesson) => !lesson.boss);
    const source = {
      ...sourceFromLessons(`training-mastery-${unit.id}`, lessons),
      dialogs: getDialogs(languageCode, unit.level),
    };
    return buildSession(source, languageCode, { canSpeak, hard: true, size: 15, random });
  }

  const learned = getLearnedLessons(languageCode, input.completedLessonIds);
  if (learned.length === 0) return [];
  const id = `training-${mode}`;
  const level = getUnits(languageCode).find((unit) => unit.id === learned[learned.length - 1].unitId)?.level;
  const dialogs = level ? getDialogs(languageCode, level) : [];
  const recent = learned.slice(-MAX_LESSONS);

  if (mode === "mistakes") {
    if (countMistakes(languageCode, input.mistakes) === 0) return [];
    const source = getMistakeSource(languageCode, input.mistakes);
    return buildSession({ ...source, id }, languageCode, { canSpeak, size: SIZES.mistakes, random });
  }

  if (mode === "vocabulary") {
    return buildSession(sourceFromLessons(id, recent), languageCode, {
      canSpeak,
      size: SIZES.vocabulary,
      only: VOCABULARY_KINDS,
      random,
    });
  }

  if (mode === "speaking") {
    if (!canSpeak) return [];
    return buildSession({ ...sourceFromLessons(id, recent), dialogs }, languageCode, {
      canSpeak,
      size: SIZES.speaking,
      only: kindsOfGroup("speaking"),
      random,
    });
  }

  if (mode === "listening") {
    return buildSession({ ...sourceFromLessons(id, recent), dialogs }, languageCode, {
      canSpeak,
      size: SIZES.listening,
      only: kindsOfGroup("listening"),
      random,
    });
  }

  // personal: mistakes + the last 3 learned lessons + 2 random older ones
  const latest = learned.slice(-RECENT_LESSONS);
  const older = shuffle(learned.slice(0, -RECENT_LESSONS), random).slice(0, OLDER_LESSONS);
  const base = countMistakes(languageCode, input.mistakes) > 0 ? getMistakeSource(languageCode, input.mistakes) : undefined;
  const source = sourceFromLessons(id, [...older, ...latest], base);
  return buildSession({ ...source, dialogs }, languageCode, { canSpeak, size: SIZES.personal, random });
}
