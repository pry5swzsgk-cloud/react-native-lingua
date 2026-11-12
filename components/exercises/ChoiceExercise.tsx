import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { AudioPrompt } from "@/components/exercises/AudioPrompt";
import { ExerciseFooter } from "@/components/exercises/ExerciseFooter";
import { ChoiceExerciseData, ExerciseResult } from "@/lib/exercises";
import { playSound } from "@/lib/sounds";
import { stopSpeaking } from "@/lib/speech";
import { LanguageCode } from "@/types/learning";

interface ChoiceExerciseProps {
  exercise: ChoiceExerciseData;
  languageCode: LanguageCode | null;
  onDone: (result: ExerciseResult) => void;
}

// Pick one option: meaning, picture, heard text or true/false. Options are
// shown as a list or as a two-column grid.
export function ChoiceExercise({
  exercise,
  languageCode,
  onDone,
}: ChoiceExerciseProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [isChecked, setIsChecked] = useState(false);

  const isCorrect = selected === exercise.answer;
  const isGrid = exercise.layout === "grid";
  // Picture tiles show only the emoji, so the answer is the meaning text
  const isPicture = exercise.kind === "picture";

  function optionClass(label: string) {
    if (isChecked && label === exercise.answer) {
      return "bg-[#E8F9F0] border-success";
    }
    if (isChecked && label === selected) return "bg-[#FFECEC] border-error";
    if (label === selected) {
      return "bg-[rgba(108,78,245,0.08)] border-lingua-purple";
    }
    return "bg-white border-border";
  }

  return (
    <View className="flex-1" testID="exercise-choice">
      <View className="flex-1 px-5">
        <Text className="h3 mb-4">{exercise.instruction}</Text>

        {exercise.audio && (
          <AudioPrompt text={exercise.audio} languageCode={languageCode} />
        )}

        {exercise.context && (
          <View className="gap-2 mb-4">
            {exercise.context.map((line, index) => (
              <View
                key={index}
                className="self-start rounded-2xl bg-white border border-border px-4 py-3"
              >
                <Text className="caption mb-1">{line.speaker}</Text>
                <Text className="body-md text-text-primary">{line.text}</Text>
              </View>
            ))}
          </View>
        )}

        {exercise.promptEmoji && (
          <Text className="text-6xl text-center mb-2">{exercise.promptEmoji}</Text>
        )}
        {exercise.prompt && (
          <Text className="h2 text-center mb-6">{exercise.prompt}</Text>
        )}

        <View
          className={isGrid ? "flex-row flex-wrap justify-between gap-y-3" : "gap-3"}
        >
          {exercise.options.map((option) => (
            <TouchableOpacity
              key={option.label}
              className={`rounded-2xl border-[1.5px] px-4 py-4 ${
                isGrid ? "basis-[48%] items-center justify-center" : ""
              } ${optionClass(option.label)}`}
              activeOpacity={0.8}
              disabled={isChecked}
              onPress={() => setSelected(option.label)}
              accessibilityLabel={option.label}
              testID="choice-option"
            >
              {isPicture && option.emoji ? (
                <Text className="text-5xl py-3">{option.emoji}</Text>
              ) : (
                <>
                  {option.emoji && <Text className="text-3xl mb-1">{option.emoji}</Text>}
                  <Text className="font-poppins-medium text-base text-text-primary">
                    {option.label}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {isChecked && exercise.audio && (
          <Text className="body-md text-text-secondary text-center mt-5">
            You heard: <Text className="font-poppins-semibold">{exercise.audio}</Text>
          </Text>
        )}
      </View>

      <ExerciseFooter
        status={isChecked ? (isCorrect ? "correct" : "wrong") : null}
        canCheck={selected !== null}
        onCheck={() => {
          stopSpeaking();
          playSound(isCorrect ? "correct" : "wrong");
          setIsChecked(true);
        }}
        onContinue={() => onDone(isCorrect ? "correct" : "wrong")}
        correctAnswer={exercise.answer}
      />
    </View>
  );
}
