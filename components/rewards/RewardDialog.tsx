import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { MascotPuzzle } from "@/components/rewards/MascotPuzzle";
import { images } from "@/constants/images";
import { PARTS_PER_MASCOT, Reward } from "@/lib/rewards";

interface RewardDialogProps {
  reward: Reward | null; // what was in the chest; null hides the dialog
  onClose: () => void;
  onOpenProfile: () => void; // go and pick the new mascot
}

// Shows what was inside a chest that was just opened
export function RewardDialog({
  reward,
  onClose,
  onOpenProfile,
}: RewardDialogProps) {
  return (
    <Modal
      visible={reward !== null}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {reward && (
        <View style={styles.backdrop}>
          {/* The card scrolls if it is taller than a small screen */}
          <View
            className="w-full max-w-[360px] bg-white rounded-3xl overflow-hidden"
            style={styles.card}
            testID="reward-dialog"
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.content}
            >
              <Image
                source={
                  reward.kind === "daily"
                    ? images.chestDailyOpen
                    : images.chestWeeklyOpen
                }
                style={styles.chest}
                resizeMode="contain"
              />
              <Text className="h2 text-center mt-1">
                {reward.kind === "daily" ? "Daily reward!" : "Weekly reward!"}
              </Text>
              <Text
                className="body-md text-text-secondary text-center mt-1"
                testID="reward-summary"
              >
                {getSummary(reward)}
              </Text>

              {/* One row for every mascot that got pieces */}
              {reward.changes.map((change) => (
                <View
                  key={change.mascot.id}
                  className="w-full flex-row items-center bg-surface rounded-2xl p-3 mt-3 gap-3"
                  testID={`reward-mascot-${change.mascot.id}`}
                >
                  <MascotPuzzle
                    mascotId={change.mascot.id}
                    parts={change.after}
                    newFrom={change.before}
                    size={84}
                  />
                  <View className="flex-1">
                    <Text className="font-poppins-semibold text-base text-text-primary">
                      {change.mascot.name}
                    </Text>
                    <Text className="body-sm text-text-secondary">
                      {change.isUnlocked
                        ? `Complete! 🎉 ${change.mascot.name} is yours now.`
                        : `${change.after} of ${PARTS_PER_MASCOT} pieces collected`}
                    </Text>
                  </View>
                </View>
              ))}

              {reward.changes.some((change) => change.isUnlocked) ? (
                <>
                  <TouchableOpacity
                    className="w-full bg-lingua-purple rounded-2xl items-center py-3.5 mt-5"
                    activeOpacity={0.85}
                    onPress={onOpenProfile}
                    testID="reward-profile-button"
                  >
                    <Text className="font-poppins-semibold text-base text-white">
                      Choose my mascot
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="w-full rounded-2xl items-center py-3 mt-1"
                    activeOpacity={0.7}
                    onPress={onClose}
                    testID="reward-close-button"
                  >
                    <Text className="font-poppins-semibold text-sm text-text-secondary">
                      Later
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  className="w-full bg-lingua-purple rounded-2xl items-center py-3.5 mt-5"
                  activeOpacity={0.85}
                  onPress={onClose}
                  testID="reward-close-button"
                >
                  <Text className="font-poppins-semibold text-base text-white">
                    Awesome!
                  </Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </View>
      )}
    </Modal>
  );
}

function getSummary(reward: Reward): string {
  if (reward.parts === 0) {
    return `You already collected every mascot, so this chest holds +${reward.bonusXP} bonus XP.`;
  }
  const pieces = `${reward.parts} mascot ${reward.parts === 1 ? "piece" : "pieces"}`;
  return reward.kind === "daily"
    ? `You reached your daily goal. You found ${pieces}!`
    : `7 days in a row! You found ${pieces}!`;
}

// Modal content and image sizes stay in StyleSheet (see AGENTS.md)
const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "rgba(0, 19, 40, 0.6)",
  },
  card: { maxHeight: "100%" },
  content: { alignItems: "center", padding: 20 },
  chest: { width: 120, height: 120 },
});
