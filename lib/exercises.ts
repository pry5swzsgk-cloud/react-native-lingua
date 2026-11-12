import { KINDS, shuffle } from "@/lib/exerciseBuilders";
import type { BuildContext, ExerciseGroup, KindSpec } from "@/lib/exerciseBuilders";
import { LanguageCode, Lesson, Phrase, VocabularyItem } from "@/types/learning";

// Every exercise has a `type` (which component shows it) and a `kind`
// (the exact format). Some examples:
//   match     - connect each word with its meaning
//   listen    - hear a word and pick what it means
//   write     - write a word yourself
//   dictation - hear something and write it down
//   speak     - say a sentence out loud

export type ExerciseKind =
  | "match"
  | "listen"
  | "write-word"
  | "translate-sentence"
  | "dictation"
  | "speak-sentence"
  | "speak-word"
  | "speak-translate"
  | "speak-answer"
  | "choice"
  | "picture"
  | "audio-match"
  | "true-false"
  | "dialog"
  | "character"
  | "word-bank"
  | "order"
  | "tap-heard"
  | "compose"
  | "gap-choose"
  | "gap-type"
  | "free-text";

export interface MatchExerciseData {
  type: "match";
  kind: "match";
  id: string;
  itemKey?: string; // the word or sentence in the target language
  pairs: { word: string; translation: string }[];
  translations: string[]; // the right column, already shuffled
}

export interface ListenExerciseData {
  type: "listen";
  kind: "listen";
  id: string;
  itemKey?: string;
  audio: string; // read aloud, never shown before answering
  answer: string;
  options: string[];
}

export interface WriteExerciseData {
  type: "write";
  kind: "write-word" | "translate-sentence";
  id: string;
  itemKey?: string;
  prompt: string;
  emoji?: string;
  pronunciation?: string;
  answer: string;
  answerInEnglish: boolean;
}

export interface DictationExerciseData {
  type: "dictation";
  kind: "dictation";
  id: string;
  itemKey?: string;
  audio: string;
  answer: string;
  answerInEnglish: boolean;
}

export interface SpeakExerciseData {
  type: "speak";
  kind: "speak-sentence" | "speak-word" | "speak-translate" | "speak-answer";
  id: string;
  itemKey?: string;
  text: string;
  pronunciation: string;
  translation: string;
  hideText?: boolean;
  question?: string;
  keywords?: string[];
}

export interface ChoiceExerciseData {
  type: "choice";
  kind: "choice" | "picture" | "audio-match" | "true-false" | "dialog" | "character";
  id: string;
  itemKey?: string;
  instruction: string;
  prompt?: string;
  promptEmoji?: string;
  audio?: string; // audio: read aloud in the target language
  context?: { speaker: string; text: string }[]; // dialog lines shown above
  options: { label: string; emoji?: string }[];
  answer: string; // answer = label of the right option
  layout: "list" | "grid";
}

export interface WordBankExerciseData {
  type: "wordbank";
  kind: "word-bank" | "order" | "tap-heard" | "compose";
  id: string;
  itemKey?: string;
  instruction: string;
  prompt?: string;
  audio?: string;
  tiles: string[];
  answer: string[];
  solution: string;
}

export interface GapExerciseData {
  type: "gap";
  kind: "gap-choose" | "gap-type";
  id: string;
  itemKey?: string;
  before: string;
  after: string;
  translation: string;
  answer: string;
  options: string[];
  full: string;
}

export interface FreeTextExerciseData {
  type: "freetext";
  kind: "free-text";
  id: string;
  question: string;
  questionTranslation: string;
  keywords: string[];
  sample: string;
  sampleTranslation: string;
}

// How an exercise ended. Wrong ones come back at the end of the session.
export type ExerciseResult = "correct" | "wrong" | "skipped";

export type Exercise =
  | MatchExerciseData
  | ListenExerciseData
  | WriteExerciseData
  | DictationExerciseData
  | SpeakExerciseData
  | ChoiceExerciseData
  | WordBankExerciseData
  | GapExerciseData
  | FreeTextExerciseData;

// What a session is built from: a lesson, or any other pool of content
export interface ExerciseSource {
  id: string;
  vocabulary: VocabularyItem[];
  phrases: Phrase[];
}

export interface SessionOptions {
  canSpeak: boolean;
  size?: number; // number of exercises
  hard?: boolean; // leaves out the easy kinds
  only?: ExerciseKind[]; // use only these kinds
  random?: () => number;
}

// Most tablets have no Japanese keyboard, so for Japanese the learner
// types the English meaning instead of the Japanese word.
function typesInEnglish(languageCode: LanguageCode | null): boolean {
  return languageCode === "ja";
}

// Puts the exercises in a random order where the same kind of exercise
// never comes twice in a row. It picks one exercise at a time: any kind
// except the one just used, unless one kind has so many left that it has
// to come now, or it could not be spread out any more.
function shuffleWithoutRepeats(exercises: Exercise[], random: () => number): Exercise[] {
  const groups = new Map<ExerciseKind, Exercise[]>();
  for (const exercise of shuffle(exercises, random)) {
    groups.set(exercise.kind, [...(groups.get(exercise.kind) ?? []), exercise]);
  }

  const result: Exercise[] = [];
  while (result.length < exercises.length) {
    const left = exercises.length - result.length;
    const previous = result[result.length - 1]?.kind;
    const kinds = [...groups.keys()].filter((kind) => groups.get(kind)!.length > 0);

    const mustCome = kinds.find((kind) => groups.get(kind)!.length > left / 2);
    const allowed = kinds.filter((kind) => kind !== previous);
    const choices = mustCome && mustCome !== previous ? [mustCome] : allowed;
    // Only possible when the session itself cannot avoid a repeat
    const kind = choices.length > 0 ? choices[Math.floor(random() * choices.length)] : kinds[0];

    result.push(groups.get(kind)!.pop()!);
  }
  return result;
}

const SESSION_SIZE = 9; // exercises per session (7 without speaking)
const MAX_PER_KIND = 2;
// Writing down what you hear is hard, so the text stays short
const MAX_DICTATION_WORDS = 5;

// One exercise from each group first, in this order
const GROUP_ORDER: ExerciseGroup[] = ["connect", "listening", "typing", "choosing", "building", "speaking"];

// "¿Cómo estás?" has 2 words; a lone "?" (French puts a space before it)
// does not count
function countWords(text: string): number {
  return text.split(/\s+/).filter((part) => /[\p{L}\p{N}]/u.test(part)).length;
}

// Several words, but not too many to keep in mind
function isShortText(text: string): boolean {
  const count = countWords(text);
  return count >= 2 && count <= MAX_DICTATION_WORDS;
}

// Builds one practice session. Every session is different: each group of
// exercises appears once if the content allows it, the remaining places
// get a random mix, words and options are shuffled, and so is the order.
// Speaking exercises are left out when the device has no speech recognition.
export function buildSession(
  source: ExerciseSource,
  languageCode: LanguageCode | null,
  options: SessionOptions,
): Exercise[] {
  // If nothing fits, relax the options: first "hard", then "only".
  // The result is empty only when the source has no words at all.
  const attempts: SessionOptions[] = [options, { ...options, hard: false }, { ...options, hard: false, only: undefined }];
  for (const attempt of attempts) {
    const exercises = buildSessionOnce(source, languageCode, attempt);
    if (exercises.length > 0) return exercises;
  }
  return [];
}

function buildSessionOnce(
  source: ExerciseSource,
  languageCode: LanguageCode | null,
  options: SessionOptions,
): Exercise[] {
  const random = options.random ?? Math.random;
  const words = shuffle(source.vocabulary, random);
  const phrases = shuffle(source.phrases, random);
  if (words.length === 0) return [];

  // The kinds that may be used in this session
  const active = KINDS.filter(
    (spec) =>
      (!options.only || options.only.includes(spec.kind)) &&
      !(options.hard && spec.easy) &&
      !(spec.needsSpeech && !options.canSpeak),
  );
  const canSpeak = options.canSpeak && phrases.length > 0;
  const size = options.size ?? (canSpeak ? SESSION_SIZE : SESSION_SIZE - 2);

  // One dictation is more than a single word: a short sentence of the
  // source (at most 5 words). If every sentence is longer, a short
  // expression from the vocabulary is used instead ("La semana pasada").
  const shortSentence = phrases.find((p) => isShortText(p.text));
  const shortExpression = words.find((v) => isShortText(v.word));
  let longDictation = shortSentence?.text ?? shortExpression?.word ?? null;
  // Speaking exercises use the other sentences first
  const speakPhrases = [...phrases.filter((p) => p !== shortSentence), ...(shortSentence ? [shortSentence] : [])];
  let nextWord = 0;
  let nextPhrase = 0;

  const context: BuildContext = {
    languageCode,
    inEnglish: typesInEnglish(languageCode),
    random,
    hard: options.hard ?? false,
    words,
    phrases,
    takeWord: () => words[nextWord++ % words.length],
    takePhrase: () => speakPhrases[nextPhrase++] ?? null,
    takeLongDictation: () => {
      const text = longDictation;
      longDictation = null;
      return text;
    },
  };

  const exercises: Exercise[] = [];
  const counts = new Map<ExerciseKind, number>();
  const impossible = new Set<ExerciseKind>(); // builders that returned null

  // Tries to add one exercise of this kind, returns whether it worked
  const add = (spec: KindSpec): boolean => {
    const exercise = spec.build(context, `${source.id}-${spec.kind}-${exercises.length + 1}`);
    if (!exercise) {
      impossible.add(spec.kind);
      return false;
    }
    exercises.push(exercise);
    counts.set(spec.kind, (counts.get(spec.kind) ?? 0) + 1);
    return true;
  };

  // 1. One exercise from each group that is possible
  for (const group of GROUP_ORDER) {
    const candidates = shuffle(
      active.filter((spec) => spec.group === group),
      random,
    );
    for (const spec of candidates) {
      if (exercises.length >= size) break;
      if (add(spec)) break;
    }
  }

  // 2. Random extras, never "match", at most 2 of a kind. If there are too
  // few kinds for that, a kind may come more often to reach the size.
  while (exercises.length < size) {
    const possible = active.filter((spec) => spec.kind !== "match" && !impossible.has(spec.kind));
    let candidates = possible.filter((spec) => (counts.get(spec.kind) ?? 0) < MAX_PER_KIND);
    if (candidates.length === 0) candidates = possible;
    if (candidates.length === 0) candidates = active.filter((spec) => !impossible.has(spec.kind));
    if (candidates.length === 0) break;
    add(candidates[Math.floor(random() * candidates.length)]);
  }

  // 3. Mix the order
  return shuffleWithoutRepeats(exercises, random);
}

// Builds one practice session for a lesson
export function buildExercises(
  lesson: Lesson,
  languageCode: LanguageCode | null,
  canSpeak: boolean,
  random: () => number = Math.random,
): Exercise[] {
  return buildSession(
    { id: lesson.id, vocabulary: lesson.vocabulary, phrases: lesson.phrases },
    languageCode,
    { canSpeak, random },
  );
}
