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
import { BOSS_SESSION_SIZE } from "@/data/bosses";
import { getDialogs } from "@/data/dialogs";
import { LESSONS } from "@/data/lessons";
import {
  buildExercises,
  buildSession,
  Exercise,
  ExerciseResult,
} from "@/lib/exercises";
import { getMistakeAction, getMistakeKey } from "@/lib/mistakes";
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
  const {
    completedLessonIds,
    completeLesson,
    addXP,
    recordActivity,
    dailyChests,
    weeklyChests,
    recordMistake,
  } = useLearningStore();

  const lesson = LESSONS.find((l) => l.id === id);
  const languageCode = lesson
    ? (getUnitOfLesson(lesson)?.languageCode ?? null)
    : null;

  // The session is built on the device: it is shuffled and depends on
  // whether speech recognition is available here.
  const [exercises, setExercises] = useState<Exercise[] | null>(null);
  // Items answered wrong in this session (a mistake is saved once)
  const wrongKeys = useRef(new Set<string>());
  // XP is given only once per session, even after a double tap
  const finishedRef = useRef(false);
  // Set when the session is finished: the XP it gave, whether the
  // lesson was done before and the session stats. null = still running.
  const [result, setResult] = useState<{
    xp: number;
    isRepeat: boolean;
    total: number;
    mistakes: number;
  } | null>(null);

  useEffect(() => {
    if (!lesson) return;
    wrongKeys.current.clear();
    finishedRef.current = false;
    const canSpeak = isSpeechRecognitionSupported();
    if (lesson.boss) {
      // Boss levels: a longer, harder session without the easy exercise types
      const level = getUnitOfLesson(lesson)?.level;
      setExercises(
        buildSession(
          {
            id: lesson.id,
            vocabulary: lesson.vocabulary,
            phrases: lesson.phrases,
            dialogs: level ? getDialogs(languageCode, level) : [],
          },
          languageCode,
          { canSpeak, hard: true, size: BOSS_SESSION_SIZE[lesson.boss.kind] },
        ),
      );
    } else {
      setExercises(buildExercises(lesson, languageCode, canSpeak));
    }
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

  function handleFinish(stats: { total: number; mistakes: number }) {
    if (!lesson || finishedRef.current) return;
    finishedRef.current = true;

    // Everything is solved: the lesson counts as complete now
    playSound("complete");
    const isRepeat = completedLessonIds.includes(lesson.id);
    // Repeating a lesson is worth half the XP. So reviewing also counts
    // for the daily goal and the streak, even when every lesson is done.
    const xp = isRepeat ? Math.ceil(lesson.xpReward / 2) : lesson.xpReward;
    if (!isRepeat) completeLesson(lesson.id);
    addXP(xp);
    // Every finished round counts as a level for the daily chest
    recordActivity(`level:${lesson.id}`);
    setResult({ xp, isRepeat, ...stats });
  }

  // Remember wrong answers for the mistakes training (once per session).
  // Lessons never resolve mistakes: only the trainings do.
  function handleResult(exercise: Exercise, answer: ExerciseResult) {
    if (!("itemKey" in exercise) || !exercise.itemKey) return;
    const key = getMistakeKey(languageCode, exercise.itemKey);
    if (getMistakeAction(answer, key, wrongKeys.current, false) === "record") {
      recordMistake(key);
    }
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
    const currentUnit = getUnitOfLesson(lesson);
    const isLevelUp =
      nextUnit &&
      currentUnit &&
      nextUnit.order > currentUnit.order &&
      nextUnit.level !== currentUnit.level;

    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.neutral.background }}
      >
        <View className="flex-1 items-center justify-center px-6">
          {lesson.boss ? (
            <Text className="text-8xl leading-[120px]">{lesson.icon}</Text>
          ) : (
            <Image
              source={images.mascotDog}
              style={styles.mascot}
              resizeMode="contain"
            />
          )}
          <Text className="h2 text-center mt-4">
            {lesson.boss
              ? lesson.boss.kind === "final"
                ? "Final boss defeated!"
                : "Mini boss defeated!"
              : "Lesson complete!"}
          </Text>
          {lesson.boss?.kind === "final" && (
            <Text className="h3 text-center mt-1">
              {getUnitOfLesson(lesson)?.level} complete 🎉
            </Text>
          )}
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
            {result.mistakes === 0
              ? `${result.total} exercises, no mistakes. Perfect!`
              : `${result.total} exercises, ${result.mistakes} ${result.mistakes === 1 ? "mistake" : "mistakes"} fixed.`}
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

  return (
    <ExerciseSession
      exercises={exercises}
      languageCode={languageCode}
      onClose={handleClose}
      onFinish={handleFinish}
      onResult={handleResult}
      boss={lesson.boss ? { name: lesson.title, emoji: lesson.icon } : undefined}
    />
  );
}

const styles = StyleSheet.create({
  mascot: { width: 180, height: 180 },
});
