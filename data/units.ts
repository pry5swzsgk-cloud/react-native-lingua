import { Unit } from '@/types/learning';

// Every language has three units that get harder: A1 -> A2 -> B1.
export const UNITS: Unit[] = [
  // ─── Spanish ───────────────────────────────────────────────────────────────
  {
    id: 'es-unit-1',
    languageCode: 'es',
    level: 'A1',
    title: 'Greetings & Basics',
    description: 'Start your Spanish journey with everyday phrases',
    order: 1,
    lessonIds: ['es-lesson-1', 'es-lesson-2', 'es-lesson-3', 'es-lesson-4', 'es-lesson-5'],
  },
  {
    id: 'es-unit-2',
    languageCode: 'es',
    level: 'A2',
    title: 'Everyday Life',
    description: 'Talk about your family and your daily routine',
    order: 2,
    lessonIds: ['es-a2-lesson-1', 'es-a2-lesson-2', 'es-a2-lesson-3', 'es-a2-lesson-4', 'es-a2-lesson-5'],
  },
  {
    id: 'es-unit-3',
    languageCode: 'es',
    level: 'B1',
    title: 'Past & Future',
    description: 'Tell stories, make plans and share opinions',
    order: 3,
    lessonIds: ['es-b1-lesson-1', 'es-b1-lesson-2', 'es-b1-lesson-3', 'es-b1-lesson-4', 'es-b1-lesson-5'],
  },

  // ─── French ────────────────────────────────────────────────────────────────
  {
    id: 'fr-unit-1',
    languageCode: 'fr',
    level: 'A1',
    title: 'Bonjour! Greetings',
    description: 'Learn how to greet and introduce yourself in French',
    order: 1,
    lessonIds: ['fr-lesson-1', 'fr-lesson-2', 'fr-lesson-3', 'fr-lesson-4', 'fr-lesson-5'],
  },
  {
    id: 'fr-unit-2',
    languageCode: 'fr',
    level: 'A2',
    title: 'La vie quotidienne',
    description: 'Talk about your family and your daily routine',
    order: 2,
    lessonIds: ['fr-a2-lesson-1', 'fr-a2-lesson-2'],
  },
  {
    id: 'fr-unit-3',
    languageCode: 'fr',
    level: 'B1',
    title: 'Passé et futur',
    description: 'Tell stories, make plans and share opinions',
    order: 3,
    lessonIds: ['fr-b1-lesson-1', 'fr-b1-lesson-2'],
  },

  // ─── Japanese ──────────────────────────────────────────────────────────────
  {
    id: 'ja-unit-1',
    languageCode: 'ja',
    level: 'A1',
    title: 'はじめまして — First Steps',
    description: 'Learn essential Japanese phrases for meeting people',
    order: 1,
    lessonIds: ['ja-lesson-1', 'ja-lesson-2', 'ja-lesson-3', 'ja-lesson-4', 'ja-lesson-5'],
  },
  {
    id: 'ja-unit-2',
    languageCode: 'ja',
    level: 'A2',
    title: '毎日の生活 — Everyday Life',
    description: 'Talk about your family and your daily routine',
    order: 2,
    lessonIds: ['ja-a2-lesson-1', 'ja-a2-lesson-2'],
  },
  {
    id: 'ja-unit-3',
    languageCode: 'ja',
    level: 'B1',
    title: '過去と未来 — Past & Future',
    description: 'Tell stories, make plans and share opinions',
    order: 3,
    lessonIds: ['ja-b1-lesson-1', 'ja-b1-lesson-2'],
  },

  // ─── German ────────────────────────────────────────────────────────────────
  {
    id: 'de-unit-1',
    languageCode: 'de',
    level: 'A1',
    title: 'Hallo! German Basics',
    description: 'Master everyday German greetings and introductions',
    order: 1,
    lessonIds: ['de-lesson-1', 'de-lesson-2', 'de-lesson-3', 'de-lesson-4', 'de-lesson-5'],
  },
  {
    id: 'de-unit-2',
    languageCode: 'de',
    level: 'A2',
    title: 'Alltag',
    description: 'Talk about your family and your daily routine',
    order: 2,
    lessonIds: ['de-a2-lesson-1', 'de-a2-lesson-2'],
  },
  {
    id: 'de-unit-3',
    languageCode: 'de',
    level: 'B1',
    title: 'Vergangenheit & Zukunft',
    description: 'Tell stories, make plans and share opinions',
    order: 3,
    lessonIds: ['de-b1-lesson-1', 'de-b1-lesson-2'],
  },
];
