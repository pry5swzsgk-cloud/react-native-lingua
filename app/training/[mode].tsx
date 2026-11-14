import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
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
import { getMistakeAction, getMistakeKey } from "@/lib/mistakes";
import { playSound } from "@/lib/sounds";
import { stopSpeaking } from "@/lib/speech";
import { isSpeechRecognitionSupported } from "@/lib/speechRecognition";
import { buildTraining, MASTERY_XP, TRAININGS } from "@/lib/training";
import { useLanguageStore } from "@/store/languageStore";
import { useLearningHydrated, useLearningStore } from "@/store/learningStore";

// One training session (vocabulary, mistakes, speaking, ...). It works
// like a practice session, but it is not tied to a lesson.
export default function TrainingScreen() {
  const { mode, unit } = useLocalSearchParams<{
    mode: string;
    unit?: string;
  }>();
  const router = useRouter();
  const hydrated = useLearningHydrated();
  const { selectedLanguage } = useLanguageStore();
  const {
    completedLessonIds,
    mistakes,
    masteredUnitIds,
    addXP,
    recordActivity,
    masterUnit,
    recordMistake,
    resolveMistake,
  } = useLearningStore();

  const isMastery = mode === "mastery";
  const info = isMastery
    ? { mode: "mastery" as const, xp: MASTERY_XP }
    : TRAININGS.find((training) => training.mode === mode);
  const canSpeak = isSpeechRecognitionSupported();

  // The session is built once on the device; "Train again" builds a new one
  const [exercises, setExercises] = useState<Exercise[] | null>(null);
  const [round, setRound] = useState(0);
  // Items answered wrong in this session (a mistake is saved once)
  const wrongKeys = useRef(new Set<string>());
  // XP is given only once per session, even after a double tap
  const finishedRef = useRef(false);
  const [result, setResult] = useState<{
    total: number;
    mistakes: number;
    xp: number;
  } | null>(null);

  useEffect(() => {
    if (!info || !hydrated) return;
    wrongKeys.current.clear();
    finishedRef.current = false;
    setExercises(
      buildTraining(info.mode, {
        languageCode: selectedLanguage,
        completedLessonIds,
        mistakes,
        canSpeak,
        unitId: unit,
      }),
    );
    setResult(null);
    // Built only when the screen opens or the learner trains again, not on
    // every change of the saved mistakes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [info?.mode, selectedLanguage, unit, round, hydrated]);

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
          <Text className="text-7xl leading-[90px]">{emoji}</Text>
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
  if (info.mode === "mastery" && exercises && exercises.length === 0) {
    return renderEmpty("🤔", "Unit not found");
  }
  if (info.mode === "speaking" && !canSpeak) {
    return renderEmpty(
      "🎤",
      "Speaking training needs a microphone. Open Lingo in a browser with speech recognition.",
    );
  }
  if (
    exercises &&
    exercises.length === 0 &&
    (info.mode === "listening" || (info.mode === "speaking" && canSpeak))
  ) {
    return renderEmpty(
      "📚",
      "Not enough content for this training yet. Finish a lesson first.",
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
    if (!info || finishedRef.current) return;
    finishedRef.current = true;
    playSound("complete");
    recordActivity(`training:${info.mode}`);
    if (info.mode === "mastery") {
      // 40 XP the first time, 20 when the unit is already mastered
      const xp =
        unit && masteredUnitIds.includes(unit) ? MASTERY_XP / 2 : MASTERY_XP;
      addXP(xp);
      if (unit) masterUnit(unit);
      setResult({ ...stats, xp });
      return;
    }
    addXP(info.xp);
    setResult({ ...stats, xp: info.xp });
  }

  // Remember wrong answers (once per session); a right answer takes one
  // mistake away, but only if the item was not wrong in this session
  function handleResult(exercise: Exercise, answer: ExerciseResult) {
    if (!("itemKey" in exercise) || !exercise.itemKey) return;
    const key = getMistakeKey(selectedLanguage, exercise.itemKey);
    const action = getMistakeAction(answer, key, wrongKeys.current, true);
    if (action === "record") recordMistake(key);
    else if (action === "resolve" && mistakes[key] !== undefined)
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
          <Text className="h2 text-center mt-4">
            {info.mode === "mastery"
              ? "Master level complete! 👑"
              : "Training complete!"}
          </Text>
          <Text
            className="body-md text-text-secondary text-center mt-1"
            testID="session-xp"
          >
            {`You earned +${result.xp} XP`}
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
});
