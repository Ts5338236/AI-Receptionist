"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mic,
  Send,
  X,
  Sparkles,
  Bot,
  User,
  Volume2,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { StatusBanner } from "@/components/kiosk/status-banner";
import { AvatarStage, AvatarState } from "@/components/kiosk/avatar-stage";
import { KioskFooter } from "@/components/kiosk/kiosk-footer";
import { useLanguage } from "@/context/language-context";
import { useKioskSession } from "@/hooks/use-kiosk-session";

interface Message {
  id: string;
  sender: "receptionist" | "visitor";
  text: string;
  time: string;
}

export default function AssistantPage() {
  const { t } = useLanguage();
  const { secondsRemaining, isWarning, resetActivity, handleSessionTimeout } =
    useKioskSession({ timeoutSeconds: 90, homePath: "/kiosk" });

  const [avatarState, setAvatarState] = useState<AvatarState>("IDLE");
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "receptionist",
      text: t.welcomeSubheading,
      time: "Just now",
    },
  ]);

  const handleToggleMic = () => {
    resetActivity();
    if (avatarState === "LISTENING") {
      setAvatarState("THINKING");
      setTimeout(() => {
        setAvatarState("SPEAKING");
        setTimeout(() => setAvatarState("IDLE"), 3500);
      }, 1500);
    } else {
      setAvatarState("LISTENING");
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    resetActivity();
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "visitor",
      text: inputText,
      time: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setAvatarState("THINKING");

    // Local conversational echo acknowledgement for Phase 2 prototype
    setTimeout(() => {
      setAvatarState("SPEAKING");
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: "receptionist",
        text: `I received your inquiry: "${userMsg.text}". Phase 2 voice pipeline foundation is active. In Phase 3, this will stream from live speech recognition & RAG.`,
        time: "Just now",
      };
      setMessages((prev) => [...prev, botResponse]);
      setTimeout(() => setAvatarState("IDLE"), 4000);
    }, 1500);
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-slate-950">
      <StatusBanner showBackToHome={true} />

      {/* Main Split Screen Area: Avatar Viewport (Left/Top) & Transcript (Right/Bottom) */}
      <div className="flex-1 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-hidden">
        {/* Left Column: Digital Human Avatar Stage */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 rounded-3xl bg-slate-900/40 border border-slate-800 backdrop-blur-md">
          <AvatarStage state={avatarState} size="compact" />
        </div>

        {/* Right Column: Live Conversation Transcript & Touch Input */}
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
                  {t.conversationSubtitle}
                </span>
              </div>
            </div>

            <Link
              href="/kiosk"
              className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>{t.endConversationBtn}</span>
            </Link>
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
          </div>

          {/* Touch-Friendly Input & Tactile Microphone Area */}
          <div className="pt-4 border-t border-slate-800 flex flex-col gap-3">
            {/* Phase 2 Prototype Notice */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-indigo-400" />
              <span>{t.prototypeNotice}</span>
            </div>

            <form onSubmit={handleSendMessage} className="flex items-center gap-3">
              {/* Large Microphone Push-To-Talk Toggle Button */}
              <button
                type="button"
                onClick={handleToggleMic}
                title={t.micTapToSpeak}
                className={`w-16 h-14 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-lg ${
                  avatarState === "LISTENING"
                    ? "bg-emerald-500 text-white animate-pulse shadow-emerald-500/40"
                    : avatarState === "THINKING"
                    ? "bg-indigo-600 text-white shadow-indigo-500/30"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700"
                }`}
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
                className="h-14 px-6 rounded-2xl bg-sky-500 hover:bg-sky-400 disabled:opacity-40 disabled:hover:bg-sky-500 text-white font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-sky-500/20"
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
