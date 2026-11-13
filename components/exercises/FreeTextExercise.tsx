import { useState } from "react";
import { Text, TextInput, View } from "react-native";

import { ExerciseFooter } from "@/components/exercises/ExerciseFooter";
import { SpeakButton } from "@/components/SpeakButton";
import { colors } from "@/constants/theme";
import { AnswerStatus, containsKeyword } from "@/lib/answers";
import { ExerciseResult, FreeTextExerciseData } from "@/lib/exercises";
import { playSound } from "@/lib/sounds";
import { stopSpeaking } from "@/lib/speech";
import { LanguageCode } from "@/types/learning";

interface FreeTextExerciseProps {
  exercise: FreeTextExerciseData;
  languageCode: LanguageCode | null;
  onDone: (result: ExerciseResult) => void;
}

// Dax asks a question and the learner answers in their own words.
// The check is simple and offline: too short = wrong, a keyword = correct,
// anything else = "almost" (it still counts, but Dax says it cannot be sure).
export function FreeTextExercise({ exercise, languageCode, onDone }: FreeTextExerciseProps) {
  const [typed, setTyped] = useState("");
  const [status, setStatus] = useState<AnswerStatus | null>(null);

  function handleCheck() {
    if (!typed.trim() || status !== null) return;
    stopSpeaking();
    const wordCount = typed.trim().split(/\s+/).length;
    let result: AnswerStatus = "almost";
    if (wordCount < 2) result = "wrong";
    else if (containsKeyword(typed, exercise.keywords)) result = "correct";
    playSound(result === "wrong" ? "wrong" : "correct");
    setStatus(result);
  }

  return (
    <View className="flex-1" testID="exercise-freetext">
      <View className="flex-1 px-5">
        <Text className="h3 mb-4">Answer in your own words</Text>
        <View className="bg-surface rounded-2xl px-5 py-5 items-center mb-5">
          <SpeakButton text={exercise.question} languageCode={languageCode} />
          <Text className="h2 text-center mt-2" testID="freetext-question">
            {exercise.question}
          </Text>
          <Text className="caption mt-1 text-center">{exercise.questionTranslation}</Text>
        </View>

        {/* TextInput is styled inline (see AGENTS.md style exceptions) */}
        <TextInput
          value={typed}
          onChangeText={setTyped}
          editable={status === null}
          multiline
          placeholder="Write your answer"
          placeholderTextColor="#9ca3af"
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          autoComplete="off"
          testID="answer-input"
          style={{
            borderWidth: 1.5,
            borderColor:
              status === null
                ? colors.neutral.border
                : status === "wrong"
                  ? colors.semantic.error
                  : colors.semantic.success,
            borderRadius: 16,
            paddingHorizontal: 16,
            paddingVertical: 14,
            minHeight: 96,
            textAlignVertical: "top",
            fontFamily: "Poppins-Medium",
            fontSize: 18,
            color: colors.neutral.textPrimary,
            backgroundColor: "#fff",
          }}
        />

        {status !== null && (
          <View className="mt-4" testID="free-example">
            {status === "almost" && (
              <Text className="body-sm text-text-secondary mb-2">
                Dax cannot fully check free answers. Compare with the example.
              </Text>
            )}
            <Text className="caption mb-1">Example answer</Text>
            <View className="flex-row items-center gap-3">
              <SpeakButton text={exercise.sample} languageCode={languageCode} />
              <View className="flex-1">
                <Text className="body-md font-poppins-semibold">{exercise.sample}</Text>
                <Text className="caption">{exercise.sampleTranslation}</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      <ExerciseFooter
        status={status}
        canCheck={typed.trim() !== ""}
        onCheck={handleCheck}
        almostTitle="Good try! Compare with the example"
        onContinue={() => onDone(status === "wrong" ? "wrong" : "correct")}
      />
    </View>
  );
}
