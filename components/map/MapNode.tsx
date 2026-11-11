import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
import { images } from "@/constants/images";
import { colors } from "@/constants/theme";
import { LABEL_WIDTH, NODE_SIZE } from "@/lib/mapLayout";
import { Lesson } from "@/types/learning";

export type MapNodeStatus = "done" | "current" | "open";

interface MapNodeProps {
  lesson: Lesson;
  levelNumber: number;
  x: number; // center of the circle on the map
  y: number;
  status: MapNodeStatus;
  accent: string; // color of the lesson's theme
  mascotSide: "left" | "right";
  onPress: () => void;
}

const NODE_WIDTH = LABEL_WIDTH;

// One level on the map. Every level can be tapped at any time.
//   done    - colored ring with a check mark
//   current - purple ring that pulses, with Dax standing next to it
//   open    - plain ring
export function MapNode({
  lesson,
  levelNumber,
  x,
  y,
  status,
  accent,
  mascotSide,
  onPress,
}: MapNodeProps) {
  const ringColor =
    status === "done"
      ? accent
      : status === "current"
        ? colors.primary.purple
        : "#d1d5db";

  return (
    <View
      style={[styles.container, { left: x - NODE_WIDTH / 2, top: y - NODE_SIZE / 2 }]}
    >
      {status === "current" && <CurrentMarker side={mascotSide} />}

      <TouchableOpacity
        className="items-center"
        activeOpacity={0.8}
        onPress={onPress}
        accessibilityLabel={`Level ${levelNumber}: ${lesson.title}, ${status}`}
        testID={`map-node-${lesson.id}`}
      >
        <View
          className="rounded-full bg-white items-center justify-center"
          style={[styles.circle, { borderColor: ringColor }]}
        >
          <Text className="text-3xl">{lesson.icon}</Text>
          {status === "done" && (
            <View className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-success border-2 border-white items-center justify-center">
              <Ionicons name="checkmark" size={13} color="#fff" />
            </View>
          )}
        </View>

        <View className="bg-white/95 rounded-xl px-2.5 py-1 mt-1.5 items-center max-w-full">
          <Text
            className="font-poppins-semibold text-xs text-text-primary"
            numberOfLines={1}
          >
            {lesson.title}
          </Text>
          <Text className="caption">
            Level {levelNumber} · {lesson.xpReward} XP
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

// Decoration of the level the learner is on: a pulsing ring and Dax.
// It pops in after the line from the previous level has arrived.
function CurrentMarker({ side }: { side: "left" | "right" }) {
  const pulse = useSharedValue(0); // 0 → 1, repeats
  const appear = useSharedValue(0); // 0 = hidden, 1 = shown
  const bounce = useSharedValue(0); // 0 ↔ 1, Dax hops

  useEffect(() => {
    pulse.set(
      withRepeat(
        withTiming(1, { duration: 1600, easing: Easing.out(Easing.quad) }),
        -1,
      ),
    );
    appear.set(withDelay(LINE_DURATION - 200, withSpring(1)));
    bounce.set(
      withRepeat(
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.quad) }),
        -1,
        true,
      ),
    );
  }, [pulse, appear, bounce]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: 0.55 * (1 - pulse.get()) * appear.get(),
    transform: [{ scale: 1 + 0.45 * pulse.get() }],
  }));

  const mascotStyle = useAnimatedStyle(() => ({
    opacity: appear.get(),
    transform: [{ scale: appear.get() }, { translateY: -6 * bounce.get() }],
  }));

  return (
    <>
      <Animated.View style={[styles.pulse, pulseStyle]} />
      <Animated.View
        style={[
          styles.mascot,
          side === "left" ? styles.mascotLeft : styles.mascotRight,
          mascotStyle,
        ]}
        testID="map-mascot"
      >
        <Image
          source={images.mascotDino}
          style={styles.mascotImage}
          resizeMode="contain"
        />
      </Animated.View>
    </>
  );
}

// Positions, animated values and transforms stay in StyleSheet (see AGENTS.md)
const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: NODE_WIDTH,
  },
  circle: {
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderWidth: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  pulse: {
    position: "absolute",
    top: 0,
    left: (NODE_WIDTH - NODE_SIZE) / 2,
    width: NODE_SIZE,
    height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    backgroundColor: colors.primary.purple,
    pointerEvents: "none",
  },
  mascot: {
    position: "absolute",
    top: 6,
    pointerEvents: "none",
  },
  mascotLeft: { left: (NODE_WIDTH - NODE_SIZE) / 2 - 62 },
  mascotRight: { left: (NODE_WIDTH + NODE_SIZE) / 2 + 6 },
  mascotImage: { width: 56, height: 56 },
});
