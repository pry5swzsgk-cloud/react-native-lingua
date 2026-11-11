import { LanguageCode, Lesson, Phrase, VocabularyItem } from "@/types/learning";

// The five kinds of practice, all built from a lesson's words and phrases:
//   match     - connect each word with its meaning
//   listen    - hear a word and pick what it means
//   write     - write a word yourself
//   dictation - hear something and write it down
//   speak     - say a sentence out loud

export interface MatchExerciseData {
  type: "match";
  id: string;
  pairs: { word: string; translation: string }[];
  translations: string[]; // the right column, already shuffled
}

export interface ListenExerciseData {
  type: "listen";
  id: string;
  audio: string; // read aloud, never shown before answering
  answer: string;
  options: string[];
}

export interface WriteExerciseData {
  type: "write";
  id: string;
  prompt: string;
  emoji?: string;
  pronunciation?: string;
  answer: string;
  answerInEnglish: boolean;
}

export interface DictationExerciseData {
  type: "dictation";
  id: string;
  audio: string;
  answer: string;
  answerInEnglish: boolean;
}

export interface SpeakExerciseData {
  type: "speak";
  id: string;
  text: string;
  pronunciation: string;
  translation: string;
}

// How an exercise ended. Wrong ones come back at the end of the session.
export type ExerciseResult = "correct" | "wrong" | "skipped";

export type Exercise =
  | MatchExerciseData
  | ListenExerciseData
  | WriteExerciseData
  | DictationExerciseData
  | SpeakExerciseData;

// Most tablets have no Japanese keyboard, so for Japanese the learner
// types the English meaning instead of the Japanese word.
function typesInEnglish(languageCode: LanguageCode | null): boolean {
  return languageCode === "ja";
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function buildMatch(id: string, words: VocabularyItem[], random: () => number): MatchExerciseData {
  const pairs = words.map((v) => ({ word: v.word, translation: v.translation }));
  return {
    type: "match",
    id,
    pairs,
    translations: shuffle(pairs.map((p) => p.translation), random),
  };
}

function buildListen(id: string, word: VocabularyItem, all: VocabularyItem[], random: () => number): ListenExerciseData {
  const wrongOptions = shuffle(
    all.map((v) => v.translation).filter((t) => t !== word.translation),
    random,
  ).slice(0, 3);
  return {
    type: "listen",
    id,
    audio: word.word,
    answer: word.translation,
    options: shuffle([word.translation, ...wrongOptions], random),
  };
}

function buildWrite(id: string, word: VocabularyItem, inEnglish: boolean): WriteExerciseData {
  return inEnglish
    ? {
        type: "write",
        id,
        prompt: word.word,
        emoji: word.emoji,
        pronunciation: word.pronunciation,
        answer: word.translation,
        answerInEnglish: true,
      }
    : {
        type: "write",
        id,
        prompt: word.translation,
        emoji: word.emoji,
        answer: word.word,
        answerInEnglish: false,
      };
}

function buildDictation(id: string, item: VocabularyItem, inEnglish: boolean): DictationExerciseData {
  return {
    type: "dictation",
    id,
    audio: item.word,
    answer: inEnglish ? item.translation : item.word,
    answerInEnglish: inEnglish,
  };
}

function buildSpeak(id: string, phrase: Phrase): SpeakExerciseData {
  return {
    type: "speak",
    id,
    text: phrase.text,
    pronunciation: phrase.pronunciation,
    translation: phrase.translation,
  };
}

// Puts the exercises in a random order where the same kind of exercise
// never comes twice in a row. It picks one exercise at a time: any kind
// except the one just used, unless one kind has so many left that it has
// to come now, or it could not be spread out any more.
function shuffleWithoutRepeats(exercises: Exercise[], random: () => number): Exercise[] {
  const groups = new Map<Exercise["type"], Exercise[]>();
  for (const exercise of shuffle(exercises, random)) {
    groups.set(exercise.type, [...(groups.get(exercise.type) ?? []), exercise]);
  }

  const result: Exercise[] = [];
  while (result.length < exercises.length) {
    const left = exercises.length - result.length;
    const previous = result[result.length - 1]?.type;
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

// Builds one practice session for a lesson. Every session is different:
// each kind of exercise appears at least once, the remaining places get a
// random mix, words and options are shuffled, and so is the order.
// Speaking exercises are left out when the device has no speech recognition.
export function buildExercises(
  lesson: Lesson,
  languageCode: LanguageCode | null,
  canSpeak: boolean,
  random: () => number = Math.random,
): Exercise[] {
  const inEnglish = typesInEnglish(languageCode);
  const words = shuffle(lesson.vocabulary, random);
  const phrases = shuffle(lesson.phrases, random);
  const speakable = canSpeak ? phrases.length : 0;

  // 1. Which kinds of exercises: one of each, then random extras
  const kinds: Exercise["type"][] = ["match", "listen", "write", "dictation"];
  if (speakable > 0) kinds.push("speak");
  const size = speakable > 0 ? SESSION_SIZE : SESSION_SIZE - 2;
  while (kinds.length < size) {
    const extras: Exercise["type"][] = ["listen", "write", "dictation"];
    // every speaking exercise needs its own sentence
    if (kinds.filter((k) => k === "speak").length < speakable) extras.push("speak");
    kinds.push(extras[Math.floor(random() * extras.length)]);
  }

  // 2. Fill them with content
  let nextWord = 0;
  let nextPhrase = 0;
  let hasSentenceDictation = false;
  // Wraps around so short lessons still fill every exercise
  const takeWord = () => words[nextWord++ % words.length];
  const id = (kind: string, index: number) => `${lesson.id}-${kind}-${index + 1}`;

  const exercises = kinds.map((kind, index): Exercise => {
    switch (kind) {
      case "match":
        return buildMatch(id(kind, index), words.slice(0, 5), random);
      case "listen":
        return buildListen(id(kind, index), takeWord(), words, random);
      case "write":
        return buildWrite(id(kind, index), takeWord(), inEnglish);
      case "speak":
        return buildSpeak(id(kind, index), phrases[nextPhrase++]);
      case "dictation":
        // The first dictation is a whole sentence (a word for Japanese)
        if (!hasSentenceDictation && !inEnglish && phrases.length > 0) {
          hasSentenceDictation = true;
          const sentence = phrases[phrases.length - 1].text;
          return {
            type: "dictation",
            id: id(kind, index),
            audio: sentence,
            answer: sentence,
            answerInEnglish: false,
          };
        }
        return buildDictation(id(kind, index), takeWord(), inEnglish);
    }
  });

  // 3. Mix the order
  return shuffleWithoutRepeats(exercises, random);
}
