import type { LanguageCode, Phrase, VocabularyItem } from "@/types/learning";
import type {
  ChoiceExerciseData,
  DictationExerciseData,
  Exercise,
  ExerciseKind,
  GapExerciseData,
  ListenExerciseData,
  MatchExerciseData,
  SpeakExerciseData,
  WordBankExerciseData,
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

// Different values only, first one wins
function unique(items: string[]): string[] {
  return [...new Set(items)];
}

// The right answer plus up to 3 wrong ones (all different), shuffled.
// null when there are fewer than 2 different options.
function pickOptions(
  answer: string,
  wrong: string[],
  random: () => number,
): string[] | null {
  const others = shuffle(unique(wrong).filter((label) => label !== answer), random).slice(0, 3);
  return others.length === 0 ? null : shuffle([answer, ...others], random);
}

function buildChoice(ctx: BuildContext, id: string): ChoiceExerciseData | null {
  const word = ctx.takeWord();
  const toWord = ctx.random() < 0.5; // meaning -> word, otherwise word -> meaning
  const answer = toWord ? word.word : word.translation;
  // Words with the same meaning would be a second right answer
  const rivals = ctx.words.filter((v) => v.translation !== word.translation);
  const labels = pickOptions(
    answer,
    toWord ? rivals.map((v) => v.word) : ctx.words.map((v) => v.translation),
    ctx.random,
  );
  if (!labels) return null;
  return {
    type: "choice",
    kind: "choice",
    id,
    itemKey: word.word,
    instruction: toWord ? "Which word fits?" : "What does it mean?",
    prompt: toWord ? word.translation : word.word,
    promptEmoji: word.emoji || undefined,
    options: labels.map((label) => ({ label })),
    answer,
    layout: "list",
  };
}

function buildPicture(ctx: BuildContext, id: string): ChoiceExerciseData | null {
  // Only words with their own emoji and their own meaning can be a picture
  const seenEmojis = new Set<string>();
  const seenMeanings = new Set<string>();
  const pictures = ctx.words.filter((v) => {
    const emoji = v.emoji?.trim();
    if (!emoji || seenEmojis.has(emoji) || seenMeanings.has(v.translation)) return false;
    seenEmojis.add(emoji);
    seenMeanings.add(v.translation);
    return true;
  });
  if (pictures.length < 4) return null;
  const word = pictures[Math.floor(ctx.random() * pictures.length)];
  const others = shuffle(
    pictures.filter((v) => v !== word),
    ctx.random,
  ).slice(0, 3);
  return {
    type: "choice",
    kind: "picture",
    id,
    itemKey: word.word,
    instruction: "Which picture fits?",
    prompt: word.word,
    options: shuffle([word, ...others], ctx.random).map((v) => ({
      label: v.translation,
      emoji: v.emoji?.trim(),
    })),
    answer: word.translation,
    layout: "grid",
  };
}

const MAX_HEARD_SENTENCE_WORDS = 6;

function buildAudioMatch(ctx: BuildContext, id: string): ChoiceExerciseData | null {
  const texts = unique(ctx.phrases.map((p) => p.text));
  let audio: string;
  let labels: string[] | null;
  if (texts.length >= 2 && ctx.random() < 0.5) {
    // A short sentence, the options are other sentences
    const short = texts.filter((t) => t.split(/\s+/).length <= MAX_HEARD_SENTENCE_WORDS);
    const pool = short.length > 0 ? short : texts;
    audio = pool[Math.floor(ctx.random() * pool.length)];
    labels = pickOptions(audio, texts, ctx.random);
  } else {
    audio = ctx.takeWord().word;
    labels = pickOptions(
      audio,
      ctx.words.map((v) => v.word),
      ctx.random,
    );
  }
  if (!labels) return null;
  return {
    type: "choice",
    kind: "audio-match",
    id,
    itemKey: audio,
    instruction: "What do you hear?",
    audio,
    options: labels.map((label) => ({ label })),
    answer: audio,
    layout: "list",
  };
}

function buildTrueFalse(ctx: BuildContext, id: string): ChoiceExerciseData {
  const word = ctx.takeWord();
  const wrong = ctx.words.filter((v) => v.translation !== word.translation);
  // Half of the statements are false (if there is another meaning to use)
  const isTrue = wrong.length === 0 || ctx.random() < 0.5;
  const shown = isTrue ? word.translation : wrong[Math.floor(ctx.random() * wrong.length)].translation;
  return {
    type: "choice",
    kind: "true-false",
    id,
    itemKey: word.word,
    instruction: "True or false?",
    prompt: `\u201C${word.word}\u201D means \u201C${shown}\u201D`,
    options: [{ label: "True" }, { label: "False" }],
    answer: isTrue ? "True" : "False",
    layout: "grid",
  };
}

// Tiles are the words of a sentence without punctuation at their edges:
// "¿Cómo estás?" -> ["Cómo", "estás"]. Empty parts are dropped.
function sentenceTiles(text: string): string[] {
  return text
    .split(/\s+/)
    .map((part) => part.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ""))
    .filter((part) => part.length > 0);
}

// Up to `count` wrong tiles taken from the given texts. None may equal a
// word of the answer (ignoring case) and all are different.
function pickDistractors(texts: string[], answer: string[], count: number, random: () => number): string[] {
  const taken = new Set(answer.map((tile) => tile.toLowerCase()));
  const pool: string[] = [];
  for (const tile of shuffle(texts.flatMap(sentenceTiles), random)) {
    const key = tile.toLowerCase();
    if (taken.has(key)) continue;
    taken.add(key);
    pool.push(tile);
    if (pool.length === count) break;
  }
  return pool;
}

const sameOrder = (a: string[], b: string[]) => a.join(" ").toLowerCase() === b.join(" ").toLowerCase();

function buildWordBank(ctx: BuildContext, id: string): WordBankExerciseData | null {
  const phrase = ctx.takePhrase();
  if (!phrase) return null;
  const answer = sentenceTiles(phrase.translation);
  if (answer.length < 2 || answer.length > 9) return null;
  const others = [
    ...ctx.phrases.filter((p) => p !== phrase).map((p) => p.translation),
    ...ctx.words.map((v) => v.translation),
  ];
  const distractors = pickDistractors(others, answer, 3, ctx.random);
  return {
    type: "wordbank",
    kind: "word-bank",
    id,
    itemKey: phrase.text,
    instruction: "Translate this sentence",
    prompt: phrase.text,
    audio: phrase.text,
    tiles: shuffle([...answer, ...distractors], ctx.random),
    answer,
    solution: phrase.translation,
  };
}

// A random sentence with a word count in range (null if none has).
// It does not use takePhrase(), so the speaking exercises keep their sentences.
function pickPhraseWithWords(ctx: BuildContext, min: number, max: number) {
  const fitting = ctx.phrases
    .map((phrase) => ({ phrase, answer: sentenceTiles(phrase.text) }))
    .filter((item) => item.answer.length >= min && item.answer.length <= max);
  return fitting.length > 0 ? fitting[Math.floor(ctx.random() * fitting.length)] : null;
}

function buildOrder(ctx: BuildContext, id: string): WordBankExerciseData | null {
  if (ctx.inEnglish) return null;
  const found = pickPhraseWithWords(ctx, 3, 8);
  if (!found) return null;
  const { phrase, answer } = found;
  // Shuffle until the order is wrong (impossible if all words are equal)
  let tiles = shuffle(answer, ctx.random);
  for (let tries = 0; tries < 20 && sameOrder(tiles, answer); tries++) {
    tiles = shuffle(answer, ctx.random);
  }
  if (sameOrder(tiles, answer)) tiles = [...answer].reverse();
  if (sameOrder(tiles, answer)) return null;
  return {
    type: "wordbank",
    kind: "order",
    id,
    itemKey: phrase.text,
    instruction: "Put the words in the right order",
    prompt: phrase.translation,
    tiles,
    answer,
    solution: phrase.text,
  };
}

function buildTapHeard(ctx: BuildContext, id: string): WordBankExerciseData | null {
  if (ctx.inEnglish) return null;
  const found = pickPhraseWithWords(ctx, 2, 8);
  if (!found) return null;
  const { phrase, answer } = found;
  const others = [
    ...ctx.phrases.filter((p) => p !== phrase).map((p) => p.text),
    ...ctx.words.map((v) => v.word),
  ];
  const distractors = pickDistractors(others, answer, 3, ctx.random);
  return {
    type: "wordbank",
    kind: "tap-heard",
    id,
    itemKey: phrase.text,
    instruction: "Tap what you hear",
    audio: phrase.text,
    tiles: shuffle([...answer, ...distractors], ctx.random),
    answer,
    solution: phrase.text,
  };
}

// Articles are too easy to be the missing word
const ARTICLES = new Set(["el", "la", "un", "una", "le", "les", "der", "die", "das"]);

// Where the gap word sits in the sentence: text before it and after it keep
// their punctuation ("¿Dónde está el baño?" -> "¿Dónde está el " + "baño" + "?")
function gapCandidates(text: string): { word: string; before: string; after: string }[] {
  const result: { word: string; before: string; after: string }[] = [];
  for (const match of text.matchAll(/\S+/g)) {
    const token = match[0];
    const lead = token.match(/^[^\p{L}\p{N}]*/u)?.[0].length ?? 0;
    const word = token.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
    if (!word) continue;
    const start = (match.index ?? 0) + lead;
    result.push({ word, before: text.slice(0, start), after: text.slice(start + word.length) });
  }
  return result;
}

function buildGap(ctx: BuildContext, id: string, type: boolean): GapExerciseData | null {
  if (ctx.inEnglish) return null;
  const sentences = ctx.phrases.filter((p) => sentenceTiles(p.text).length >= 3);
  if (sentences.length === 0) return null;
  const phrase = sentences[Math.floor(ctx.random() * sentences.length)];

  // Words that are part of a vocabulary item of the source
  const known = new Set(
    ctx.words.flatMap((v) => sentenceTiles(v.word).map((w) => w.toLowerCase())),
  );
  const candidates = gapCandidates(phrase.text);
  const preferred = candidates.filter(
    (c) => c.word.length >= 3 && !ARTICLES.has(c.word.toLowerCase()) && known.has(c.word.toLowerCase()),
  );
  const long = candidates.filter((c) => c.word.length >= 4);
  let pool = preferred;
  if (pool.length === 0 && long.length > 0) {
    const longest = Math.max(...long.map((c) => c.word.length));
    pool = long.filter((c) => c.word.length === longest);
  }
  if (pool.length === 0) return null;
  const gap = pool[Math.floor(ctx.random() * pool.length)];

  let options: string[] = [];
  if (!type) {
    // Wrong words: other sentences and vocabulary, at least 3 letters
    const taken = new Set([gap.word.toLowerCase()]);
    const wrong: string[] = [];
    const texts = [...ctx.phrases.filter((p) => p !== phrase).map((p) => p.text), ...ctx.words.map((v) => v.word)];
    for (const word of shuffle(texts.flatMap(sentenceTiles), ctx.random)) {
      if (word.length < 3 || taken.has(word.toLowerCase())) continue;
      taken.add(word.toLowerCase());
      wrong.push(word);
      if (wrong.length === 3) break;
    }
    if (wrong.length < 2) return null;
    options = shuffle([gap.word, ...wrong], ctx.random);
  }
  return {
    type: "gap",
    kind: type ? "gap-type" : "gap-choose",
    id,
    itemKey: phrase.text,
    before: gap.before,
    after: gap.after,
    translation: phrase.translation,
    answer: gap.word,
    options,
    full: phrase.text,
  };
}

const buildGapChoose = (ctx: BuildContext, id: string) => buildGap(ctx, id, false);
const buildGapType = (ctx: BuildContext, id: string) => buildGap(ctx, id, true);

export const KINDS: KindSpec[] = [
  { kind: "match", group: "connect", easy: true, needsSpeech: false, build: buildMatch },
  { kind: "listen", group: "listening", easy: true, needsSpeech: false, build: buildListen },
  { kind: "choice", group: "choosing", easy: true, needsSpeech: false, build: buildChoice },
  { kind: "picture", group: "choosing", easy: true, needsSpeech: false, build: buildPicture },
  { kind: "audio-match", group: "listening", easy: false, needsSpeech: false, build: buildAudioMatch },
  { kind: "true-false", group: "choosing", easy: true, needsSpeech: false, build: buildTrueFalse },
  { kind: "write-word", group: "typing", easy: false, needsSpeech: false, build: buildWrite },
  { kind: "dictation", group: "listening", easy: false, needsSpeech: false, build: buildDictation },
  { kind: "speak-sentence", group: "speaking", easy: false, needsSpeech: true, build: buildSpeak },
  { kind: "word-bank", group: "building", easy: true, needsSpeech: false, build: buildWordBank },
  { kind: "order", group: "building", easy: false, needsSpeech: false, build: buildOrder },
  { kind: "tap-heard", group: "listening", easy: false, needsSpeech: false, build: buildTapHeard },
  { kind: "gap-choose", group: "choosing", easy: true, needsSpeech: false, build: buildGapChoose },
  { kind: "gap-type", group: "typing", easy: false, needsSpeech: false, build: buildGapType },
];
