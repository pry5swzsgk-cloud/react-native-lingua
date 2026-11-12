import { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { SpeakButton } from "@/components/SpeakButton";
import { images } from "@/constants/images";
import { cleanForSpeech } from "@/lib/teacherText";
import { LanguageCode } from "@/types/learning";

interface TeacherBubbleProps {
  text: string;
  translation: string;
  // Open the German translation right away (used when the learner is stuck)
  showTranslation: boolean;
  languageCode: LanguageCode;
}

// Something Dax says in the chat. Below the text: listen, listen slowly,
// and show or hide the German translation.
export function TeacherBubble({
  text,
  translation,
  showTranslation,
  languageCode,
}: TeacherBubbleProps) {
  const [isOpen, setIsOpen] = useState(showTranslation);
  const spoken = cleanForSpeech(text);

  return (
    <View className="flex-row items-end gap-2 mb-3 pr-8" testID="chat-teacher">
      <Image source={images.mascotDino} style={styles.avatar} resizeMode="contain" />
      <View
        className="flex-1 bg-white rounded-2xl rounded-bl-md border border-border px-4 py-3"
        style={styles.shadow}
      >
        <Text
          className="font-poppins-medium text-[15px] text-text-primary leading-6"
          testID="chat-teacher-text"
        >
          {text}
        </Text>
        {isOpen && (
          <Text className="body-sm text-text-secondary mt-1" testID="chat-translation">
            {translation}
          </Text>
        )}

        <View className="flex-row items-center gap-2 mt-2">
          <SpeakButton text={spoken} languageCode={languageCode} />
          <SpeakButton text={spoken} languageCode={languageCode} slow />
          <TouchableOpacity
            className="h-10 px-3 rounded-full bg-surface items-center justify-center"
            activeOpacity={0.7}
            onPress={() => setIsOpen(!isOpen)}
            testID="chat-translate-button"
          >
            <Text className="font-poppins-medium text-xs text-text-secondary">
              {isOpen ? "Hide German" : "🇩🇪 Translate"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// Image sizes and shadows stay in StyleSheet (see AGENTS.md)
const styles = StyleSheet.create({
  avatar: { width: 32, height: 32 },
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
});
