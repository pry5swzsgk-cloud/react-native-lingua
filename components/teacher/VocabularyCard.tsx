import { Text, View } from "react-native";

import { SpeakButton } from "@/components/SpeakButton";
import { LANGUAGES } from "@/data/languages";
import { DictionaryMatch } from "@/lib/teacherDictionary";
import { LanguageCode } from "@/types/learning";

interface VocabularyCardProps {
  words: DictionaryMatch[];
  languageCode: LanguageCode;
}

// The answer to "Wie sagt man …?": the German word and what it is in the
// language being learned, with a button to hear it.
export function VocabularyCard({ words, languageCode }: VocabularyCardProps) {
  const language = LANGUAGES.find((l) => l.code === languageCode);

  return (
    <View
      className="bg-[#FFF6DB] border border-[#F5D36B] rounded-2xl px-4 py-3 mb-3"
      testID="chat-help"
    >
      <Text className="caption mb-1">
        🇩🇪 German → {language?.flag} {language?.name}
      </Text>
      {words.map((word) => (
        <View key={word.german} className="flex-row items-center py-1.5">
          <View className="flex-1 mr-3">
            <Text className="body-sm text-text-secondary">{word.german}</Text>
            <Text className="font-poppins-semibold text-lg text-text-primary">
              {word.target}
            </Text>
          </View>
          {/* "soy / estoy": read only the first one aloud */}
          <SpeakButton text={word.target.split(" / ")[0]} languageCode={languageCode} />
        </View>
      ))}
    </View>
  );
}
