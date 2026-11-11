import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { ExerciseFooter } from "@/components/exercises/ExerciseFooter";
import { PronunciationFeedback } from "@/components/PronunciationFeedback";
import { SpeakButton } from "@/components/SpeakButton";
import { colors } from "@/constants/theme";
import { LANGUAGES } from "@/data/languages";
import { ExerciseResult, SpeakExerciseData } from "@/lib/exercises";
import { comparePronunciation, PronunciationResult } from "@/lib/pronunciation";
import { playSound } from "@/lib/sounds";
import { stopSpeaking } from "@/lib/speech";
import { listenOnce } from "@/lib/speechRecognition";
import { LanguageCode } from "@/types/learning";

interface SpeakExerciseProps {
  exercise: SpeakExerciseData;
  languageCode: LanguageCode | null;
  onDone: (result: ExerciseResult) => void;
}

// Pronunciation: the learner says the sentence and the device's speech
// recognition checks it. It can be retried as often as needed, and skipped
// when speaking is not possible right now (it never blocks the lesson).
export function SpeakExercise({
  exercise,
  languageCode,
  onDone,
}: SpeakExerciseProps) {
  const [isListening, setIsListening] = useState(false);
  const [result, setResult] = useState<PronunciationResult | null>(null);
  const [heard, setHeard] = useState("");
  const [error, setError] = useState("");
  const stopRef = useRef<(() => void) | null>(null);

  // Stop the microphone when the exercise leaves the screen
  useEffect(() => () => stopRef.current?.(), []);

  const hasPassed = result?.passed === true;

  function handleMicPress() {
    if (isListening) {
      stopRef.current?.();
      return;
    }

    const locale =
      LANGUAGES.find((l) => l.code === languageCode)?.speechLocale ?? "en-US";

    // The microphone must not hear the voice reading the sentence
    stopSpeaking();
    setIsListening(true);
    setResult(null);
    setError("");
    stopRef.current = listenOnce(locale, {
      onResult: (transcript) => {
        const comparison = comparePronunciation(exercise.text, transcript);
        playSound(comparison.passed ? "correct" : "wrong");
        setHeard(transcript);
        setResult(comparison);
      },
      onError: setError,
      onEnd: () => setIsListening(false),
    }).stop;
  }

  return (
    <View className="flex-1" testID="exercise-speak">
      <View className="flex-1 px-5">
        <Text className="h3 mb-1">Say it out loud</Text>
        <Text className="body-sm text-text-secondary mb-5">
          Listen first if you like, then tap the mic and speak.
        </Text>

        <View className="bg-surface rounded-2xl px-4 py-4 flex-row items-center mb-6">
          <View className="flex-1 mr-3">
            <Text
              className="font-poppins-semibold text-lg text-text-primary"
              testID="speak-text"
            >
              {exercise.text}
            </Text>
            <Text className="caption">{exercise.pronunciation}</Text>
            <Text className="body-sm text-text-secondary mt-1">
              {exercise.translation}
            </Text>
          </View>
          <SpeakButton text={exercise.text} languageCode={languageCode} />
        </View>

        {!hasPassed && (
          <View className="items-center">
            <TouchableOpacity
              className={`w-24 h-24 rounded-full items-center justify-center ${isListening ? "bg-lingua-purple" : "bg-[#EDE9FE]"}`}
              activeOpacity={0.7}
              onPress={handleMicPress}
              accessibilityLabel={isListening ? "Stop listening" : "Start speaking"}
              testID="speak-mic-button"
            >
              <Ionicons
                name={isListening ? "stop" : "mic"}
                size={40}
                color={isListening ? "#fff" : colors.primary.purple}
              />
            </TouchableOpacity>
            <Text className="body-sm text-text-secondary mt-3">
              {isListening ? "Listening… tap to stop" : "Tap to speak"}
            </Text>
          </View>
        )}

        {error !== "" && !isListening && (
          <Text className="body-sm text-error text-center mt-4">{error}</Text>
        )}

        {result && !isListening && (
          <View className="mt-5" testID="speech-result">
            <PronunciationFeedback
              sentence={exercise.text}
              result={result}
              heard={heard}
            />
          </View>
        )}
      </View>

      {hasPassed ? (
        <ExerciseFooter status="correct" onContinue={() => onDone("correct")} />
      ) : (
        <View className="px-5 pt-3 pb-4">
          <TouchableOpacity
            className="rounded-2xl items-center py-4 border border-border"
            activeOpacity={0.85}
            onPress={() => onDone("skipped")}
            testID="speak-skip-button"
          >
            <Text className="font-poppins-semibold text-base text-text-secondary">
              I can&apos;t speak right now
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
