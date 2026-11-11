import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { TouchableOpacity } from "react-native";

import { colors } from "@/constants/theme";
import { speak, stopSpeaking } from "@/lib/speech";
import { LanguageCode } from "@/types/learning";

interface SpeakButtonProps {
  text: string;
  languageCode: LanguageCode | null;
  // "large" is the big button used in listening exercises
  size?: "small" | "large";
}

// Round speaker button that reads a word or sentence aloud.
// Tapping it again while it plays stops the reading.
export function SpeakButton({
  text,
  languageCode,
  size = "small",
}: SpeakButtonProps) {
  const isLarge = size === "large";
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isSpeakingRef = useRef(false);

  function setSpeaking(value: boolean) {
    isSpeakingRef.current = value;
    setIsSpeaking(value);
  }

  // Stop the voice when the button leaves the screen
  useEffect(() => {
    return () => {
      if (isSpeakingRef.current) stopSpeaking();
    };
  }, []);

  function handlePress() {
    if (isSpeaking) {
      stopSpeaking();
      return;
    }
    setSpeaking(true);
    speak(text, languageCode, () => setSpeaking(false));
  }

  return (
    <TouchableOpacity
      className={`rounded-full items-center justify-center ${isLarge ? "w-24 h-24" : "w-10 h-10"} ${isSpeaking ? "bg-lingua-purple" : "bg-[#EDE9FE]"}`}
      activeOpacity={0.7}
      onPress={handlePress}
      accessibilityLabel={
        isSpeaking ? `Stop playing ${text}` : `Listen to ${text}`
      }
      testID="speak-button"
    >
      <Ionicons
        name={isSpeaking ? "stop" : "volume-medium"}
        size={(isSpeaking ? 18 : 20) * (isLarge ? 2.2 : 1)}
        color={isSpeaking ? "#fff" : colors.primary.purple}
      />
    </TouchableOpacity>
  );
}
