import { SPANISH_TEACHER } from "@/data/teacher/spanish";
import { LanguageCode } from "@/types/learning";
import { TeacherContent } from "@/types/teacher";

// Languages Dax can hold conversations in. More can be added by writing
// another content file like data/teacher/spanish.ts.
const TEACHERS: Partial<Record<LanguageCode, TeacherContent>> = {
  es: SPANISH_TEACHER,
};

export function getTeacherContent(
  languageCode: LanguageCode | null,
): TeacherContent | null {
  return (languageCode && TEACHERS[languageCode]) || null;
}
