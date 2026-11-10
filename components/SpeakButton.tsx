import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";

import { colors } from "@/constants/theme";
import { speak } from "@/lib/speech";
import { LanguageCode } from "@/types/learning";

interface SpeakButtonProps {
  text: string;
  languageCode: LanguageCode | null;
}

// Round speaker button that reads a word or sentence aloud.
export function SpeakButton({ text, languageCode }: SpeakButtonProps) {
  return (
    <TouchableOpacity
      className="w-10 h-10 rounded-full bg-[#EDE9FE] items-center justify-center"
      activeOpacity={0.7}
      onPress={() => speak(text, languageCode)}
      accessibilityLabel={`Listen to ${text}`}
      testID="speak-button"
    >
      <Ionicons name="volume-medium" size={20} color={colors.primary.purple} />
    </TouchableOpacity>
  );
}
