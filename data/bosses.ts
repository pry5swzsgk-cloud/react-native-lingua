import { BossKind, Lesson, Phrase, VocabularyItem } from "@/types/learning";

// A boss is a review level made from the words and phrases of other lessons.
export interface BossDef {
  id: string;
  unitId: string;
  kind: BossKind;
  title: string;
  description: string;
  sourceLessonIds: string[];
}

export const BOSSES: BossDef[] = [
  {
    id: "es-a1-miniboss",
    unitId: "es-unit-1",
    kind: "mini",
    title: "Mini boss",
    description: "A harder review of the last levels.",
    sourceLessonIds: ["es-lesson-1", "es-lesson-2", "es-lesson-3"],
  },
  {
    id: "es-a1-boss",
    unitId: "es-unit-1",
    kind: "final",
    title: "A1 final boss",
    description: "The big test for everything in A1.",
    sourceLessonIds: ["es-lesson-1", "es-lesson-2", "es-lesson-3", "es-lesson-4", "es-lesson-5"],
  },
  {
    id: "es-a2-miniboss",
    unitId: "es-unit-2",
    kind: "mini",
    title: "Mini boss",
    description: "A harder review of the last levels.",
    sourceLessonIds: ["es-a2-lesson-1", "es-a2-lesson-2", "es-a2-lesson-3"],
  },
  {
    id: "es-a2-boss",
    unitId: "es-unit-2",
    kind: "final",
    title: "A2 final boss",
    description: "The big test for everything in A2.",
    sourceLessonIds: ["es-a2-lesson-1", "es-a2-lesson-2", "es-a2-lesson-3", "es-a2-lesson-4", "es-a2-lesson-5"],
  },
  {
    id: "es-b1-miniboss-1",
    unitId: "es-unit-3",
    kind: "mini",
    title: "Mini boss",
    description: "A harder review of the last levels.",
    sourceLessonIds: ["es-b1-lesson-1", "es-b1-lesson-2", "es-b1-lesson-3", "es-b1-lesson-4", "es-b1-lesson-5"],
  },
  {
    id: "es-b1-miniboss-2",
    unitId: "es-unit-4",
    kind: "mini",
    title: "Mini boss",
    description: "A harder review of the last levels.",
    sourceLessonIds: ["es-b1-lesson-6", "es-b1-lesson-7", "es-b1-lesson-8", "es-b1-lesson-9", "es-b1-lesson-10"],
  },
  {
    id: "es-b1-boss",
    unitId: "es-unit-5",
    kind: "final",
    title: "B1 final boss",
    description: "The big test for everything in B1.",
    sourceLessonIds: ["es-b1-lesson-1", "es-b1-lesson-2", "es-b1-lesson-3", "es-b1-lesson-4", "es-b1-lesson-5", "es-b1-lesson-6", "es-b1-lesson-7", "es-b1-lesson-8", "es-b1-lesson-9", "es-b1-lesson-10", "es-b1-lesson-11", "es-b1-lesson-12", "es-b1-lesson-13", "es-b1-lesson-14", "es-b1-lesson-15"],
  },
  {
    id: "es-b2-miniboss",
    unitId: "es-unit-6",
    kind: "mini",
    title: "Mini boss",
    description: "A harder review of the last levels.",
    sourceLessonIds: ["es-b2-lesson-1", "es-b2-lesson-2", "es-b2-lesson-3", "es-b2-lesson-4", "es-b2-lesson-5"],
  },
  {
    id: "es-b2-boss",
    unitId: "es-unit-7",
    kind: "final",
    title: "B2 final boss",
    description: "The big test for everything in B2.",
    sourceLessonIds: ["es-b2-lesson-1", "es-b2-lesson-2", "es-b2-lesson-3", "es-b2-lesson-4", "es-b2-lesson-5", "es-b2-lesson-6", "es-b2-lesson-7", "es-b2-lesson-8", "es-b2-lesson-9", "es-b2-lesson-10"],
  },
  {
    id: "fr-a1-miniboss",
    unitId: "fr-unit-1",
    kind: "mini",
    title: "Mini boss",
    description: "A harder review of the last levels.",
    sourceLessonIds: ["fr-lesson-1", "fr-lesson-2", "fr-lesson-3"],
  },
  {
    id: "fr-a1-boss",
    unitId: "fr-unit-1",
    kind: "final",
    title: "A1 final boss",
    description: "The big test for everything in A1.",
    sourceLessonIds: ["fr-lesson-1", "fr-lesson-2", "fr-lesson-3", "fr-lesson-4", "fr-lesson-5"],
  },
  {
    id: "fr-a2-boss",
    unitId: "fr-unit-2",
    kind: "final",
    title: "A2 final boss",
    description: "The big test for everything in A2.",
    sourceLessonIds: ["fr-a2-lesson-1", "fr-a2-lesson-2"],
  },
  {
    id: "fr-b1-boss",
    unitId: "fr-unit-3",
    kind: "final",
    title: "B1 final boss",
    description: "The big test for everything in B1.",
    sourceLessonIds: ["fr-b1-lesson-1", "fr-b1-lesson-2"],
  },
  {
    id: "ja-a1-miniboss",
    unitId: "ja-unit-1",
    kind: "mini",
    title: "Mini boss",
    description: "A harder review of the last levels.",
    sourceLessonIds: ["ja-lesson-1", "ja-lesson-2", "ja-lesson-3"],
  },
  {
    id: "ja-a1-boss",
    unitId: "ja-unit-1",
    kind: "final",
    title: "A1 final boss",
    description: "The big test for everything in A1.",
    sourceLessonIds: ["ja-lesson-1", "ja-lesson-2", "ja-lesson-3", "ja-lesson-4", "ja-lesson-5"],
  },
  {
    id: "ja-a2-boss",
    unitId: "ja-unit-2",
    kind: "final",
    title: "A2 final boss",
    description: "The big test for everything in A2.",
    sourceLessonIds: ["ja-a2-lesson-1", "ja-a2-lesson-2"],
  },
  {
    id: "ja-b1-boss",
    unitId: "ja-unit-3",
    kind: "final",
    title: "B1 final boss",
    description: "The big test for everything in B1.",
    sourceLessonIds: ["ja-b1-lesson-1", "ja-b1-lesson-2"],
  },
  {
    id: "de-a1-miniboss",
    unitId: "de-unit-1",
    kind: "mini",
    title: "Mini boss",
    description: "A harder review of the last levels.",
    sourceLessonIds: ["de-lesson-1", "de-lesson-2", "de-lesson-3"],
  },
  {
    id: "de-a1-boss",
    unitId: "de-unit-1",
    kind: "final",
    title: "A1 final boss",
    description: "The big test for everything in A1.",
    sourceLessonIds: ["de-lesson-1", "de-lesson-2", "de-lesson-3", "de-lesson-4", "de-lesson-5"],
  },
  {
    id: "de-a2-boss",
    unitId: "de-unit-2",
    kind: "final",
    title: "A2 final boss",
    description: "The big test for everything in A2.",
    sourceLessonIds: ["de-a2-lesson-1", "de-a2-lesson-2"],
  },
  {
    id: "de-b1-boss",
    unitId: "de-unit-3",
    kind: "final",
    title: "B1 final boss",
    description: "The big test for everything in B1.",
    sourceLessonIds: ["de-b1-lesson-1", "de-b1-lesson-2"],
  },
];

// XP for finishing a boss and number of exercises in its session
export const BOSS_XP: Record<BossKind, number> = { mini: 30, final: 60 };
export const BOSS_SESSION_SIZE: Record<BossKind, number> = {
  mini: 10,
  final: 16,
};

// Turns every boss definition into a lesson. Words and phrases come from the
// source lessons (in order, without duplicates). Missing sources are skipped.
export function buildBossLessons(base: Lesson[]): Lesson[] {
  return BOSSES.map((boss) => {
    const vocabulary: VocabularyItem[] = [];
    const phrases: Phrase[] = [];
    const words = new Set<string>();
    const texts = new Set<string>();

    for (const sourceId of boss.sourceLessonIds) {
      const source = base.find((lesson) => lesson.id === sourceId);
      if (!source) continue;
      for (const item of source.vocabulary) {
        if (words.has(item.word)) continue;
        words.add(item.word);
        vocabulary.push(item);
      }
      for (const phrase of source.phrases) {
        if (texts.has(phrase.text)) continue;
        texts.add(phrase.text);
        phrases.push(phrase);
      }
    }

    return {
      id: boss.id,
      unitId: boss.unitId,
      theme: "boss",
      title: boss.title,
      description: boss.description,
      icon: boss.kind === "mini" ? "👾" : "🐲",
      xpReward: BOSS_XP[boss.kind],
      goals: [],
      vocabulary,
      phrases,
      activities: [],
      boss: { kind: boss.kind, sourceLessonIds: boss.sourceLessonIds },
    };
  });
}
