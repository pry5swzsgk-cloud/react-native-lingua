import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";

import { ChatEntry, ChatMessage, TeacherChatController } from "@/hooks/useTeacherChat";
import { llm } from "@/lib/llm";
import {
  buildMessages,
  buildRequestText,
  buildSystemPrompt,
  buildTranslationMessages,
  cleanPartial,
  cleanReply,
  getXPForMessage,
  Level,
  SMART_XP,
  SmartRequest,
  SmartTurn,
} from "@/lib/smartTeacher";
import { playSound } from "@/lib/sounds";
import { NORMAL_RATE, SLOW_RATE, speak, stopSpeaking } from "@/lib/speech";
import { cleanForSpeech } from "@/lib/teacherText";
import { useLearningStore } from "@/store/learningStore";
import { LanguageCode } from "@/types/learning";

interface SmartTeacherOptions {
  languageCode: LanguageCode;
  languageName: string; // "Spanish"
  correction: string; // how Dax introduces a correction, "Mejor"
  level: Level;
  firstTopic: string | null; // for example "food and drinks"
}

const FALLBACK_ANSWER = "¿Puedes repetir, por favor?";
const FAILED_NOTE = "Dax lost his train of thought. Please try again.";

// Runs a conversation with Smart Dax. The language model does the talking;
// this hook keeps the chat, lets the answer appear while it is written,
// reads it aloud and hands out XP for real conversation.
// The model must be loaded already (see useSmartModel).
export function useSmartTeacher(options: SmartTeacherOptions): TeacherChatController {
  const addXP = useLearningStore((state) => state.addXP);
  const [entries, setEntries] = useState<ChatEntry[]>([]);
  const [hasStarted, setHasStarted] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [writingId, setWritingId] = useState<number | null>(null);
  const [translatingId, setTranslatingId] = useState<number | null>(null);

  // What the model remembers, and values for callbacks that run later
  const history = useRef<SmartTurn[]>([]);
  const entriesRef = useRef<ChatEntry[]>([]);
  const busyRef = useRef(false);
  const autoSpeakRef = useRef(true);
  const nextId = useRef(1);
  const countedMessages = useRef(0);
  const isMounted = useRef(true);
  const isFocused = useRef(true); // the learner is on this tab

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      llm.stop();
      stopSpeaking();
    };
  }, []);

  // Dax stops writing and talking when the learner switches to another tab
  useFocusEffect(
    useCallback(() => {
      isFocused.current = true;
      return () => {
        isFocused.current = false;
        llm.stop();
        stopSpeaking();
      };
    }, []),
  );

  const systemPrompt = buildSystemPrompt(
    options.languageName,
    options.correction,
    options.level,
    options.firstTopic,
  );

  function setAllEntries(update: (previous: ChatEntry[]) => ChatEntry[]) {
    entriesRef.current = update(entriesRef.current);
    if (isMounted.current) setEntries(entriesRef.current);
  }

  function addEntry(message: ChatMessage): number {
    const id = nextId.current++;
    setAllEntries((previous) => [...previous, { id, message }]);
    return id;
  }

  function changeTeacherEntry(id: number, change: { text?: string; translation?: string }) {
    setAllEntries((previous) =>
      previous.map((entry) =>
        entry.id === id && entry.message.kind === "teacher"
          ? { id, message: { ...entry.message, ...change } }
          : entry,
      ),
    );
  }

  function say(text: string, rate: number) {
    const spoken = cleanForSpeech(text);
    if (spoken) speak(spoken, options.languageCode, () => {}, rate);
  }

  // One round: the learner asks, the model answers
  async function run(request: SmartRequest, learnerMessage?: ChatMessage) {
    if (busyRef.current) return;
    busyRef.current = true;
    setIsBusy(true);
    stopSpeaking();

    const turnsBefore = history.current.length;
    history.current.push({ role: "learner", text: buildRequestText(request) });
    if (learnerMessage) addEntry(learnerMessage);

    const id = addEntry({
      kind: "teacher",
      text: "",
      translation: "",
      showTranslation: false,
    });
    setWritingId(id);

    try {
      const raw = await llm.reply(
        buildMessages(systemPrompt, history.current),
        (partial) => changeTeacherEntry(id, { text: cleanPartial(partial) }),
      );
      const answer = cleanReply(raw) || FALLBACK_ANSWER;
      history.current.push({ role: "teacher", text: answer });
      changeTeacherEntry(id, { text: answer });
      if (autoSpeakRef.current && isFocused.current) say(answer, NORMAL_RATE);

      // Real conversation earns XP
      if (request.kind === "message") {
        const result = getXPForMessage(request.text, countedMessages.current);
        countedMessages.current = result.counted;
        if (result.xp > 0) {
          addXP(result.xp);
          playSound("correct");
          addEntry({ kind: "note", text: `+${SMART_XP} XP · great conversation` });
        }
      }
    } catch {
      // Forget the question that got no answer
      history.current.length = turnsBefore;
      setAllEntries((previous) => previous.filter((entry) => entry.id !== id));
      addEntry({ kind: "note", text: FAILED_NOTE });
    } finally {
      busyRef.current = false;
      if (isMounted.current) {
        setIsBusy(false);
        setWritingId(null);
      }
    }
  }

  function start() {
    setHasStarted(true);
    run({ kind: "start" });
  }

  // germanHelp: the learner switched on "ask in German" for this message
  function send(text: string, germanHelp: boolean) {
    if (!text.trim()) return;
    run(
      germanHelp
        ? { kind: "german", text }
        : { kind: "message", text },
      { kind: "learner", text: text.trim(), german: germanHelp },
    );
  }

  function newTopic() {
    run({ kind: "newTopic" });
  }

  function helpMe() {
    run({ kind: "help" });
  }

  // Reads Dax's last answer again, slowly
  function repeat() {
    const last = [...entriesRef.current]
      .reverse()
      .find((entry) => entry.message.kind === "teacher" && entry.message.text);
    if (last && last.message.kind === "teacher") say(last.message.text, SLOW_RATE);
  }

  function toggleAutoSpeak() {
    const next = !autoSpeakRef.current;
    autoSpeakRef.current = next;
    setAutoSpeak(next);
    if (!next) stopSpeaking();
  }

  // German translation of one of Dax's messages, made by the model when asked
  async function translate(id: number) {
    const entry = entriesRef.current.find((e) => e.id === id);
    if (busyRef.current || !entry || entry.message.kind !== "teacher") return;
    if (entry.message.translation) return;

    busyRef.current = true;
    setIsBusy(true);
    setTranslatingId(id);
    try {
      const raw = await llm.reply(
        buildTranslationMessages(entry.message.text),
        () => {},
      );
      changeTeacherEntry(id, { translation: cleanReply(raw) || "…" });
    } catch {
      changeTeacherEntry(id, { translation: "Sorry, I could not translate this." });
    } finally {
      busyRef.current = false;
      if (isMounted.current) {
        setIsBusy(false);
        setTranslatingId(null);
      }
    }
  }

  return {
    entries,
    hasStarted,
    topicLabel: hasStarted ? "Free conversation" : null,
    autoSpeak,
    isBusy,
    writingId,
    translatingId,
    start,
    send,
    newTopic,
    helpMe,
    repeat,
    toggleAutoSpeak,
    translate,
  };
}
