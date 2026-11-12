import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { images } from "@/constants/images";
import { LANGUAGES } from "@/data/languages";
import { getTeacherContent } from "@/data/teacher";
import { TeacherChatController, useTeacherChat } from "@/hooks/useTeacherChat";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { getNextLesson } from "@/lib/progress";
import { stopSpeaking } from "@/lib/speech";
import { useLanguageStore, useStartUnitOrder } from "@/store/languageStore";
import { useLearningStore } from "@/store/learningStore";
import { ThemeId } from "@/types/learning";
import { TeacherContent } from "@/types/teacher";

const CALL_BACKGROUND = "#1B1730";

// A voice call with Dax: no camera, just talking. Dax has content for
// Spanish; other languages see a short notice.
export default function CallScreen() {
  const router = useRouter();
  const { selectedLanguage } = useLanguageStore();
  const { completedLessonIds } = useLearningStore();
  const startUnitOrder = useStartUnitOrder();

  const content = getTeacherContent(selectedLanguage);

  if (!content) {
    const language = LANGUAGES.find((l) => l.code === selectedLanguage);

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: CALL_BACKGROUND }}>
        <View
          className="flex-1 items-center justify-center px-8"
          testID="call-unavailable"
        >
          <Image
            source={images.mascotDino}
            style={styles.smallMascot}
            resizeMode="contain"
          />
          <Text className="h3 text-center text-white mt-4 mb-2">
            Dax only takes calls in Spanish so far
          </Text>
          <Text className="body-md text-center text-white/70">
            {language
              ? `Calls in ${language.name} are not ready yet. Switch to Spanish to call Dax.`
              : "Pick a language on the home screen to call Dax."}
          </Text>
          <TouchableOpacity
            className="bg-lingua-purple rounded-2xl items-center py-3.5 px-8 mt-6"
            activeOpacity={0.85}
            onPress={() => goBack(router)}
            testID="call-unavailable-back-button"
          >
            <Text className="font-poppins-semibold text-base text-white">
              Back
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Dax starts with a topic that fits the lesson the learner is on
  const nextLesson = getNextLesson(
    selectedLanguage,
    completedLessonIds,
    startUnitOrder,
  );
  const preferredTheme = nextLesson && !nextLesson.boss ? nextLesson.theme : null;

  return <CallWithDax content={content} preferredTheme={preferredTheme} />;
}

function goBack(router: ReturnType<typeof useRouter>) {
  if (router.canGoBack()) router.back();
  else router.replace("/chat");
}

interface CallWithDaxProps {
  content: TeacherContent;
  preferredTheme: ThemeId | null;
}

// The call itself: first it rings, after "accept" the conversation runs
function CallWithDax({ content, preferredTheme }: CallWithDaxProps) {
  const router = useRouter();
  const chat = useTeacherChat(content, preferredTheme);
  const [accepted, setAccepted] = useState(false);

  const language = LANGUAGES.find((l) => l.code === content.languageCode);

  // Dax stops talking when the screen goes away
  useEffect(() => () => stopSpeaking(), []);

  function handleAccept() {
    // This tap also allows speech output in the browser
    setAccepted(true);
    chat.start();
  }

  function handleHangUp() {
    stopSpeaking();
    goBack(router);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: CALL_BACKGROUND }}>
      {accepted ? (
        <ActiveCall
          chat={chat}
          speechLocale={language?.speechLocale ?? "es-ES"}
          onHangUp={handleHangUp}
        />
      ) : (
        <Ringing
          languageName={language?.name ?? "Spanish"}
          onDecline={() => goBack(router)}
          onAccept={handleAccept}
        />
      )}
    </SafeAreaView>
  );
}

interface RingingProps {
  languageName: string;
  onDecline: () => void;
  onAccept: () => void;
}

function Ringing({ languageName, onDecline, onAccept }: RingingProps) {
  const pulse = useSharedValue(0); // 0 … 1

  useEffect(() => {
    pulse.set(
      withRepeat(
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      ),
    );
    return () => cancelAnimation(pulse);
  }, [pulse]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.get() * 0.08 }],
    opacity: 0.75 + pulse.get() * 0.25,
  }));

  return (
    <View className="flex-1 items-center justify-between px-8 py-12" testID="call-ringing">
      <View className="items-center mt-8">
        <Animated.View style={[styles.circle, ringStyle]}>
          <Image
            source={images.mascotDino}
            style={styles.bigMascot}
            resizeMode="contain"
          />
        </Animated.View>
        <Text className="h2 text-white text-center mt-8">Dax is calling…</Text>
        <Text className="body-md text-white/70 text-center mt-2">
          A voice call in {languageName}. No camera, just talking.
        </Text>
      </View>

      <View className="flex-row gap-16 mb-6">
        <TouchableOpacity
          className="w-16 h-16 rounded-full bg-[#EF4444] items-center justify-center"
          activeOpacity={0.8}
          onPress={onDecline}
          accessibilityLabel="Decline"
          testID="call-decline-button"
        >
          <Ionicons name="call" size={28} color="#fff" style={styles.hangUpIcon} />
        </TouchableOpacity>
        <TouchableOpacity
          className="w-16 h-16 rounded-full bg-[#22C55E] items-center justify-center"
          activeOpacity={0.8}
          onPress={onAccept}
          accessibilityLabel="Accept"
          testID="call-accept-button"
        >
          <Ionicons name="call" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

interface ActiveCallProps {
  chat: TeacherChatController;
  speechLocale: string;
  onHangUp: () => void;
}

// What the subtitles show for the last thing Dax did
function getLastDax(chat: TeacherChatController) {
  for (let i = chat.entries.length - 1; i >= 0; i--) {
    const { id, message } = chat.entries[i];
    if (message.kind === "learner") continue;
    if (message.kind === "help") {
      return { id, text: "Dax shows you some words in the chat." };
    }
    return { id, text: message.text };
  }
  return null;
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function ActiveCall({ chat, speechLocale, onHangUp }: ActiveCallProps) {
  const router = useRouter();
  const voice = useVoiceInput();
  const [seconds, setSeconds] = useState(0);
  const [captionsOn, setCaptionsOn] = useState(true);
  const [isTalking, setIsTalking] = useState(false);
  const bob = useSharedValue(0); // 0 … 1

  const lastDax = getLastDax(chat);
  const lastDaxId = lastDax?.id ?? null;
  const lastDaxLength = lastDax?.text.length ?? 0;

  // Call timer
  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Dax "talks" for an estimated time after each new message
  // (about 60 ms per character, at least 1.5 s)
  useEffect(() => {
    if (lastDaxId === null) return;
    setIsTalking(true);
    const timer = setTimeout(
      () => setIsTalking(false),
      Math.max(1500, lastDaxLength * 60),
    );
    return () => clearTimeout(timer);
  }, [lastDaxId, lastDaxLength]);

  useEffect(() => {
    if (!isTalking) {
      cancelAnimation(bob);
      bob.set(withTiming(0, { duration: 200 }));
      return;
    }
    bob.set(
      withRepeat(
        withSequence(
          withTiming(1, { duration: 260 }),
          withTiming(0, { duration: 260 }),
        ),
        -1,
      ),
    );
  }, [isTalking, bob]);

  const bobStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + bob.get() * 0.06 }],
  }));

  return (
    <View className="flex-1 items-center px-6 pt-6 pb-8" testID="call-active">
      {/* Header */}
      <View className="items-center">
        <Text className="font-poppins-bold text-2xl text-white">Dax</Text>
        <Text className="caption text-white/70" numberOfLines={1}>
          {chat.topicLabel ?? "Choosing a topic…"}
        </Text>
        <Text className="font-poppins-medium text-sm text-white/70" testID="call-timer">
          {formatTime(seconds)}
        </Text>
      </View>

      {/* Dax */}
      <View className="flex-1 items-center justify-center">
        <Animated.View style={[styles.circle, bobStyle]}>
          <Image
            source={images.mascotDino}
            style={styles.bigMascot}
            resizeMode="contain"
          />
        </Animated.View>
      </View>

      {/* Subtitles */}
      <View className="w-full max-w-[520px] items-center">
        {voice.error !== "" && !voice.isListening && (
          <Text className="body-sm text-[#FCA5A5] text-center mb-2" testID="call-mic-error">
            {voice.error}
          </Text>
        )}
        {(captionsOn || voice.isListening) && (
          <View
            className="w-full bg-white/10 rounded-2xl px-4 py-3 mb-6 min-h-[72px] justify-center"
            testID="call-captions"
          >
            <Text className="font-poppins-medium text-base text-white text-center">
              {voice.isListening
                ? voice.liveText || "Listening…"
                : (lastDax?.text ?? "")}
            </Text>
          </View>
        )}

        {voice.isSupported === false && (
          <View className="items-center mb-4" testID="call-no-speech">
            <Text className="body-sm text-white/80 text-center">
              This browser has no speech recognition. Use the AI Teacher tab to
              type.
            </Text>
            <TouchableOpacity
              className="bg-lingua-purple rounded-2xl items-center py-3 px-6 mt-3"
              activeOpacity={0.85}
              onPress={() => {
                stopSpeaking();
                router.replace("/ai-teacher");
              }}
              testID="call-teacher-button"
            >
              <Text className="font-poppins-semibold text-base text-white">
                Open AI Teacher
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Buttons */}
        <View className="w-full flex-row items-center justify-around">
          <View className="items-center gap-1">
            <TouchableOpacity
              className="w-14 h-14 rounded-full bg-white/15 items-center justify-center"
              activeOpacity={0.7}
              onPress={chat.newTopic}
              accessibilityLabel="New topic"
              testID="call-topic-button"
            >
              <Ionicons name="shuffle" size={24} color="#fff" />
            </TouchableOpacity>
            <Text className="caption text-white/70">New topic</Text>
          </View>

          {voice.isSupported && (
            <TouchableOpacity
              className={`w-20 h-20 rounded-full items-center justify-center ${voice.isListening ? "bg-[#22C55E]" : "bg-lingua-purple"}`}
              activeOpacity={0.8}
              onPress={() =>
                voice.toggle(speechLocale, (text) => chat.send(text, false))
              }
              accessibilityLabel={voice.isListening ? "Stop listening" : "Speak"}
              testID="call-mic-button"
            >
              <Ionicons
                name={voice.isListening ? "stop" : "mic"}
                size={34}
                color="#fff"
              />
            </TouchableOpacity>
          )}

          <View className="items-center gap-1">
            <TouchableOpacity
              className="w-14 h-14 rounded-full bg-[#EF4444] items-center justify-center"
              activeOpacity={0.8}
              onPress={onHangUp}
              accessibilityLabel="Hang up"
              testID="call-hangup-button"
            >
              <Ionicons name="call" size={24} color="#fff" style={styles.hangUpIcon} />
            </TouchableOpacity>
            <Text className="caption text-white/70">Hang up</Text>
          </View>
        </View>

        <TouchableOpacity
          className={`rounded-full px-4 py-1.5 mt-5 ${captionsOn ? "bg-white" : "bg-white/15"}`}
          activeOpacity={0.7}
          onPress={() => setCaptionsOn(!captionsOn)}
          accessibilityLabel={captionsOn ? "Turn captions off" : "Turn captions on"}
          testID="call-captions-button"
        >
          <Text
            className={`font-poppins-semibold text-xs ${captionsOn ? "text-[#1B1730]" : "text-white"}`}
          >
            CC
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Image sizes, the circle around Dax and the hang-up icon turn stay in StyleSheet
const styles = StyleSheet.create({
  bigMascot: { width: 170, height: 170 },
  smallMascot: { width: 140, height: 140 },
  circle: {
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  hangUpIcon: { transform: [{ rotate: "135deg" }] },
});
