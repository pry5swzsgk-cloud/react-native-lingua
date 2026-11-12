import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SmartTeacher } from "@/components/teacher/SmartTeacher";
import { SmartTryCard } from "@/components/teacher/SmartTryCard";
import { TeacherChat } from "@/components/teacher/TeacherChat";
import { images } from "@/constants/images";
import { colors } from "@/constants/theme";
import { LANGUAGES } from "@/data/languages";
import { getTeacherContent } from "@/data/teacher";
import { THEMES } from "@/data/themes";
import { getNextLesson, getUnits } from "@/lib/progress";
import { Level } from "@/lib/smartTeacher";
import { useLanguageStore, useStartUnitOrder } from "@/store/languageStore";
import { useLearningStore } from "@/store/learningStore";
import { useSmartModeStore } from "@/store/smartModeStore";
import { LanguageCode } from "@/types/learning";

// How Smart Dax introduces a correction, per language
const CORRECTION_WORDS: Partial<Record<LanguageCode, string>> = { es: "Mejor" };

// The teacher tab: conversations with Dax in the language being learned.
// Dax has content for Spanish; other languages see a friendly notice.
// There are two Daxes: one with rules (works everywhere, offline) and
// Smart Dax, which uses a language model that runs on the device.
export default function AITeacherScreen() {
  const router = useRouter();
  const { selectedLanguage } = useLanguageStore();
  const { completedLessonIds } = useLearningStore();
  const startUnitOrder = useStartUnitOrder();
  const { enabled: smartEnabled, setEnabled: setSmartEnabled } =
    useSmartModeStore();

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

  if (smartEnabled) {
    const language = LANGUAGES.find((l) => l.code === content.languageCode);
    const level =
      getUnits(content.languageCode).find((u) => u.order === startUnitOrder)
        ?.level ?? "A1";

    return (
      <SmartTeacher
        key={content.languageCode}
        languageCode={content.languageCode}
        languageName={language?.name ?? "Spanish"}
        correction={CORRECTION_WORDS[content.languageCode] ?? "Better"}
        level={level as Level}
        firstTopic={preferredTheme ? THEMES[preferredTheme].title : null}
      />
    );
  }

  // A new language starts a new conversation
  return (
    <TeacherChat
      key={content.languageCode}
      content={content}
      preferredTheme={preferredTheme}
      introExtra={<SmartTryCard onTry={() => setSmartEnabled(true)} />}
    />
  );
}

const styles = StyleSheet.create({
  mascot: { width: 140, height: 140 },
});
