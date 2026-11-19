import { apiClient } from "./api-client";

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
}

export interface ConversationTurnRequest {
  message: string;
  conversation_id?: string;
  session_id?: string;
  language?: string;
}

export interface ConversationTurnResponse {
  conversation_id: string;
  session_id: string;
  reply: string;
  intent?: string;
  confidence?: number;
  entities?: Record<string, string | null>;
  needs_clarification?: boolean;
  is_escalated?: boolean;
  tool_executed?: string | null;
  latency_ms?: number;
  suggested_actions?: string[];
  is_development_preview?: boolean;
}

export interface ConversationDetail {
  conversation_id: string;
  tenant_id: string;
  kiosk_id: string | null;
  status: string;
  current_intent: string | null;
  messages: Array<{
    id: string;
    sender: string;
    content: string;
    intent?: string | null;
    created_at: string;
  }>;
}

let activeConversationId: string | null = null;

export const conversationService = {
  /**
   * Initializes or returns the current active conversation ID.
   */
  async getOrCreateConversation(kioskId = "kiosk-default-01", language = "en-US"): Promise<string> {
    if (activeConversationId) return activeConversationId;

    try {
      const res = await apiClient<{ conversation_id: string }>("/conversations", {
        method: "POST",
        body: JSON.stringify({ kiosk_id: kioskId, language }),
      });
      activeConversationId = res.conversation_id;
      return res.conversation_id;
    } catch {
      activeConversationId = `conv-${Date.now()}`;
      return activeConversationId;
    }
  },

  /**
   * Send a message to the AI receptionist backend running LangGraph.
   */
  async sendMessage(req: ConversationTurnRequest): Promise<ConversationTurnResponse> {
    const convId = req.conversation_id || req.session_id || (await this.getOrCreateConversation());

    try {
      const res = await apiClient<{
        conversation_id: string;
        reply: string;
        intent: string;
        confidence: number;
        entities: Record<string, string | null>;
        needs_clarification: boolean;
        is_escalated: boolean;
        tool_executed: string | null;
        latency_ms: number;
      }>(`/conversations/${convId}/messages`, {
        method: "POST",
        body: JSON.stringify({
          message: req.message,
          language: req.language || "en-US",
        }),
      });

      return {
        conversation_id: res.conversation_id,
        session_id: res.conversation_id,
        reply: res.reply,
        intent: res.intent,
        confidence: res.confidence,
        entities: res.entities,
        needs_clarification: res.needs_clarification,
        is_escalated: res.is_escalated,
        tool_executed: res.tool_executed,
        latency_ms: res.latency_ms,
        suggested_actions: ["Visitor Check-In", "Employee Directory", "Office Directions"],
        is_development_preview: false,
      };
    } catch {
      // Offline fallback
      return {
        conversation_id: convId,
        session_id: convId,
        reply: `Thank you for reaching reception regarding '${req.message}'. How may I assist you further?`,
        suggested_actions: ["Visitor Check-In", "Employee Directory", "Connect with Concierge"],
        is_development_preview: true,
      };
    }
  },

  /**
   * Reset conversation history and memory.
   */
  async resetConversation(convId?: string): Promise<boolean> {
    const targetId = convId || activeConversationId;
    if (!targetId) return true;

    try {
      await apiClient(`/conversations/${targetId}/reset`, { method: "POST" });
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Terminate conversation and purge active session.
   */
  async endConversation(convId?: string): Promise<boolean> {
    const targetId = convId || activeConversationId;
    if (!targetId) return true;

    try {
      await apiClient(`/conversations/${targetId}/end`, { method: "POST" });
    } catch {
      // ignore
    }
    activeConversationId = null;
    return true;
  },
};
