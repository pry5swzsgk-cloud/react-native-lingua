export type LanguageCode = "es" | "fr" | "ja" | "ko" | "de" | "zh";

export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string; // emoji, works offline
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

export interface Lesson {
  id: string;
  unitId: string;
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

// CEFR level of a unit: A1 = beginner, A2 = elementary, B1 = intermediate
export type UnitLevel = "A1" | "A2" | "B1";

export interface Unit {
  id: string;
  languageCode: LanguageCode;
  level: UnitLevel;
  title: string;
  description: string;
  order: number;
  lessonIds: string[];
}
