import { LanguageCode, ThemeId } from "@/types/learning";

// Something Dax says: in the language being learned, plus what it means in
// German (the learner's own language, shown on request).
export interface TeacherLine {
  text: string;
  translation: string;
}

export interface TeacherQuestion {
  ask: TeacherLine;
  // A way to begin the answer, offered when the learner is stuck
  starter: TeacherLine;
  // Dax's own answer, used when the learner asks "¿Y tú?"
  myAnswer: TeacherLine;
  // Special replies when the answer contains one of these words
  reactions?: { keywords: string[]; say: TeacherLine }[];
}

export interface TeacherTopic {
  id: string;
  emoji: string;
  title: TeacherLine;
  // Words in any language that pick this topic ("essen", "food", "comida")
  keywords: string[];
  // Lesson themes this topic goes well with
  themes?: ThemeId[];
  intro: TeacherLine;
  questions: TeacherQuestion[];
}

// [German, target language]. "A|B" lists German words with the same meaning,
// "x / y" lists alternative translations.
export type DictionaryEntry = [german: string, target: string];

// The fixed things Dax says. {topic} and {word} are filled in later.
export interface TeacherLines {
  greeting: TeacherLine;
  leadNewTopic: TeacherLine; // the learner asked for a new topic
  leadChosenTopic: TeacherLine; // the learner named a topic
  leadNextTopic: TeacherLine; // moving on after a finished topic
  customTopicIntro: TeacherLine; // uses {topic}
  askMore: TeacherLine;
  starterIntro: TeacherLine;
  repeat: TeacherLine;
  useTargetLanguage: TeacherLine;
  wordFound: TeacherLine;
  wordNotFound: TeacherLine; // uses {word}
  goodQuestion: TeacherLine;
  topicFinished: TeacherLine;
  pause: TeacherLine;
  noQuestion: TeacherLine;
  goodbye: TeacherLine;
}

// Everything Dax needs to hold conversations in one language
export interface TeacherContent {
  languageCode: LanguageCode;
  topics: TeacherTopic[];
  // Questions that fit any topic the learner comes up with
  genericQuestions: TeacherQuestion[];
  dictionary: DictionaryEntry[];
  lines: TeacherLines;
  acknowledgements: TeacherLine[];
  positiveReactions: TeacherLine[];
  negativeReactions: TeacherLine[];
  // Word lists that help Dax understand the learner a little
  articles: string[];
  commonWords: string[];
  positiveWords: string[];
  negativeWords: string[];
}
