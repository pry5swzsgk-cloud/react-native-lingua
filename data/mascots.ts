// The mascots of the app. All of them are our own characters.
//
// Dax and Bo are there from the start. The others are collected piece by
// piece from reward chests (see lib/rewards.ts), in the order listed here.
// Their pictures live in constants/images.ts (mascotImages).

export type MascotId =
  | "dino"
  | "dog"
  | "cat"
  | "penguin"
  | "fox"
  | "owl"
  | "bunny";

export interface Mascot {
  id: MascotId;
  name: string;
  description: string;
  isStarter: boolean; // owned from the start, nothing to collect
}

export const MASCOTS: Mascot[] = [
  { id: "dino", name: "Dax", description: "A curious little dino", isStarter: true },
  { id: "dog", name: "Bo", description: "A cheerful puppy", isStarter: true },
  { id: "cat", name: "Mimi", description: "A clever cat", isStarter: false },
  { id: "penguin", name: "Pico", description: "A cool penguin", isStarter: false },
  { id: "fox", name: "Rumi", description: "A quick fox", isStarter: false },
  { id: "owl", name: "Olli", description: "A wise owl", isStarter: false },
  { id: "bunny", name: "Coco", description: "A bouncy bunny", isStarter: false },
];

export const DEFAULT_MASCOT_ID: MascotId = "dino";

// The mascot with this id (Dax if the id is unknown)
export function getMascot(id: string): Mascot {
  return MASCOTS.find((mascot) => mascot.id === id) ?? MASCOTS[0];
}
