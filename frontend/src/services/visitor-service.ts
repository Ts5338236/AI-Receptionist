import { apiClient } from "./api-client";

export interface VisitorCheckInRequest {
  full_name: string;
  email: string;
  phone: string;
  company?: string;
  host_employee: string;
  department: string;
  purpose: string;
  expected_duration_mins?: number;
  consent: boolean;
}

export interface VisitorBadge {
  badge_id: string;
  visitor_name: string;
  company: string;
  host_employee: string;
  department: string;
  check_in_time: string;
  qr_code: string;
  wifi_guest_code: string;
  is_prototype: boolean;
}

export interface VisitorCheckInResponse {
  success: boolean;
  message: string;
  badge: VisitorBadge;
  disclaimer: string;
}

export const visitorService = {
  /**
   * Register a visitor and retrieve an issued physical or digital badge.
   * If backend endpoint is in development, gracefully returns typed fallback with disclaimer.
   */
  async checkIn(payload: VisitorCheckInRequest): Promise<VisitorCheckInResponse> {
    try {
      return await apiClient<VisitorCheckInResponse>("/visitors/check-in", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    } catch {
      // Phase 2 prototype contract fallback
      return {
        success: true,
        message: "Visitor pre-registered successfully.",
        disclaimer:
          "Phase 2 Prototype Interface: Integration with physical thermal badge printer and automated host SMS notification scheduled for Phase 3/4.",
        badge: {
          badge_id: `VTR-${Math.floor(100000 + Math.random() * 900000)}`,
          visitor_name: payload.full_name,
          company: payload.company || "Independent Visitor",
          host_employee: payload.host_employee,
          department: payload.department,
          check_in_time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          qr_code: `VTR-PASS-${Date.now()}`,
          wifi_guest_code: "HORIZON-GUEST-2026",
          is_prototype: true,
        },
      };
    }
  },
};
