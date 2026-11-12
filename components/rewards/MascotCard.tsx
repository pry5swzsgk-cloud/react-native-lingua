import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { MascotPuzzle } from "@/components/rewards/MascotPuzzle";
import { mascotImages } from "@/constants/images";
import { colors } from "@/constants/theme";
import { MascotStatus, PARTS_PER_MASCOT } from "@/lib/rewards";

interface MascotCardProps {
  status: MascotStatus;
  isSelected: boolean;
  onSelect: () => void;
}

// One mascot in the collection.
//   selected - the learner's mascot right now
//   unlocked - complete, tap to choose it
//   locked   - shown as a puzzle with the pieces collected so far
export function MascotCard({ status, isSelected, onSelect }: MascotCardProps) {
  const { mascot, parts, isUnlocked } = status;

  const look = isSelected
    ? "bg-[#F1EDFF] border-lingua-purple"
    : isUnlocked
      ? "bg-white border-border"
      : "bg-surface border-surface";
  const label = isSelected
    ? `${mascot.name}, selected`
    : isUnlocked
      ? `${mascot.name}, tap to choose`
      : `${mascot.name}, ${parts} of ${PARTS_PER_MASCOT} pieces`;

  return (
    <TouchableOpacity
      className={`w-[48%] rounded-2xl items-center p-3 border-2 ${look}`}
      activeOpacity={0.8}
      disabled={!isUnlocked || isSelected}
      onPress={onSelect}
      accessibilityLabel={label}
      testID={`mascot-card-${mascot.id}`}
    >
      {isUnlocked ? (
        <Image
          source={mascotImages[mascot.id]}
          style={styles.image}
          resizeMode="contain"
        />
      ) : (
        <MascotPuzzle mascotId={mascot.id} parts={parts} size={84} />
      )}

      <Text className="font-poppins-semibold text-[15px] text-text-primary mt-2">
        {mascot.name}
      </Text>
      <Text className="caption text-center">
        {isUnlocked
          ? mascot.description
          : `${parts} of ${PARTS_PER_MASCOT} pieces`}
      </Text>

      {isSelected ? (
        <View className="flex-row items-center gap-1 bg-lingua-purple rounded-full px-3 py-1 mt-2">
          <Ionicons name="checkmark" size={12} color="#fff" />
          <Text className="font-poppins-semibold text-xs text-white">
            Selected
          </Text>
        </View>
      ) : isUnlocked ? (
        <View className="border border-lingua-purple rounded-full px-3 py-1 mt-2">
          <Text className="font-poppins-semibold text-xs text-lingua-purple">
            Choose
          </Text>
        </View>
      ) : (
        <View className="flex-row items-center gap-1 bg-[#e9ebf2] rounded-full px-3 py-1 mt-2">
          <Ionicons
            name="lock-closed"
            size={11}
            color={colors.neutral.textSecondary}
          />
          <Text className="font-poppins-semibold text-xs text-text-secondary">
            Locked
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// Image sizes stay in StyleSheet (see AGENTS.md)
const styles = StyleSheet.create({
  image: { width: 84, height: 84 },
});
