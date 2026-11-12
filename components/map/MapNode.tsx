import { Ionicons } from "@expo/vector-icons";
import { ReactNode, useEffect } from "react";
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
import { getNodeSize, LABEL_WIDTH } from "@/lib/mapLayout";
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
const BOSS_BACKGROUND = "#2B2440";
const FINAL_BOSS_RING = "#F5A300";

// One level on the map. Every level can be tapped at any time.
//   done    - colored ring with a check mark
//   current - purple ring that pulses (the mascot stands next to it,
//             see MapMascot)
//   open    - plain ring
// Bosses are bigger with a dark circle (purple ring for a mini boss, gold
// ring and a soft pulse for the final boss). The circle stays centered on
// (x, y) however big it is.
export function MapNode({
  lesson,
  levelNumber,
  x,
  y,
  status,
  accent,
  onPress,
}: MapNodeProps) {
  const bossKind = lesson.boss?.kind;
  const size = getNodeSize(lesson);
  const bossRing =
    bossKind === "final" ? FINAL_BOSS_RING : colors.primary.purple;
  const ringColor = bossKind
    ? bossRing
    : status === "done"
      ? accent
      : status === "current"
        ? colors.primary.purple
        : "#d1d5db";
  const bossName = bossKind === "final" ? "Final boss" : "Mini boss";
  const label = bossKind
    ? `${bossName}: ${lesson.title}, ${status}`
    : `Level ${levelNumber}: ${lesson.title}, ${status}`;
  const subtitle = bossKind
    ? `${bossName} · ${lesson.xpReward} XP`
    : `Level ${levelNumber} · ${lesson.xpReward} XP`;

  return (
    <View
      style={[
        styles.container,
        { left: x - NODE_WIDTH / 2, top: y - size / 2 },
      ]}
    >
      {status === "current" && <CurrentPulse size={size} />}

      <TouchableOpacity
        className="items-center"
        activeOpacity={0.8}
        onPress={onPress}
        accessibilityLabel={label}
        testID={`map-node-${lesson.id}`}
      >
        <BossPulse enabled={bossKind === "final"}>
          <View
            className={`rounded-full items-center justify-center ${bossKind ? "" : "bg-white"}`}
            style={[
              styles.circle,
              { width: size, height: size, borderColor: ringColor },
              bossKind ? { backgroundColor: BOSS_BACKGROUND } : null,
            ]}
          >
            <Text className={bossKind ? "text-4xl" : "text-3xl"}>
              {lesson.icon}
            </Text>
            {status === "done" && (
              <View className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-success border-2 border-white items-center justify-center">
                <Ionicons name="checkmark" size={13} color="#fff" />
              </View>
            )}
          </View>
        </BossPulse>

        <View className="bg-white/95 rounded-xl px-2.5 py-1 mt-1.5 items-center max-w-full">
          <Text
            className="font-poppins-semibold text-xs text-text-primary"
            numberOfLines={1}
          >
            {lesson.title}
          </Text>
          <Text className="caption">{subtitle}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

// The pulsing ring around the level the learner is on. It appears when
// the line from the previous level has arrived.
function CurrentPulse({ size }: { size: number }) {
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

  return (
    <Animated.View
      style={[
        styles.pulse,
        {
          left: (NODE_WIDTH - size) / 2,
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        pulseStyle,
      ]}
    />
  );
}

// Makes the final boss grow and shrink a little (scale 1 to 1.06). Other
// levels are shown as they are.
function BossPulse({
  enabled,
  children,
}: {
  enabled: boolean;
  children: ReactNode;
}) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (!enabled) return;
    scale.set(
      withRepeat(
        withTiming(1.06, { duration: 1100, easing: Easing.inOut(Easing.quad) }),
        -1,
        true,
      ),
    );
  }, [enabled, scale]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  if (!enabled) return <>{children}</>;
  return <Animated.View style={style}>{children}</Animated.View>;
}

// Positions, animated values and transforms stay in StyleSheet (see AGENTS.md)
const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: NODE_WIDTH,
  },
  circle: {
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
    backgroundColor: colors.primary.purple,
    pointerEvents: "none",
  },
});
