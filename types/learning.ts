export type LanguageCode = "es" | "fr" | "ja" | "ko" | "de" | "zh";

export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string; // emoji, works offline
  speechLocale: string; // voice used for text-to-speech, e.g. "es-ES"
  color: string;
}

export type ActivityType =
  | "vocabulary"
  | "translate"
  | "multiple-choice"
  | "listen";

export interface VocabularyItem {
  word: string;
  translation: string;
  pronunciation: string;
  emoji?: string;
}

export interface Phrase {
  text: string;
  translation: string;
  pronunciation: string;
}

export interface Activity {
  id: string;
  type: ActivityType;
  question: string;
  correctAnswer: string;
  options?: string[];
  hint?: string;
}

export interface LessonGoal {
  description: string;
  xpReward: number;
}

export interface AITeacherPrompt {
  systemPrompt: string;
  introMessage: string;
  topics: string[];
}

// What a lesson is about. The progress map shows the theme of the lesson
// the learner is working on (see data/themes.ts).
export type ThemeId =
  | "greetings"
  | "introductions"
  | "numbers"
  | "colors"
  | "actions"
  | "food"
  | "family"
  | "routine"
  | "past"
  | "plans"
  | "shopping"
  | "weather"
  | "home"
  | "travel"
  | "health"
  | "work"
  | "hobbies"
  | "music"
  | "sports"
  | "party"
  | "city"
  | "transport"
  | "technology"
  | "news"
  | "school"
  | "nature"
  | "money"
  | "art"
  | "history"
  | "goals";

export interface Theme {
  id: ThemeId;
  title: string;
  emoji: string;
  background: string; // soft color behind the map
  accent: string; // stronger color for lines and badges
  decor: string[]; // emojis scattered over the background
}

export interface Lesson {
  id: string;
  unitId: string;
  theme: ThemeId;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  goals: LessonGoal[];
  vocabulary: VocabularyItem[];
  phrases: Phrase[];
  activities: Activity[];
  aiTeacherPrompt?: AITeacherPrompt;
}

// CEFR level of a unit: A1 = beginner, A2 = elementary, B1 = intermediate,
// B2 = upper intermediate
export type UnitLevel = "A1" | "A2" | "B1" | "B2";

export interface Unit {
  id: string;
  languageCode: LanguageCode;
  level: UnitLevel;
  title: string;
  description: string;
  order: number;
  lessonIds: string[];
}

// A short spoken dialog: Dax asks a question, the learner answers.
// `keywords` are lowercase words without accents that fit most good answers.
// `wrongReplies` are correct sentences that do not answer the question.
export interface DialogItem {
  id: string;
  languageCode: LanguageCode;
  level: UnitLevel;
  question: string;
  questionTranslation: string;
  reply: string;
  replyTranslation: string;
  keywords: string[];
  wrongReplies: string[];
}
