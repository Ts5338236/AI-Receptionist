import { apiClient } from "./api-client";

export interface DepartmentInfo {
  id: string;
  name: string;
  floor: string;
  wing: string;
  description: string;
  lead: string;
  meetingRooms: string[];
  wayfindingDirections: string[];
}

const DEPARTMENTS_DATA: DepartmentInfo[] = [
  {
    id: "dept-exec",
    name: "Executive Leadership",
    floor: "4th Floor",
    wing: "North Tower",
    description: "Office of the CEO, COO, Chief Legal Officer and Boardroom Alpha.",
    lead: "Vikram Malhotra (COO)",
    meetingRooms: ["Boardroom Alpha (Cap: 24)", "Executive Briefing Suite 401"],
    wayfindingDirections: [
      "Proceed to Lobby Elevator Bank A.",
      "Take Elevator to the 4th Floor.",
      "Turn right upon exiting; Boardroom Alpha is through double glass doors.",
    ],
  },
  {
    id: "dept-ai",
    name: "AI Research & Engineering",
    floor: "3rd Floor",
    wing: "East Wing",
    description: "Multimodal AI models, speech synthesis labs, and physical robotics.",
    lead: "Dr. Ananya Roy",
    meetingRooms: ["Lab 3B (Speech & Vision)", "Compute Cluster Room 305", "Agile Pod 3A"],
    wayfindingDirections: [
      "Take Elevator or Central Escalator to the 3rd Floor.",
      "Follow signage for East Wing Innovation Labs.",
      "Check in at Lab 3B badge reader scanner.",
    ],
  },
  {
    id: "dept-design",
    name: "Product Design & UX",
    floor: "2nd Floor",
    wing: "West Wing",
    description: "Hardware industrial design, touchscreen kiosk UI, and accessibility labs.",
    lead: "Priya Nair",
    meetingRooms: ["Design Studio 210", "Usability Testing Lab 202"],
    wayfindingDirections: [
      "Take Central Stairs to the 2nd Floor.",
      "Turn left toward the open collaborative atrium.",
      "Design Studio 210 is immediately adjacent to the skylight terrace.",
    ],
  },
  {
    id: "dept-hr",
    name: "Human Resources & Talent",
    floor: "2nd Floor",
    wing: "South Wing",
    description: "Candidate interviews, employee benefits, and onboarding suite.",
    lead: "Kavita Rao",
    meetingRooms: ["Interview Suite 204", "Onboarding Lounge 206"],
    wayfindingDirections: [
      "Take Central Stairs or Elevator to Floor 2.",
      "Follow South Corridor to Suite 204.",
    ],
  },
  {
    id: "dept-ops",
    name: "Operations & Facilities",
    floor: "1st Floor (Ground)",
    wing: "Central Concourse",
    description: "Building management, security operations, guest badge center, and loading dock.",
    lead: "Marcus Vance",
    meetingRooms: ["Facilities Control 105", "Security Operations Command"],
    wayfindingDirections: [
      "Located on the ground floor, 50 feet past this kiosk on the right corridor.",
    ],
  },
];

export const departmentService = {
  async getDepartments(): Promise<DepartmentInfo[]> {
    try {
      return await apiClient<DepartmentInfo[]>("/departments");
    } catch {
      return DEPARTMENTS_DATA;
    }
  },

  async getDepartmentById(id: string): Promise<DepartmentInfo | undefined> {
    try {
      return await apiClient<DepartmentInfo>(`/departments/${id}`);
    } catch {
      return DEPARTMENTS_DATA.find((d) => d.id === id);
    }
  },
};
