import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { SpeakButton } from "@/components/SpeakButton";
import { colors } from "@/constants/theme";
import { LANGUAGES } from "@/data/languages";
import { comparePronunciation, PronunciationResult } from "@/lib/pronunciation";
import { listenOnce } from "@/lib/speechRecognition";
import { LanguageCode, Phrase } from "@/types/learning";

interface PhraseCardProps {
  phrase: Phrase;
  languageCode: LanguageCode | null;
  // false when the device or browser has no speech recognition
  canPractice: boolean;
}

// A sentence with a listen button and, when supported, a mic button that
// checks the learner's pronunciation word by word.
export function PhraseCard({ phrase, languageCode, canPractice }: PhraseCardProps) {
  const [isListening, setIsListening] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [result, setResult] = useState<PronunciationResult | null>(null);
  const [heard, setHeard] = useState("");
  const [error, setError] = useState("");
  const stopRef = useRef<(() => void) | null>(null);

  // Stop the microphone when the card leaves the screen
  useEffect(() => () => stopRef.current?.(), []);

  function handleMicPress() {
    // Tapping again while listening stops right away
    if (isListening) {
      setIsStopping(true);
      stopRef.current?.();
      return;
    }

    const locale =
      LANGUAGES.find((l) => l.code === languageCode)?.speechLocale ?? "en-US";

    setIsListening(true);
    setResult(null);
    setError("");
    stopRef.current = listenOnce(locale, {
      onResult: (transcript) => {
        setHeard(transcript);
        setResult(comparePronunciation(phrase.text, transcript));
      },
      onError: setError,
      onEnd: () => {
        setIsListening(false);
        setIsStopping(false);
      },
    }).stop;
  }

  return (
    <View className="bg-surface rounded-2xl px-4 py-3" testID="phrase-card">
      <View className="flex-row items-center">
        <View className="flex-1 mr-2">
          <Text className="font-poppins-semibold text-sm text-text-primary">
            {phrase.text}
          </Text>
          <Text className="caption">{phrase.pronunciation}</Text>
          <Text className="body-sm text-text-secondary mt-1">
            {phrase.translation}
          </Text>
        </View>
        <View className="gap-2">
          <SpeakButton text={phrase.text} languageCode={languageCode} />
          {canPractice && (
            <TouchableOpacity
              className={`w-10 h-10 rounded-full items-center justify-center ${isListening ? "bg-lingua-purple" : "bg-[#EDE9FE]"}`}
              activeOpacity={0.7}
              onPress={handleMicPress}
              accessibilityLabel={`Practice saying ${phrase.text}`}
              testID="mic-button"
            >
              {isListening ? (
                <Ionicons name="stop" size={18} color="#fff" />
              ) : (
                <Ionicons name="mic" size={20} color={colors.primary.purple} />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isListening && (
        <Text className="body-sm text-lingua-purple mt-2">
          {isStopping
            ? "Checking…"
            : "Listening… say the sentence, tap again to stop."}
        </Text>
      )}

      {error !== "" && !isListening && (
        <Text className="body-sm text-error mt-2">{error}</Text>
      )}

      {result && !isListening && (
        <View className="mt-2 pt-2 border-t border-border" testID="speech-result">
          <Text className="font-poppins-semibold text-sm">
            {result.words.map((word, index) => (
              <Text
                key={`${word.text}-${index}`}
                className={word.ok ? "text-success" : "text-error"}
              >
                {word.text}
                {phrase.text.includes(" ") ? " " : ""}
              </Text>
            ))}
          </Text>
          <Text className="body-sm text-text-secondary mt-1">
            {result.passed
              ? `Great job! ${Math.round(result.score * 100)}% matched.`
              : `${Math.round(result.score * 100)}% matched. I heard: “${heard}”. Try again!`}
          </Text>
        </View>
      )}
    </View>
  );
}
