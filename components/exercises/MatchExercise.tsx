import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { ExerciseFooter } from "@/components/exercises/ExerciseFooter";
import { useMascotReaction } from "@/components/exercises/PeekingMascot";
import { ExerciseResult, MatchExerciseData } from "@/lib/exercises";
import { playSound } from "@/lib/sounds";

interface MatchExerciseProps {
  exercise: MatchExerciseData;
  onDone: (result: ExerciseResult) => void;
}

// Tap a word on the left, then its meaning on the right. Right pairs turn
// green and stay, a wrong pair flashes red and can be tried again.
export function MatchExercise({ exercise, onDone }: MatchExerciseProps) {
  const react = useMascotReaction();
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [matchedWords, setMatchedWords] = useState<string[]>([]);
  const [wrongPair, setWrongPair] = useState<{
    word: string;
    translation: string;
  } | null>(null);

  const matchedTranslations = exercise.pairs
    .filter((pair) => matchedWords.includes(pair.word))
    .map((pair) => pair.translation);
  const isSolved = matchedWords.length === exercise.pairs.length;

  function handleTranslationPress(translation: string) {
    if (!selectedWord) return;
    const pair = exercise.pairs.find((p) => p.word === selectedWord);

    if (pair?.translation === translation) {
      const isLastPair = matchedWords.length + 1 === exercise.pairs.length;
      playSound(isLastPair ? "correct" : "tick");
      setMatchedWords([...matchedWords, selectedWord]);
      setWrongPair(null);
    } else {
      playSound("wrong");
      react("sad");
      setWrongPair({ word: selectedWord, translation });
      // Clear the red flash after a moment
      setTimeout(() => setWrongPair(null), 700);
    }
    setSelectedWord(null);
  }

  function tileClass(isMatched: boolean, isSelected: boolean, isWrong: boolean) {
    if (isMatched) return "bg-[#E8F9F0] border-success";
    if (isWrong) return "bg-[#FFECEC] border-error";
    if (isSelected) return "bg-[rgba(108,78,245,0.08)] border-lingua-purple";
    return "bg-white border-border";
  }

  return (
    <View className="flex-1" testID="exercise-match">
      <View className="flex-1 px-5">
        <Text className="h3 mb-1">Match the pairs</Text>
        <Text className="body-sm text-text-secondary mb-5">
          Tap a word, then tap what it means.
        </Text>

        <View className="flex-row gap-3">
          {/* Left column: words to learn */}
          <View className="flex-1 gap-3">
            {exercise.pairs.map((pair) => {
              const isMatched = matchedWords.includes(pair.word);
              return (
                <TouchableOpacity
                  key={pair.word}
                  className={`rounded-2xl border-[1.5px] px-3 py-4 items-center justify-center min-h-[60px] ${tileClass(isMatched, selectedWord === pair.word, wrongPair?.word === pair.word)}`}
                  activeOpacity={0.8}
                  disabled={isMatched}
                  onPress={() => setSelectedWord(pair.word)}
                  testID="match-word"
                >
                  <Text
                    className={`font-poppins-semibold text-sm text-center ${isMatched ? "text-success" : "text-text-primary"}`}
                  >
                    {pair.word}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Right column: meanings in mixed order */}
          <View className="flex-1 gap-3">
            {exercise.translations.map((translation, index) => {
              const isMatched = matchedTranslations.includes(translation);
              return (
                <TouchableOpacity
                  key={`${translation}-${index}`}
                  className={`rounded-2xl border-[1.5px] px-3 py-4 items-center justify-center min-h-[60px] ${tileClass(isMatched, false, wrongPair?.translation === translation)}`}
                  activeOpacity={0.8}
                  disabled={isMatched}
                  onPress={() => handleTranslationPress(translation)}
                  testID="match-translation"
                >
                  <Text
                    className={`font-poppins-medium text-sm text-center ${isMatched ? "text-success" : "text-text-primary"}`}
                  >
                    {translation}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      <ExerciseFooter
        status={isSolved ? "correct" : null}
        onContinue={() => onDone("correct")}
      />
    </View>
  );
}
