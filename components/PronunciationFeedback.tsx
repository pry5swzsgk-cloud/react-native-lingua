import { Text } from "react-native";

import { PronunciationResult } from "@/lib/pronunciation";

interface PronunciationFeedbackProps {
  sentence: string;
  result: PronunciationResult;
  heard: string;
}

// Shows a spoken sentence word by word: green = recognized, red = not.
export function PronunciationFeedback({
  sentence,
  result,
  heard,
}: PronunciationFeedbackProps) {
  // Languages without spaces (Japanese) are compared character by character
  const separator = sentence.includes(" ") ? " " : "";
  const percent = Math.round(result.score * 100);

  return (
    <>
      <Text className="font-poppins-semibold text-sm">
        {result.words.map((word, index) => (
          <Text
            key={`${word.text}-${index}`}
            className={word.ok ? "text-success" : "text-error"}
          >
            {word.text}
            {separator}
          </Text>
        ))}
      </Text>
      <Text className="body-sm text-text-secondary mt-1">
        {result.passed
          ? `Great job! ${percent}% matched.`
          : `${percent}% matched. I heard: “${heard}”. Try again!`}
      </Text>
    </>
  );
}
