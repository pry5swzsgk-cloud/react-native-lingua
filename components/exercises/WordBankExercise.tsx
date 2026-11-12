import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { AudioPrompt } from "@/components/exercises/AudioPrompt";
import { ExerciseFooter } from "@/components/exercises/ExerciseFooter";
import { SpeakButton } from "@/components/SpeakButton";
import { ExerciseResult, WordBankExerciseData } from "@/lib/exercises";
import { playSound } from "@/lib/sounds";
import { stopSpeaking } from "@/lib/speech";
import { LanguageCode } from "@/types/learning";

interface WordBankExerciseProps {
  exercise: WordBankExerciseData;
  languageCode: LanguageCode | null;
  onDone: (result: ExerciseResult) => void;
}

// Build a sentence from word tiles. Tiles are tracked by their index, so
// the same word may appear twice. Tap a tile to move it up into the answer
// row, tap it there to put it back.
export function WordBankExercise({
  exercise,
  languageCode,
  onDone,
}: WordBankExerciseProps) {
  const [picked, setPicked] = useState<number[]>([]); // indexes into tiles
  const [isChecked, setIsChecked] = useState(false);

  // Japanese words (compose) have no spaces between characters
  const joiner = exercise.kind === "compose" ? "" : " ";
  const given = picked.map((index) => exercise.tiles[index]).join(joiner).toLowerCase();
  const isCorrect = given === exercise.answer.join(joiner).toLowerCase();
  // order and tap-heard solutions are in the target language
  const solutionIsSpoken = exercise.kind === "order" || exercise.kind === "tap-heard";

  function pick(index: number) {
    setPicked((current) => [...current, index]);
  }

  function unpick(index: number) {
    setPicked((current) => current.filter((i) => i !== index));
  }

  return (
    <View className="flex-1" testID="exercise-wordbank">
      <View className="flex-1 px-5">
        <Text className="h3 mb-4">{exercise.instruction}</Text>

        {exercise.audio && exercise.prompt && (
          <View className="flex-row items-center justify-center gap-3 mb-5">
            <SpeakButton text={exercise.audio} languageCode={languageCode} />
            <Text className="h2 shrink text-center">{exercise.prompt}</Text>
          </View>
        )}
        {exercise.audio && !exercise.prompt && (
          <AudioPrompt text={exercise.audio} languageCode={languageCode} />
        )}
        {!exercise.audio && exercise.prompt && (
          <Text className="h2 text-center mb-5">{exercise.prompt}</Text>
        )}

        {/* Answer row */}
        <View className="flex-row flex-wrap gap-2 min-h-[72px] border-b-2 border-border pb-3 mb-6">
          {picked.map((index) => (
            <TouchableOpacity
              key={index}
              className={`rounded-xl border-[1.5px] px-4 py-3 ${
                isChecked
                  ? isCorrect
                    ? "bg-[#E8F9F0] border-success"
                    : "bg-[#FFECEC] border-error"
                  : "bg-white border-border"
              }`}
              activeOpacity={0.8}
              disabled={isChecked}
              onPress={() => unpick(index)}
              accessibilityLabel={exercise.tiles[index]}
              testID="bank-answer-tile"
            >
              <Text className="font-poppins-medium text-base text-text-primary">
                {exercise.tiles[index]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tiles that are still free */}
        <View className="flex-row flex-wrap justify-center gap-2">
          {exercise.tiles.map((tile, index) =>
            picked.includes(index) ? null : (
              <TouchableOpacity
                key={index}
                className="rounded-xl border-[1.5px] border-border bg-white px-4 py-3"
                activeOpacity={0.8}
                disabled={isChecked}
                onPress={() => pick(index)}
                accessibilityLabel={tile}
                testID="bank-tile"
              >
                <Text className="font-poppins-medium text-base text-text-primary">
                  {tile}
                </Text>
              </TouchableOpacity>
            ),
          )}
        </View>

        {isChecked && (
          <View className="flex-row items-center justify-center gap-2 mt-5">
            {solutionIsSpoken && (
              <SpeakButton text={exercise.solution} languageCode={languageCode} />
            )}
            <Text className="body-md text-text-secondary shrink">
              Solution:{" "}
              <Text className="font-poppins-semibold" testID="correct-answer">
                {exercise.solution}
              </Text>
            </Text>
          </View>
        )}
      </View>

      <ExerciseFooter
        status={isChecked ? (isCorrect ? "correct" : "wrong") : null}
        canCheck={picked.length > 0}
        onCheck={() => {
          stopSpeaking();
          playSound(isCorrect ? "correct" : "wrong");
          setIsChecked(true);
        }}
        onContinue={() => onDone(isCorrect ? "correct" : "wrong")}
      />
    </View>
  );
}
