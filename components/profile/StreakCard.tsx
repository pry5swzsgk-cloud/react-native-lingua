import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, View } from "react-native";

import { images } from "@/constants/images";
import { getLastDays, getWeekdayLetter } from "@/lib/dates";
import { getDaysToWeeklyChest } from "@/lib/rewards";
import { getStreak, hasLearnedOn, XPByDay } from "@/lib/streak";

interface StreakCardProps {
  xpByDay: XPByDay;
  today: string;
  longestStreak: number;
  waitingWeeklyChests: number;
}

// The streak overview: how many days in a row the learner has learned,
// the last seven days at a glance, and what comes next.
export function StreakCard({
  xpByDay,
  today,
  longestStreak,
  waitingWeeklyChests,
}: StreakCardProps) {
  const streak = getStreak(xpByDay, today);
  const learnedToday = hasLearnedOn(xpByDay, today);
  const best = Math.max(longestStreak, streak);
  const daysToChest = getDaysToWeeklyChest(streak);

  const message =
    streak === 0
      ? "Learn today to start your streak!"
      : learnedToday
        ? "You learned today. Come back tomorrow!"
        : "Learn today to keep your streak alive!";

  return (
    <View className="bg-[#FFF5E8] rounded-[20px] p-5" testID="streak-card">
      <View className="flex-row items-center gap-3">
        <Image source={images.flame} style={styles.flame} resizeMode="contain" />
        <View className="flex-1">
          <View className="flex-row items-baseline gap-1.5">
            <Text
              className="font-poppins-bold text-[34px] leading-[40px] text-streak"
              testID="streak-count"
            >
              {streak}
            </Text>
            <Text className="font-poppins-semibold text-base text-text-primary">
              {streak === 1 ? "day in a row" : "days in a row"}
            </Text>
          </View>
          <Text className="body-sm text-text-secondary" testID="streak-message">
            {message}
          </Text>
        </View>
      </View>

      {/* The last seven days, today on the right */}
      <View className="flex-row justify-between mt-4">
        {getLastDays(today, 7).map((day) => {
          const learned = hasLearnedOn(xpByDay, day);
          const isToday = day === today;

          return (
            <View
              key={day}
              className="items-center gap-1"
              accessibilityLabel={`${isToday ? "today" : day}: ${learned ? "learned" : "not learned"}`}
              testID="streak-day"
            >
              <Text
                className={`font-poppins-medium text-xs ${
                  isToday ? "text-text-primary" : "text-text-secondary"
                }`}
              >
                {getWeekdayLetter(day)}
              </Text>
              <View
                className={`w-7 h-7 rounded-full items-center justify-center ${
                  learned
                    ? "bg-streak"
                    : isToday
                      ? "bg-white border-2 border-streak"
                      : "bg-white border border-[#f0dcc0]"
                }`}
              >
                {learned && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
            </View>
          );
        })}
      </View>

      <View className="flex-row mt-4 pt-3 border-t border-[#f3e3cc]">
        <View className="flex-1">
          <Text className="caption">Longest streak</Text>
          <Text
            className="font-poppins-semibold text-sm text-text-primary"
            testID="streak-longest"
          >
            {best} {best === 1 ? "day" : "days"}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="caption">Next big chest</Text>
          <Text
            className="font-poppins-semibold text-sm text-text-primary"
            testID="streak-next-chest"
          >
            {waitingWeeklyChests > 0
              ? "Ready on Home!"
              : `in ${daysToChest} ${daysToChest === 1 ? "day" : "days"}`}
          </Text>
        </View>
      </View>
    </View>
  );
}

// Image sizes stay in StyleSheet (see AGENTS.md)
const styles = StyleSheet.create({
  flame: { width: 48, height: 48 },
});
