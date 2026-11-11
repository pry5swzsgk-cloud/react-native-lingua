import { isTargetWord, translateGermanPhrase } from "@/lib/teacherDictionary";
import { getWords, normalizeText, stripAccents } from "@/lib/teacherText";
import { TeacherContent } from "@/types/teacher";

// Works out what the learner wants with a message. Dax is not a real AI:
// he looks for typical phrases in German, Spanish and English.

export type Intent =
  // "Wie sagt man Hund?" (asked = true) or just "Hund" (asked = false)
  | { type: "translate"; query: string; fromTarget: boolean; asked: boolean }
  | { type: "chooseTopic"; topic: string } // "Lass uns über Musik reden"
  | { type: "newTopic" } // "Neues Thema"
  | { type: "repeat" } // "Wie bitte?"
  | { type: "goodbye" }
  | { type: "german" } // a German sentence instead of an answer
  | { type: "askBack" } // "¿Y tú?"
  | { type: "answer" };

// Questions for a word. The word is the part in brackets.
const TRANSLATE_PATTERNS: { pattern: RegExp; fromTarget: boolean }[] = [
  { pattern: /^(?:und )?wie sagt man (.+?)(?: auf \p{L}+| in \p{L}+)?$/u, fromTarget: false },
  { pattern: /^(?:und )?was hei(?:ß|ss)t (.+?)(?: auf \p{L}+)?$/u, fromTarget: false },
  { pattern: /^(?:und )?wie hei(?:ß|ss)t (.+?)(?: auf \p{L}+)?$/u, fromTarget: false },
  { pattern: /^was bedeutet (.+?)(?: auf \p{L}+)?$/u, fromTarget: true },
  { pattern: /^(?:was ist )?das (?:\p{L}+ )?wort f(?:ü|ue)r (.+)$/u, fromTarget: false },
  { pattern: /^(.+?) auf spanisch$/u, fromTarget: false },
  { pattern: /^(?:ü|ue)bersetz\p{L}* (?:bitte )?(.+?)(?: auf \p{L}+| ins \p{L}+)?$/u, fromTarget: false },
  { pattern: /(?:^| )c(?:ó|o)mo se dice (.+?)(?: en espa(?:ñ|n)ol)?$/u, fromTarget: false },
  { pattern: /^how do you say (.+?)(?: in spanish)?$/u, fromTarget: false },
  { pattern: /(?:^| )qu(?:é|e) significa (.+)$/u, fromTarget: true },
  { pattern: /(?:^| )qu(?:é|e) quiere decir (.+)$/u, fromTarget: true },
  { pattern: /^what does (.+?) mean$/u, fromTarget: true },
];

// "Let's talk about …" in three languages. The topic is the part in brackets.
const CHOOSE_TOPIC_PATTERNS: RegExp[] = [
  /(?:lass uns|lasst uns|k(?:ö|oe)nnen wir|kannst du|wollen wir|ich m(?:ö|oe)chte|ich will|ich w(?:ü|ue)rde gerne?|sprechen wir|reden wir|sprich|rede|erz(?:ä|ae)hl\p{L}*) .*?(?:ü|ue)ber (.+?)(?: (?:reden|sprechen|unterhalten|quatschen|plaudern|diskutieren|erz(?:ä|ae)hlen))?(?: bitte)?$/u,
  /(?:^| )(?:ü|ue)ber (.+?) (?:reden|sprechen|unterhalten|quatschen|plaudern)(?: bitte)?$/u,
  /(?:^| )(?:hablemos|hablamos|charlemos|conversemos) (?:de|del|sobre|acerca de) (.+)$/u,
  /(?:^| )(?:quiero|quisiera|me gustar(?:í|i)a|podemos|puedes|vamos a|prefiero) (?:hablar|charlar|conversar) (?:contigo |conmigo )?(?:de|del|sobre|acerca de) (.+)$/u,
  /(?:^| )h(?:á|a)blame (?:de|del|sobre|acerca de) (.+)$/u,
  /(?:^| )(?:lets|can we|could we|i want to|i would like to|id like to) (?:talk|speak|chat) about (.+)$/u,
];

// "thema: fußball" (checked on the raw text, because of the colon)
const TOPIC_WITH_COLON = /(?:thema|tema|topic)\s*:\s*(.+)$/iu;

// A "topic" that really means: you choose
const ANY_TOPIC =
  /^(?:(?:etwas|was) anderes|(?:ein|einem|ein neues) (?:anderes |anderen |neues )?thema|irgendwas|irgendetwas|otra cosa|(?:otro|un|algún|algun|un nuevo) tema(?: nuevo| diferente)?|algo (?:diferente|nuevo)|cualquier cosa|something else|anything|another topic)$/u;

const NEW_TOPIC_PATTERNS: RegExp[] = [
  /(?:^| )(?:neues|anderes|n(?:ä|ae)chstes) thema(?: |$)/u,
  /thema (?:wechseln|(?:ä|ae)ndern)/u,
  /wechs\p{L}* (?:bitte )?(?:mal )?das thema/u,
  /(?:such|w(?:ä|ae)hl)\p{L}* (?:du )?(?:dir )?(?:bitte )?(?:selbst |selber )?(?:ein|das) (?:neues |anderes )?thema/u,
  /(?:^| )(?:etwas|was) anderes(?: |$)/u,
  /(?:^| )(?:otro|nuevo|siguiente) tema(?: |$)/u,
  /(?:^| )tema nuevo(?: |$)/u,
  /(?:^| )cambi\p{L}* de tema(?: |$)/u,
  /elige (?:t(?:ú|u) )?(?:un|otro|el) tema/u,
  /(?:^| )otra cosa(?: |$)/u,
  /(?:^| )(?:new|another|next|different) topic(?: |$)/u,
  /change (?:the )?topic/u,
  /(?:pick|choose) (?:a|another|the) topic/u,
  /(?:^| )something else(?: |$)/u,
];

const REPEAT_PATTERNS: RegExp[] = [
  /^(?:wie bitte|nochmal|noch einmal|bitte nochmal|bitte wiederholen|wiederhol\p{L}*.*|(?:bitte )?langsamer.*)$/u,
  /^(?:ich verstehe (?:das |dich |es )?nicht|(?:das )?verstehe ich nicht|ich habe (?:das |dich )?nicht verstanden)$/u,
  /^(?:c(?:ó|o)mo|c(?:ó|o)mo dices|perd(?:ó|o)n|otra vez(?: por favor)?|repite(?: por favor)?|repita(?: por favor)?|puedes repetir.*|m(?:á|a)s despacio.*)$/u,
  /^no (?:te |lo |la )?(?:entiendo|comprendo)(?: nada| la pregunta)?$/u,
  /^(?:what|again|repeat(?: please)?|say (?:that|it) again|i dont understand|sorry)$/u,
];

const GOODBYE =
  /^(?:adi(?:ó|o)s|hasta luego|hasta pronto|hasta ma(?:ñ|n)ana|chao|chau|nos vemos|tsch(?:ü|ue)ss|auf wiedersehen|bis bald|bis sp(?:ä|ae)ter|ciao|bye|goodbye|see you)(?: dax)?$/u;

const ASK_BACK =
  /(?:^| )(?:y t(?:ú|u)|y a ti|y usted|y vos|und du|und dir|und bei dir|and you|what about you)(?: dax)?$/u;

// Words that only German has. A message with several of them is German.
const GERMAN_WORDS = new Set([
  "ich", "du", "er", "sie", "wir", "ihr", "nicht", "kein", "keine", "keinen",
  "und", "oder", "aber", "ist", "bin", "bist", "sind", "seid", "war", "habe",
  "hast", "hat", "haben", "hatte", "das", "der", "die", "den", "dem", "ein",
  "eine", "einen", "einem", "wie", "was", "wo", "wann", "warum", "wer",
  "bitte", "danke", "kann", "kannst", "können", "möchte", "will", "willst",
  "weiß", "weiss", "mit", "für", "auf", "über", "auch", "sehr", "gern",
  "gerne", "heute", "morgen", "gestern", "mein", "meine", "meinen", "dein",
  "deine", "mir", "mich", "dir", "dich", "zu", "im", "am", "vom", "zum",
  "zur", "nein", "ja", "noch", "schon", "nur", "wenn", "weil", "dass", "mag",
  "magst", "gibt", "man", "doch", "immer", "nie", "viel", "viele", "sagen",
  "soll", "muss", "musst", "uns", "euch", "hier", "dort", "jetzt", "dann",
  "heiße", "heisse", "heißt", "heisst", "komme", "wohne", "lebe", "arbeite",
  "lerne", "spreche", "verstehe",
]);

// Words that are the same in many languages. Typed alone they are an
// answer, not a question for a translation ("Rock" as music, not a skirt).
const INTERNATIONAL_WORDS = new Set([
  "rock", "pop", "jazz", "bus", "taxi", "hotel", "film", "party", "sport",
  "tennis", "basketball", "internet", "computer", "team", "job", "baby",
  "song", "training", "pizza", "pasta", "hobby", "radio", "museum", "park",
]);

// Polite extras and articles around a topic: "über das Wetter bitte" -> "wetter"
function cleanTopic(topic: string): string {
  return normalizeText(topic)
    .replace(/ (?:bitte|mal|por favor|please)$/u, "")
    .replace(/^(?:das thema|el tema|the topic) /u, "")
    .replace(/^(?:der|die|das|den|dem|ein|eine|einen|el|la|los|las|un|una|the|a|an) /u, "")
    .trim();
}

function findTopic(input: string, text: string): string | null {
  const withColon = input.match(TOPIC_WITH_COLON);
  if (withColon) return cleanTopic(withColon[1]);

  for (const pattern of CHOOSE_TOPIC_PATTERNS) {
    const match = text.match(pattern);
    if (match?.[1]) return cleanTopic(match[1]);
  }
  return null;
}

// True for a message that is clearly German and not the learned language
export function looksGerman(text: string, targetCommonWords: string[]): boolean {
  const words = getWords(text);
  const german = words.filter((word) => GERMAN_WORDS.has(word)).length;
  if (german === 0) return false;

  const target = words.filter((word) =>
    targetCommonWords.includes(stripAccents(word)),
  ).length;
  // Short messages: one German word is enough ("nein danke", "ich weiß nicht")
  if (words.length <= 3) return target === 0;
  return german >= 2 && german > target;
}

// A single German word such as "Hund" is a silent question: what is that
// in Spanish? Words that also exist in the learned language are answers.
function isLoneGermanWord(content: TeacherContent, text: string): boolean {
  const words = getWords(text);
  if (words.length === 0 || words.length > 2) return false;
  if (words.some((word) => INTERNATIONAL_WORDS.has(word))) return false;
  if (
    words.some(
      (word) =>
        content.commonWords.includes(stripAccents(word)) ||
        isTargetWord(content.dictionary, content.articles, word),
    )
  ) {
    return false;
  }
  return translateGermanPhrase(content.dictionary, content.articles, text) !== null;
}

export function detectIntent(
  content: TeacherContent,
  input: string,
  germanHelp: boolean,
): Intent {
  const text = normalizeText(input);

  // 1. A direct question for a word always wins
  for (const { pattern, fromTarget } of TRANSLATE_PATTERNS) {
    const match = text.match(pattern);
    if (match?.[1]) {
      return { type: "translate", query: match[1], fromTarget, asked: true };
    }
  }

  // 2. Topic wishes
  const topic = findTopic(input, text);
  if (topic !== null) {
    return topic === "" || ANY_TOPIC.test(topic)
      ? { type: "newTopic" }
      : { type: "chooseTopic", topic };
  }
  if (NEW_TOPIC_PATTERNS.some((pattern) => pattern.test(text))) {
    return { type: "newTopic" };
  }

  // 3. Other requests
  if (REPEAT_PATTERNS.some((pattern) => pattern.test(text))) return { type: "repeat" };
  if (GOODBYE.test(text)) return { type: "goodbye" };

  // 4. German help is switched on: everything else is a word to translate
  if (germanHelp) {
    return { type: "translate", query: text, fromTarget: false, asked: true };
  }

  // 5. A question back: "¿Y tú?", "Und du?"
  if (ASK_BACK.test(text)) return { type: "askBack" };

  // 6. German without being asked to
  if (isLoneGermanWord(content, text)) {
    return { type: "translate", query: text, fromTarget: false, asked: false };
  }
  if (looksGerman(text, content.commonWords)) return { type: "german" };

  return { type: "answer" };
}
