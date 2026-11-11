import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PhraseCard } from "@/components/PhraseCard";
import { SpeakButton } from "@/components/SpeakButton";
import { colors } from "@/constants/theme";
import { LESSONS } from "@/data/lessons";
import { getUnitOfLesson } from "@/lib/progress";
import { isSpeechRecognitionSupported } from "@/lib/speechRecognition";
import { useLearningStore } from "@/store/learningStore";

// First half of a lesson: read and listen to the new words and phrases.
// The exercises that complete the lesson live in app/practice/[id].tsx.
export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { completedLessonIds } = useLearningStore();

  const lesson = LESSONS.find((l) => l.id === id);
  // null until checked; speech recognition is missing in some browsers
  const [canPractice, setCanPractice] = useState<boolean | null>(null);

  useEffect(() => {
    setCanPractice(isSpeechRecognitionSupported());
  }, []);
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
        <Text className="h4 mb-1">Useful phrases</Text>
        <Text className="body-sm text-text-secondary mb-3" testID="practice-hint">
          {canPractice === false
            ? "Tap the speaker to listen. Speaking practice isn't supported on this device or browser."
            : "Tap the speaker to listen, then the mic to practice saying it."}
        </Text>
        <View className="gap-3">
          {lesson.phrases.map((phrase) => (
            <PhraseCard
              key={phrase.text}
              phrase={phrase}
              languageCode={languageCode}
              canPractice={canPractice === true}
            />
          ))}
        </View>
      </ScrollView>

      {/* Exercises button */}
      <View className="px-5 pt-3 pb-4">
        <TouchableOpacity
          className="bg-lingua-purple rounded-2xl items-center py-4"
          activeOpacity={0.85}
          onPress={() => router.push(`/practice/${lesson.id}`)}
          testID="start-exercises-button"
        >
          <Text className="font-poppins-semibold text-base text-white">
            {isCompleted
              ? "Practice again"
              : `Start exercises · +${lesson.xpReward} XP`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ScrollView.contentContainerStyle and shadows must stay in StyleSheet
const styles = StyleSheet.create({
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
