import { apiClient } from "./api-client";

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
}

export interface ConversationTurnRequest {
  message: string;
  session_id?: string;
  language?: string;
}

export interface ConversationTurnResponse {
  session_id: string;
  reply: string;
  suggested_actions?: string[];
  audio_url?: string;
  is_development_preview: boolean;
}

export const conversationService = {
  /**
   * Send a message to the AI receptionist backend.
   * Discloses development preview mode if live LLM/RAG backend is in subsequent phases.
   */
  async sendMessage(req: ConversationTurnRequest): Promise<ConversationTurnResponse> {
    try {
      return await apiClient<ConversationTurnResponse>("/conversation/message", {
        method: "POST",
        body: JSON.stringify(req),
      });
    } catch {
      // Deterministic development preview replies matching reception queries
      const text = req.message.toLowerCase();
      let reply =
        "I can help you check in as a visitor, locate an employee, find conference rooms, or call a human concierge. What would you like to do?";

      if (text.includes("check in") || text.includes("visitor") || text.includes("arrive")) {
        reply =
          "To check in and receive your visitor pass, you can tap the 'Visitor Check-In' card on the screen, or let me guide you through the registration form.";
      } else if (text.includes("appointment") || text.includes("booking") || text.includes("qr")) {
        reply =
          "If you have a scheduled appointment, please tap 'Scheduled Appointment' or hold your invite QR code up to the optical camera scanner.";
      } else if (text.includes("wifi") || text.includes("internet") || text.includes("network")) {
        reply =
          "Guest Wi-Fi is available throughout the lobby. Connect to 'HORIZON-GUEST' using passcode: HORIZON-GUEST-2026.";
      } else if (text.includes("bathroom") || text.includes("restroom") || text.includes("toilet")) {
        reply =
          "Restrooms are located on the ground floor down the east hallway, just past the central elevator lobby on your left.";
      } else if (text.includes("coffee") || text.includes("cafeteria") || text.includes("lunch")) {
        reply =
          "The Horizon Lounge & Coffee Bar is located on the 2nd floor terrace, open from 8:00 AM to 5:00 PM.";
      }

      return {
        session_id: req.session_id || `sess-${Date.now()}`,
        reply,
        suggested_actions: ["Visitor Check-In", "Employee Directory", "Connect with Concierge"],
        is_development_preview: true,
      };
    }
  },
};
