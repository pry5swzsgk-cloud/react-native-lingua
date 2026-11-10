import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SpeakButton } from "@/components/SpeakButton";
import { images } from "@/constants/images";
import { colors } from "@/constants/theme";
import { LESSONS } from "@/data/lessons";
import { getLessonAfter, getUnitOfLesson } from "@/lib/progress";
import { useLearningStore } from "@/store/learningStore";

// Offline lesson screen: everything comes from data/lessons.ts,
// progress is saved on the device via the learning store.
export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { completedLessonIds, completeLesson, addXP } = useLearningStore();

  const lesson = LESSONS.find((l) => l.id === id);
  // Which lesson was just finished and how much XP it gave (0 on a repeat)
  const [finished, setFinished] = useState<{ id: string; xp: number } | null>(
    null,
  );

  if (!lesson) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.neutral.background }}
      >
        <View className="flex-1 items-center justify-center">
          <Text className="body-md text-text-secondary">Lesson not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isCompleted = completedLessonIds.includes(lesson.id);
  const languageCode = getUnitOfLesson(lesson)?.languageCode ?? null;

  function handleComplete() {
    if (!lesson) return;
    if (!isCompleted) {
      completeLesson(lesson.id);
      addXP(lesson.xpReward);
    }
    setFinished({ id: lesson.id, xp: isCompleted ? 0 : lesson.xpReward });
  }

  if (finished?.id === lesson.id) {
    const nextLesson = getLessonAfter(lesson, completedLessonIds);
    const nextUnit = nextLesson && getUnitOfLesson(nextLesson);
    const isLevelUp =
      nextUnit && nextUnit.level !== getUnitOfLesson(lesson)?.level;

    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.neutral.background }}
      >
        <View className="flex-1 items-center justify-center px-6">
          <Image
            source={images.mascotDog}
            style={styles.mascot}
            resizeMode="contain"
          />
          <Text className="h2 text-center mt-4">Lesson complete!</Text>
          <Text className="body-md text-text-secondary text-center mt-1">
            {finished.xp > 0
              ? `You earned +${finished.xp} XP`
              : "Nice review! You already earned the XP for this lesson."}
          </Text>

          {nextLesson ? (
            <View
              className="w-full bg-surface rounded-2xl px-4 py-3 mt-8"
              testID="next-lesson-card"
            >
              <Text className="caption">
                {isLevelUp
                  ? `Level up! Next: ${nextUnit.level} · ${nextUnit.title}`
                  : "Up next"}
              </Text>
              <Text className="font-poppins-semibold text-base text-text-primary">
                {nextLesson.icon} {nextLesson.title}
              </Text>
              <Text className="body-sm text-text-secondary">
                {nextLesson.description}
              </Text>
            </View>
          ) : (
            <Text className="body-md text-center mt-8">
              🎉 You finished every lesson in this course!
            </Text>
          )}
        </View>

        <View className="px-5 pt-3 pb-4 gap-3">
          {nextLesson && (
            <TouchableOpacity
              className="bg-lingua-purple rounded-2xl items-center py-4"
              activeOpacity={0.85}
              onPress={() => router.replace(`/lesson/${nextLesson.id}`)}
              testID="next-lesson-button"
            >
              <Text className="font-poppins-semibold text-base text-white">
                Start next lesson
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            className="rounded-2xl items-center py-4 border border-border"
            activeOpacity={0.85}
            onPress={() => router.back()}
            testID="back-to-lessons-button"
          >
            <Text className="font-poppins-semibold text-base text-text-primary">
              Back to lessons
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.neutral.background }}>
      {/* Header */}
      <View className="flex-row items-center px-5 pt-2 pb-3">
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          testID="lesson-back-button"
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
          {lesson.title}
        </Text>
        <View className="w-6" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Intro */}
        <View className="items-center mb-6">
          <Text className="text-5xl mb-2">{lesson.icon}</Text>
          <Text className="body-md text-text-secondary text-center">
            {lesson.description}
          </Text>
        </View>

        {/* Vocabulary */}
        <Text className="h4 mb-3">New words</Text>
        <View
          className="bg-white rounded-[20px] border border-border mb-6 overflow-hidden"
          style={styles.cardShadow}
        >
          {lesson.vocabulary.map((item, index) => (
            <View key={item.word}>
              {index > 0 && <View className="h-px bg-border mx-4" />}
              <View className="flex-row items-center px-4 py-3">
                <Text className="text-2xl w-9">{item.emoji ?? "📝"}</Text>
                <View className="flex-1 ml-2">
                  <Text className="font-poppins-semibold text-sm text-text-primary">
                    {item.word}
                  </Text>
                  <Text className="caption">{item.pronunciation}</Text>
                </View>
                <Text className="body-sm text-text-secondary mr-2">
                  {item.translation}
                </Text>
                <SpeakButton text={item.word} languageCode={languageCode} />
              </View>
            </View>
          ))}
        </View>

        {/* Phrases */}
        <Text className="h4 mb-3">Useful phrases</Text>
        <View className="gap-3">
          {lesson.phrases.map((phrase) => (
            <View
              key={phrase.text}
              className="flex-row items-center bg-surface rounded-2xl px-4 py-3"
            >
              <View className="flex-1 mr-2">
                <Text className="font-poppins-semibold text-sm text-text-primary">
                  {phrase.text}
                </Text>
                <Text className="caption">{phrase.pronunciation}</Text>
                <Text className="body-sm text-text-secondary mt-1">
                  {phrase.translation}
                </Text>
              </View>
              <SpeakButton text={phrase.text} languageCode={languageCode} />
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Complete button */}
      <View className="px-5 pt-3 pb-4">
        <TouchableOpacity
          className="bg-lingua-purple rounded-2xl items-center py-4"
          activeOpacity={0.85}
          onPress={handleComplete}
          testID="lesson-complete-button"
        >
          <Text className="font-poppins-semibold text-base text-white">
            {isCompleted
              ? "Continue"
              : `Complete lesson · +${lesson.xpReward} XP`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ScrollView.contentContainerStyle and shadows must stay in StyleSheet
const styles = StyleSheet.create({
  mascot: { width: 180, height: 180 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
});
