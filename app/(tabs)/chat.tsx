import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/constants/theme";
import { getScenes, SCENE_KINDS } from "@/data/scenes";
import { getTeacherContent } from "@/data/teacher";
import { TRAININGS } from "@/lib/training";
import { countMistakes } from "@/lib/mistakes";
import { useLanguageStore } from "@/store/languageStore";
import { useLearningStore } from "@/store/learningStore";

// Same dark color as the call screen
const CALL_BACKGROUND = "#1B1730";

// The practice overview: trainings, a call with Dax and all
// stories, radio episodes, adventures and role plays.
export default function PracticeScreen() {
  const router = useRouter();
  const { selectedLanguage } = useLanguageStore();
  const { mistakes, completedSceneIds } = useLearningStore();

  const mistakeCount = countMistakes(selectedLanguage, mistakes);
  const hasTeacher = getTeacherContent(selectedLanguage) !== null;
  const sections = SCENE_KINDS.map((entry) => ({
    ...entry,
    scenes: getScenes(selectedLanguage, entry.kind),
  })).filter((section) => section.scenes.length > 0);

  if (!selectedLanguage) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.neutral.background }}
      >
        <View className="flex-1 items-center justify-center px-8">
          <Text className="h3 text-center mb-2">No language selected</Text>
          <Text className="body-md text-text-secondary text-center">
            Go to the home screen and pick a language to start practising.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.neutral.background }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* A column that stays compact on tablets */}
        <View className="w-full max-w-[520px] self-center">
          <Text className="h2">Practice</Text>
          <Text className="body-sm text-text-secondary mt-1 mb-4">
            Train what you learned, or try stories, radio and role plays.
          </Text>

          {/* ── Training ── */}
          <Text className="font-poppins-semibold text-[17px] text-text-primary mb-2">
            Training
          </Text>
          {TRAININGS.map((training) => (
            <TouchableOpacity
              key={training.mode}
              activeOpacity={0.8}
              className="flex-row items-center bg-surface rounded-2xl p-4 mb-3"
              testID={`practice-training-${training.mode}`}
              onPress={() =>
                router.push({
                  pathname: "/training/[mode]",
                  params: { mode: training.mode },
                })
              }
            >
              <Text className="text-[28px] mr-3">{training.emoji}</Text>
              <View className="flex-1">
                <Text className="font-poppins-semibold text-[15px] text-text-primary">
                  {training.title}
                </Text>
                <Text className="caption">{training.description}</Text>
                {training.mode === "mistakes" && mistakeCount === 0 && (
                  <Text className="caption mt-0.5">No mistakes saved</Text>
                )}
              </View>
              <View className="items-end ml-2">
                {training.mode === "mistakes" && mistakeCount > 0 && (
                  <View className="bg-error rounded-full px-2 py-0.5 mb-1 min-w-[22px] items-center">
                    <Text className="font-poppins-bold text-[11px] text-white">
                      {mistakeCount}
                    </Text>
                  </View>
                )}
                <Text className="font-poppins-semibold text-xs text-lingua-purple">
                  +{training.xp} XP
                </Text>
              </View>
            </TouchableOpacity>
          ))}

          {/* ── Call Dax ── */}
          {hasTeacher && (
            <>
              <Text className="font-poppins-semibold text-[17px] text-text-primary mt-3 mb-2">
                Call Dax
              </Text>
              <TouchableOpacity
                activeOpacity={0.85}
                className="flex-row items-center rounded-[20px] p-4 mb-3"
                style={{ backgroundColor: CALL_BACKGROUND }}
                testID="practice-call"
                onPress={() => router.push("/call")}
              >
                <Text className="text-[34px] mr-3">📞</Text>
                <View className="flex-1">
                  <Text className="font-poppins-bold text-[17px] text-white">
                    Call Dax
                  </Text>
                  <Text className="font-poppins text-xs text-white/75">
                    A voice call in Spanish. No camera, just talking.
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#fff" />
              </TouchableOpacity>
            </>
          )}

          {/* ── Stories, radio, adventures, role plays ── */}
          {sections.map((section) => (
            <View key={section.kind} className="mt-3">
              <Text className="font-poppins-semibold text-[17px] text-text-primary">
                {section.emoji} {section.title}
              </Text>
              <Text className="caption mb-2">{section.description}</Text>
              {section.scenes.map((scene) => (
                <TouchableOpacity
                  key={scene.id}
                  activeOpacity={0.8}
                  className="flex-row items-center bg-surface rounded-2xl p-3 mb-2"
                  testID={`practice-scene-${scene.id}`}
                  onPress={() =>
                    router.push({
                      pathname: "/scene/[id]",
                      params: { id: scene.id },
                    })
                  }
                >
                  <Text className="text-[24px] mr-3">{scene.emoji}</Text>
                  <Text
                    className="flex-1 font-poppins-semibold text-[14px] text-text-primary"
                    numberOfLines={2}
                  >
                    {scene.title}
                  </Text>
                  <View className="bg-white rounded-full px-2 py-0.5 ml-2">
                    <Text className="font-poppins-semibold text-[11px] text-text-secondary">
                      {scene.level.toUpperCase()}
                    </Text>
                  </View>
                  <Text className="font-poppins-semibold text-xs text-lingua-purple ml-2">
                    +{scene.xpReward} XP
                  </Text>
                  {completedSceneIds.includes(scene.id) && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.semantic.success}
                      style={styles.check}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ))}

          {sections.length === 0 && (
            <View
              className="bg-surface rounded-2xl p-4 mt-3"
              testID="practice-scenes-notice"
            >
              <Text className="body-md text-text-secondary text-center">
                Stories, radio, adventures and role plays are only available in
                Spanish so far.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ScrollView.contentContainerStyle and the icon spacing stay in StyleSheet
const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 110,
  },
  check: { marginLeft: 6 },
});
