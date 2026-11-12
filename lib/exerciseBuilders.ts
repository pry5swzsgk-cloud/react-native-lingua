import type { LanguageCode, Phrase, VocabularyItem } from "@/types/learning";
import type {
  DictationExerciseData,
  Exercise,
  ExerciseKind,
  ListenExerciseData,
  MatchExerciseData,
  SpeakExerciseData,
  WriteExerciseData,
} from "@/lib/exercises";

// Every kind of exercise has one entry in KINDS below. buildSession() in
// lib/exercises.ts picks entries from this list and calls their build().

// Kinds are sorted into groups so a session mixes different skills
export type ExerciseGroup = "connect" | "listening" | "typing" | "choosing" | "building" | "speaking";

// Everything a builder may need to make one exercise
export interface BuildContext {
  languageCode: LanguageCode | null;
  inEnglish: boolean; // the learner types English instead of the target language
  random: () => number;
  hard: boolean;
  words: VocabularyItem[]; // shuffled
  phrases: Phrase[]; // shuffled
  // Next word; wraps around so short sources still fill every exercise
  takeWord: () => VocabularyItem;
  // Next sentence. Each sentence is given out only once, null when none is left
  takePhrase: () => Phrase | null;
  // The short sentence (or expression) for the first dictation, given out
  // only once, null when there is none or it was already used
  takeLongDictation: () => string | null;
}

export interface KindSpec {
  kind: ExerciseKind;
  group: ExerciseGroup;
  easy: boolean; // left out of hard sessions
  needsSpeech: boolean; // left out when the device cannot recognise speech
  // null = not possible with this content
  build: (ctx: BuildContext, id: string) => Exercise | null;
}

export function shuffle<T>(items: T[], random: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function buildMatch(ctx: BuildContext, id: string): MatchExerciseData {
  const pairs = ctx.words.slice(0, 5).map((v) => ({ word: v.word, translation: v.translation }));
  return {
    type: "match",
    kind: "match",
    id,
    pairs,
    translations: shuffle(
      pairs.map((p) => p.translation),
      ctx.random,
    ),
  };
}

function buildListen(ctx: BuildContext, id: string): ListenExerciseData {
  const word = ctx.takeWord();
  const wrongOptions = shuffle(
    ctx.words.map((v) => v.translation).filter((t) => t !== word.translation),
    ctx.random,
  ).slice(0, 3);
  return {
    type: "listen",
    kind: "listen",
    id,
    itemKey: word.word,
    audio: word.word,
    answer: word.translation,
    options: shuffle([word.translation, ...wrongOptions], ctx.random),
  };
}

function buildWrite(ctx: BuildContext, id: string): WriteExerciseData {
  const word = ctx.takeWord();
  // Hard sessions show no emoji, so the picture cannot give the answer away
  const emoji = ctx.hard ? undefined : word.emoji;
  return ctx.inEnglish
    ? {
        type: "write",
        kind: "write-word",
        id,
        itemKey: word.word,
        prompt: word.word,
        emoji,
        pronunciation: word.pronunciation,
        answer: word.translation,
        answerInEnglish: true,
      }
    : {
        type: "write",
        kind: "write-word",
        id,
        itemKey: word.word,
        prompt: word.translation,
        emoji,
        answer: word.word,
        answerInEnglish: false,
      };
}

function buildDictation(ctx: BuildContext, id: string): DictationExerciseData {
  // The first dictation is a short sentence (not for Japanese, where the
  // learner types the English meaning of a word)
  const sentence = ctx.inEnglish ? null : ctx.takeLongDictation();
  if (sentence) {
    return {
      type: "dictation",
      kind: "dictation",
      id,
      itemKey: sentence,
      audio: sentence,
      answer: sentence,
      answerInEnglish: false,
    };
  }
  const item = ctx.takeWord();
  return {
    type: "dictation",
    kind: "dictation",
    id,
    itemKey: item.word,
    audio: item.word,
    answer: ctx.inEnglish ? item.translation : item.word,
    answerInEnglish: ctx.inEnglish,
  };
}

function buildSpeak(ctx: BuildContext, id: string): SpeakExerciseData | null {
  const phrase = ctx.takePhrase();
  if (!phrase) return null;
  return {
    type: "speak",
    kind: "speak-sentence",
    id,
    itemKey: phrase.text,
    text: phrase.text,
    pronunciation: phrase.pronunciation,
    translation: phrase.translation,
  };
}

export const KINDS: KindSpec[] = [
  { kind: "match", group: "connect", easy: true, needsSpeech: false, build: buildMatch },
  { kind: "listen", group: "listening", easy: true, needsSpeech: false, build: buildListen },
  { kind: "write-word", group: "typing", easy: false, needsSpeech: false, build: buildWrite },
  { kind: "dictation", group: "listening", easy: false, needsSpeech: false, build: buildDictation },
  { kind: "speak-sentence", group: "speaking", easy: false, needsSpeech: true, build: buildSpeak },
];
