"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type SupportedLanguage = "en" | "hi";

export interface Translations {
  // Navigation & Brand
  brandName: string;
  brandTagline: string;
  terminalId: string;
  onlineStatus: string;
  activeSensors: string;

  // Welcome Screen
  welcomeHeading: string;
  welcomeSubheading: string;
  startConversationBtn: string;
  quickActionsTitle: string;
  quickActionsSubtitle: string;

  // Quick Action Items
  actionCheckIn: string;
  actionCheckInDesc: string;
  actionAppointment: string;
  actionAppointmentDesc: string;
  actionEmployee: string;
  actionEmployeeDesc: string;
  actionDepartment: string;
  actionDepartmentDesc: string;
  actionInfo: string;
  actionInfoDesc: string;
  actionAssistance: string;
  actionAssistanceDesc: string;

  // Avatar States
  avatarIdle: string;
  avatarListening: string;
  avatarThinking: string;
  avatarSpeaking: string;
  avatarError: string;

  // Conversation Assistant
  conversationTitle: string;
  conversationSubtitle: string;
  transcriptPlaceholder: string;
  micTapToSpeak: string;
  micListening: string;
  micProcessing: string;
  typeFallbackPlaceholder: string;
  sendBtn: string;
  endConversationBtn: string;

  // Utility & Accessibility
  accessibilityBtn: string;
  languageBtn: string;
  privacyBtn: string;
  privacyTitle: string;
  dismissBtn: string;
  highContrast: string;
  textScale: string;
  resetKioskBtn: string;
  inactivityWarning: string;
  backToHomeBtn: string;
  prototypeNotice: string;
}

const DICTIONARY: Record<SupportedLanguage, Translations> = {
  en: {
    brandName: "Horizon Technologies",
    brandTagline: "Enterprise Headquarters • Building A",
    terminalId: "KIOSK-LOBBY-01",
    onlineStatus: "Online & Secure",
    activeSensors: "Vision & Voice Ready",

    welcomeHeading: "Welcome to Our Organization",
    welcomeSubheading:
      "Hello! I am your AI Virtual Receptionist. I can assist you with visitor check-in, directory navigation, appointments, and general inquiries.",
    startConversationBtn: "Start Conversation",
    quickActionsTitle: "Touch Screen Quick Actions",
    quickActionsSubtitle: "Select an option below or tap the microphone to begin talking",

    actionCheckIn: "Visitor Check-In",
    actionCheckInDesc: "Register your arrival and print your visitor badge",
    actionAppointment: "Scheduled Appointment",
    actionAppointmentDesc: "Scan your QR invite or look up your booking",
    actionEmployee: "Meet an Employee",
    actionEmployeeDesc: "Notify your host employee of your arrival",
    actionDepartment: "Find a Department",
    actionDepartmentDesc: "Interactive office wayfinding & floor map",
    actionInfo: "General Information",
    actionInfoDesc: "Company policies, WiFi access & amenities",
    actionAssistance: "Request Assistance",
    actionAssistanceDesc: "Connect with a live facilities concierge",

    avatarIdle: "Ready to assist you. Tap below or say hello.",
    avatarListening: "I'm listening... please speak naturally.",
    avatarThinking: "Processing your request...",
    avatarSpeaking: "Answering your inquiry...",
    avatarError: "Microphone disconnected or service unavailable.",

    conversationTitle: "AI Virtual Assistant",
    conversationSubtitle: "Voice & Multimodal Receptionist Interface",
    transcriptPlaceholder: "Conversation transcript will appear here in real time.",
    micTapToSpeak: "Tap to Speak",
    micListening: "Listening...",
    micProcessing: "Thinking...",
    typeFallbackPlaceholder: "Or type your question here...",
    sendBtn: "Send",
    endConversationBtn: "End Conversation",

    accessibilityBtn: "Accessibility",
    languageBtn: "Language",
    privacyBtn: "Privacy Notice",
    privacyTitle: "Privacy & Data Protection",
    dismissBtn: "Dismiss & Return",
    highContrast: "High Contrast",
    textScale: "Text Size",
    resetKioskBtn: "Session Reset",
    inactivityWarning: "Resetting due to inactivity in",
    backToHomeBtn: "Return to Main Screen",
    prototypeNotice:
      "Phase 2 Interface: Integration with live visitor badge printer and RAG backend scheduled for subsequent phases.",
  },
  hi: {
    brandName: "होराइजन टेक्नोलॉजीज",
    brandTagline: "कॉर्पोरेट मुख्यालय • भवन ए",
    terminalId: "कियोस्क-लॉबी-01",
    onlineStatus: "ऑनलाइन एवं सुरक्षित",
    activeSensors: "ध्वनि एवं दृष्टि तैयार",

    welcomeHeading: "हमारे संगठन में आपका स्वागत है",
    welcomeSubheading:
      "नमस्ते! मैं आपकी एआई वर्चुअल रिसेप्शनिस्ट हूँ। मैं आगंतुक पंजीकरण, कार्यालय निर्देशिका, अपॉइंटमेंट और पूछताछ में आपकी सहायता कर सकती हूँ।",
    startConversationBtn: "बातचीत शुरू करें",
    quickActionsTitle: "टच स्क्रीन त्वरित विकल्प",
    quickActionsSubtitle: "नीचे दिए गए विकल्प चुनें या बातचीत करने के लिए माइक दबाएं",

    actionCheckIn: "आगंतुक चेक-इन",
    actionCheckInDesc: "अपना आगमन दर्ज करें और प्रवेश पास प्राप्त करें",
    actionAppointment: "निर्धारित अपॉइंटमेंट",
    actionAppointmentDesc: "अपना क्यूआर कोड स्कैन करें या बुकिंग खोजें",
    actionEmployee: "कर्मचारी से मिलें",
    actionEmployeeDesc: "अपने मेजबान कर्मचारी को आगमन की सूचना दें",
    actionDepartment: "विभाग खोजें",
    actionDepartmentDesc: "कार्यालय मानचित्र एवं नेविगेशन निर्देश",
    actionInfo: "सामान्य जानकारी",
    actionInfoDesc: "कंपनी नीतियां, वाई-फाई और सुविधाएं",
    actionAssistance: "सहायता का अनुरोध करें",
    actionAssistanceDesc: "लाइव सहायता ऑपरेटर से संपर्क करें",

    avatarIdle: "आपकी सेवा में तैयार। कृपया स्पर्श करें या बोलें।",
    avatarListening: "मैं सुन रही हूँ... कृपया बोलें।",
    avatarThinking: "आपके अनुरोध पर विचार कर रही हूँ...",
    avatarSpeaking: "उत्तर दे रही हूँ...",
    avatarError: "माइक्रोफ़ोन डिस्कनेक्ट हो गया है।",

    conversationTitle: "एआई वर्चुअल रिसेप्शनिस्ट",
    conversationSubtitle: "ध्वनि एवं इंटरैक्टिव कियोस्क इंटरफेस",
    transcriptPlaceholder: "बातचीत का विवरण यहाँ वास्तविक समय में दिखाई देगा।",
    micTapToSpeak: "बोलने के लिए दबाएं",
    micListening: "सुन रही हूँ...",
    micProcessing: "विचार कर रही हूँ...",
    typeFallbackPlaceholder: "या अपना प्रश्न यहाँ लिखें...",
    sendBtn: "भेजें",
    endConversationBtn: "बातचीत समाप्त करें",

    accessibilityBtn: "अभिगम्यता विकल्प",
    languageBtn: "भाषा चुनें",
    privacyBtn: "गोपनीयता सूचना",
    privacyTitle: "गोपनीयता एवं डेटा सुरक्षा",
    dismissBtn: "बंद करें और वापस जाएं",
    highContrast: "उच्च कंट्रास्ट",
    textScale: "अक्षर का आकार",
    resetKioskBtn: "सत्र रीसेट",
    inactivityWarning: "निष्क्रियता के कारण रीसेट हो रहा है:",
    backToHomeBtn: "मुख्य स्क्रीन पर वापस जाएं",
    prototypeNotice:
      "चरण 2 प्रोटोटाइप इंटरफ़ेस: लाइव विज़िटर प्रिंटर और आरएजी एकीकरण आगामी चरणों के लिए निर्धारित है।",
  },
};

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: DICTIONARY.en,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>("en");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("kiosk_language") as SupportedLanguage;
      if (saved && (saved === "en" || saved === "hi")) {
        setLanguageState(saved);
      }
    }
  }, []);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("kiosk_language", lang);
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: DICTIONARY[language],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
