import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SpeakButton } from "@/components/SpeakButton";
import { images } from "@/constants/images";
import { colors } from "@/constants/theme";
import { getScene } from "@/data/scenes";
import { playSound } from "@/lib/sounds";
import { speak, stopSpeaking } from "@/lib/speech";
import { useLearningStore } from "@/store/learningStore";
import { LanguageCode } from "@/types/learning";
import { SceneKind } from "@/types/scenes";

// What the learner did on one question / reply step
interface Answer {
  wrong: string[]; // options tapped that were wrong
  right: string | null; // the right option, once found
}

const KIND_NAMES: Record<SceneKind, string> = {
  story: "Story",
  radio: "Episode",
  adventure: "Adventure",
  roleplay: "Roleplay",
};

// Speech bubble for a line in the target language
function LineBubble({
  speaker,
  text,
  translation,
  languageCode,
  mine = false,
}: {
  speaker: string;
  text: string;
  translation: string;
  languageCode: LanguageCode;
  mine?: boolean;
}) {
  const [showTranslation, setShowTranslation] = useState(false);
  return (
    <View
      className={`rounded-2xl px-4 py-3 mb-3 max-w-[88%] ${mine ? "self-end bg-[#EDE9FE]" : "self-start bg-surface border border-border"}`}
      testID="scene-line"
    >
      <Text className="font-poppins-semibold text-xs text-lingua-purple">
        {speaker}
      </Text>
      <Text className="font-poppins-medium text-base text-text-primary mt-1">
        {text}
      </Text>
      <View className="flex-row items-center gap-2 mt-2">
        <SpeakButton text={text} languageCode={languageCode} />
        <SpeakButton text={text} languageCode={languageCode} slow />
      </View>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setShowTranslation((value) => !value)}
        testID="scene-translation-toggle"
      >
        <Text className="font-poppins-medium text-sm text-text-secondary mt-2">
          {showTranslation ? translation : "Show translation"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// Interactive stories, radio episodes, adventures and roleplays all play
// here: steps appear one by one, like a chat.
export default function SceneScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { completedSceneIds, addXP, completeScene } = useLearningStore();
  const scene = getScene(id);

  // How many steps are visible (the last one is the current one)
  const [shown, setShown] = useState(1);
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const [xp, setXp] = useState<number | null>(null);
  const [round, setRound] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  // Read a new line aloud once when it appears
  useEffect(() => {
    const step = scene?.steps[shown - 1];
    if (scene && step?.type === "line") {
      speak(step.text, scene.languageCode, () => {});
    }
  }, [scene, shown, round]);

  // Stop the voice when leaving the screen
  useEffect(() => {
    return () => stopSpeaking();
  }, []);

  function handleBack() {
    stopSpeaking();
    if (router.canGoBack()) router.back();
    else router.replace("/chat");
  }

  if (!scene) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.neutral.background }}
      >
        <View
          className="flex-1 items-center justify-center px-8"
          testID="scene-not-found"
        >
          <Text style={styles.emoji}>🤔</Text>
          <Text className="body-md text-text-secondary text-center mt-3">
            Story not found
          </Text>
          <TouchableOpacity
            className="rounded-2xl items-center py-4 px-10 border border-border mt-6"
            activeOpacity={0.85}
            onPress={handleBack}
            testID="scene-not-found-back"
          >
            <Text className="font-poppins-semibold text-base text-text-primary">
              Back
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const total = scene.steps.length;
  const current = scene.steps[shown - 1];
  const questionIndexes = scene.steps.flatMap((step, index) =>
    step.type === "question" || step.type === "reply" ? [index] : [],
  );
  const isOpen =
    (current.type === "question" || current.type === "reply") &&
    !answers[shown - 1]?.right;

  function handleChoose(index: number, option: string, answer: string) {
    if (option === answer) {
      playSound("correct");
      setAnswers((prev) => ({
        ...prev,
        [index]: { wrong: prev[index]?.wrong ?? [], right: option },
      }));
    } else {
      playSound("wrong");
      setAnswers((prev) => ({
        ...prev,
        [index]: {
          wrong: [...(prev[index]?.wrong ?? []), option],
          right: null,
        },
      }));
    }
  }

  function handleContinue() {
    if (!scene) return;
    if (shown < total) {
      setShown(shown + 1);
      return;
    }
    // Last step done: full XP the first time, half (rounded up) after that
    stopSpeaking();
    playSound("complete");
    const earned = completedSceneIds.includes(scene.id)
      ? Math.ceil(scene.xpReward / 2)
      : scene.xpReward;
    addXP(earned);
    completeScene(scene.id);
    setXp(earned);
  }

  function handlePlayAgain() {
    stopSpeaking();
    setAnswers({});
    setShown(1);
    setXp(null);
    setRound((value) => value + 1);
  }

  // ── Scene finished ──
  if (xp !== null) {
    const firstTry = questionIndexes.filter(
      (index) =>
        answers[index]?.right && (answers[index]?.wrong.length ?? 0) === 0,
    ).length;
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.neutral.background }}
      >
        <View className="flex-1 items-center justify-center px-6">
          <Image
            source={images.mascotDog}
            style={styles.mascot}
            resizeMode="contain"
          />
          <Text className="h2 text-center mt-4">
            {`${KIND_NAMES[scene.kind]} complete!`}
          </Text>
          <Text
            className="body-md text-text-secondary text-center mt-1"
            testID="scene-xp"
          >
            {`You earned +${xp} XP`}
          </Text>
          <Text
            className="body-sm text-text-secondary text-center mt-1"
            testID="scene-summary"
          >
            {`Questions: ${firstTry} right on the first try of ${questionIndexes.length}`}
          </Text>
        </View>
        <View className="px-5 pt-3 pb-4 gap-3">
          <TouchableOpacity
            className="bg-lingua-purple rounded-2xl items-center py-4"
            activeOpacity={0.85}
            onPress={handlePlayAgain}
            testID="scene-again-button"
          >
            <Text className="font-poppins-semibold text-base text-white">
              Play again
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="rounded-2xl items-center py-4 border border-border"
            activeOpacity={0.85}
            onPress={handleBack}
            testID="scene-done-button"
          >
            <Text className="font-poppins-semibold text-base text-text-primary">
              Done
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // One option button; shows green when right, red when wrong
  function renderOption(
    index: number,
    label: string,
    answer: string,
    speakIt: boolean,
  ) {
    const state = answers[index];
    const isRight = state?.right === label;
    const isWrong = state?.wrong.includes(label) ?? false;
    const style = isRight
      ? "border-[#21c16b] bg-[#E8F8EF]"
      : isWrong
        ? "border-[#ff4d4f] bg-[#FFECEC]"
        : "border-border bg-white";
    return (
      <View key={label} className="flex-row items-center gap-2 mb-2">
        <TouchableOpacity
          className={`flex-1 rounded-2xl border-2 px-4 py-3 ${style}`}
          activeOpacity={0.85}
          disabled={!!state?.right}
          onPress={() => handleChoose(index, label, answer)}
          testID="scene-option"
        >
          <Text className="font-poppins-medium text-base text-text-primary">
            {label}
          </Text>
        </TouchableOpacity>
        {speakIt && (
          <SpeakButton text={label} languageCode={scene?.languageCode ?? null} />
        )}
      </View>
    );
  }

  function renderStep(index: number) {
    const step = scene?.steps[index];
    if (!scene || !step) return null;
    switch (step.type) {
      case "narration":
        return (
          <Text
            key={index}
            className="font-poppins-regular text-sm text-text-secondary italic text-center mb-3 px-4"
          >
            {step.text}
          </Text>
        );
      case "line":
        return (
          <LineBubble
            key={index}
            speaker={step.speaker}
            text={step.text}
            translation={step.translation}
            languageCode={scene.languageCode}
          />
        );
      case "question":
        return (
          <View key={index} className="mb-3">
            <Text className="font-poppins-semibold text-base text-text-primary mb-2">
              {step.question}
            </Text>
            {step.options.map((option) =>
              renderOption(index, option, step.answer, false),
            )}
          </View>
        );
      case "reply": {
        const chosen = step.options.find(
          (option) => option.text === answers[index]?.right,
        );
        return (
          <View key={index} className="mb-3">
            <Text className="font-poppins-semibold text-base text-text-primary mb-2">
              {step.prompt}
            </Text>
            {!chosen &&
              step.options.map((option) =>
                renderOption(index, option.text, step.answer, true),
              )}
            {chosen && (
              <>
                <LineBubble
                  speaker="You"
                  text={chosen.text}
                  translation={chosen.translation}
                  languageCode={scene.languageCode}
                  mine
                />
                {chosen.feedback && (
                  <Text className="font-poppins-regular text-sm text-text-secondary mb-3">
                    {chosen.feedback}
                  </Text>
                )}
              </>
            )}
          </View>
        );
      }
    }
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.neutral.background }}
    >
      <View className="flex-row items-center gap-3 px-5 pt-2 pb-3">
        <TouchableOpacity
          className="w-10 h-10 items-center justify-center"
          activeOpacity={0.7}
          onPress={handleBack}
          accessibilityLabel="Close"
          testID="scene-close-button"
        >
          <Ionicons name="close" size={28} color={colors.neutral.textPrimary} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text
            className="font-poppins-semibold text-base text-text-primary"
            numberOfLines={1}
          >
            {`${scene.emoji} ${scene.title}`}
          </Text>
          <View className="h-2 rounded-full bg-border mt-1 overflow-hidden">
            <View
              className="h-2 rounded-full bg-lingua-purple"
              style={{ width: `${(shown / total) * 100}%` }}
            />
          </View>
        </View>
        <Text className="font-poppins-medium text-xs text-text-secondary">
          {`${shown} of ${total}`}
        </Text>
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        onContentSizeChange={() =>
          scrollRef.current?.scrollToEnd({ animated: true })
        }
      >
        {scene.steps.slice(0, shown).map((_, index) => renderStep(index))}
      </ScrollView>

      <View className="px-5 pt-3 pb-4">
        <TouchableOpacity
          className={`rounded-2xl items-center py-4 ${isOpen ? "bg-border" : "bg-lingua-purple"}`}
          activeOpacity={0.85}
          disabled={isOpen}
          onPress={handleContinue}
          testID="scene-continue-button"
        >
          <Text
            className={`font-poppins-semibold text-base ${isOpen ? "text-text-secondary" : "text-white"}`}
          >
            Continue
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mascot: { width: 180, height: 180 },
  emoji: { fontSize: 72, lineHeight: 90 },
  content: { paddingHorizontal: 20, paddingBottom: 16 },
});
