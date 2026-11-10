import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LANGUAGES } from "@/data/languages";
import { getUnitLessons, getUnits } from "@/lib/progress";
import { useLanguageStore, useStartUnitOrder } from "@/store/languageStore";
import { UnitLevel } from "@/types/learning";

const LEVEL_LABELS: Record<UnitLevel, string> = {
  A1: "I'm just starting",
  A2: "I know the basics",
  B1: "I can have simple conversations",
};

// Lets the learner pick a starting point so they can skip what they know.
// Nothing gets locked: easier units stay open for review.
export default function LevelSelectScreen() {
  const { selectedLanguage, setStartUnitOrder } = useLanguageStore();
  const savedOrder = useStartUnitOrder();
  const [selectedOrder, setSelectedOrder] = useState(savedOrder);

  const language = LANGUAGES.find((l) => l.code === selectedLanguage);
  const units = getUnits(selectedLanguage);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-8 h-8 items-center justify-center"
        >
          <Ionicons name="chevron-back" size={24} color="#001328" />
        </TouchableOpacity>
        <Text className="flex-1 text-center font-poppins-semibold text-lg text-text-primary">
          Choose your level
        </Text>
        <View className="w-8" />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text className="body-md text-text-secondary mb-4">
          How much {language?.name ?? "of this language"} do you already know?
          Pick the first sentence that feels new to you.
        </Text>

        <View className="gap-3">
          {units.map((unit) => {
            const isSelected = unit.order === selectedOrder;
            // A sentence from this level, so learners can judge themselves
            const example = getUnitLessons(unit)[0]?.phrases[0];

            return (
              <TouchableOpacity
                key={unit.id}
                onPress={() => setSelectedOrder(unit.order)}
                activeOpacity={0.8}
                testID={`level-option-${unit.level}`}
                className={`rounded-2xl border-[1.5px] px-4 py-3.5 ${isSelected ? "bg-[rgba(108,78,245,0.08)] border-lingua-purple" : "bg-white border-border"}`}
              >
                <View className="flex-row items-center gap-2 mb-1">
                  <View className="bg-lingua-purple rounded-full px-2.5 py-0.5">
                    <Text className="font-poppins-semibold text-[11px] text-white">
                      {unit.level}
                    </Text>
                  </View>
                  <Text className="flex-1 font-poppins-semibold text-base text-text-primary">
                    {LEVEL_LABELS[unit.level]}
                  </Text>
                  {isSelected && (
                    <View className="w-6 h-6 rounded-full bg-lingua-purple items-center justify-center">
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    </View>
                  )}
                </View>
                <Text className="body-sm text-text-secondary">
                  Starts with: {unit.title}
                </Text>
                {example && (
                  <Text className="font-poppins-medium text-sm text-text-primary mt-2">
                    “{example.text}”
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Confirm button */}
      <View className="px-4 pt-3 pb-3">
        <TouchableOpacity
          className="bg-lingua-purple rounded-2xl items-center py-4"
          activeOpacity={0.85}
          testID="level-confirm-button"
          onPress={() => {
            if (selectedLanguage) {
              setStartUnitOrder(selectedLanguage, selectedOrder);
            }
            // Close the selection screens, then let app/index.tsx route home
            if (router.canDismiss()) router.dismissAll();
            router.replace("/");
          }}
        >
          <Text className="font-poppins-semibold text-base text-white">
            Start learning
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});
