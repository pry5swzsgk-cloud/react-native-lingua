import { useEffect } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from "react-native-reanimated";

import { mascotImages } from "@/constants/images";
import { MascotId } from "@/data/mascots";
import { PARTS_PER_MASCOT } from "@/lib/rewards";

const GAP = 4; // space between the pieces
const PIECES = [0, 1, 2, 3]; // top left, top right, bottom left, bottom right

interface MascotPuzzleProps {
  mascotId: MascotId;
  parts: number; // pieces collected so far
  size: number;
  // Pieces from this number on are new: they pop in one after the other
  newFrom?: number;
}

// A mascot as a puzzle of four pieces. A collected piece shows its part of
// the picture, a missing one is an empty tile with a question mark.
export function MascotPuzzle({
  mascotId,
  parts,
  size,
  newFrom = PARTS_PER_MASCOT,
}: MascotPuzzleProps) {
  const pieceSize = (size - GAP) / 2;

  return (
    <View
      style={{ width: size, height: size }}
      accessibilityLabel={`${parts} of ${PARTS_PER_MASCOT} pieces`}
      testID={`mascot-puzzle-${mascotId}`}
    >
      {PIECES.map((index) => {
        const column = index % 2;
        const row = Math.floor(index / 2);
        const left = column * (pieceSize + GAP);
        const top = row * (pieceSize + GAP);

        return (
          <View
            key={index}
            className="absolute rounded-xl bg-[#e9ebf2] items-center justify-center"
            style={{ left, top, width: pieceSize, height: pieceSize }}
          >
            {index < parts ? (
              <PuzzlePiece
                // New pieces appear one after the other
                delay={index >= newFrom ? 400 + (index - newFrom) * 350 : null}
              >
                {/* The whole picture, moved so this piece shows its part */}
                <Image
                  source={mascotImages[mascotId]}
                  style={{
                    position: "absolute",
                    left: -left,
                    top: -top,
                    width: size,
                    height: size,
                  }}
                  resizeMode="contain"
                />
              </PuzzlePiece>
            ) : (
              <Text className="font-poppins-semibold text-base text-[#b6bccb]">
                ?
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

// One collected piece. With a delay it pops in, without one it is just there.
function PuzzlePiece({
  delay,
  children,
}: {
  delay: number | null;
  children: React.ReactNode;
}) {
  const scale = useSharedValue(delay === null ? 1 : 0);

  useEffect(() => {
    if (delay !== null) scale.set(withDelay(delay, withSpring(1)));
  }, [delay, scale]);

  const popStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  return <Animated.View style={[styles.piece, popStyle]}>{children}</Animated.View>;
}

// Animated values stay in StyleSheet (see AGENTS.md)
const styles = StyleSheet.create({
  piece: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },
});
