import { getUnitLessons } from "@/lib/progress";
import { Lesson, Unit } from "@/types/learning";

// Works out where everything sits on the progress map. The map is one long
// column: a banner for each unit, followed by its levels (lessons), which
// wander left and right like a path.
//
// The path looks random, but every level always lands on the same spot:
// its position is "rolled" from its lesson id. So the map never jumps
// around between visits.

export const NODE_SIZE = 72; // diameter of a level circle
export const LABEL_WIDTH = 168; // a level's touch area: circle plus title
export const MAX_MAP_WIDTH = 480; // keeps the path compact on tablets
export const MASCOT_SIZE = 56; // the mascot's picture on the map
const MASCOT_GAP = 6; // space between a level circle and the mascot
const MIN_ROW_HEIGHT = 118; // smallest distance from one level to the next
const MAX_ROW_HEIGHT = 160; // largest distance
const UNIT_BANNER_HEIGHT = 96; // room for a unit banner
const TOP_PADDING = 8;
const SIDE_PADDING = 6; // space between a title and the screen edge
// Each step moves at least this share of the free width sideways, so the
// path keeps winding instead of going straight down.
const MIN_SIDE_STEP = 0.3;

// A random number between 0 and 1 that is always the same for the same text
// (a small hash function: FNV-1a, then mixed so that texts which differ only
// in their last letter, like "es-lesson-1" and "es-lesson-2", still get very
// different numbers).
function stableRandom(text: string): number {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x85ebca6b);
  hash ^= hash >>> 13;
  hash = Math.imul(hash, 0xc2b2ae35);
  hash ^= hash >>> 16;
  return (hash >>> 0) / 4294967295;
}

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

  // Titles must stay on screen, so the circles keep away from the edges
  const minX = LABEL_WIDTH / 2 + SIDE_PADDING;
  const maxX = Math.max(minX, width - LABEL_WIDTH / 2 - SIDE_PADDING);
  const range = maxX - minX;
  let share = 0.5; // the first level starts in the middle

  for (const unit of units) {
    const lessons = getUnitLessons(unit);
    unitLayouts.push({ unit, lessons, y });
    y += UNIT_BANNER_HEIGHT;

    for (const lesson of lessons) {
      if (nodes.length > 0) {
        // Roll a new sideways position, far enough from the previous one
        const roll = stableRandom(lesson.id);
        const left = share - MIN_SIDE_STEP; // room for a step to the left
        const right = 1 - share - MIN_SIDE_STEP; // room to the right
        const goLeft = right <= 0 || (left > 0 && roll < left / (left + right));
        share = goLeft
          ? stableRandom(lesson.id + "x") * left
          : share + MIN_SIDE_STEP + stableRandom(lesson.id + "x") * right;
      }

      nodes.push({
        lesson,
        unit,
        levelNumber: nodes.length + 1,
        x: Math.round(minX + share * range),
        y: y + NODE_SIZE / 2,
      });
      y +=
        MIN_ROW_HEIGHT +
        stableRandom(lesson.id + "y") * (MAX_ROW_HEIGHT - MIN_ROW_HEIGHT);
    }
  }

  return { units: unitLayouts, nodes, height: y };
}

// Where the mascot stands at a level: next to the circle, on the side with
// more room. Returns the center of its picture.
export function getMascotSpot(
  node: { x: number; y: number },
  width: number,
): { x: number; y: number } {
  const side = node.x > width / 2 ? -1 : 1; // -1 = left of the circle
  return {
    x: node.x + side * (NODE_SIZE / 2 + MASCOT_GAP + MASCOT_SIZE / 2),
    y: node.y - NODE_SIZE / 2 + MASCOT_GAP + MASCOT_SIZE / 2,
  };
}
