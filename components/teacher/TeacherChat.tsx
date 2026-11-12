import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { ReactNode, useCallback, useRef, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { TeacherBubble } from "@/components/teacher/TeacherBubble";
import { VocabularyCard } from "@/components/teacher/VocabularyCard";
import { images } from "@/constants/images";
import { colors } from "@/constants/theme";
import { LANGUAGES } from "@/data/languages";
import { TeacherChatController, useTeacherChat } from "@/hooks/useTeacherChat";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { stopSpeaking } from "@/lib/speech";
import { LanguageCode, ThemeId } from "@/types/learning";
import { TeacherContent } from "@/types/teacher";

interface TeacherChatProps {
  content: TeacherContent;
  // The theme of the lesson the learner is on; Dax starts with a fitting topic
  preferredTheme: ThemeId | null;
  // A card below the intro text, for example the way to Smart Dax
  introExtra?: ReactNode;
}

const TIPS = [
  { emoji: "🗣️", text: "Dax picks a topic, or you choose one: “Hablemos de música”." },
  { emoji: "🇩🇪", text: "Missing a word? Ask in German: “Wie sagt man Hund?”" },
  { emoji: "🎲", text: "Say “nuevo tema” or “neues Thema” for a new topic." },
  { emoji: "💡", text: "Stuck? “Help me answer” shows you how to begin." },
];

// Dax with rules: works offline, follows a script of topics and questions
export function TeacherChat({
  content,
  preferredTheme,
  introExtra,
}: TeacherChatProps) {
  const chat = useTeacherChat(content, preferredTheme);

  return (
    <TeacherChatView
      chat={chat}
      languageCode={content.languageCode}
      tips={TIPS}
      note="Dax is a built-in practice partner that works offline. He follows simple rules and does not understand everything you say."
      introExtra={introExtra}
    />
  );
}

interface TeacherChatViewProps {
  chat: TeacherChatController;
  languageCode: LanguageCode;
  tips: { emoji: string; text: string }[];
  note: string; // small print below the tips
  introExtra?: ReactNode;
}

// The conversation screen, the same for both teachers: Dax's messages,
// quick actions and the input bar for typing or speaking.
export function TeacherChatView({
  chat,
  languageCode,
  tips,
  note,
  introExtra,
}: TeacherChatViewProps) {
  const voice = useVoiceInput();
  const [input, setInput] = useState("");
  // The next message is a German word to translate (also for the mic)
  const [germanHelp, setGermanHelp] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const language = LANGUAGES.find((l) => l.code === languageCode);
  const languageName = language?.name ?? "Spanish";

  // Dax stops talking when the learner switches to another tab
  useFocusEffect(useCallback(() => () => stopSpeaking(), []));

  function handleSend(text: string) {
    // Smart Dax answers one message at a time
    if (!text.trim() || chat.isBusy) return;
    chat.send(text, germanHelp);
    setInput("");
    setGermanHelp(false);
  }

  function handleMicPress() {
    const locale = germanHelp ? "de-DE" : (language?.speechLocale ?? "es-ES");
    // What was understood is sent right away, like in a real conversation
    voice.toggle(locale, handleSend);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.neutral.surface }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="flex-1 w-full max-w-[640px] self-center">
          {/* Header */}
          <View className="flex-row items-center gap-3 px-4 py-3 bg-white border-b border-border">
            <Image
              source={images.mascotDino}
              style={styles.headerAvatar}
              resizeMode="contain"
            />
            <View className="flex-1">
              <Text className="font-poppins-semibold text-base text-text-primary">
                Dax
              </Text>
              <Text className="caption" numberOfLines={1} testID="teacher-topic">
                {chat.topicLabel ?? `Your ${languageName} conversation partner`}
              </Text>
            </View>
            {chat.hasStarted && (
              <TouchableOpacity
                className="w-10 h-10 rounded-full bg-surface items-center justify-center"
                activeOpacity={0.7}
                onPress={chat.toggleAutoSpeak}
                accessibilityLabel={
                  chat.autoSpeak ? "Turn Dax's voice off" : "Turn Dax's voice on"
                }
                testID="teacher-voice-button"
              >
                <Ionicons
                  name={chat.autoSpeak ? "volume-high" : "volume-mute"}
                  size={20}
                  color={
                    chat.autoSpeak
                      ? colors.primary.purple
                      : colors.neutral.textSecondary
                  }
                />
              </TouchableOpacity>
            )}
          </View>

          {!chat.hasStarted ? (
            // ── Before the conversation ──
            <ScrollView contentContainerStyle={styles.intro}>
              <Image
                source={images.mascotDino}
                style={styles.introMascot}
                resizeMode="contain"
              />
              <Text className="h2 text-center mt-4">Talk with Dax</Text>
              <Text className="body-md text-text-secondary text-center mt-1">
                Practice real conversations in {languageName}. Dax asks, you
                answer by typing or speaking.
              </Text>

              <View className="w-full bg-white rounded-2xl border border-border px-4 py-3 mt-6 gap-3">
                {tips.map((tip) => (
                  <View key={tip.emoji} className="flex-row gap-3">
                    <Text className="text-xl">{tip.emoji}</Text>
                    <Text className="flex-1 body-sm">{tip.text}</Text>
                  </View>
                ))}
              </View>

              <Text className="caption text-center mt-4">{note}</Text>

              {introExtra}

              <TouchableOpacity
                className="w-full bg-lingua-purple rounded-2xl items-center py-4 mt-6"
                activeOpacity={0.85}
                onPress={chat.start}
                testID="teacher-start-button"
              >
                <Text className="font-poppins-semibold text-base text-white">
                  Start talking
                </Text>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            <>
              {/* ── Messages ── */}
              <ScrollView
                ref={scrollRef}
                contentContainerStyle={styles.messages}
                keyboardShouldPersistTaps="handled"
                onContentSizeChange={() =>
                  scrollRef.current?.scrollToEnd({ animated: true })
                }
              >
                {chat.entries.map(({ id, message }) => {
                  switch (message.kind) {
                    case "teacher":
                      return (
                        <TeacherBubble
                          key={id}
                          text={message.text}
                          translation={message.translation}
                          showTranslation={message.showTranslation}
                          languageCode={languageCode}
                          onTranslate={
                            chat.translate ? () => chat.translate?.(id) : undefined
                          }
                          isTranslating={chat.translatingId === id}
                          isWriting={chat.writingId === id}
                        />
                      );
                    case "help":
                      return (
                        <VocabularyCard
                          key={id}
                          words={message.words}
                          languageCode={languageCode}
                        />
                      );
                    case "note":
                      return (
                        <Text
                          key={id}
                          className="caption text-center mb-3 px-6"
                          testID="chat-note"
                        >
                          {message.text}
                        </Text>
                      );
                    case "learner":
                      return (
                        <View
                          key={id}
                          className="self-end max-w-[82%] bg-lingua-purple rounded-2xl rounded-br-md px-4 py-2.5 mb-3"
                          testID="chat-learner"
                        >
                          <Text className="font-poppins-medium text-[15px] text-white leading-6">
                            {message.german ? "🇩🇪 " : ""}
                            {message.text}
                          </Text>
                        </View>
                      );
                  }
                })}
              </ScrollView>

              {/* ── Quick actions (scroll sideways) ── */}
              <View testID="teacher-chips">
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.chips}
                  keyboardShouldPersistTaps="handled"
                >
                  <Chip
                    label="🎲 New topic"
                    onPress={chat.newTopic}
                    testID="teacher-chip-new-topic"
                  />
                  <Chip
                    label="💡 Help me answer"
                    onPress={chat.helpMe}
                    testID="teacher-chip-help"
                  />
                  <Chip
                    label="🔁 Repeat slowly"
                    onPress={chat.repeat}
                    testID="teacher-chip-repeat"
                  />
                  <Chip
                    label="🇩🇪 Wie sagt man …?"
                    isActive={germanHelp}
                    onPress={() => setGermanHelp(!germanHelp)}
                    testID="teacher-chip-german"
                  />
                </ScrollView>
              </View>

              {/* ── Input bar ── */}
              <View className="px-4 pt-1 pb-3 bg-white border-t border-border">
                {germanHelp && (
                  <Text
                    className="caption text-lingua-purple pt-1"
                    testID="teacher-german-hint"
                  >
                    🇩🇪 Type or say a German word. Dax answers with the{" "}
                    {languageName} word.
                  </Text>
                )}
                {voice.error !== "" && !voice.isListening && (
                  <Text className="body-sm text-error pt-1" testID="teacher-mic-error">
                    {voice.error}
                  </Text>
                )}

                <View className="flex-row items-center gap-2 pt-2">
                  {/* TextInput is styled inline (see AGENTS.md style exceptions) */}
                  <TextInput
                    value={voice.isListening ? voice.liveText : input}
                    onChangeText={setInput}
                    onSubmitEditing={() => handleSend(input)}
                    editable={!voice.isListening}
                    placeholder={
                      voice.isListening
                        ? "Listening…"
                        : germanHelp
                          ? "Deutsches Wort, z. B. Hund"
                          : `Answer in ${languageName}…`
                    }
                    placeholderTextColor="#9ca3af"
                    autoCapitalize="none"
                    autoCorrect={false}
                    spellCheck={false}
                    autoComplete="off"
                    returnKeyType="send"
                    blurOnSubmit={false}
                    testID="teacher-input"
                    style={{
                      flex: 1,
                      // Web inputs have a built-in minimum width that would
                      // push the buttons off the screen
                      minWidth: 0,
                      borderWidth: 1.5,
                      borderColor: germanHelp
                        ? colors.primary.purple
                        : colors.neutral.border,
                      borderRadius: 22,
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      fontFamily: "Poppins-Regular",
                      fontSize: 15,
                      color: colors.neutral.textPrimary,
                      backgroundColor: "#fff",
                    }}
                  />

                  {voice.isSupported && (
                    <TouchableOpacity
                      className={`w-11 h-11 rounded-full items-center justify-center ${voice.isListening ? "bg-lingua-purple" : "bg-[#EDE9FE]"}`}
                      activeOpacity={0.7}
                      onPress={handleMicPress}
                      accessibilityLabel={
                        voice.isListening
                          ? "Stop listening"
                          : germanHelp
                            ? "Speak German"
                            : `Speak ${languageName}`
                      }
                      testID="teacher-mic-button"
                    >
                      <Ionicons
                        name={voice.isListening ? "stop" : "mic"}
                        size={20}
                        color={voice.isListening ? "#fff" : colors.primary.purple}
                      />
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    className={`w-11 h-11 rounded-full items-center justify-center ${input.trim() && !chat.isBusy ? "bg-lingua-purple" : "bg-border"}`}
                    activeOpacity={0.7}
                    disabled={!input.trim() || chat.isBusy}
                    onPress={() => handleSend(input)}
                    accessibilityLabel="Send"
                    testID="teacher-send-button"
                  >
                    <Ionicons
                      name="arrow-up"
                      size={20}
                      color={
                        input.trim() && !chat.isBusy
                          ? "#fff"
                          : colors.neutral.textSecondary
                      }
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

interface ChipProps {
  label: string;
  onPress: () => void;
  testID: string;
  isActive?: boolean;
}

// One of the quick actions above the input bar
function Chip({ label, onPress, testID, isActive = false }: ChipProps) {
  return (
    <TouchableOpacity
      className={`rounded-full border px-3.5 py-2 ${isActive ? "bg-lingua-purple border-lingua-purple" : "bg-white border-border"}`}
      activeOpacity={0.7}
      onPress={onPress}
      testID={testID}
    >
      <Text
        className={`font-poppins-medium text-[13px] ${isActive ? "text-white" : "text-text-primary"}`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ScrollView.contentContainerStyle and image sizes stay in StyleSheet
const styles = StyleSheet.create({
  headerAvatar: { width: 40, height: 40 },
  introMascot: { width: 140, height: 140 },
  intro: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
  },
  messages: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  chips: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
});
