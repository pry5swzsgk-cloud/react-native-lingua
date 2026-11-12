import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { TeacherChat } from "@/components/teacher/TeacherChat";
import { images } from "@/constants/images";
import { colors } from "@/constants/theme";
import { LANGUAGES } from "@/data/languages";
import { getTeacherContent } from "@/data/teacher";
import { getNextLesson } from "@/lib/progress";
import { useLanguageStore, useStartUnitOrder } from "@/store/languageStore";
import { useLearningStore } from "@/store/learningStore";

// The teacher tab: conversations with Dax in the language being learned.
// Dax has content for Spanish; other languages see a friendly notice.
export default function AITeacherScreen() {
  const router = useRouter();
  const { selectedLanguage } = useLanguageStore();
  const { completedLessonIds } = useLearningStore();
  const startUnitOrder = useStartUnitOrder();

  const content = getTeacherContent(selectedLanguage);

  if (!content) {
    const language = LANGUAGES.find((l) => l.code === selectedLanguage);

    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.neutral.background }}
      >
        <View className="flex-1 items-center justify-center px-8">
          <Image
            source={images.mascotDino}
            style={styles.mascot}
            resizeMode="contain"
          />
          <Text className="h3 text-center mt-4 mb-2">
            {language ? "Dax only speaks Spanish so far" : "No language selected"}
          </Text>
          <Text className="body-md text-text-secondary text-center">
            {language
              ? `Conversations in ${language.name} are not ready yet. Switch to Spanish to talk with Dax.`
              : "Go to the home screen and pick a language to start learning."}
          </Text>
          {language && (
            <TouchableOpacity
              className="bg-lingua-purple rounded-2xl items-center py-3.5 px-8 mt-6"
              activeOpacity={0.85}
              onPress={() => router.push("/language-select")}
              testID="teacher-change-language-button"
            >
              <Text className="font-poppins-semibold text-base text-white">
                Change language
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // Dax starts with a topic that fits the lesson the learner is on
  const preferredTheme =
    getNextLesson(selectedLanguage, completedLessonIds, startUnitOrder)?.theme ??
    null;

  // A new language starts a new conversation
  return (
    <TeacherChat
      key={content.languageCode}
      content={content}
      preferredTheme={preferredTheme}
    />
  );
}

const styles = StyleSheet.create({
  mascot: { width: 140, height: 140 },
});
