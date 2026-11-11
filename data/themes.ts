import { Theme, ThemeId } from "@/types/learning";

// Every lesson has a theme. The progress map paints its background in the
// theme of the lesson you are learning right now: a soft color plus a few
// matching emojis. Everything is drawn on the device, no images needed.
export const THEMES: Record<ThemeId, Theme> = {
  greetings: {
    id: "greetings",
    title: "Greetings",
    emoji: "👋",
    background: "#FFF3D1",
    accent: "#F5A300",
    decor: ["👋", "☀️", "😊", "🌙", "💬"],
  },
  introductions: {
    id: "introductions",
    title: "Introductions",
    emoji: "🙋",
    background: "#E1F0FF",
    accent: "#4D88FF",
    decor: ["🙋", "🤝", "🌍", "🏷️", "💬"],
  },
  numbers: {
    id: "numbers",
    title: "Numbers",
    emoji: "🔢",
    background: "#E2F7E9",
    accent: "#21C16B",
    decor: ["🔢", "🧮", "🎲", "✏️", "💯"],
  },
  colors: {
    id: "colors",
    title: "Colors",
    emoji: "🎨",
    background: "#FCE6F1",
    accent: "#E84C9A",
    decor: ["🎨", "🌈", "🖌️", "🖍️", "🦜"],
  },
  actions: {
    id: "actions",
    title: "Everyday Actions",
    emoji: "🏃",
    background: "#ECE7FF",
    accent: "#6C4EF5",
    decor: ["🏃", "📖", "👀", "✍️", "🎧"],
  },
  food: {
    id: "food",
    title: "Food & Drinks",
    emoji: "☕",
    background: "#F6E9D8",
    accent: "#B5733A",
    decor: ["☕", "🥐", "🍰", "🍵", "🍽️"],
  },
  family: {
    id: "family",
    title: "Family",
    emoji: "👨‍👩‍👧",
    background: "#FFE7DD",
    accent: "#FF7A59",
    decor: ["👨‍👩‍👧", "🏠", "❤️", "👵", "🧸"],
  },
  routine: {
    id: "routine",
    title: "Daily Routine",
    emoji: "⏰",
    background: "#DDF2FA",
    accent: "#1FA2C9",
    decor: ["⏰", "🌅", "🥣", "🚿", "🛏️"],
  },
  past: {
    id: "past",
    title: "The Past",
    emoji: "📅",
    background: "#F2ECD6",
    accent: "#A08A4F",
    decor: ["📅", "🎬", "🕰️", "📷", "🗓️"],
  },
  plans: {
    id: "plans",
    title: "Plans & Opinions",
    emoji: "💭",
    background: "#D9F4EE",
    accent: "#12A594",
    decor: ["✈️", "💭", "🚀", "🌊", "🗺️"],
  },
};
