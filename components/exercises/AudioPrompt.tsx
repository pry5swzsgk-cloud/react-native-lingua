import { Text, View } from "react-native";

import { SpeakButton } from "@/components/SpeakButton";
import { LanguageCode } from "@/types/learning";

interface AudioPromptProps {
  text: string;
  languageCode: LanguageCode | null;
}

// The audio part of a listening exercise: a big speaker for normal speed
// and a smaller button that reads the same text at half speed.
export function AudioPrompt({ text, languageCode }: AudioPromptProps) {
  return (
    <View className="flex-row items-center justify-center gap-5 mb-6">
      {/* Empty box as wide as the slow button keeps the big one centered */}
      <View className="w-14" />
      <SpeakButton text={text} languageCode={languageCode} size="large" />
      <View className="items-center w-14">
        <SpeakButton
          text={text}
          languageCode={languageCode}
          size="medium"
          slow
        />
        <Text className="caption mt-1">Slow</Text>
      </View>
    </View>
  );
}
