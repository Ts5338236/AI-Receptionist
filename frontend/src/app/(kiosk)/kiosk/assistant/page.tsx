"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Mic,
  Send,
  X,
  Sparkles,
  Bot,
  User,
  AlertCircle,
  RotateCcw,
  MicOff,
  VolumeX,
} from "lucide-react";
import { StatusBanner } from "@/components/kiosk/status-banner";
import { AvatarStage, AvatarState } from "@/components/kiosk/avatar-stage";
import { KioskFooter } from "@/components/kiosk/kiosk-footer";
import { useLanguage } from "@/context/language-context";
import { useKioskSession } from "@/hooks/use-kiosk-session";
import { useVoiceClient } from "@/hooks/useVoiceClient";
import { conversationService } from "@/services/conversation-service";

interface Message {
  id: string;
  sender: "receptionist" | "visitor";
  text: string;
  time: string;
}

export default function AssistantPage() {
  const { t, language } = useLanguage();
  const { secondsRemaining, isWarning, resetActivity } = useKioskSession({
    timeoutSeconds: 90,
    homePath: "/kiosk",
  });

  const [inputText, setInputText] = useState("");
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Initialize production Voice Client hook
  const voice = useVoiceClient({
    language: language === "hi" ? "hi-IN" : "en-US",
  });

  // Consolidated conversational messages (initial + voice + text)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "receptionist",
      text: t.welcomeSubheading,
      time: "Just now",
    },
  ]);

  // Synchronize incoming voice transcripts into message stream
  useEffect(() => {
    if (voice.messages.length > 1) {
      setMessages(voice.messages);
    }
  }, [voice.messages]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, voice.partialTranscript]);

  // Determine avatar operational visual state
  const computedAvatarState: AvatarState = voice.isRecording
    ? "LISTENING"
    : voice.connectionState === "PROCESSING"
    ? "THINKING"
    : voice.isPlaying
    ? "SPEAKING"
    : voice.connectionState === "ERROR"
    ? "ERROR"
    : "IDLE";

  const handleToggleMic = async () => {
    resetActivity();
    if (voice.isRecording) {
      voice.stopListening();
    } else if (voice.isPlaying) {
      // Barge-in: stop receptionist speech
      voice.cancelSpeech();
    } else {
      await voice.startListening();
    }
  };

  const handleRestartConversation = () => {
    resetActivity();
    voice.cancelSpeech();
    setMessages([
      {
        id: Date.now().toString(),
        sender: "receptionist",
        text: "Conversation refreshed. How may I assist you today?",
        time: "Just now",
      },
    ]);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    resetActivity();
    const query = inputText;
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "visitor",
      text: query,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");

    try {
      const response = await conversationService.sendMessage({ message: query });
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: "receptionist",
        text: response.reply,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, botResponse]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "receptionist",
          text: "I experienced a temporary communication issue. Please try again.",
          time: "Just now",
        },
      ]);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-slate-950">
      <StatusBanner showBackToHome={true} />

      {/* Main Split Screen Area: Avatar Stage (Left/Top) & Transcript (Right/Bottom) */}
      <div className="flex-1 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 md:p-6 overflow-hidden">
        {/* Left Column: Digital Human Avatar Stage */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-900/40 border border-slate-800 backdrop-blur-md relative">
          <AvatarStage state={computedAvatarState} size="compact" />

          {/* Barge-in Button when Avatar is Speaking */}
          {voice.isPlaying && (
            <button
              type="button"
              onClick={voice.cancelSpeech}
              className="absolute bottom-6 px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center gap-2 hover:bg-amber-500/30 transition shadow-lg"
            >
              <VolumeX className="w-4 h-4" />
              <span>Tap to Interrupt / Barge-in</span>
            </button>
          )}
        </div>

        {/* Right Column: Live Conversation Transcript & Touch Controls */}
        <div className="lg:col-span-7 flex flex-col justify-between rounded-3xl bg-slate-900/60 border border-slate-800 shadow-2xl backdrop-blur-xl overflow-hidden p-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {t.conversationTitle}
                </h2>
                <span className="text-xs text-slate-400 font-medium">
                  {voice.isRecording
                    ? "Listening to speech..."
                    : voice.isPlaying
                    ? "Speaking response..."
                    : t.conversationSubtitle}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRestartConversation}
                title="Restart Conversation"
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restart</span>
              </button>

              <Link
                href="/kiosk"
                className="px-3.5 py-2 rounded-xl bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>{t.endConversationBtn}</span>
              </Link>
            </div>
          </div>

          {/* Transcript Scroll Area */}
          <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-2 my-2">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 ${
                  m.sender === "visitor" ? "justify-end" : "justify-start"
                }`}
              >
                {m.sender === "receptionist" && (
                  <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center shrink-0 text-white mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-lg p-4 rounded-2xl text-sm leading-relaxed ${
                    m.sender === "visitor"
                      ? "bg-sky-500 text-white rounded-br-none shadow-md shadow-sky-500/20"
                      : "bg-slate-800/90 text-slate-100 rounded-bl-none border border-slate-700/80 shadow-md"
                  }`}
                >
                  <p>{m.text}</p>
                  <span className="block text-[10px] mt-1.5 opacity-60 text-right">
                    {m.time}
                  </span>
                </div>
                {m.sender === "visitor" && (
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 text-white mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {/* Live Partial Streaming Transcript Bubble */}
            {voice.partialTranscript && (
              <div className="flex gap-3 justify-end animate-pulse">
                <div className="max-w-lg p-4 rounded-2xl text-sm leading-relaxed bg-sky-500/50 text-white rounded-br-none border border-sky-400/40">
                  <p className="italic">{voice.partialTranscript}...</p>
                  <span className="block text-[10px] mt-1.5 opacity-75 text-right">
                    Transcribing...
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-sky-600 flex items-center justify-center shrink-0 text-white mt-1">
                  <User className="w-4 h-4" />
                </div>
              </div>
            )}

            <div ref={transcriptEndRef} />
          </div>

          {/* Touch-Friendly Input & Tactile Microphone Area */}
          <div className="pt-4 border-t border-slate-800 flex flex-col gap-3">
            {/* Microphone State & Error Banners */}
            {voice.permissionState === "DENIED" && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                <MicOff className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Microphone access denied. You can use the touch keyboard below.</span>
              </div>
            )}

            {voice.errorMessage && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{voice.errorMessage}</span>
              </div>
            )}

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-indigo-400" />
              <span>{t.prototypeNotice}</span>
            </div>

            <form onSubmit={handleSendMessage} className="flex items-center gap-3">
              {/* Push-To-Talk Toggle Button with Dynamic Audio Pulse */}
              <button
                type="button"
                onClick={handleToggleMic}
                aria-label={t.micTapToSpeak}
                title={t.micTapToSpeak}
                className={`w-16 h-14 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-lg shrink-0 ${
                  voice.isRecording
                    ? "bg-emerald-500 text-white shadow-emerald-500/40 ring-4 ring-emerald-500/30"
                    : voice.isPlaying
                    ? "bg-amber-500 text-white shadow-amber-500/30"
                    : computedAvatarState === "THINKING"
                    ? "bg-indigo-600 text-white shadow-indigo-500/30"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700"
                }`}
                style={
                  voice.isRecording
                    ? {
                        transform: `scale(${1.0 + Math.min(0.2, voice.audioLevel * 0.4)})`,
                      }
                    : undefined
                }
              >
                <Mic className="w-6 h-6" />
              </button>

              {/* Text Input Fallback */}
              <input
                type="text"
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  resetActivity();
                }}
                placeholder={t.typeFallbackPlaceholder}
                className="flex-1 h-14 px-5 rounded-2xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 text-base"
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="h-14 px-6 rounded-2xl bg-sky-500 hover:bg-sky-400 disabled:opacity-40 disabled:hover:bg-sky-500 text-white font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-sky-500/20 shrink-0"
              >
                <span>{t.sendBtn}</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      <KioskFooter
        showStartConversationCTA={false}
        secondsRemaining={secondsRemaining}
        isWarning={isWarning}
      />
    </div>
  );
}
