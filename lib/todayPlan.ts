import type { Ionicons } from "@expo/vector-icons";
import type { Href } from "expo-router";

import { getScenes } from "@/data/scenes";
import { countMistakes } from "@/lib/mistakes";
import {
  getNextLesson,
  getUnitLessons,
  getUnitOfLesson,
  getUnits,
} from "@/lib/progress";
import { DAILY_LEVEL_GOAL } from "@/lib/rewards";
import type { LanguageCode, UnitLevel } from "@/types/learning";
import type { Scene, SceneKind } from "@/types/scenes";

// One row of "Today's plan" on the home screen
export interface PlanItem {
  id: "levels" | "review" | "listen";
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  progress?: string;
  done: boolean;
  href: Href;
}

export interface TodayPlanInput {
  languageCode: LanguageCode | null;
  completedLessonIds: string[];
  startUnitOrder: number;
  mistakes: Record<string, number>;
  masteredUnitIds: string[];
  completedSceneIds: string[];
  activitiesToday: string[];
}

const LEVEL_ORDER: UnitLevel[] = ["A1", "A2", "B1", "B2"];
const KIND_ORDER: SceneKind[] = ["story", "radio", "adventure", "roleplay"];
const KIND_TITLES: Record<SceneKind, string> = {
  story: "Story",
  radio: "Lingo Radio",
  adventure: "Adventure",
  roleplay: "Roleplay",
};

function levelIndex(level: UnitLevel): number {
  return LEVEL_ORDER.indexOf(level);
}

// Stories first, then radio, adventures, roleplay; easier levels first
function sortScenes(scenes: Scene[]): Scene[] {
  return [...scenes].sort(
    (a, b) =>
      KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind) ||
      levelIndex(a.level) - levelIndex(b.level),
  );
}

function getLevelsItem(input: TodayPlanInput): PlanItem {
  const { languageCode, completedLessonIds, startUnitOrder, activitiesToday } =
    input;
  const count = activitiesToday.filter((id) => id.startsWith("level:")).length;
  const next = getNextLesson(languageCode, completedLessonIds, startUnitOrder);

  return {
    id: "levels",
    icon: "book",
    iconBg: "#EDE9FE",
    iconColor: "#6c4ef5",
    title: `Finish ${DAILY_LEVEL_GOAL} levels`,
    subtitle: next
      ? `Next: ${next.title}`
      : "Every level is done – review any you like",
    progress: `${Math.min(count, DAILY_LEVEL_GOAL)}/${DAILY_LEVEL_GOAL}`,
    done: count >= DAILY_LEVEL_GOAL,
    href: next
      ? { pathname: "/lesson/[id]", params: { id: next.id } }
      : "/learn",
  };
}

function getReviewItem(input: TodayPlanInput): PlanItem {
  const {
    languageCode,
    completedLessonIds,
    mistakes,
    masteredUnitIds,
    activitiesToday,
  } = input;
  const did = (mode: string) => activitiesToday.includes(`training:${mode}`);
  const mistakeCount = countMistakes(languageCode, mistakes);

  // A review done today stays in the row with a check mark (the last one wins)
  const doneMode = [...activitiesToday]
    .reverse()
    .find(
      (id) =>
        id === "training:mistakes" ||
        id === "training:mastery" ||
        id === "training:vocabulary",
    );
  if (doneMode === "training:mistakes") {
    return {
      id: "review",
      icon: "bandage",
      iconBg: "#FEE2E2",
      iconColor: "#EF4444",
      title: "Fix your mistakes",
      subtitle:
        mistakeCount > 0
          ? `${mistakeCount} saved ${mistakeCount === 1 ? "mistake" : "mistakes"}`
          : "All mistakes fixed 🎉",
      done: true,
      href: { pathname: "/training/[mode]", params: { mode: "mistakes" } },
    };
  }
  if (doneMode === "training:mastery") {
    // The unit finished first that is not mastered yet, else the last mastered one
    const units = getUnits(languageCode);
    const open = units.find(
      (u) =>
        !masteredUnitIds.includes(u.id) &&
        getUnitLessons(u).length > 0 &&
        getUnitLessons(u).every((l) => completedLessonIds.includes(l.id)),
    );
    const lastMasteredId = [...masteredUnitIds]
      .reverse()
      .find((id) => units.some((u) => u.id === id));
    const unit = open ?? units.find((u) => u.id === lastMasteredId);
    return {
      id: "review",
      icon: "trophy",
      iconBg: "#FEF3C7",
      iconColor: "#D97706",
      title: "Master level",
      subtitle: unit ? unit.title : "Unit mastered 👑",
      done: true,
      href: unit
        ? { pathname: "/training/[mode]", params: { mode: "mastery", unit: unit.id } }
        : { pathname: "/training/[mode]", params: { mode: "mastery" } },
    };
  }
  if (doneMode === "training:vocabulary") {
    return {
      id: "review",
      icon: "albums",
      iconBg: "#E0F2FE",
      iconColor: "#0284C7",
      title: "Vocabulary training",
      subtitle: "Review words you learned",
      done: true,
      href: { pathname: "/training/[mode]", params: { mode: "vocabulary" } },
    };
  }

  if (mistakeCount > 0) {
    return {
      id: "review",
      icon: "bandage",
      iconBg: "#FEE2E2",
      iconColor: "#EF4444",
      title: "Fix your mistakes",
      subtitle: `${mistakeCount} saved ${mistakeCount === 1 ? "mistake" : "mistakes"}`,
      done: did("mistakes"),
      href: { pathname: "/training/[mode]", params: { mode: "mistakes" } },
    };
  }

  // First unit that is fully finished but not mastered yet
  const unit = getUnits(languageCode).find(
    (u) =>
      !masteredUnitIds.includes(u.id) &&
      getUnitLessons(u).length > 0 &&
      getUnitLessons(u).every((l) => completedLessonIds.includes(l.id)),
  );
  if (unit) {
    return {
      id: "review",
      icon: "trophy",
      iconBg: "#FEF3C7",
      iconColor: "#D97706",
      title: "Master level",
      subtitle: unit.title,
      done: did("mastery"),
      href: {
        pathname: "/training/[mode]",
        params: { mode: "mastery", unit: unit.id },
      },
    };
  }

  return {
    id: "review",
    icon: "albums",
    iconBg: "#E0F2FE",
    iconColor: "#0284C7",
    title: "Vocabulary training",
    subtitle: "Review words you learned",
    done: did("vocabulary"),
    href: { pathname: "/training/[mode]", params: { mode: "vocabulary" } },
  };
}

function getListenItem(input: TodayPlanInput): PlanItem {
  const {
    languageCode,
    completedLessonIds,
    startUnitOrder,
    completedSceneIds,
    activitiesToday,
  } = input;
  const base = {
    id: "listen" as const,
    icon: "headset" as const,
    iconBg: "#EDE9FE",
    iconColor: "#6c4ef5",
  };
  const scenes = getScenes(languageCode);

  if (scenes.length === 0) {
    return {
      ...base,
      title: "Listening training",
      subtitle: "Train your ear",
      done: activitiesToday.includes("training:listening"),
      href: { pathname: "/training/[mode]", params: { mode: "listening" } },
    };
  }

  // Show the scene finished today (the last one), so the row stays put
  const doneToday = activitiesToday
    .filter((id) => id.startsWith("scene:"))
    .map((id) => scenes.find((s) => `scene:${s.id}` === id))
    .filter((s): s is Scene => s !== undefined);
  let scene = doneToday[doneToday.length - 1];

  if (!scene) {
    // Current level = level of the next lesson's unit, else the highest unit
    const next = getNextLesson(
      languageCode,
      completedLessonIds,
      startUnitOrder,
    );
    const nextUnit = next ? getUnitOfLesson(next) : undefined;
    const units = getUnits(languageCode);
    const level = nextUnit?.level ?? units[units.length - 1]?.level ?? "A1";

    const open = sortScenes(
      scenes.filter((s) => !completedSceneIds.includes(s.id)),
    );
    scene =
      open.find((s) => levelIndex(s.level) <= levelIndex(level)) ??
      open[0] ??
      sortScenes(scenes)[0];
  }

  return {
    ...base,
    title: KIND_TITLES[scene.kind],
    subtitle: scene.title,
    done: doneToday.length > 0,
    href: { pathname: "/scene/[id]", params: { id: scene.id } },
  };
}

// The three things to do today. Empty until a language is chosen.
export function getTodayPlan(input: TodayPlanInput): PlanItem[] {
  if (!input.languageCode) return [];
  return [getLevelsItem(input), getReviewItem(input), getListenItem(input)];
}
