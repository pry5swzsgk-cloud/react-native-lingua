import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const LINE_WIDTH = 10;
export const LINE_DURATION = 900; // ms the line needs to reach the next level

interface Point {
  x: number;
  y: number;
}

interface MapLineProps {
  lessonId: string; // the level this line starts from
  from: Point;
  to: Point;
  // true once the level it starts from is completed
  filled: boolean;
  color: string;
}

// The path between two levels. It starts as a pale track; when the level
// is completed, a colored line runs along it to the next level.
export function MapLine({ lessonId, from, to, filled, color }: MapLineProps) {
  // 0 = empty track, 1 = line has reached the next level
  const progress = useSharedValue(filled ? 1 : 0);

  useEffect(() => {
    progress.set(
      withTiming(filled ? 1 : 0, {
        duration: LINE_DURATION,
        easing: Easing.inOut(Easing.cubic),
      }),
    );
  }, [filled, progress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.get() * 100}%`,
  }));

  // A straight bar from one circle center to the other: as long as their
  // distance, placed on the midpoint and turned to point at the target.
  const length = Math.hypot(to.x - from.x, to.y - from.y);
  const angle = Math.atan2(to.y - from.y, to.x - from.x);

  return (
    <View
      style={[
        styles.track,
        {
          width: length,
          left: (from.x + to.x) / 2 - length / 2,
          top: (from.y + to.y) / 2 - LINE_WIDTH / 2,
          transform: [{ rotate: `${angle}rad` }],
        },
      ]}
      testID={`map-line-${lessonId}`}
    >
      <Animated.View
        style={[styles.fill, { backgroundColor: color }, fillStyle]}
        testID={`map-line-fill-${lessonId}`}
      />
    </View>
  );
}

// Animated values and transforms stay in StyleSheet (see AGENTS.md)
const styles = StyleSheet.create({
  track: {
    position: "absolute",
    height: LINE_WIDTH,
    borderRadius: LINE_WIDTH / 2,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    overflow: "hidden",
    pointerEvents: "none",
  },
  fill: {
    height: LINE_WIDTH,
    borderRadius: LINE_WIDTH / 2,
  },
});
