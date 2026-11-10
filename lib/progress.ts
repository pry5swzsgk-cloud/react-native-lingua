import { LESSONS } from "@/data/lessons";
import { UNITS } from "@/data/units";
import { LanguageCode, Lesson, Unit } from "@/types/learning";

// All units of a language, easiest first.
export function getUnits(languageCode: LanguageCode | null): Unit[] {
  return UNITS.filter((u) => u.languageCode === languageCode).sort(
    (a, b) => a.order - b.order,
  );
}

export function getUnitLessons(unit: Unit): Lesson[] {
  return unit.lessonIds
    .map((id) => LESSONS.find((l) => l.id === id))
    .filter((l): l is Lesson => l !== undefined);
}

// The lesson the learner should do next: the first open lesson at or above
// their starting unit. If everything there is done, fall back to any open
// lesson in an easier unit. Returns null when the whole course is finished.
export function getNextLesson(
  languageCode: LanguageCode | null,
  completedLessonIds: string[],
  startUnitOrder = 1,
): Lesson | null {
  const units = getUnits(languageCode);
  const isOpen = (lesson: Lesson) => !completedLessonIds.includes(lesson.id);

  const fromStart = units
    .filter((u) => u.order >= startUnitOrder)
    .flatMap(getUnitLessons)
    .find(isOpen);

  return fromStart ?? units.flatMap(getUnitLessons).find(isOpen) ?? null;
}

export function getUnitOfLesson(lesson: Lesson): Unit | undefined {
  return UNITS.find((u) => u.id === lesson.unitId);
}
