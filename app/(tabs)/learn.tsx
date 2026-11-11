import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { MapLine } from "@/components/map/MapLine";
import { MapNode } from "@/components/map/MapNode";
import { ThemeBackground } from "@/components/map/ThemeBackground";
import { colors } from "@/constants/theme";
import { THEMES } from "@/data/themes";
import { buildMapLayout, MAX_MAP_WIDTH } from "@/lib/mapLayout";
import { getNextLesson, getUnits } from "@/lib/progress";
import { useLanguageStore, useStartUnitOrder } from "@/store/languageStore";
import { useLearningHydrated, useLearningStore } from "@/store/learningStore";

// The progress map: every lesson is a level on a winding path. Finishing a
// level sends a line running to the next one, and the background shows the
// theme of the level the learner is on. All levels can be opened anytime.
export default function LearnScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { selectedLanguage } = useLanguageStore();
  const { completedLessonIds } = useLearningStore();
  const startUnitOrder = useStartUnitOrder();
  const isHydrated = useLearningHydrated();
  const scrollRef = useRef<ScrollView>(null);

  // What the map shows. It lags behind the saved progress on purpose: a
  // level finished in a lesson is revealed when the learner comes back to
  // the map, so the line animation happens in front of their eyes.
  const [shownCompleted, setShownCompleted] = useState<string[] | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (isHydrated) setShownCompleted(completedLessonIds);
    }, [isHydrated, completedLessonIds]),
  );

  const mapWidth = Math.min(width, MAX_MAP_WIDTH);
  const units = getUnits(selectedLanguage);
  const layout = buildMapLayout(units, mapWidth);
  const completed = shownCompleted ?? [];

  const nextLesson = getNextLesson(selectedLanguage, completed, startUnitOrder);
  // The level the learner is on (the last one when everything is done)
  const currentNode =
    layout.nodes.find((node) => node.lesson.id === nextLesson?.id) ??
    layout.nodes[layout.nodes.length - 1];
  const currentY = currentNode?.y ?? 0;
  const isReady = shownCompleted !== null;

  // Keep the current level in view, also after it moved on
  useEffect(() => {
    if (!isReady) return;
    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({
        y: Math.max(0, currentY - 230),
        animated: true,
      });
    }, 150);
    return () => clearTimeout(timer);
  }, [isReady, currentY]);

  if (!selectedLanguage || !currentNode) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.neutral.background }}
      >
        <View className="flex-1 items-center justify-center px-8">
          <Text className="h3 text-center mb-2">No language selected</Text>
          <Text className="body-md text-text-secondary text-center">
            Go to the home screen and pick a language to start learning.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const theme = THEMES[currentNode.lesson.theme];
  const currentUnit = layout.units.find(
    (entry) => entry.unit.id === currentNode.unit.id,
  );
  const currentUnitDone =
    currentUnit?.lessons.filter((l) => completed.includes(l.id)).length ?? 0;

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ThemeBackground theme={theme} />

      <SafeAreaView style={{ flex: 1 }}>
        {/* Header, as wide as the map so it also looks right on tablets */}
        <View className="w-full max-w-[480px] self-center px-4 pt-2 pb-2">
          <View
            className="bg-white rounded-2xl px-3 py-2.5 flex-row items-center"
            style={styles.cardShadow}
          >
            <TouchableOpacity
              onPress={() => router.navigate("/")}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color={colors.neutral.textPrimary}
              />
            </TouchableOpacity>

            <View className="flex-1 items-center">
              <Text
                className="font-poppins-semibold text-base text-text-primary"
                numberOfLines={1}
              >
                {currentNode.unit.title}
              </Text>
              <Text className="caption">
                Unit {currentNode.unit.order} · {currentUnitDone}/
                {currentUnit?.lessons.length ?? 0} lessons
              </Text>
            </View>

            <View className="w-6" />
          </View>

          {/* The theme the background is showing */}
          <View className="items-center mt-2">
            <View
              className="rounded-full px-3 py-1"
              style={{ backgroundColor: theme.accent }}
            >
              <Text
                className="font-poppins-semibold text-xs text-white"
                testID="map-theme"
              >
                Now learning: {theme.emoji} {theme.title}
              </Text>
            </View>
          </View>
        </View>

        {!isReady ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={colors.primary.purple} />
          </View>
        ) : (
          <ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={{ width: mapWidth, height: layout.height }}>
              {/* Lines first, so banners and levels sit on top of them */}
              {layout.nodes.slice(0, -1).map((node, index) => (
                <MapLine
                  key={node.lesson.id}
                  lessonId={node.lesson.id}
                  from={node}
                  to={layout.nodes[index + 1]}
                  filled={completed.includes(node.lesson.id)}
                  color={THEMES[node.lesson.theme].accent}
                />
              ))}

              {/* One banner per unit */}
              {layout.units.map(({ unit, lessons, y }) => {
                const done = lessons.filter((l) =>
                  completed.includes(l.id),
                ).length;

                return (
                  <View
                    key={unit.id}
                    className="absolute left-4 right-4 bg-white rounded-2xl px-4 py-2.5"
                    style={[styles.cardShadow, { top: y }]}
                    testID={`unit-${unit.order}`}
                  >
                    <View className="flex-row items-center gap-2">
                      <View className="bg-lingua-purple rounded-full px-2.5 py-0.5">
                        <Text className="font-poppins-semibold text-[11px] text-white">
                          {unit.level}
                        </Text>
                      </View>
                      <Text className="caption">
                        Unit {unit.order} · {done}/{lessons.length} done
                      </Text>
                    </View>
                    <Text className="h4" numberOfLines={1}>
                      {unit.title}
                    </Text>
                    {unit.order < startUnitOrder && (
                      <Text className="caption">
                        Below your starting level, still open for review.
                      </Text>
                    )}
                  </View>
                );
              })}

              {/* The levels */}
              {layout.nodes.map((node) => (
                <MapNode
                  key={node.lesson.id}
                  lesson={node.lesson}
                  levelNumber={node.levelNumber}
                  x={node.x}
                  y={node.y}
                  status={
                    completed.includes(node.lesson.id)
                      ? "done"
                      : node.lesson.id === nextLesson?.id
                        ? "current"
                        : "open"
                  }
                  accent={THEMES[node.lesson.theme].accent}
                  // Dax stands on the side with more room
                  mascotSide={node.x > mapWidth / 2 ? "left" : "right"}
                  onPress={() => router.push(`/lesson/${node.lesson.id}`)}
                />
              ))}
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

// ScrollView.contentContainerStyle and shadows must stay in StyleSheet
const styles = StyleSheet.create({
  scrollContent: {
    alignItems: "center",
    paddingBottom: 110,
  },
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
});
