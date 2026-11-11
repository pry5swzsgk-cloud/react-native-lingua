import { LANGUAGES } from "@/data/languages";
import {
  DictionaryMatch,
  lookupGerman,
  lookupTarget,
  translateGermanPhrase,
} from "@/lib/teacherDictionary";
import { detectIntent } from "@/lib/teacherIntent";
import {
  cleanForSpeech,
  containsPhrase,
  getWords,
  normalizeText,
} from "@/lib/teacherText";
import { ThemeId } from "@/types/learning";
import {
  TeacherContent,
  TeacherLine,
  TeacherQuestion,
  TeacherTopic,
} from "@/types/teacher";

// Dax, the built-in conversation partner. He works offline and follows
// simple rules: he asks the questions of a topic one after the other,
// reacts to a few key words, helps with vocabulary and changes the topic
// on request. He is not a real AI and does not understand free text.
//
// Everything here is a pure function: state in, new state and messages out.
// That keeps it easy to test and easy to swap for a real language model.

export const TOPIC_XP = 5; // XP for finishing a topic
const CUSTOM_TOPIC = "custom"; // topic id for a topic the learner named

export interface TeacherState {
  // A topic id, "custom", or null when no topic is running
  topicId: string | null;
  // The learner's own topic, e.g. "el fútbol"
  customTopic: string | null;
  questionIndex: number;
  // Dax already asked for a longer answer to this question
  askedForMore: boolean;
  finishedTopicIds: string[];
  // The last reaction, so Dax does not say the same thing twice in a row
  lastReaction: string | null;
}

export type TeacherMessage =
  | { kind: "teacher"; text: string; translation: string; showTranslation: boolean }
  | { kind: "help"; words: DictionaryMatch[] }
  | { kind: "note"; text: string };

// What Dax does in one turn
export interface TeacherTurn {
  state: TeacherState;
  messages: TeacherMessage[];
  xp: number;
  slow: boolean; // read the answer aloud slowly
}

export function createTeacherState(): TeacherState {
  return {
    topicId: null,
    customTopic: null,
    questionIndex: 0,
    askedForMore: false,
    finishedTopicIds: [],
    lastReaction: null,
  };
}

// ── Small helpers ──

function say(line: TeacherLine, showTranslation = false): TeacherMessage {
  return { kind: "teacher", text: line.text, translation: line.translation, showTranslation };
}

function note(text: string): TeacherMessage {
  return { kind: "note", text };
}

function turn(state: TeacherState, messages: TeacherMessage[]): TeacherTurn {
  return { state, messages, xp: 0, slow: false };
}

// Several lines in one speech bubble
function join(...lines: TeacherLine[]): TeacherLine {
  return {
    text: lines.map((line) => line.text).join(" "),
    translation: lines.map((line) => line.translation).join(" "),
  };
}

// Replaces {topic} or {word} in a line
function fill(line: TeacherLine, key: string, value: string): TeacherLine {
  return {
    text: line.text.replace(`{${key}}`, value),
    translation: line.translation.replace(`{${key}}`, value),
  };
}

// "soy / estoy" -> "soy"
function firstAlternative(target: string): string {
  return target.split(" / ")[0];
}

function starterLine(content: TeacherContent, question: TeacherQuestion): TeacherLine {
  return {
    text: `${content.lines.starterIntro.text} «${question.starter.text}»`,
    translation: `${content.lines.starterIntro.translation} „${question.starter.translation}“`,
  };
}

// ── Topics ──

function getTopic(content: TeacherContent, state: TeacherState): TeacherTopic | null {
  return content.topics.find((topic) => topic.id === state.topicId) ?? null;
}

function getQuestions(content: TeacherContent, state: TeacherState): TeacherQuestion[] {
  if (state.topicId === CUSTOM_TOPIC) return content.genericQuestions;
  return getTopic(content, state)?.questions ?? [];
}

export function getCurrentQuestion(
  content: TeacherContent,
  state: TeacherState,
): TeacherQuestion | null {
  return getQuestions(content, state)[state.questionIndex] ?? null;
}

// The topic as shown in the header: "🍽️ Comida y bebida"
export function getTopicLabel(
  content: TeacherContent,
  state: TeacherState,
): string | null {
  if (state.topicId === CUSTOM_TOPIC) return `💬 ${state.customTopic}`;
  const topic = getTopic(content, state);
  return topic ? `${topic.emoji} ${topic.title.text}` : null;
}

// The topic whose key words fit the learner's wish best
function findTopicByKeyword(
  content: TeacherContent,
  requested: string,
): TeacherTopic | null {
  let best: TeacherTopic | null = null;
  let bestLength = 0;

  for (const topic of content.topics) {
    for (const keyword of topic.keywords) {
      // "tiempo libre" beats "tiempo": the longest key word wins
      if (keyword.length > bestLength && containsPhrase(requested, keyword)) {
        best = topic;
        bestLength = keyword.length;
      }
    }
  }
  return best;
}

// Dax chooses: a topic that fits the current lesson, else a random one.
// Topics already talked about come back only when all are used up.
function pickTopicId(
  content: TeacherContent,
  state: TeacherState,
  random: () => number,
  preferredTheme: ThemeId | null,
): string {
  const others = content.topics.filter((topic) => topic.id !== state.topicId);
  const fresh = others.filter((topic) => !state.finishedTopicIds.includes(topic.id));
  const candidates = fresh.length > 0 ? fresh : others;

  const fitting = preferredTheme
    ? candidates.find((topic) => topic.themes?.includes(preferredTheme))
    : undefined;
  return (fitting ?? candidates[Math.floor(random() * candidates.length)]).id;
}

function beginTopic(
  content: TeacherContent,
  state: TeacherState,
  topicId: string,
  customTopic: string | null,
  lead: TeacherLine | null,
): TeacherTurn {
  const nextState: TeacherState = {
    ...state,
    topicId,
    customTopic,
    questionIndex: 0,
    askedForMore: false,
  };
  const topic = getTopic(content, nextState);
  const intro = topic
    ? topic.intro
    : fill(content.lines.customTopicIntro, "topic", customTopic ?? "");
  const firstQuestion = getQuestions(content, nextState)[0].ask;

  return turn(nextState, [
    note(`Topic: ${getTopicLabel(content, nextState)}`),
    say(join(...(lead ? [lead] : []), intro, firstQuestion)),
  ]);
}

// ── What Dax can do ──

export function startConversation(
  content: TeacherContent,
  random: () => number = Math.random,
  preferredTheme: ThemeId | null = null,
): TeacherTurn {
  const state = createTeacherState();
  const language = LANGUAGES.find((l) => l.code === content.languageCode);
  const first = beginTopic(
    content,
    state,
    pickTopicId(content, state, random, preferredTheme),
    null,
    null,
  );

  return {
    ...first,
    messages: [
      say(content.lines.greeting),
      note(
        `Answer in ${language?.name ?? "the language you learn"}. Missing a word? Ask in German: “Wie sagt man …?”`,
      ),
      ...first.messages,
    ],
  };
}

// Dax picks a new topic himself
export function pickNewTopic(
  content: TeacherContent,
  state: TeacherState,
  random: () => number = Math.random,
  lead: TeacherLine = content.lines.leadNewTopic,
): TeacherTurn {
  return beginTopic(content, state, pickTopicId(content, state, random, null), null, lead);
}

// The learner named a topic: one of Dax's own if it fits, else any topic
function startChosenTopic(
  content: TeacherContent,
  state: TeacherState,
  requested: string,
): TeacherTurn {
  const topic = findTopicByKeyword(content, requested);
  if (topic) {
    return beginTopic(content, state, topic.id, null, content.lines.leadChosenTopic);
  }

  // A German topic word is shown in the learned language when Dax knows it
  const translated = translateGermanPhrase(content.dictionary, content.articles, requested);
  const name = translated ? firstAlternative(translated.target) : requested;
  return beginTopic(content, state, CUSTOM_TOPIC, name, content.lines.leadChosenTopic);
}

// A way to begin the answer to the current question
export function helpWithAnswer(content: TeacherContent, state: TeacherState): TeacherTurn {
  const question = getCurrentQuestion(content, state);
  return turn(state, [
    say(question ? starterLine(content, question) : content.lines.noQuestion, true),
  ]);
}

// The current question again, slowly and with its translation
export function repeatQuestion(content: TeacherContent, state: TeacherState): TeacherTurn {
  const question = getCurrentQuestion(content, state);
  if (!question) return turn(state, [say(content.lines.noQuestion, true)]);

  return {
    ...turn(state, [say(join(content.lines.repeat, question.ask), true)]),
    slow: true,
  };
}

// "Wie sagt man Hund?" -> el perro
function answerVocabulary(
  content: TeacherContent,
  state: TeacherState,
  query: string,
  fromTarget: boolean,
): TeacherTurn {
  const { dictionary, articles } = content;
  const german = () => lookupGerman(dictionary, articles, query);
  const target = () => lookupTarget(dictionary, articles, query);

  let words = fromTarget ? target() : german();
  if (words.length === 0) words = fromTarget ? german() : target();

  if (words.length === 0) {
    return turn(state, [say(fill(content.lines.wordNotFound, "word", query), true)]);
  }
  return turn(state, [{ kind: "help", words }, say(content.lines.wordFound, true)]);
}

// The learner wrote German: ask for the learned language and offer the
// words Dax recognizes
function remindToUseTarget(
  content: TeacherContent,
  state: TeacherState,
  input: string,
): TeacherTurn {
  const words = lookupGerman(content.dictionary, content.articles, input);
  return turn(state, [
    say(content.lines.useTargetLanguage, true),
    ...(words.length > 0 ? [{ kind: "help" as const, words }] : []),
  ]);
}

function chooseReaction(
  content: TeacherContent,
  question: TeacherQuestion,
  answer: string,
  state: TeacherState,
  random: () => number,
): TeacherLine {
  // A special reply for a key word in the answer
  for (const reaction of question.reactions ?? []) {
    if (reaction.keywords.some((keyword) => containsPhrase(answer, keyword))) {
      return reaction.say;
    }
  }

  const isNegative =
    getWords(answer)[0] === "no" ||
    content.negativeWords.some((phrase) => containsPhrase(answer, phrase));
  const isPositive = content.positiveWords.some((phrase) => containsPhrase(answer, phrase));

  const pool = isNegative
    ? content.negativeReactions
    : isPositive
      ? content.positiveReactions
      : content.acknowledgements;
  const choices = pool.filter((line) => line.text !== state.lastReaction);
  return choices[Math.floor(random() * choices.length)];
}

const DECLINE =
  /^(?:no|nein|no gracias|nein danke|ahora no|jetzt nicht|sp(?:ä|ae)ter|m(?:á|a)s tarde|not now|no thanks)$/u;

// The learner answered the current question
function continueConversation(
  content: TeacherContent,
  state: TeacherState,
  input: string,
  askedBack: boolean,
  random: () => number,
): TeacherTurn {
  const questions = getQuestions(content, state);
  const question = questions[state.questionIndex];

  let reaction: TeacherLine;
  if (askedBack) {
    // "¿Y tú?" -> Dax answers the question himself
    reaction = join(content.lines.goodQuestion, question.myAnswer);
  } else if (getWords(input).length <= 2 && !state.askedForMore) {
    // One or two words: ask once for a whole sentence and show how to start
    return turn({ ...state, askedForMore: true }, [
      say(join(content.lines.askMore, starterLine(content, question)), true),
    ]);
  } else {
    reaction = chooseReaction(content, question, input, state, random);
  }

  const nextIndex = state.questionIndex + 1;
  if (nextIndex < questions.length) {
    return turn(
      {
        ...state,
        questionIndex: nextIndex,
        askedForMore: false,
        lastReaction: reaction.text,
      },
      [say(join(reaction, questions[nextIndex].ask))],
    );
  }

  // That was the last question of the topic
  const finishedTopicIds =
    state.topicId && state.topicId !== CUSTOM_TOPIC
      ? [...state.finishedTopicIds, state.topicId]
      : state.finishedTopicIds;

  return {
    state: {
      ...state,
      topicId: null,
      customTopic: null,
      questionIndex: 0,
      askedForMore: false,
      finishedTopicIds,
      lastReaction: reaction.text,
    },
    messages: [
      say(join(reaction, content.lines.topicFinished)),
      note(`+${TOPIC_XP} XP · topic finished`),
    ],
    xp: TOPIC_XP,
    slow: false,
  };
}

// The main entry: the learner said or typed something.
// germanHelp is true when they switched on "ask in German".
export function respondToLearner(
  content: TeacherContent,
  state: TeacherState,
  input: string,
  germanHelp: boolean,
  random: () => number = Math.random,
): TeacherTurn {
  const text = normalizeText(input);
  if (!text) return turn(state, []);

  const intent = detectIntent(content, input, germanHelp);

  // No topic is running (the last one was finished) and the learner did
  // not ask for anything: "no" pauses, everything else, even a German
  // "ja", moves on to a new topic.
  const isRequest =
    intent.type === "chooseTopic" ||
    intent.type === "newTopic" ||
    intent.type === "repeat" ||
    intent.type === "goodbye" ||
    (intent.type === "translate" && intent.asked);
  if (state.topicId === null && !isRequest) {
    return DECLINE.test(text)
      ? turn(state, [say(content.lines.pause)])
      : pickNewTopic(content, state, random, content.lines.leadNextTopic);
  }

  switch (intent.type) {
    case "translate":
      return answerVocabulary(content, state, intent.query, intent.fromTarget);
    case "chooseTopic":
      return startChosenTopic(content, state, intent.topic);
    case "newTopic":
      return pickNewTopic(content, state, random);
    case "repeat":
      return repeatQuestion(content, state);
    case "goodbye":
      return turn(state, [say(content.lines.goodbye)]);
  }

  if (intent.type === "german") return remindToUseTarget(content, state, input);
  return continueConversation(content, state, input, intent.type === "askBack", random);
}

// What should be read aloud for these messages: Dax's lines and the words
// he looked up, without emojis and notes.
export function getSpeechText(messages: TeacherMessage[]): string {
  const parts: string[] = [];
  for (const message of messages) {
    if (message.kind === "teacher") parts.push(cleanForSpeech(message.text));
    if (message.kind === "help") {
      parts.push(message.words.map((word) => firstAlternative(word.target)).join(". ") + ".");
    }
  }
  return parts.join(" ");
}
