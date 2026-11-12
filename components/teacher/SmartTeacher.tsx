import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SmartSetup } from "@/components/teacher/SmartSetup";
import { TeacherChatView } from "@/components/teacher/TeacherChat";
import { colors } from "@/constants/theme";
import { useSmartModel } from "@/hooks/useSmartModel";
import { useSmartTeacher } from "@/hooks/useSmartTeacher";
import { Level } from "@/lib/smartTeacher";
import { useSmartModeStore } from "@/store/smartModeStore";
import { LanguageCode } from "@/types/learning";

interface SmartTeacherProps {
  languageCode: LanguageCode;
  languageName: string; // "Spanish"
  correction: string; // how Dax introduces a correction, "Mejor"
  level: Level;
  firstTopic: string | null;
}

const TIPS = [
  { emoji: "💬", text: "Talk about anything: food, football, your day …" },
  { emoji: "🇩🇪", text: "Missing a word? Tap “Wie sagt man …?” and type it in German." },
  { emoji: "🎲", text: "Tap “New topic” and Dax picks something else." },
  { emoji: "💡", text: "Stuck? “Help me answer” gives you a sentence to begin with." },
];

// Smart Dax: first the setup (download and loading of the model), then
// the chat. The model status decides which of the two is shown.
export function SmartTeacher(props: SmartTeacherProps) {
  const { modelKey, setModelKey, setEnabled } = useSmartModeStore();
  const smart = useSmartModel(modelKey, true);

  if (smart.status.phase === "ready") {
    return <SmartChat {...props} onRemoveModel={smart.remove} />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.neutral.surface }}>
      <View className="flex-1 w-full max-w-[640px] self-center">
        <SmartSetup
          status={smart.status}
          model={smart.model}
          onSelectModel={setModelKey}
          onDownload={smart.download}
          onBack={() => setEnabled(false)}
        />
      </View>
    </SafeAreaView>
  );
}

interface SmartChatProps extends SmartTeacherProps {
  onRemoveModel: () => Promise<void>;
}

// The chat, once the model is loaded
function SmartChat({ onRemoveModel, ...options }: SmartChatProps) {
  const chat = useSmartTeacher(options);
  const setEnabled = useSmartModeStore((state) => state.setEnabled);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <TeacherChatView
      chat={chat}
      languageCode={options.languageCode}
      tips={TIPS}
      note="Smart Dax is an AI model that runs on your device. It is free and works offline, but it can make mistakes."
      introExtra={
        <View className="w-full items-center mt-4 gap-1">
          <TouchableOpacity
            className="py-2 px-4"
            activeOpacity={0.7}
            onPress={() => setEnabled(false)}
            testID="smart-switch-basic"
          >
            <Text className="font-poppins-semibold text-sm text-text-secondary">
              Switch to Dax with rules
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="py-2 px-4"
            activeOpacity={0.7}
            onPress={() => {
              if (confirmDelete) onRemoveModel();
              else setConfirmDelete(true);
            }}
            testID="smart-delete-button"
          >
            <Text className="font-poppins-semibold text-sm text-error">
              {confirmDelete
                ? "Tap again to delete the download"
                : "Delete the downloaded model"}
            </Text>
          </TouchableOpacity>
        </View>
      }
    />
  );
}
