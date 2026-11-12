import { Text, TouchableOpacity, View } from "react-native";

import { llm } from "@/lib/llm";

interface SmartTryCardProps {
  onTry: () => void;
}

// A card on the intro of Dax with rules that leads to Smart Dax
export function SmartTryCard({ onTry }: SmartTryCardProps) {
  if (!llm.isSupported()) {
    return (
      <Text className="caption text-center mt-4" testID="smart-try-unsupported">
        Smart Dax (free chat about any topic) needs a browser with WebGPU, for
        example Safari on iPadOS 26.
      </Text>
    );
  }

  return (
    <View
      className="w-full bg-[#F1EDFF] rounded-2xl p-4 mt-4"
      testID="smart-try-card"
    >
      <View className="flex-row items-center gap-2">
        <Text className="font-poppins-semibold text-base text-text-primary">
          ✨ Smart Dax
        </Text>
        <View className="bg-white rounded-full px-2.5 py-0.5">
          <Text className="font-poppins-semibold text-[11px] text-lingua-purple">
            Beta
          </Text>
        </View>
      </View>
      <Text className="body-sm text-text-secondary mt-1">
        Chat about any topic, with an AI model that runs on this device. Free,
        and it works offline after a one-time download.
      </Text>
      <TouchableOpacity
        className="border border-lingua-purple rounded-2xl items-center py-3 mt-3"
        activeOpacity={0.85}
        onPress={onTry}
        testID="smart-try-button"
      >
        <Text className="font-poppins-semibold text-sm text-lingua-purple">
          Try Smart Dax
        </Text>
      </TouchableOpacity>
    </View>
  );
}
