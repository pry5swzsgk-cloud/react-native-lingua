import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
  Image as RNImage,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LessonCard } from "@/components/LessonCard";
import { images } from "@/constants/images";
import { colors } from "@/constants/theme";
import {
  getNextLesson,
  getUnitLessons,
  getUnitOfLesson,
  getUnits,
} from "@/lib/progress";
import { useLanguageStore, useStartUnitOrder } from "@/store/languageStore";
import { useLearningStore } from "@/store/learningStore";

export default function LearnScreen() {
  const router = useRouter();
  const { selectedLanguage } = useLanguageStore();
  const { completedLessonIds } = useLearningStore();

  const units = getUnits(selectedLanguage);
  const startUnitOrder = useStartUnitOrder();
  const nextLesson = getNextLesson(
    selectedLanguage,
    completedLessonIds,
    startUnitOrder,
  );
  // The unit the learner is currently working on (last unit when all is done)
  const currentUnit =
    (nextLesson && getUnitOfLesson(nextLesson)) ?? units[units.length - 1];

  if (!selectedLanguage || !currentUnit) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.neutral.background }}
      >
        <View className="flex-1 items-center justify-center px-8">
          <Text className="h3 text-center mb-2">No language selected</Text>
          <Text className="body-md text-text-secondary text-center">
            Go to the home screen and pick a language to start learning.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentLessons = getUnitLessons(currentUnit);
  const currentDone = currentLessons.filter((l) =>
    completedLessonIds.includes(l.id),
  ).length;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.neutral.background }}
    >
      {/* Header */}
      <View className="px-5 pt-2 pb-3">
        <View className="flex-row items-center mb-1">
          <TouchableOpacity
            onPress={() => router.navigate("/")}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={colors.neutral.textPrimary}
            />
          </TouchableOpacity>

          <Text
            className="flex-1 text-center font-poppins-semibold text-base text-text-primary"
            numberOfLines={1}
          >
            {currentUnit.title}
          </Text>

          <View className="w-6" />
        </View>

        <Text className="caption text-center">
          Unit {currentUnit.order} · {currentDone}/{currentLessons.length}{" "}
          lessons
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <Image
            source={images.palace}
            contentFit="contain"
            style={styles.heroImage}
          />
          <RNImage
            source={images.mascotDino}
            style={styles.mascotImage}
            resizeMode="contain"
          />
        </View>

        {/* One section per unit, easiest first. Every lesson is open. */}
        {units.map((unit) => {
          const lessons = getUnitLessons(unit);
          const done = lessons.filter((l) =>
            completedLessonIds.includes(l.id),
          ).length;

          return (
            <View key={unit.id} className="mb-7" testID={`unit-${unit.order}`}>
              <View className="flex-row items-center gap-2 mb-1">
                <View className="bg-lingua-purple rounded-full px-2.5 py-0.5">
                  <Text className="font-poppins-semibold text-[11px] text-white">
                    {unit.level}
                  </Text>
                </View>
                <Text className="caption">
                  Unit {unit.order} · {done}/{lessons.length} done
                </Text>
              </View>
              <Text className="h4">{unit.title}</Text>
              <Text className="body-sm text-text-secondary mb-3">
                {unit.description}
                {unit.order < startUnitOrder
                  ? " · Below your starting level, still open for review."
                  : ""}
              </Text>

              <View className="gap-3">
                {lessons.map((lesson, index) => (
                  <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    index={index}
                    isCompleted={completedLessonIds.includes(lesson.id)}
                    isInProgress={lesson.id === nextLesson?.id}
                    onPress={() => router.push(`/lesson/${lesson.id}`)}
                  />
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  heroContainer: {
    height: 180,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 20,
    backgroundColor: "#ffffff",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  mascotImage: {
    position: "absolute",
    bottom: 0,
    right: 16,
    width: 110,
    height: 110,
  },
});
