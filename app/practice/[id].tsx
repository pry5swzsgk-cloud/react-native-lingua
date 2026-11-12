import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ListenExercise } from "@/components/exercises/ListenExercise";
import { MatchExercise } from "@/components/exercises/MatchExercise";
import { SpeakExercise } from "@/components/exercises/SpeakExercise";
import { TypeExercise } from "@/components/exercises/TypeExercise";
import { images } from "@/constants/images";
import { colors } from "@/constants/theme";
import { LESSONS } from "@/data/lessons";
import { buildExercises, Exercise, ExerciseResult } from "@/lib/exercises";
import { getLessonAfter, getUnitOfLesson } from "@/lib/progress";
import { playSound } from "@/lib/sounds";
import { stopSpeaking } from "@/lib/speech";
import { isSpeechRecognitionSupported } from "@/lib/speechRecognition";
import { useLearningStore } from "@/store/learningStore";

// One practice session for a lesson. The learner works through every
// exercise; wrong answers come back at the end until they are solved.
// Only then is the lesson marked as complete.
export default function PracticeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { completedLessonIds, completeLesson, addXP, dailyChests, weeklyChests } =
    useLearningStore();

  const lesson = LESSONS.find((l) => l.id === id);
  const languageCode = lesson
    ? (getUnitOfLesson(lesson)?.languageCode ?? null)
    : null;

  // The session is built on the device: it is shuffled and depends on
  // whether speech recognition is available here.
  const [queue, setQueue] = useState<Exercise[] | null>(null);
  const [total, setTotal] = useState(0);
  const [position, setPosition] = useState(0);
  const [solved, setSolved] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  // Set when the session is finished: the XP it gave and whether the
  // lesson was done before. null = still running.
  const [result, setResult] = useState<{
    xp: number;
    isRepeat: boolean;
  } | null>(null);

  useEffect(() => {
    if (!lesson) return;
    const exercises = buildExercises(
      lesson,
      languageCode,
      isSpeechRecognitionSupported(),
    );
    setQueue(exercises);
    setTotal(exercises.length);
    setPosition(0);
    setSolved(0);
    setMistakes(0);
    setResult(null);
  }, [lesson, languageCode]);

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

  function handleDone(result: ExerciseResult) {
    if (!queue || !lesson) return;
    stopSpeaking();

    let nextQueue = queue;
    if (result === "wrong") {
      // Ask the same exercise again at the end of the session
      nextQueue = [...queue, queue[position]];
      setQueue(nextQueue);
      setMistakes(mistakes + 1);
    } else {
      setSolved(solved + 1);
    }

    if (position + 1 < nextQueue.length) {
      setPosition(position + 1);
      return;
    }

    // Everything is solved: the lesson counts as complete now
    playSound("complete");
    const isRepeat = completedLessonIds.includes(lesson.id);
    // Repeating a lesson is worth half the XP. So reviewing also counts
    // for the daily goal and the streak, even when every lesson is done.
    const xp = isRepeat ? Math.ceil(lesson.xpReward / 2) : lesson.xpReward;
    if (!isRepeat) completeLesson(lesson.id);
    addXP(xp);
    setResult({ xp, isRepeat });
  }

  function handleClose() {
    stopSpeaking();
    if (router.canGoBack()) router.back();
    else router.replace(`/lesson/${lesson?.id}`);
  }

  // ── Session finished ──
  if (result !== null) {
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
          <Text
            className="body-md text-text-secondary text-center mt-1"
            testID="session-xp"
          >
            {result.isRepeat
              ? `Nice review! You earned +${result.xp} XP`
              : `You earned +${result.xp} XP`}
          </Text>
          <Text
            className="body-sm text-text-secondary text-center mt-1"
            testID="session-summary"
          >
            {mistakes === 0
              ? `${total} exercises, no mistakes. Perfect!`
              : `${total} exercises, ${mistakes} ${mistakes === 1 ? "mistake" : "mistakes"} fixed.`}
          </Text>
          {dailyChests + weeklyChests > 0 && (
            <View
              className="bg-[#FFF5E8] rounded-full px-4 py-2 mt-4"
              testID="chest-hint"
            >
              <Text className="font-poppins-medium text-[13px] text-text-primary text-center">
                🎁 A reward chest is waiting on your home screen!
              </Text>
            </View>
          )}

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
              onPress={() => {
                // Leave practice, then swap the old lesson for the next one
                if (router.canDismiss()) router.dismiss();
                router.replace(`/lesson/${nextLesson.id}`);
              }}
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
            onPress={() => {
              if (router.canDismiss()) router.dismissAll();
              else router.replace("/learn");
            }}
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

  const exercise = queue?.[position];
  const progress = total > 0 ? Math.round((solved / total) * 100) : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.neutral.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header: close button and progress */}
        <View className="flex-row items-center gap-3 px-5 pt-2 pb-5">
          <TouchableOpacity
            onPress={handleClose}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Close exercises"
            testID="practice-close-button"
          >
            <Ionicons
              name="close"
              size={26}
              color={colors.neutral.textSecondary}
            />
          </TouchableOpacity>
          <View className="flex-1 h-3 bg-border rounded-full overflow-hidden">
            <View
              className="h-3 bg-success rounded-full"
              style={{ width: `${progress}%` }}
            />
          </View>
          <Text className="caption" testID="practice-progress">
            {solved}/{total}
          </Text>
        </View>

        {!exercise ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={colors.primary.purple} />
          </View>
        ) : exercise.type === "match" ? (
          <MatchExercise key={position} exercise={exercise} onDone={handleDone} />
        ) : exercise.type === "listen" ? (
          <ListenExercise
            key={position}
            exercise={exercise}
            languageCode={languageCode}
            onDone={handleDone}
          />
        ) : exercise.type === "speak" ? (
          <SpeakExercise
            key={position}
            exercise={exercise}
            languageCode={languageCode}
            onDone={handleDone}
          />
        ) : (
          <TypeExercise
            key={position}
            exercise={exercise}
            languageCode={languageCode}
            onDone={handleDone}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mascot: { width: 180, height: 180 },
});
