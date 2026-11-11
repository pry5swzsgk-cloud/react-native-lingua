import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { Theme } from "@/types/learning";

const FADE_DURATION = 700; // ms to blend from one theme to the next

// Where the theme's emojis sit on the screen (share of width and height),
// how big they are and how much they are tilted. Fixed, so it looks
// arranged rather than random.
const SPOTS = [
  { left: 0.06, top: 0.13, size: 54, tilt: -14 },
  { left: 0.74, top: 0.16, size: 46, tilt: 12 },
  { left: 0.4, top: 0.26, size: 38, tilt: -6 },
  { left: 0.8, top: 0.36, size: 58, tilt: 16 },
  { left: 0.04, top: 0.42, size: 44, tilt: 10 },
  { left: 0.46, top: 0.5, size: 50, tilt: -12 },
  { left: 0.78, top: 0.6, size: 42, tilt: -10 },
  { left: 0.1, top: 0.66, size: 56, tilt: 14 },
  { left: 0.5, top: 0.76, size: 40, tilt: 8 },
  { left: 0.8, top: 0.84, size: 52, tilt: -16 },
  { left: 0.08, top: 0.88, size: 44, tilt: -8 },
];

interface ThemeBackgroundProps {
  theme: Theme;
}

// Full-screen backdrop of the progress map. It shows the theme of the level
// being learned and blends softly into the next theme when that changes.
// The emojis drift up and down a little, so the map feels alive.
export function ThemeBackground({ theme }: ThemeBackgroundProps) {
  const [shown, setShown] = useState(theme); // fully visible
  const [incoming, setIncoming] = useState<Theme | null>(null); // fading in
  const fade = useSharedValue(0);
  const drift = useSharedValue(0); // 0 ↔ 1, shared by all emojis

  useEffect(() => {
    drift.set(
      withRepeat(
        withTiming(1, { duration: 2800, easing: Easing.inOut(Easing.sin) }),
        -1,
        true,
      ),
    );
  }, [drift]);

  useEffect(() => {
    if (theme.id === shown.id) return;

    setIncoming(theme);
    fade.set(0);
    fade.set(withTiming(1, { duration: FADE_DURATION }));

    // When the new theme is fully visible it becomes the base layer
    const timer = setTimeout(() => {
      setShown(theme);
      setIncoming(null);
    }, FADE_DURATION + 50);
    return () => clearTimeout(timer);
  }, [theme, shown.id, fade]);

  const fadeStyle = useAnimatedStyle(() => ({ opacity: fade.get() }));

  return (
    <View style={styles.fill}>
      <ThemeLayer theme={shown} drift={drift} />
      {incoming && (
        <Animated.View style={[styles.fill, fadeStyle]}>
          <ThemeLayer theme={incoming} drift={drift} />
        </Animated.View>
      )}
    </View>
  );
}

function ThemeLayer({ theme, drift }: { theme: Theme; drift: SharedValue<number> }) {
  return (
    <View
      style={[styles.fill, { backgroundColor: theme.background }]}
      testID={`theme-layer-${theme.id}`}
    >
      {SPOTS.map((spot, index) => (
        <FloatingEmoji
          key={index}
          emoji={theme.decor[index % theme.decor.length]}
          spot={spot}
          // neighbours move in opposite directions
          direction={index % 2 === 0 ? 1 : -1}
          drift={drift}
        />
      ))}
    </View>
  );
}

interface FloatingEmojiProps {
  emoji: string;
  spot: (typeof SPOTS)[number];
  direction: 1 | -1;
  drift: SharedValue<number>;
}

function FloatingEmoji({ emoji, spot, direction, drift }: FloatingEmojiProps) {
  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: (drift.get() * 2 - 1) * 7 * direction },
      { rotate: `${spot.tilt}deg` },
    ],
  }));

  return (
    <Animated.Text
      style={[
        styles.emoji,
        {
          left: `${spot.left * 100}%`,
          top: `${spot.top * 100}%`,
          fontSize: spot.size,
          lineHeight: spot.size * 1.25,
        },
        style,
      ]}
    >
      {emoji}
    </Animated.Text>
  );
}

// Animated values, transforms and absolute positions stay in StyleSheet
const styles = StyleSheet.create({
  fill: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: "none",
  },
  emoji: {
    position: "absolute",
    opacity: 0.4,
  },
});
