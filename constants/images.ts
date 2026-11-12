import chestDailyClosed from "@/assets/images/chest-daily-closed.png";
import chestDailyOpen from "@/assets/images/chest-daily-open.png";
import chestWeeklyClosed from "@/assets/images/chest-weekly-closed.png";
import chestWeeklyOpen from "@/assets/images/chest-weekly-open.png";
import earth from "@/assets/images/earth.png";
import flame from "@/assets/images/flame.png";
import mascotBunny from "@/assets/images/mascot-bunny.png";
import mascotCat from "@/assets/images/mascot-cat.png";
import mascotDino from "@/assets/images/mascot-dino.png";
import mascotDog from "@/assets/images/mascot-dog.png";
import mascotFox from "@/assets/images/mascot-fox.png";
import mascotLogo from "@/assets/images/mascot-logo.png";
import mascotOwl from "@/assets/images/mascot-owl.png";
import mascotPenguin from "@/assets/images/mascot-penguin.png";
import mascotWelcome from "@/assets/images/mascot-welcome.png";
import palace from "@/assets/images/palace.png";
import { MascotId } from "@/data/mascots";

export const images = {
  chestDailyClosed,
  chestDailyOpen,
  chestWeeklyClosed,
  chestWeeklyOpen,
  earth,
  flame,
  mascotBunny,
  mascotCat,
  mascotDino,
  mascotDog,
  mascotFox,
  mascotLogo,
  mascotOwl,
  mascotPenguin,
  mascotWelcome,
  palace,
} as const;

// The picture of every mascot in data/mascots.ts
export const mascotImages: Record<MascotId, typeof mascotDino> = {
  dino: mascotDino,
  dog: mascotDog,
  cat: mascotCat,
  penguin: mascotPenguin,
  fox: mascotFox,
  owl: mascotOwl,
  bunny: mascotBunny,
};
