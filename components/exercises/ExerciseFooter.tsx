import { Text, TouchableOpacity, View } from "react-native";

import { AnswerStatus } from "@/lib/answers";

interface ExerciseFooterProps {
  // null while the learner is still answering
  status: AnswerStatus | null;
  canCheck?: boolean;
  onCheck?: () => void;
  onContinue: () => void;
  // Shown after a wrong or almost-right answer
  correctAnswer?: string;
}

const TITLES: Record<AnswerStatus, string> = {
  correct: "Correct! 🎉",
  almost: "Almost! Check the spelling",
  wrong: "Not quite",
};

// Bottom bar of every exercise: "Check" first, then the feedback with
// "Continue". Green for right answers, red for wrong ones.
export function ExerciseFooter({
  status,
  canCheck = false,
  onCheck,
  onContinue,
  correctAnswer,
}: ExerciseFooterProps) {
  if (status === null) {
    // Exercises without a Check step (matching) show nothing until solved
    if (!onCheck) return null;

    return (
      <View className="px-5 pt-3 pb-4">
        <TouchableOpacity
          className={`rounded-2xl items-center py-4 ${canCheck ? "bg-lingua-purple" : "bg-border"}`}
          activeOpacity={0.85}
          disabled={!canCheck}
          onPress={onCheck}
          testID="check-button"
        >
          <Text
            className={`font-poppins-semibold text-base ${canCheck ? "text-white" : "text-text-secondary"}`}
          >
            Check
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isWrong = status === "wrong";

  return (
    <View
      className={`px-5 pt-4 pb-4 ${isWrong ? "bg-[#FFECEC]" : "bg-[#E8F9F0]"}`}
      testID={`feedback-${status}`}
    >
      <Text
        className={`font-poppins-bold text-lg ${isWrong ? "text-error" : "text-success"}`}
      >
        {TITLES[status]}
      </Text>
      {correctAnswer !== undefined && status !== "correct" && (
        <Text className="body-md mt-1">
          Correct answer:{" "}
          <Text className="font-poppins-semibold" testID="correct-answer">
            {correctAnswer}
          </Text>
        </Text>
      )}
      <TouchableOpacity
        className={`rounded-2xl items-center py-4 mt-3 ${isWrong ? "bg-error" : "bg-success"}`}
        activeOpacity={0.85}
        onPress={onContinue}
        testID="continue-button"
      >
        <Text className="font-poppins-semibold text-base text-white">
          Continue
        </Text>
      </TouchableOpacity>
    </View>
  );
}
