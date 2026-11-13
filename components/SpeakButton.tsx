import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { Text, TouchableOpacity } from "react-native";

import { colors } from "@/constants/theme";
import { NORMAL_RATE, SLOW_RATE, speak, stopSpeaking } from "@/lib/speech";
import { LanguageCode } from "@/types/learning";

interface SpeakButtonProps {
  text: string;
  languageCode: LanguageCode | null;
  // "large" and "medium" are used in listening exercises
  size?: "small" | "medium" | "large";
  // Reads at half speed and shows "0.5×" instead of the speaker icon
  slow?: boolean;
  // Replaces the screen reader label (e.g. when the text is hidden)
  label?: string;
}

const SIZES = {
  small: { box: "w-10 h-10", icon: 20 },
  medium: { box: "w-14 h-14", icon: 24 },
  large: { box: "w-24 h-24", icon: 44 },
};

// Round speaker button that reads a word or sentence aloud.
// Tapping it again while it plays stops the reading.
export function SpeakButton({
  text,
  languageCode,
  size = "small",
  slow = false,
  label,
}: SpeakButtonProps) {
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
    speak(
      text,
      languageCode,
      () => setSpeaking(false),
      slow ? SLOW_RATE : NORMAL_RATE,
    );
  }

  return (
    <TouchableOpacity
      className={`rounded-full items-center justify-center ${SIZES[size].box} ${isSpeaking ? "bg-lingua-purple" : "bg-[#EDE9FE]"}`}
      activeOpacity={0.7}
      onPress={handlePress}
      accessibilityLabel={
        isSpeaking
          ? label
            ? "Stop playing"
            : `Stop playing ${text}`
          : (label ??
            (slow ? `Listen slowly to ${text}` : `Listen to ${text}`))
      }
      testID={slow ? "speak-slow-button" : "speak-button"}
    >
      {slow && !isSpeaking ? (
        <Text className="font-poppins-bold text-sm text-lingua-purple">
          0.5×
        </Text>
      ) : (
        <Ionicons
          name={isSpeaking ? "stop" : "volume-medium"}
          size={SIZES[size].icon * (isSpeaking ? 0.9 : 1)}
          color={isSpeaking ? "#fff" : colors.primary.purple}
        />
      )}
    </TouchableOpacity>
  );
}
