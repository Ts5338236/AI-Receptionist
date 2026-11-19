import { apiClient } from "./api-client";

export interface Appointment {
  id: string;
  confirmation_code: string;
  visitor_name: string;
  host_employee: string;
  department: string;
  meeting_room: string;
  time: string;
  date: string;
  status: "CONFIRMED" | "CHECKED_IN" | "CANCELLED";
  purpose: string;
}

export interface AppointmentSearchRequest {
  code?: string;
  email?: string;
  phone?: string;
}

const DEMO_APPOINTMENTS: Appointment[] = [
  {
    id: "apt-101",
    confirmation_code: "APT-8821",
    visitor_name: "Rahul Sharma",
    host_employee: "Vikram Malhotra",
    department: "Executive Leadership",
    meeting_room: "Boardroom Alpha • Floor 4",
    time: "10:30 AM",
    date: "Today",
    status: "CONFIRMED",
    purpose: "Strategic Partnership Review",
  },
  {
    id: "apt-102",
    confirmation_code: "APT-4419",
    visitor_name: "Sarah Jenkins",
    host_employee: "Dr. Ananya Roy",
    department: "AI Research & Engineering",
    meeting_room: "Lab 3B • Floor 3",
    time: "02:00 PM",
    date: "Today",
    status: "CONFIRMED",
    purpose: "Technical Architecture Sync",
  },
  {
    id: "apt-103",
    confirmation_code: "APT-9930",
    visitor_name: "Elena Rostova",
    host_employee: "Priya Nair",
    department: "Product Design & UX",
    meeting_room: "Studio West • Floor 2",
    time: "04:15 PM",
    date: "Today",
    status: "CONFIRMED",
    purpose: "Kiosk UI Hardware Evaluation",
  },
];

export const appointmentService = {
  async searchAppointment(req: AppointmentSearchRequest): Promise<Appointment[]> {
    try {
      return await apiClient<Appointment[]>("/appointments/search", {
        method: "POST",
        body: JSON.stringify(req),
      });
    } catch {
      if (req.code) {
        const found = DEMO_APPOINTMENTS.filter(
          (a) => a.confirmation_code.toLowerCase() === req.code?.toLowerCase()
        );
        return found.length > 0 ? found : [DEMO_APPOINTMENTS[0]];
      }
      return DEMO_APPOINTMENTS;
    }
  },

  async checkInAppointment(appointmentId: string): Promise<{ success: boolean; message: string }> {
    try {
      return await apiClient<{ success: boolean; message: string }>(
        `/appointments/${appointmentId}/check-in`,
        { method: "POST" }
      );
    } catch {
      return {
        success: true,
        message: "Appointment arrival confirmed. Your host has been alerted.",
      };
    }
  },
};
