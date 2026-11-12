import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
  onPress: () => void;
}

const NODE_WIDTH = LABEL_WIDTH;

// One level on the map. Every level can be tapped at any time.
//   done    - colored ring with a check mark
//   current - purple ring that pulses (the mascot stands next to it,
//             see MapMascot)
//   open    - plain ring
export function MapNode({
  lesson,
  levelNumber,
  x,
  y,
  status,
  accent,
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
      {status === "current" && <CurrentPulse />}

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

// The pulsing ring around the level the learner is on. It appears when
// the line from the previous level has arrived.
function CurrentPulse() {
  const pulse = useSharedValue(0); // 0 → 1, repeats
  const appear = useSharedValue(0); // 0 = hidden, 1 = shown

  useEffect(() => {
    pulse.set(
      withRepeat(
        withTiming(1, { duration: 1600, easing: Easing.out(Easing.quad) }),
        -1,
      ),
    );
    appear.set(withDelay(LINE_DURATION - 200, withSpring(1)));
  }, [pulse, appear]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: 0.55 * (1 - pulse.get()) * appear.get(),
    transform: [{ scale: 1 + 0.45 * pulse.get() }],
  }));

  return <Animated.View style={[styles.pulse, pulseStyle]} />;
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
});
