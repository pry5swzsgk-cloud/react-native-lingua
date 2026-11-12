import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ExerciseSession } from "@/components/exercises/ExerciseSession";
import { images } from "@/constants/images";
import { colors } from "@/constants/theme";
import { Exercise, ExerciseResult } from "@/lib/exercises";
import { getMistakeKey } from "@/lib/mistakes";
import { playSound } from "@/lib/sounds";
import { stopSpeaking } from "@/lib/speech";
import { isSpeechRecognitionSupported } from "@/lib/speechRecognition";
import { buildTraining, TRAININGS } from "@/lib/training";
import { useLanguageStore } from "@/store/languageStore";
import { useLearningStore } from "@/store/learningStore";

// One training session (vocabulary, mistakes, speaking, ...). It works
// like a practice session, but it is not tied to a lesson.
export default function TrainingScreen() {
  const { mode } = useLocalSearchParams<{ mode: string }>();
  const router = useRouter();
  const { selectedLanguage } = useLanguageStore();
  const { completedLessonIds, mistakes, addXP, recordMistake, resolveMistake } =
    useLearningStore();

  const info = TRAININGS.find((training) => training.mode === mode);
  const canSpeak = isSpeechRecognitionSupported();

  // The session is built once on the device; "Train again" builds a new one
  const [exercises, setExercises] = useState<Exercise[] | null>(null);
  const [round, setRound] = useState(0);
  const [result, setResult] = useState<{
    total: number;
    mistakes: number;
  } | null>(null);

  useEffect(() => {
    if (!info) return;
    setExercises(
      buildTraining(info.mode, {
        languageCode: selectedLanguage,
        completedLessonIds,
        mistakes,
        canSpeak,
      }),
    );
    setResult(null);
    // Built only when the screen opens or the learner trains again, not on
    // every change of the saved mistakes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [info?.mode, selectedLanguage, round]);

  function handleBack() {
    stopSpeaking();
    if (router.canGoBack()) router.back();
    else router.replace("/chat");
  }

  function renderEmpty(emoji: string, text: string) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.neutral.background }}
      >
        <View
          className="flex-1 items-center justify-center px-8"
          testID="training-empty"
        >
          <Text style={styles.emoji}>{emoji}</Text>
          <Text className="body-md text-text-secondary text-center mt-3">
            {text}
          </Text>
          <TouchableOpacity
            className="rounded-2xl items-center py-4 px-10 border border-border mt-6"
            activeOpacity={0.85}
            onPress={handleBack}
            testID="training-empty-back"
          >
            <Text className="font-poppins-semibold text-base text-text-primary">
              Back
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!info) return renderEmpty("🤔", "Training not found");
  if (!selectedLanguage) {
    return renderEmpty(
      "🌍",
      "Go to the home screen and pick a language to start training.",
    );
  }
  if (info.mode === "speaking" && !canSpeak) {
    return renderEmpty(
      "🎤",
      "Speaking training needs a microphone. Open Lingo in a browser with speech recognition.",
    );
  }
  if (info.mode === "mistakes" && exercises && exercises.length === 0) {
    return renderEmpty("🎉", "No mistakes to practise 🎉");
  }

  if (!exercises) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.neutral.background }}
      >
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary.purple} />
        </View>
      </SafeAreaView>
    );
  }

  function handleFinish(stats: { total: number; mistakes: number }) {
    if (!info) return;
    playSound("complete");
    addXP(info.xp);
    setResult(stats);
  }

  // Remember wrong answers; a right answer takes one mistake away again
  function handleResult(exercise: Exercise, answer: ExerciseResult) {
    if (!("itemKey" in exercise) || !exercise.itemKey) return;
    const key = getMistakeKey(selectedLanguage, exercise.itemKey);
    if (answer === "wrong") recordMistake(key);
    else if (answer === "correct" && mistakes[key] !== undefined)
      resolveMistake(key);
  }

  // ── Session finished ──
  if (result !== null) {
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
          <Text className="h2 text-center mt-4">Training complete!</Text>
          <Text
            className="body-md text-text-secondary text-center mt-1"
            testID="session-xp"
          >
            {`You earned +${info.xp} XP`}
          </Text>
          <Text
            className="body-sm text-text-secondary text-center mt-1"
            testID="session-summary"
          >
            {result.mistakes === 0
              ? `${result.total} exercises, no mistakes. Perfect!`
              : `${result.total} exercises, ${result.mistakes} ${result.mistakes === 1 ? "mistake" : "mistakes"} fixed.`}
          </Text>
        </View>
        <View className="px-5 pt-3 pb-4 gap-3">
          <TouchableOpacity
            className="bg-lingua-purple rounded-2xl items-center py-4"
            activeOpacity={0.85}
            onPress={() => {
              setExercises(null);
              setRound((value) => value + 1);
            }}
            testID="train-again-button"
          >
            <Text className="font-poppins-semibold text-base text-white">
              Train again
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="rounded-2xl items-center py-4 border border-border"
            activeOpacity={0.85}
            onPress={handleBack}
            testID="training-done-button"
          >
            <Text className="font-poppins-semibold text-base text-text-primary">
              Done
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <ExerciseSession
      exercises={exercises}
      languageCode={selectedLanguage}
      onClose={handleBack}
      onFinish={handleFinish}
      onResult={handleResult}
    />
  );
}

const styles = StyleSheet.create({
  mascot: { width: 180, height: 180 },
  emoji: { fontSize: 72, lineHeight: 90 },
});
