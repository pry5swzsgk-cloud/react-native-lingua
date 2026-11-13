import { useState } from "react";
import { Text, TextInput, View } from "react-native";

import { ExerciseFooter } from "@/components/exercises/ExerciseFooter";
import { AudioPrompt } from "@/components/exercises/AudioPrompt";
import { colors } from "@/constants/theme";
import { LANGUAGES } from "@/data/languages";
import { AnswerStatus, checkTypedAnswer } from "@/lib/answers";
import {
  DictationExerciseData,
  ExerciseResult,
  WriteExerciseData,
} from "@/lib/exercises";
import { checkTranslatedSentence } from "@/lib/sentenceMatch";
import { playSound } from "@/lib/sounds";
import { stopSpeaking } from "@/lib/speech";
import { LanguageCode } from "@/types/learning";

interface TypeExerciseProps {
  exercise: WriteExerciseData | DictationExerciseData;
  languageCode: LanguageCode | null;
  onDone: (result: ExerciseResult) => void;
}

// Both typing exercises share this screen:
//   write     - see a word and write it in the other language
//   dictation - hear a word or sentence and write it down
export function TypeExercise({ exercise, languageCode, onDone }: TypeExerciseProps) {
  const [typed, setTyped] = useState("");
  const [status, setStatus] = useState<AnswerStatus | null>(null);
  // false when a sentence was right but worded differently from the model answer
  const [exact, setExact] = useState(true);

  const languageName =
    LANGUAGES.find((l) => l.code === languageCode)?.name ?? "the language";
  const answerLanguage = exercise.answerInEnglish ? "English" : languageName;

  function handleCheck() {
    if (!typed.trim() || status !== null) return;
    stopSpeaking();
    let result: AnswerStatus;
    if (exercise.kind === "translate-sentence") {
      const sentence = checkTranslatedSentence(exercise.answer, typed);
      result = sentence.status;
      setExact(sentence.exact);
    } else {
      result = checkTypedAnswer(
        exercise.answer,
        typed,
        exercise.answerInEnglish,
      );
    }
    // "almost" (accent or typo) still counts, so it gets the happy sound
    playSound(result === "wrong" ? "wrong" : "correct");
    setStatus(result);
  }

  return (
    <View className="flex-1" testID={`exercise-${exercise.type}`}>
      <View className="flex-1 px-5">
        {exercise.type === "write" ? (
          <>
            <Text className="h3 mb-1">Write this in {answerLanguage}</Text>
            <Text className="body-sm text-text-secondary mb-5">
              {exercise.kind === "translate-sentence"
                ? "Any word order that means the same is fine."
                : "Type the answer yourself. Capital letters don't matter."}
            </Text>
            <View className="bg-surface rounded-2xl px-5 py-6 items-center mb-5">
              {exercise.emoji && (
                <Text className="text-4xl mb-2">{exercise.emoji}</Text>
              )}
              <Text className="h2 text-center" testID="write-prompt">
                {exercise.prompt}
              </Text>
              {exercise.pronunciation && (
                <Text className="caption mt-1">{exercise.pronunciation}</Text>
              )}
            </View>
          </>
        ) : (
          <>
            <Text className="h3 mb-1">
              {exercise.answerInEnglish
                ? "Listen and write the meaning"
                : "Write what you hear"}
            </Text>
            <Text className="body-sm text-text-secondary mb-5">
              Tap the speaker as often as you like (0.5× is slow), then type{" "}
              {exercise.answerInEnglish
                ? "what it means in English."
                : `it in ${languageName}.`}
            </Text>
            <AudioPrompt text={exercise.audio} languageCode={languageCode} />
          </>
        )}

        {/* TextInput is styled inline (see AGENTS.md style exceptions) */}
        <TextInput
          value={typed}
          onChangeText={setTyped}
          onSubmitEditing={handleCheck}
          editable={status === null}
          placeholder={`Type in ${answerLanguage}`}
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
        {status === "correct" && !exact && (
          <Text className="body-sm text-text-secondary mt-3" testID="translate-alternative">
            Another way to say it: {exercise.answer}
          </Text>
        )}
      </View>

      <ExerciseFooter
        status={status}
        canCheck={typed.trim() !== ""}
        onCheck={handleCheck}
        onContinue={() => onDone(status === "wrong" ? "wrong" : "correct")}
        correctAnswer={exercise.answer}
      />
    </View>
  );
}
