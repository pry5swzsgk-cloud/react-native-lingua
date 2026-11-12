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
import { SafeAreaView } from "react-native-safe-area-context";

import { ListenExercise } from "@/components/exercises/ListenExercise";
import { MatchExercise } from "@/components/exercises/MatchExercise";
import { SpeakExercise } from "@/components/exercises/SpeakExercise";
import { TypeExercise } from "@/components/exercises/TypeExercise";
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
}

// One run through a list of exercises. Wrong answers come back at the end
// until they are solved. Render it with a new `key` to start a new run.
export function ExerciseSession({
  exercises,
  languageCode,
  onClose,
  onFinish,
  onResult,
}: ExerciseSessionProps) {
  const [queue, setQueue] = useState<Exercise[]>(exercises);
  const [position, setPosition] = useState(0);
  const [solved, setSolved] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const total = exercises.length;

  function handleDone(result: ExerciseResult) {
    stopSpeaking();
    const current = queue[position];
    onResult?.(current, result);

    let nextQueue = queue;
    let nextMistakes = mistakes;
    if (result === "wrong") {
      // Ask the same exercise again at the end of the session
      nextQueue = [...queue, current];
      nextMistakes = mistakes + 1;
      setQueue(nextQueue);
      setMistakes(nextMistakes);
    } else {
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.neutral.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header: close button and progress */}
        <View className="flex-row items-center gap-3 px-5 pt-2 pb-5">
          <TouchableOpacity
            onPress={onClose}
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
