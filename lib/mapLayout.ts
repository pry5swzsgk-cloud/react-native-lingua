import { getUnitLessons } from "@/lib/progress";
import { Lesson, Unit } from "@/types/learning";

// Works out where everything sits on the progress map. The map is one long
// column: a banner for each unit, followed by its levels (lessons), which
// wander left and right like a path.

export const NODE_SIZE = 72; // diameter of a level circle
export const MAX_MAP_WIDTH = 480; // keeps the path compact on tablets
const ROW_HEIGHT = 136; // distance from one level to the next
const UNIT_BANNER_HEIGHT = 96; // room for a unit banner
const TOP_PADDING = 8;
// Horizontal position of a level as a share of the map width
const X_PATTERN = [0.5, 0.73, 0.5, 0.27];

export interface MapNodeLayout {
  lesson: Lesson;
  unit: Unit;
  levelNumber: number; // 1, 2, 3 … across the whole course
  x: number; // center of the circle
  y: number;
}

export interface MapUnitLayout {
  unit: Unit;
  lessons: Lesson[];
  y: number; // top of the banner
}

export interface MapLayout {
  units: MapUnitLayout[];
  nodes: MapNodeLayout[];
  height: number;
}

export function buildMapLayout(units: Unit[], width: number): MapLayout {
  const unitLayouts: MapUnitLayout[] = [];
  const nodes: MapNodeLayout[] = [];
  let y = TOP_PADDING;

  for (const unit of units) {
    const lessons = getUnitLessons(unit);
    unitLayouts.push({ unit, lessons, y });
    y += UNIT_BANNER_HEIGHT;

    for (const lesson of lessons) {
      nodes.push({
        lesson,
        unit,
        levelNumber: nodes.length + 1,
        x: Math.round(width * X_PATTERN[nodes.length % X_PATTERN.length]),
        y: y + NODE_SIZE / 2,
      });
      y += ROW_HEIGHT;
    }
  }

  return { units: unitLayouts, nodes, height: y };
}
