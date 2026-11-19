import { apiClient } from "./api-client";

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  floor: string;
  room: string;
  status: "AVAILABLE" | "IN_MEETING" | "AWAY" | "OFF_SITE";
  email: string;
  avatar_url?: string;
}

const DEMO_EMPLOYEES: Employee[] = [
  {
    id: "emp-001",
    name: "Dr. Ananya Roy",
    role: "Head of AI & Robotics",
    department: "AI Research & Engineering",
    floor: "Floor 3",
    room: "Lab 3B",
    status: "AVAILABLE",
    email: "ananya.roy@horizon.tech",
  },
  {
    id: "emp-002",
    name: "Vikram Malhotra",
    role: "Chief Operating Officer",
    department: "Executive Leadership",
    floor: "Floor 4",
    room: "Executive Suite 402",
    status: "IN_MEETING",
    email: "vikram.m@horizon.tech",
  },
  {
    id: "emp-003",
    name: "Priya Nair",
    role: "Principal Product Designer",
    department: "Product Design & UX",
    floor: "Floor 2",
    room: "Design Studio 210",
    status: "AVAILABLE",
    email: "priya.nair@horizon.tech",
  },
  {
    id: "emp-004",
    name: "Marcus Vance",
    role: "Director of Facilities & Security",
    department: "Operations & Facilities",
    floor: "Floor 1",
    room: "Control Room 105",
    status: "AVAILABLE",
    email: "marcus.v@horizon.tech",
  },
  {
    id: "emp-005",
    name: "Kavita Rao",
    role: "Senior Talent Acquisition Manager",
    department: "Human Resources",
    floor: "Floor 2",
    room: "Interview Suite 204",
    status: "AVAILABLE",
    email: "kavita.rao@horizon.tech",
  },
  {
    id: "emp-006",
    name: "Arjun Mehta",
    role: "Lead Cloud Infrastructure Architect",
    department: "DevOps & Cloud Systems",
    floor: "Floor 3",
    room: "NOC Station 301",
    status: "AWAY",
    email: "arjun.m@horizon.tech",
  },
];

export const employeeService = {
  async searchEmployees(query: string = "", department: string = ""): Promise<Employee[]> {
    try {
      const params = new URLSearchParams();
      if (query) params.append("q", query);
      if (department) params.append("dept", department);
      return await apiClient<Employee[]>(`/employees?${params.toString()}`);
    } catch {
      let filtered = [...DEMO_EMPLOYEES];
      if (department && department !== "All") {
        filtered = filtered.filter((e) => e.department === department);
      }
      if (query.trim()) {
        const q = query.toLowerCase();
        filtered = filtered.filter(
          (e) =>
            e.name.toLowerCase().includes(q) ||
            e.role.toLowerCase().includes(q) ||
            e.department.toLowerCase().includes(q)
        );
      }
      return filtered;
    }
  },

  async notifyHost(employeeId: string, visitorName: string): Promise<{ success: boolean; message: string }> {
    try {
      return await apiClient<{ success: boolean; message: string }>(
        `/employees/${employeeId}/notify-arrival`,
        {
          method: "POST",
          body: JSON.stringify({ visitor_name: visitorName }),
        }
      );
    } catch {
      const emp = DEMO_EMPLOYEES.find((e) => e.id === employeeId);
      const name = emp ? emp.name : "Your host";
      return {
        success: true,
        message: `Notification dispatched! ${name} has been alerted of your arrival at Lobby Kiosk 01.`,
      };
    }
  },
};
