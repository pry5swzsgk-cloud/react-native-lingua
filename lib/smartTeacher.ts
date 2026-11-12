import { getWords } from "@/lib/teacherText";
import { LlmMessage } from "@/types/llm";

// The conversation rules for Smart Dax, the teacher that uses a language
// model. The model does the talking, this file decides what it is told:
// who it is, what the learner said, how much of the chat it remembers and
// how its answer is cleaned up. All of it is plain functions, so it can be
// tested without a model.

export const SMART_XP = 5; // XP for a stretch of real conversation
export const MESSAGES_PER_XP = 6; // learner messages needed for those XP
const MIN_WORDS_FOR_XP = 3; // shorter messages do not count
// The model remembers about 1000 tokens, and its own rules and answer need
// part of that. So only the newest turns are sent: not too many, not too long.
const MAX_HISTORY_TURNS = 10;
const MAX_HISTORY_CHARS = 1200;
const MAX_LEARNER_CHARS = 300; // a very long message is cut

export type Level = "A1" | "A2" | "B1" | "B2";

const LEVEL_RULES: Record<Level, string> = {
  A1: "Use only very simple words and short present-tense sentences.",
  A2: "Use simple everyday words and short sentences.",
  B1: "Use natural everyday language with clear sentences.",
  B2: "Use natural language with a richer vocabulary. Longer sentences are fine.",
};

// One turn of the chat as the model remembers it
export interface SmartTurn {
  role: "learner" | "teacher";
  text: string;
}

// ── What the model is told ──

export function buildSystemPrompt(
  language: string,
  correction: string, // how Dax introduces a correction, e.g. "Mejor"
  level: Level,
  firstTopic: string | null,
): string {
  return [
    `You are Dax, a friendly little dinosaur who chats with a German-speaking learner of ${language}. The learner's level is ${level}. ${LEVEL_RULES[level]}`,
    "Rules:",
    `- Always answer in ${language}. Write 1 or 2 short sentences, then ask ONE short question.`,
    `- If the learner writes German or asks how to say something, give the ${language} word or phrase with one tiny example. Then ask a short question in ${language}. Do not answer in German.`,
    `- If the learner makes a mistake, first write the correct sentence like this: "${correction}: ..." and then continue the chat.`,
    "- Never write long explanations, lists or translations. Do not use emojis.",
    firstTopic ? `- A good first topic is: ${firstTopic}.` : "",
  ]
    .filter((line) => line !== "")
    .join("\n");
}

// What the learner wants, turned into a message for the model. The chat
// buttons ("New topic", "Help me answer") use the same path as typing.
export type SmartRequest =
  | { kind: "start" }
  | { kind: "message"; text: string }
  | { kind: "german"; text: string }
  | { kind: "newTopic" }
  | { kind: "help" };

export function buildRequestText(request: SmartRequest): string {
  switch (request.kind) {
    case "start":
      return "Greet me in one short sentence and ask me one simple question to start our chat.";
    case "message":
      return request.text.trim().slice(0, MAX_LEARNER_CHARS);
    case "german":
      return `How do I say this in the language I am learning? In German: "${request.text.trim().slice(0, MAX_LEARNER_CHARS)}". Tell me, with one tiny example, and then ask me a short question.`;
    case "newTopic":
      return "Let's talk about something else. Pick a new topic yourself, introduce it in one short sentence and ask me a simple question about it.";
    case "help":
      return "I am stuck. Give me one short sentence I can use to answer your last question. Then wait for me.";
  }
}

// The messages sent to the model: the rules, then as much of the chat as
// fits, newest turns first. The last turn is always included.
export function buildMessages(
  systemPrompt: string,
  history: SmartTurn[],
): LlmMessage[] {
  const kept: SmartTurn[] = [];
  let chars = 0;

  for (let i = history.length - 1; i >= 0; i--) {
    chars += history[i].text.length;
    if (kept.length > 0 && (kept.length >= MAX_HISTORY_TURNS || chars > MAX_HISTORY_CHARS)) {
      break;
    }
    kept.unshift(history[i]);
  }
  // A chat starts with the learner's turn
  while (kept.length > 1 && kept[0].role === "teacher") kept.shift();

  return [
    { role: "system", content: systemPrompt },
    ...kept.map<LlmMessage>((turn) => ({
      role: turn.role === "learner" ? "user" : "assistant",
      content: turn.text,
    })),
  ];
}

// Translating is a separate, tiny task: nothing from the chat is needed
export function buildTranslationMessages(text: string): LlmMessage[] {
  return [
    {
      role: "system",
      content:
        "You translate into German. Answer with the German translation only, nothing else.",
    },
    { role: "user", content: text },
  ];
}

// ── What comes back ──

// Markdown signs and a name tag at the start ("Dax: ...") are not wanted.
// This is also used while an answer is still being written.
export function cleanPartial(raw: string): string {
  return raw
    .replace(/[*_`#]/g, "")
    .replace(/^\s*(dax|teacher|assistant|profesor)\s*:\s*/i, "")
    .trimStart();
}

// The finished answer. Small models sometimes wrap it in quotes or stop in
// the middle of a sentence when they run out of words.
export function cleanReply(raw: string): string {
  let text = cleanPartial(raw)
    .trim()
    .replace(/^["“«]+|["”»]+$/g, "")
    .trim();

  if (!/[.!?…]$/.test(text)) {
    const end = Math.max(
      text.lastIndexOf("."),
      text.lastIndexOf("!"),
      text.lastIndexOf("?"),
    );
    // Only cut when a good part of the answer stays
    if (end >= 20) text = text.slice(0, end + 1);
  }
  return text;
}

// ── XP ──

// Real conversation earns XP: every sixth message of at least three words
// (so tapping "hola" over and over does not count). `counted` is how many
// messages counted before this one.
export function getXPForMessage(
  text: string,
  counted: number,
): { counted: number; xp: number } {
  if (getWords(text).length < MIN_WORDS_FOR_XP) return { counted, xp: 0 };
  const next = counted + 1;
  return { counted: next, xp: next % MESSAGES_PER_XP === 0 ? SMART_XP : 0 };
}
