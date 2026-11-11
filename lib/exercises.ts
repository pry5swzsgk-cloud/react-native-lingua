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

// Builds one practice session for a lesson. Words and options are shuffled,
// so every round looks a little different. Speaking exercises are left out
// when the device has no speech recognition.
export function buildExercises(
  lesson: Lesson,
  languageCode: LanguageCode | null,
  canSpeak: boolean,
  random: () => number = Math.random,
): Exercise[] {
  const inEnglish = typesInEnglish(languageCode);
  const words = shuffle(lesson.vocabulary, random);
  const phrases = shuffle(lesson.phrases, random);
  const id = (name: string) => `${lesson.id}-${name}`;
  // Wraps around so short lessons still fill every slot
  const word = (index: number) => words[index % words.length];

  const exercises: (Exercise | null)[] = [
    buildMatch(id("match"), words.slice(0, 5), random),
    buildListen(id("listen-1"), word(0), words, random),
    buildWrite(id("write-1"), word(1), inEnglish),
    canSpeak && phrases[0] ? buildSpeak(id("speak-1"), phrases[0]) : null,
    buildListen(id("listen-2"), word(2), words, random),
    buildDictation(id("dictation-1"), word(3), inEnglish),
    buildWrite(id("write-2"), word(4), inEnglish),
    canSpeak && phrases[1] ? buildSpeak(id("speak-2"), phrases[1]) : null,
    // Last and hardest: write down a whole sentence (a word for Japanese)
    inEnglish || phrases.length === 0
      ? buildDictation(id("dictation-2"), word(0), inEnglish)
      : {
          type: "dictation",
          id: id("dictation-2"),
          audio: phrases[phrases.length - 1].text,
          answer: phrases[phrases.length - 1].text,
          answerInEnglish: false,
        },
  ];

  return exercises.filter((exercise): exercise is Exercise => exercise !== null);
}
