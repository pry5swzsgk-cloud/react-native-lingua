import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { ChoiceExercise } from "@/components/exercises/ChoiceExercise";
import { FreeTextExercise } from "@/components/exercises/FreeTextExercise";
import { GapExercise } from "@/components/exercises/GapExercise";
import { ListenExercise } from "@/components/exercises/ListenExercise";
import { MatchExercise } from "@/components/exercises/MatchExercise";
import { SpeakExercise } from "@/components/exercises/SpeakExercise";
import { TypeExercise } from "@/components/exercises/TypeExercise";
import { WordBankExercise } from "@/components/exercises/WordBankExercise";
import { colors } from "@/constants/theme";
import { Exercise, ExerciseResult } from "@/lib/exercises";
import { stopSpeaking } from "@/lib/speech";
import { LanguageCode } from "@/types/learning";

interface ExerciseSessionProps {
  exercises: Exercise[];
  languageCode: LanguageCode | null;
  onClose: () => void;
  // Called once, when everything is solved
  onFinish: (stats: { total: number; mistakes: number }) => void;
  // Called after every answer
  onResult?: (exercise: Exercise, result: ExerciseResult) => void;
  // Boss fight: shows the boss with a health bar instead of the progress bar
  boss?: { name: string; emoji: string };
}

// One run through a list of exercises. Wrong answers come back at the end
// until they are solved. Render it with a new `key` to start a new run.
export function ExerciseSession({
  exercises,
  languageCode,
  onClose,
  onFinish,
  onResult,
  boss,
}: ExerciseSessionProps) {
  const [queue, setQueue] = useState<Exercise[]>(exercises);
  const [position, setPosition] = useState(0);
  const [solved, setSolved] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const total = exercises.length;
  const shake = useSharedValue(0); // boss moves left and right
  const hit = useSharedValue(1); // boss scale

  function handleDone(result: ExerciseResult) {
    stopSpeaking();
    const current = queue[position];
    onResult?.(current, result);

    let nextQueue = queue;
    let nextMistakes = mistakes;
    if (result === "wrong") {
      // The boss laughs: it shakes a little
      shake.set(
        withSequence(
          withTiming(-8, { duration: 50 }),
          withTiming(8, { duration: 100 }),
          withTiming(-8, { duration: 100 }),
          withTiming(0, { duration: 50 }),
        ),
      );
      // Ask the same exercise again at the end of the session
      nextQueue = [...queue, current];
      nextMistakes = mistakes + 1;
      setQueue(nextQueue);
      setMistakes(nextMistakes);
    } else {
      // The boss flinches
      hit.set(
        withSequence(
          withTiming(0.85, { duration: 100 }),
          withTiming(1, { duration: 150 }),
        ),
      );
      setSolved(solved + 1);
    }

    if (position + 1 < nextQueue.length) {
      setPosition(position + 1);
      return;
    }

    // Everything is solved
    onFinish({ total, mistakes: nextMistakes });
  }

  const exercise = queue[position];
  const progress = total > 0 ? Math.round((solved / total) * 100) : 0;
  const health = 100 - progress;
  const bossStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.get() }, { scale: hit.get() }],
  }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.neutral.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header: close button and progress */}
        {/* (hidden when empty: the hint below has its own close button) */}
        <View className={`flex-row items-center gap-3 px-5 pt-2 pb-5 ${total === 0 ? "hidden" : ""}`}>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Close exercises"
            testID={total === 0 ? undefined : "practice-close-button"}
          >
            <Ionicons
              name="close"
              size={26}
              color={colors.neutral.textSecondary}
            />
          </TouchableOpacity>
          {boss ? (
            <View className="flex-1 flex-row items-center gap-2">
              <Animated.Text style={[{ fontSize: 28 }, bossStyle]}>
                {boss.emoji}
              </Animated.Text>
              <View className="flex-1 gap-1">
                <Text className="font-poppins-semibold text-xs text-text-primary" numberOfLines={1}>
                  {boss.name}
                </Text>
                <View
                  className="h-3 bg-border rounded-full overflow-hidden"
                  accessibilityLabel={`Boss health ${health}%`}
                  testID="boss-health"
                >
                  <View
                    className="h-3 bg-error rounded-full"
                    style={{ width: `${health}%` }}
                  />
                </View>
              </View>
            </View>
          ) : (
            <View className="flex-1 h-3 bg-border rounded-full overflow-hidden">
              <View
                className="h-3 bg-success rounded-full"
                style={{ width: `${progress}%` }}
              />
            </View>
          )}
          <Text className="caption" testID="practice-progress">
            {solved}/{total}
          </Text>
        </View>

        {total === 0 ? (
          <View className="flex-1 items-center justify-center px-8 gap-6" testID="session-empty">
            <Text className="h3 text-center">Nothing to practise here yet</Text>
            <Text className="body-md text-center">
              There is no content for this practice yet. Try another one.
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="rounded-2xl items-center py-4 px-10 bg-lingua-purple"
              accessibilityLabel="Close"
              testID="practice-close-button"
            >
              <Text className="font-poppins-semibold text-base text-white">Close</Text>
            </TouchableOpacity>
          </View>
        ) : !exercise ? (
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
        ) : exercise.type === "choice" ? (
          <ChoiceExercise
            key={position}
            exercise={exercise}
            languageCode={languageCode}
            onDone={handleDone}
          />
        ) : exercise.type === "wordbank" ? (
          <WordBankExercise
            key={position}
            exercise={exercise}
            languageCode={languageCode}
            onDone={handleDone}
          />
        ) : exercise.type === "gap" ? (
          <GapExercise
            key={position}
            exercise={exercise}
            languageCode={languageCode}
            onDone={handleDone}
          />
        ) : exercise.type === "freetext" ? (
          <FreeTextExercise
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
        ) : exercise.type === "write" || exercise.type === "dictation" ? (
          <TypeExercise
            key={position}
            exercise={exercise}
            languageCode={languageCode}
            onDone={handleDone}
          />
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
