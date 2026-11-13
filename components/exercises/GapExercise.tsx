import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

import { ExerciseFooter } from "@/components/exercises/ExerciseFooter";
import { SpeakButton } from "@/components/SpeakButton";
import { colors } from "@/constants/theme";
import { AnswerStatus, checkTypedAnswer } from "@/lib/answers";
import { ExerciseResult, GapExerciseData } from "@/lib/exercises";
import { playSound } from "@/lib/sounds";
import { stopSpeaking } from "@/lib/speech";
import { LanguageCode } from "@/types/learning";

interface GapExerciseProps {
  exercise: GapExerciseData;
  languageCode: LanguageCode | null;
  onDone: (result: ExerciseResult) => void;
}

// A sentence with one missing word. gap-choose: pick the word from 4 options.
// gap-type: type the word ("almost" counts, like in TypeExercise).
export function GapExercise({ exercise, languageCode, onDone }: GapExerciseProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [typed, setTyped] = useState("");
  const [status, setStatus] = useState<AnswerStatus | null>(null);

  const isTyping = exercise.kind === "gap-type";
  const canCheck = isTyping ? typed.trim() !== "" : selected !== null;

  function handleCheck() {
    if (!canCheck || status !== null) return;
    stopSpeaking();
    const result: AnswerStatus = isTyping
      ? checkTypedAnswer(exercise.answer, typed)
      : selected === exercise.answer
        ? "correct"
        : "wrong";
    playSound(result === "wrong" ? "wrong" : "correct");
    setStatus(result);
  }

  function optionClass(option: string) {
    if (status !== null && option === exercise.answer) {
      return "bg-[#E8F9F0] border-success";
    }
    if (status !== null && option === selected) return "bg-[#FFECEC] border-error";
    if (option === selected) return "bg-[rgba(108,78,245,0.08)] border-lingua-purple";
    return "bg-white border-border";
  }

  return (
    <View className="flex-1" testID="exercise-gap">
      <View className="flex-1 px-5">
        <Text className="h3 mb-1">{isTyping ? "Type the missing word" : "Fill in the gap"}</Text>
        <Text className="body-sm text-text-secondary mb-5">
          {isTyping
            ? "Capital letters don't matter."
            : "Pick the word that completes the sentence."}
        </Text>

        <View className="bg-surface rounded-2xl px-5 py-6 mb-5">
          <Text className="h2 text-center" testID="gap-sentence">
            {exercise.before}
            {status === null ? (
              "____"
            ) : (
              <Text className="text-success">{exercise.answer}</Text>
            )}
            {exercise.after}
          </Text>
          <Text className="body-md text-text-secondary text-center mt-3">
            {exercise.translation}
          </Text>
        </View>

        {isTyping ? (
          // TextInput is styled inline (see AGENTS.md style exceptions)
          <TextInput
            value={typed}
            onChangeText={setTyped}
            onSubmitEditing={handleCheck}
            editable={status === null}
            placeholder="Type the missing word"
            placeholderTextColor="#9ca3af"
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            autoComplete="off"
            returnKeyType="done"
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
              fontFamily: "Poppins-Medium",
              fontSize: 18,
              color: colors.neutral.textPrimary,
              backgroundColor: "#fff",
            }}
          />
        ) : (
          <View className="gap-3">
            {exercise.options.map((option) => (
              <TouchableOpacity
                key={option}
                className={`rounded-2xl border-[1.5px] px-4 py-4 ${optionClass(option)}`}
                activeOpacity={0.8}
                disabled={status !== null}
                onPress={() => setSelected(option)}
                accessibilityLabel={option}
                testID="gap-option"
              >
                <Text className="font-poppins-medium text-base text-text-primary">
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {status !== null && (
          <View className="flex-row items-center justify-center gap-2 mt-5">
            <SpeakButton text={exercise.full} languageCode={languageCode} />
            <Text className="body-md text-text-secondary shrink">{exercise.full}</Text>
          </View>
        )}
      </View>

      <ExerciseFooter
        status={status}
        canCheck={canCheck}
        onCheck={handleCheck}
        onContinue={() => onDone(status === "wrong" ? "wrong" : "correct")}
        correctAnswer={exercise.answer}
      />
    </View>
  );
}
