import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { mascotImages } from "@/constants/images";
import { useLearningStore } from "@/store/learningStore";

export type MascotMood = "happy" | "sad";

interface Reaction {
  mood: MascotMood;
  id: number; // counts up, so two equal reactions in a row both animate
}

interface MascotReactionContextValue {
  react: (mood: MascotMood) => void;
  reaction: Reaction | null;
}

const MascotReactionContext = createContext<MascotReactionContextValue | null>(
  null,
);

const SIZE = 56;
const REACTION_MS = 1600;
const HIDDEN_Y = 26; // resting: only the head peeks out
const HAPPY_TEXTS = ["Yay! 🎉", "Great! 🎉", "You got it! 🎉"];
const SAD_TEXTS = ["Oh no… 😢", "Keep going! 💪"];

function pick(list: string[]) {
  return list[Math.floor(Math.random() * list.length)];
}

// Holds the latest reaction. Exercises call react(), PeekingMascot shows it.
export function MascotReactionProvider({ children }: { children: ReactNode }) {
  const [reaction, setReaction] = useState<Reaction | null>(null);

  const react = useCallback((mood: MascotMood) => {
    setReaction((prev) => ({ mood, id: (prev?.id ?? 0) + 1 }));
  }, []);

  const value = useMemo(() => ({ react, reaction }), [react, reaction]);

  return (
    <MascotReactionContext.Provider value={value}>
      {children}
    </MascotReactionContext.Provider>
  );
}

// Without a provider this returns a function that does nothing.
export function useMascotReaction(): (mood: MascotMood) => void {
  const context = useContext(MascotReactionContext);
  return context ? context.react : noop;
}

function noop() {}

// The chosen mascot peeks over the edge of the exercise card and reacts.
export function PeekingMascot() {
  const mascotId = useLearningStore((s) => s.selectedMascotId);
  const reaction = useContext(MascotReactionContext)?.reaction ?? null;

  // The reaction being shown right now (null = resting)
  const [active, setActive] = useState<
    (Reaction & { text: string }) | null
  >(null);

  const translateY = useSharedValue(HIDDEN_Y);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);

  // Start a reaction whenever a new one arrives
  useEffect(() => {
    if (!reaction) return;
    setActive({
      ...reaction,
      text: pick(reaction.mood === "happy" ? HAPPY_TEXTS : SAD_TEXTS),
    });
    const timer = setTimeout(() => setActive(null), REACTION_MS);
    return () => clearTimeout(timer);
  }, [reaction]);

  // Animate: rest, happy or sad
  useEffect(() => {
    cancelAnimation(translateY);
    cancelAnimation(translateX);
    cancelAnimation(rotate);
    translateX.set(0);
    rotate.set(0);

    if (!active) {
      // Rest: sink down and bob up and down by 2 px
      translateY.set(
        withSequence(
          withTiming(HIDDEN_Y, { duration: 300 }),
          withRepeat(
            withSequence(
              withTiming(HIDDEN_Y - 2, { duration: 700 }),
              withTiming(HIDDEN_Y + 2, { duration: 700 }),
            ),
            -1,
            true,
          ),
        ),
      );
    } else if (active.mood === "happy") {
      translateY.set(withSpring(0, { damping: 9, stiffness: 160 }));
      rotate.set(
        withSequence(
          withTiming(8, { duration: 100 }),
          withRepeat(withTiming(-8, { duration: 200 }), 4, true),
          withTiming(0, { duration: 100 }),
        ),
      );
    } else {
      translateY.set(withSpring(34, { damping: 14, stiffness: 140 }));
      translateX.set(
        withSequence(
          withTiming(4, { duration: 60 }),
          withRepeat(withTiming(-4, { duration: 120 }), 6, true),
          withTiming(0, { duration: 60 }),
        ),
      );
    }
  }, [active, translateX, translateY, rotate]);

  const imageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.get() },
      { translateX: translateX.get() },
      { rotate: `${rotate.get()}deg` },
    ],
  }));

  const state = active ? active.mood : "idle";

  return (
    <View
      className="flex-row items-end justify-end px-5"
      nativeID={`mascot-${state}`}
      testID="peeking-mascot"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {active ? (
        <View
          className="mr-2 mb-3 rounded-2xl border border-border bg-white px-3 py-2"
          testID="mascot-bubble"
        >
          <Text className="font-poppins-semibold text-sm text-text-primary">
            {active.text}
          </Text>
        </View>
      ) : null}
      <View style={styles.frame}>
        <Animated.Image
          source={mascotImages[mascotId]}
          style={[styles.image, imageStyle]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { width: SIZE, height: SIZE, overflow: "hidden" },
  image: { width: SIZE, height: SIZE },
});
