import { useEffect } from "react";
import { Image, StyleSheet } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { LINE_DURATION } from "@/components/map/MapLine";
import { mascotImages } from "@/constants/images";
import { Mascot } from "@/data/mascots";
import { MASCOT_SIZE } from "@/lib/mapLayout";

const HOPS = 3; // hops on the way from one level to the next

interface MapMascotProps {
  mascot: Mascot;
  // Where the mascot stands: the center of its picture on the map
  x: number;
  y: number;
}

// The learner's mascot on the progress map. It stands next to the current
// level and bobs a little. When that level is finished, it hops along to
// the next one while the line is drawn.
export function MapMascot({ mascot, x, y }: MapMascotProps) {
  const left = useSharedValue(x - MASCOT_SIZE / 2);
  const top = useSharedValue(y - MASCOT_SIZE / 2);
  const appear = useSharedValue(0); // 0 = hidden, 1 = shown
  const bob = useSharedValue(0); // 0 ↔ 1, gentle movement while standing
  const hop = useSharedValue(0); // 0 ↔ 1, hops while walking

  // Pop in once, then keep bobbing
  useEffect(() => {
    appear.set(withDelay(150, withSpring(1)));
    bob.set(
      withRepeat(
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.quad) }),
        -1,
        true,
      ),
    );
  }, [appear, bob]);

  // Walk to the new spot when the current level changes. It takes as long
  // as the line needs, so both arrive together.
  useEffect(() => {
    const targetLeft = x - MASCOT_SIZE / 2;
    const targetTop = y - MASCOT_SIZE / 2;
    // Already there (for example when the map opens): no need to walk
    if (left.get() === targetLeft && top.get() === targetTop) return;

    const walk = {
      duration: LINE_DURATION,
      easing: Easing.inOut(Easing.cubic),
    };
    left.set(withTiming(targetLeft, walk));
    top.set(withTiming(targetTop, walk));
    // Up and down counts as two steps, so the mascot lands on the ground
    hop.set(
      withRepeat(
        withTiming(1, {
          duration: LINE_DURATION / (HOPS * 2),
          easing: Easing.out(Easing.quad),
        }),
        HOPS * 2,
        true,
      ),
    );
  }, [x, y, left, top, hop]);

  const mascotStyle = useAnimatedStyle(() => ({
    opacity: appear.get(),
    transform: [
      { translateX: left.get() },
      { translateY: top.get() - 5 * bob.get() - 12 * hop.get() },
      { scale: appear.get() },
    ],
  }));

  return (
    <Animated.View
      style={[styles.mascot, mascotStyle]}
      accessibilityLabel={`${mascot.name}, your mascot`}
      testID="map-mascot"
    >
      <Image
        source={mascotImages[mascot.id]}
        style={styles.image}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

// Positions, animated values and transforms stay in StyleSheet (see AGENTS.md)
const styles = StyleSheet.create({
  mascot: {
    position: "absolute",
    top: 0,
    left: 0,
    pointerEvents: "none",
  },
  image: { width: MASCOT_SIZE, height: MASCOT_SIZE },
});
