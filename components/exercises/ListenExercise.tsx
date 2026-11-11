import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { ExerciseFooter } from "@/components/exercises/ExerciseFooter";
import { SpeakButton } from "@/components/SpeakButton";
import { ExerciseResult, ListenExerciseData } from "@/lib/exercises";
import { stopSpeaking } from "@/lib/speech";
import { LanguageCode } from "@/types/learning";

interface ListenExerciseProps {
  exercise: ListenExerciseData;
  languageCode: LanguageCode | null;
  onDone: (result: ExerciseResult) => void;
}

// Pure listening: the word is only heard, never shown. The learner picks
// its meaning from four options.
export function ListenExercise({
  exercise,
  languageCode,
  onDone,
}: ListenExerciseProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [isChecked, setIsChecked] = useState(false);

  const isCorrect = selected === exercise.answer;

  function optionClass(option: string) {
    if (isChecked && option === exercise.answer) {
      return "bg-[#E8F9F0] border-success";
    }
    if (isChecked && option === selected) return "bg-[#FFECEC] border-error";
    if (option === selected) {
      return "bg-[rgba(108,78,245,0.08)] border-lingua-purple";
    }
    return "bg-white border-border";
  }

  return (
    <View className="flex-1" testID="exercise-listen">
      <View className="flex-1 px-5">
        <Text className="h3 mb-1">What do you hear?</Text>
        <Text className="body-sm text-text-secondary mb-5">
          Tap the speaker and choose the meaning.
        </Text>

        <View className="items-center mb-6">
          <SpeakButton
            text={exercise.audio}
            languageCode={languageCode}
            size="large"
          />
        </View>

        <View className="gap-3">
          {exercise.options.map((option) => (
            <TouchableOpacity
              key={option}
              className={`rounded-2xl border-[1.5px] px-4 py-4 ${optionClass(option)}`}
              activeOpacity={0.8}
              disabled={isChecked}
              onPress={() => setSelected(option)}
              testID="listen-option"
            >
              <Text className="font-poppins-medium text-base text-text-primary">
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {isChecked && (
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
          setIsChecked(true);
        }}
        onContinue={() => onDone(isCorrect ? "correct" : "wrong")}
        correctAnswer={exercise.answer}
      />
    </View>
  );
}
