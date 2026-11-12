import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { StreakCard } from "@/components/profile/StreakCard";
import { MascotCard } from "@/components/rewards/MascotCard";
import { mascotImages } from "@/constants/images";
import { colors } from "@/constants/theme";
import { getMascot, MASCOTS } from "@/data/mascots";
import { getToday } from "@/lib/dates";
import { getMascotStatuses } from "@/lib/rewards";
import { playSound } from "@/lib/sounds";
import { useLearningStore, useStreak } from "@/store/learningStore";

// The profile: the learner's mascot, the streak overview, a few numbers
// and the mascot collection. Everything comes from the device, there is
// no account.
export default function ProfileScreen() {
  const {
    xpByDay,
    totalXP,
    longestStreak,
    completedLessonIds,
    weeklyChests,
    mascotParts,
    selectedMascotId,
    selectMascot,
  } = useLearningStore();
  const streak = useStreak();

  const mascot = getMascot(selectedMascotId);
  const statuses = getMascotStatuses(MASCOTS, mascotParts);
  const unlockedCount = statuses.filter((status) => status.isUnlocked).length;

  const stats = [
    { id: "total-xp", label: "Total XP", value: totalXP },
    { id: "lessons", label: "Lessons done", value: completedLessonIds.length },
    {
      id: "longest-streak",
      label: "Longest streak",
      value: Math.max(longestStreak, streak),
    },
  ];

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.neutral.background }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* A column that stays compact on tablets */}
        <View className="w-full max-w-[520px] self-center">
          <Text className="h2 mb-4">Profile</Text>

          {/* ── The mascot the learner picked ── */}
          <View className="flex-row items-center bg-lingua-purple rounded-[20px] p-4 mb-4">
            <View className="w-[88px] h-[88px] rounded-full bg-white items-center justify-center">
              <Image
                source={mascotImages[mascot.id]}
                style={styles.mascot}
                resizeMode="contain"
              />
            </View>
            <View className="flex-1 ml-4">
              <Text className="font-poppins text-[11px] text-white/75">
                Your mascot
              </Text>
              <Text
                className="font-poppins-bold text-[22px] text-white leading-7"
                testID="profile-mascot-name"
              >
                {mascot.name}
              </Text>
              <Text className="font-poppins text-xs text-white/75 mt-0.5">
                {mascot.description}. Walks with you on the progress map.
              </Text>
            </View>
          </View>

          {/* ── Streak overview ── */}
          <StreakCard
            xpByDay={xpByDay}
            today={getToday()}
            longestStreak={longestStreak}
            waitingWeeklyChests={weeklyChests}
          />

          {/* ── A few numbers ── */}
          <View className="flex-row gap-3 mt-4">
            {stats.map((stat) => (
              <View
                key={stat.id}
                className="flex-1 bg-surface rounded-2xl items-center py-3 px-1"
              >
                <Text
                  className="font-poppins-bold text-xl text-text-primary"
                  testID={`stat-${stat.id}`}
                >
                  {stat.value}
                </Text>
                <Text className="caption text-center">{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* ── Mascot collection ── */}
          <View className="flex-row items-end justify-between mt-6 mb-1">
            <Text className="font-poppins-semibold text-[17px] text-text-primary">
              Mascots
            </Text>
            <Text className="caption" testID="mascots-collected">
              {unlockedCount} of {MASCOTS.length} collected
            </Text>
          </View>
          <Text className="body-sm text-text-secondary mb-3">
            Open reward chests on the home screen to find mascot pieces. Four
            pieces complete a mascot.
          </Text>
          <View className="flex-row flex-wrap justify-between gap-y-3">
            {statuses.map((status) => (
              <MascotCard
                key={status.mascot.id}
                status={status}
                isSelected={status.mascot.id === mascot.id}
                onSelect={() => {
                  playSound("tick");
                  selectMascot(status.mascot.id);
                }}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ScrollView.contentContainerStyle and image sizes stay in StyleSheet
const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 110,
  },
  mascot: { width: 72, height: 72 },
});
