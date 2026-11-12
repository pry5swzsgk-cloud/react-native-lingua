import { useEffect } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { images } from "@/constants/images";
import { ChestKind, ChestState } from "@/lib/rewards";

const CHEST_IMAGES = {
  daily: { closed: images.chestDailyClosed, open: images.chestDailyOpen },
  weekly: { closed: images.chestWeeklyClosed, open: images.chestWeeklyOpen },
};

interface ChestButtonProps {
  kind: ChestKind;
  state: ChestState;
  onPress: () => void;
}

// A reward chest on the home screen.
//   locked - closed and pale: not earned yet
//   ready  - closed and wiggling with an "Open" label: tap to open it
//   opened - open, until the next one is earned
export function ChestButton({ kind, state, onPress }: ChestButtonProps) {
  const wiggle = useSharedValue(0); // -1 … 1, turns the chest left and right

  useEffect(() => {
    if (state !== "ready") {
      cancelAnimation(wiggle);
      wiggle.set(0);
      return;
    }
    // Shake, wait a moment, shake again
    wiggle.set(
      withRepeat(
        withSequence(
          withTiming(-1, { duration: 90 }),
          withTiming(1, { duration: 180 }),
          withTiming(-1, { duration: 180 }),
          withTiming(0, { duration: 90 }),
          withDelay(1100, withTiming(0, { duration: 0 })),
        ),
        -1,
      ),
    );
  }, [state, wiggle]);

  const wiggleStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${wiggle.get() * 7}deg` }],
  }));

  const chest = CHEST_IMAGES[kind];

  return (
    <TouchableOpacity
      className="items-center"
      activeOpacity={0.8}
      disabled={state !== "ready"}
      onPress={onPress}
      accessibilityLabel={`${kind} chest, ${state}`}
      testID={`${kind}-chest`}
    >
      <Animated.View style={[wiggleStyle, state === "locked" && styles.locked]}>
        <Image
          source={state === "opened" ? chest.open : chest.closed}
          style={styles.chest}
          resizeMode="contain"
        />
      </Animated.View>
      {state === "ready" && (
        <View className="bg-lingua-purple rounded-full px-3.5 py-1 -mt-1">
          <Text className="font-poppins-semibold text-xs text-white">Open</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// Image sizes and animated values stay in StyleSheet (see AGENTS.md)
const styles = StyleSheet.create({
  chest: { width: 76, height: 76 },
  locked: { opacity: 0.45 },
});
