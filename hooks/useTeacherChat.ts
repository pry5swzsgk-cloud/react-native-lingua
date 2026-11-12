import { useRef, useState } from "react";

import { playSound } from "@/lib/sounds";
import { NORMAL_RATE, SLOW_RATE, speak, stopSpeaking } from "@/lib/speech";
import {
  getSpeechText,
  getTopicLabel,
  helpWithAnswer,
  pickNewTopic,
  repeatQuestion,
  respondToLearner,
  startConversation,
  TeacherMessage,
  TeacherState,
  TeacherTurn,
} from "@/lib/teacher";
import { useLearningStore } from "@/store/learningStore";
import { ThemeId } from "@/types/learning";
import { TeacherContent } from "@/types/teacher";

// Everything shown in the chat: what Dax says and what the learner wrote
export type ChatMessage =
  | TeacherMessage
  | { kind: "learner"; text: string; german: boolean };

export interface ChatEntry {
  id: number;
  message: ChatMessage;
}

// What the chat screen needs from a teacher. Both teachers (Dax with rules
// and Smart Dax with a language model) provide it, so one screen shows both.
export interface TeacherChatController {
  entries: ChatEntry[];
  hasStarted: boolean;
  topicLabel: string | null;
  autoSpeak: boolean;
  isBusy: boolean; // Dax is still working on an answer
  start: () => void;
  send: (text: string, germanHelp: boolean) => void;
  newTopic: () => void;
  helpMe: () => void;
  repeat: () => void;
  toggleAutoSpeak: () => void;
  // Smart Dax only
  writingId?: number | null; // the message Dax is writing right now
  translate?: (id: number) => void; // German translation of one message
  translatingId?: number | null;
}

// Runs a conversation with Dax: keeps the chat history, asks the engine
// (lib/teacher.ts) what Dax does next, reads his answers aloud and hands
// out XP for finished topics.
export function useTeacherChat(
  content: TeacherContent,
  preferredTheme: ThemeId | null,
): TeacherChatController {
  const addXP = useLearningStore((state) => state.addXP);
  const [entries, setEntries] = useState<ChatEntry[]>([]);
  // null until the learner taps "Start talking"
  const [teacherState, setTeacherState] = useState<TeacherState | null>(null);
  const [autoSpeak, setAutoSpeak] = useState(true);

  // The same values for callbacks that run later (speech recognition
  // answers after the screen has drawn again)
  const stateRef = useRef<TeacherState | null>(null);
  const autoSpeakRef = useRef(true);
  const nextId = useRef(1);

  // Shows a turn of Dax in the chat, optionally after the learner's message
  function apply(turn: TeacherTurn, learnerMessage?: ChatMessage) {
    stateRef.current = turn.state;
    setTeacherState(turn.state);

    const messages = [...(learnerMessage ? [learnerMessage] : []), ...turn.messages];
    const added = messages.map((message) => ({ id: nextId.current++, message }));
    setEntries((previous) => [...previous, ...added]);

    if (turn.xp > 0) {
      addXP(turn.xp);
      playSound("correct");
    }

    const speech = getSpeechText(turn.messages);
    if (autoSpeakRef.current && speech) {
      speak(
        speech,
        content.languageCode,
        () => {},
        turn.slow ? SLOW_RATE : NORMAL_RATE,
      );
    }
  }

  function start() {
    apply(startConversation(content, Math.random, preferredTheme));
  }

  // germanHelp: the learner switched on "ask in German" for this message
  function send(text: string, germanHelp: boolean) {
    const state = stateRef.current;
    if (!state || !text.trim()) return;
    apply(respondToLearner(content, state, text, germanHelp), {
      kind: "learner",
      text: text.trim(),
      german: germanHelp,
    });
  }

  function newTopic() {
    if (stateRef.current) apply(pickNewTopic(content, stateRef.current));
  }

  function helpMe() {
    if (stateRef.current) apply(helpWithAnswer(content, stateRef.current));
  }

  function repeat() {
    if (stateRef.current) apply(repeatQuestion(content, stateRef.current));
  }

  function toggleAutoSpeak() {
    const next = !autoSpeakRef.current;
    autoSpeakRef.current = next;
    setAutoSpeak(next);
    if (!next) stopSpeaking();
  }

  return {
    entries,
    isBusy: false,
    hasStarted: teacherState !== null,
    topicLabel: teacherState ? getTopicLabel(content, teacherState) : null,
    autoSpeak,
    start,
    send,
    newTopic,
    helpMe,
    repeat,
    toggleAutoSpeak,
  };
}
