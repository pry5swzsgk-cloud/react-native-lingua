import { Unit } from '@/types/learning';

// Units get harder from top to bottom: A1 -> A2 -> B1 -> B2. Every language
// has A1, A2 and B1; Spanish goes on with more B1 units and two B2 units.
// Boss levels (data/bosses.ts) sit in lessonIds like lessons: mini bosses after
// the 3rd lesson or at the end of a unit, final bosses at the end of the last unit of a level.
export const UNITS: Unit[] = [
  // ─── Spanish ───────────────────────────────────────────────────────────────
  {
    id: 'es-unit-1',
    languageCode: 'es',
    level: 'A1',
    title: 'Greetings & Basics',
    description: 'Start your Spanish journey with everyday phrases',
    order: 1,
    lessonIds: ['es-lesson-1', 'es-lesson-2', 'es-lesson-3', 'es-a1-miniboss', 'es-lesson-4', 'es-lesson-5', 'es-a1-boss'],
  },
  {
    id: 'es-unit-2',
    languageCode: 'es',
    level: 'A2',
    title: 'Everyday Life',
    description: 'Talk about your family and your daily routine',
    order: 2,
    lessonIds: ['es-a2-lesson-1', 'es-a2-lesson-2', 'es-a2-lesson-3', 'es-a2-miniboss', 'es-a2-lesson-4', 'es-a2-lesson-5', 'es-a2-boss'],
  },
  {
    id: 'es-unit-3',
    languageCode: 'es',
    level: 'B1',
    title: 'Past & Future',
    description: 'Tell stories, make plans and share opinions',
    order: 3,
    lessonIds: ['es-b1-lesson-1', 'es-b1-lesson-2', 'es-b1-lesson-3', 'es-b1-lesson-4', 'es-b1-lesson-5', 'es-b1-miniboss-1'],
  },

  {
    id: 'es-unit-4',
    languageCode: 'es',
    level: 'B1',
    title: 'Leisure & Culture',
    description: 'Talk about hobbies, music, sport and parties',
    order: 4,
    lessonIds: ['es-b1-lesson-6', 'es-b1-lesson-7', 'es-b1-lesson-8', 'es-b1-lesson-9', 'es-b1-lesson-10', 'es-b1-miniboss-2'],
  },
  {
    id: 'es-unit-5',
    languageCode: 'es',
    level: 'B1',
    title: 'City Life',
    description: 'Find your way and get things done in town',
    order: 5,
    lessonIds: ['es-b1-lesson-11', 'es-b1-lesson-12', 'es-b1-lesson-13', 'es-b1-lesson-14', 'es-b1-lesson-15', 'es-b1-boss'],
  },
  {
    id: 'es-unit-6',
    languageCode: 'es',
    level: 'B2',
    title: 'Ideas & Society',
    description: 'Share your views on school, nature, money and relationships',
    order: 6,
    lessonIds: ['es-b2-lesson-1', 'es-b2-lesson-2', 'es-b2-lesson-3', 'es-b2-lesson-4', 'es-b2-lesson-5', 'es-b2-miniboss'],
  },
  {
    id: 'es-unit-7',
    languageCode: 'es',
    level: 'B2',
    title: 'Career & Culture',
    description: 'Go further with work, art, history and big goals',
    order: 7,
    lessonIds: ['es-b2-lesson-6', 'es-b2-lesson-7', 'es-b2-lesson-8', 'es-b2-lesson-9', 'es-b2-lesson-10', 'es-b2-boss'],
  },

  // ─── French ────────────────────────────────────────────────────────────────
  {
    id: 'fr-unit-1',
    languageCode: 'fr',
    level: 'A1',
    title: 'Bonjour! Greetings',
    description: 'Learn how to greet and introduce yourself in French',
    order: 1,
    lessonIds: ['fr-lesson-1', 'fr-lesson-2', 'fr-lesson-3', 'fr-a1-miniboss', 'fr-lesson-4', 'fr-lesson-5', 'fr-a1-boss'],
  },
  {
    id: 'fr-unit-2',
    languageCode: 'fr',
    level: 'A2',
    title: 'La vie quotidienne',
    description: 'Talk about your family and your daily routine',
    order: 2,
    lessonIds: ['fr-a2-lesson-1', 'fr-a2-lesson-2', 'fr-a2-boss'],
  },
  {
    id: 'fr-unit-3',
    languageCode: 'fr',
    level: 'B1',
    title: 'Passé et futur',
    description: 'Tell stories, make plans and share opinions',
    order: 3,
    lessonIds: ['fr-b1-lesson-1', 'fr-b1-lesson-2', 'fr-b1-boss'],
  },

  // ─── Japanese ──────────────────────────────────────────────────────────────
  {
    id: 'ja-unit-1',
    languageCode: 'ja',
    level: 'A1',
    title: 'はじめまして — First Steps',
    description: 'Learn essential Japanese phrases for meeting people',
    order: 1,
    lessonIds: ['ja-lesson-1', 'ja-lesson-2', 'ja-lesson-3', 'ja-a1-miniboss', 'ja-lesson-4', 'ja-lesson-5', 'ja-a1-boss'],
  },
  {
    id: 'ja-unit-2',
    languageCode: 'ja',
    level: 'A2',
    title: '毎日の生活 — Everyday Life',
    description: 'Talk about your family and your daily routine',
    order: 2,
    lessonIds: ['ja-a2-lesson-1', 'ja-a2-lesson-2', 'ja-a2-boss'],
  },
  {
    id: 'ja-unit-3',
    languageCode: 'ja',
    level: 'B1',
    title: '過去と未来 — Past & Future',
    description: 'Tell stories, make plans and share opinions',
    order: 3,
    lessonIds: ['ja-b1-lesson-1', 'ja-b1-lesson-2', 'ja-b1-boss'],
  },

  // ─── German ────────────────────────────────────────────────────────────────
  {
    id: 'de-unit-1',
    languageCode: 'de',
    level: 'A1',
    title: 'Hallo! German Basics',
    description: 'Master everyday German greetings and introductions',
    order: 1,
    lessonIds: ['de-lesson-1', 'de-lesson-2', 'de-lesson-3', 'de-a1-miniboss', 'de-lesson-4', 'de-lesson-5', 'de-a1-boss'],
  },
  {
    id: 'de-unit-2',
    languageCode: 'de',
    level: 'A2',
    title: 'Alltag',
    description: 'Talk about your family and your daily routine',
    order: 2,
    lessonIds: ['de-a2-lesson-1', 'de-a2-lesson-2', 'de-a2-boss'],
  },
  {
    id: 'de-unit-3',
    languageCode: 'de',
    level: 'B1',
    title: 'Vergangenheit & Zukunft',
    description: 'Tell stories, make plans and share opinions',
    order: 3,
    lessonIds: ['de-b1-lesson-1', 'de-b1-lesson-2', 'de-b1-boss'],
  },
];
