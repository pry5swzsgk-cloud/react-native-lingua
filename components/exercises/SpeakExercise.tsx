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
import { normalizeText, stripAccents } from "@/lib/teacherText";
import { LanguageCode } from "@/types/learning";

// Lowercase, no accents, no punctuation
const plain = (text: string) => stripAccents(normalizeText(text));

// Right when the heard text contains a keyword (keywords may be word stems)
function hasKeyword(heard: string, keywords: string[]): boolean {
  const text = plain(heard);
  return keywords.some((keyword) => {
    const key = plain(keyword);
    return key !== "" && text.includes(key);
  });
}

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
  // Words understood so far, shown live while listening
  const [liveText, setLiveText] = useState("");
  const [error, setError] = useState("");
  const stopRef = useRef<(() => void) | null>(null);

  // Stop the microphone when the exercise leaves the screen
  useEffect(() => () => stopRef.current?.(), []);

  const hasPassed = result?.passed === true;
  // With hideText the sentence stays hidden until the first attempt
  const showText = !exercise.hideText || result !== null;
  // Question exercises: the learner answers in their own words
  const question = exercise.question;
  const languageName =
    LANGUAGES.find((l) => l.code === languageCode)?.name ?? "the language";

  // For a question the score is only "has a keyword" or not
  function answerResult(transcript: string): PronunciationResult {
    const passed = hasKeyword(transcript, exercise.keywords ?? []);
    return { words: [], score: passed ? 1 : 0, passed };
  }

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
    setLiveText("");
    stopRef.current = listenOnce(locale, {
      onPartial: setLiveText,
      onResult: (transcript) => {
        const comparison = question
          ? answerResult(transcript)
          : comparePronunciation(exercise.text, transcript);
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
        <Text className="h3 mb-1">
          {question
            ? "Answer the question out loud"
            : exercise.hideText
            ? `Say this in ${languageName}`
            : exercise.kind === "speak-word"
              ? "Say this word"
              : "Say it out loud"}
        </Text>
        <Text className="body-sm text-text-secondary mb-5">
          {question
            ? "Tap the mic and answer in your own words."
            : exercise.hideText
            ? "Tap the mic and say it in your own words."
            : "Listen first if you like, then tap the mic and speak."}
        </Text>

        {question ? (
          <View className="bg-surface rounded-2xl px-4 py-4 flex-row items-center mb-6">
            <View className="flex-1 mr-3">
              <Text
                className="font-poppins-semibold text-lg text-text-primary"
                testID="speak-question"
              >
                {question}
              </Text>
              <Text className="body-sm text-text-secondary mt-1">
                {exercise.translation}
              </Text>
            </View>
            <SpeakButton text={question} languageCode={languageCode} />
          </View>
        ) : showText ? (
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
        ) : (
          <View className="bg-surface rounded-2xl px-5 py-6 items-center mb-6">
            <Text className="h2 text-center" testID="speak-prompt">
              {exercise.translation}
            </Text>
          </View>
        )}

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
            {isListening && liveText !== "" && (
              <Text
                className="body-md text-text-primary text-center mt-2"
                testID="live-transcript"
              >
                I hear: “{liveText}”
              </Text>
            )}
          </View>
        )}

        {error !== "" && !isListening && (
          <Text className="body-sm text-error text-center mt-4">{error}</Text>
        )}

        {result && !isListening && question && (
          <View className="mt-5" testID="speech-result">
            <Text className="body-sm text-text-secondary">
              I heard: “{heard}”
            </Text>
            {result.passed && (
              <Text className="font-poppins-semibold text-sm text-success mt-1">
                Great answer!
              </Text>
            )}
            <View className="bg-surface rounded-2xl px-4 py-3 flex-row items-center mt-3">
              <Text className="flex-1 mr-3 body-md text-text-primary" testID="speak-example">
                Example: {exercise.text}
              </Text>
              <SpeakButton text={exercise.text} languageCode={languageCode} />
            </View>
          </View>
        )}

        {result && !isListening && !question && (
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
