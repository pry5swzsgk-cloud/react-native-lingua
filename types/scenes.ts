import { LanguageCode, UnitLevel } from "@/types/learning";

export type SceneKind = "story" | "radio" | "adventure" | "roleplay";

export type SceneStep =
  | { type: "narration"; text: string } // English, sets the scene
  | { type: "line"; speaker: string; text: string; translation: string } // spoken in the target language
  | { type: "question"; question: string; options: string[]; answer: string } // comprehension, in English
  | {
      type: "reply"; // the learner's turn: answer = text of the right option
      prompt: string;
      options: { text: string; translation: string; feedback?: string }[];
      answer: string;
    };

export interface Scene {
  id: string;
  kind: SceneKind;
  languageCode: LanguageCode;
  level: UnitLevel;
  title: string;
  description: string;
  emoji: string;
  xpReward: number;
  steps: SceneStep[];
}
