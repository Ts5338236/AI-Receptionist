"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Building,
  Mail,
  MapPin,
  Compass,
  AlertCircle,
  Bell,
  ArrowRight,
} from "lucide-react";
import { StatusBanner } from "@/components/kiosk/status-banner";
import { KioskFooter } from "@/components/kiosk/kiosk-footer";
import { useLanguage } from "@/context/language-context";
import { useKioskSession } from "@/hooks/use-kiosk-session";

export default function DirectoryPage() {
  const { t } = useLanguage();
  const { secondsRemaining, isWarning, resetActivity } = useKioskSession({
    timeoutSeconds: 90,
    homePath: "/kiosk",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"employees" | "departments">("employees");

  const EMPLOYEES = [
    {
      id: "1",
      name: "Sarah Jenkins",
      role: "VP of Engineering",
      department: "Software & AI Systems",
      floor: "Floor 4, East Wing",
      email: "sarah.j@horizon.tech",
    },
    {
      id: "2",
      name: "David Ross",
      role: "Director of Corporate Finance",
      department: "Finance & Accounting",
      floor: "Floor 3, West Wing",
      email: "david.r@horizon.tech",
    },
    {
      id: "3",
      name: "Michael Chang",
      role: "Lead Information Security Officer",
      department: "Security Operations",
      floor: "Floor 2, North Wing",
      email: "m.chang@horizon.tech",
    },
    {
      id: "4",
      name: "Amina Al-Mansoor",
      role: "Head of People & Facilities",
      department: "Human Resources",
      floor: "Floor 2, South Wing",
      email: "amina@horizon.tech",
    },
  ];

  const DEPARTMENTS = [
    {
      id: "d1",
      name: "Executive Briefing Center",
      floor: "Floor 14, Penthouse",
      contact: "Exec Support Desk",
      description: "Client presentations, board rooms, and executive suites.",
    },
    {
      id: "d2",
      name: "Software & AI Engineering",
      floor: "Floor 4, East Wing",
      contact: "Sarah Jenkins",
      description: "Research labs, hardware simulation rooms, open workspaces.",
    },
    {
      id: "d3",
      name: "People Operations & HR",
      floor: "Floor 2, South Wing",
      contact: "Amina Al-Mansoor",
      description: "Talent acquisition, candidate interviewing rooms, training center.",
    },
    {
      id: "d4",
      name: "Corporate Logistics & Mailroom",
      floor: "Lower Level (LL-1)",
      contact: "Facilities Team",
      description: "Package receipt, courier dispatch, central building supplies.",
    },
  ];

  const filteredEmployees = EMPLOYEES.filter(
    (e) =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDepartments = DEPARTMENTS.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.floor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-slate-950">
      <StatusBanner showBackToHome={true} />

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 flex flex-col justify-center overflow-y-auto">
        <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Users className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                  Company Directory & Wayfinding
                </h1>
                <p className="text-sm text-slate-400">
                  Search for staff members, office branches, and meeting zones
                </p>
              </div>
            </div>

            <Link
              href="/kiosk"
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
            >
              &larr; {t.backToHomeBtn}
            </Link>
          </div>

          {/* Prototype Notice */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              Phase 2 Demonstration: Interactive directory mockup. Active Slack/Teams host notifications and 3D floorplan wayfinding will connect in Phase 3.
            </span>
          </div>

          {/* Tab Selector & Search */}
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex rounded-xl bg-slate-800 p-1 w-full md:w-auto">
              <button
                onClick={() => {
                  setActiveTab("employees");
                  resetActivity();
                }}
                className={`flex-1 md:flex-initial px-6 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                  activeTab === "employees"
                    ? "bg-emerald-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Employees (Directory)
              </button>
              <button
                onClick={() => {
                  setActiveTab("departments");
                  resetActivity();
                }}
                className={`flex-1 md:flex-initial px-6 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                  activeTab === "departments"
                    ? "bg-emerald-600 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Departments & Wayfinding
              </button>
            </div>

            <div className="flex-1 w-full relative">
              <Search className="w-5 h-5 text-slate-500 absolute left-4 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  resetActivity();
                }}
                placeholder={
                  activeTab === "employees"
                    ? "Search staff by name or department..."
                    : "Search departments or floor numbers..."
                }
                className="w-full h-11 pl-12 pr-4 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
              />
            </div>
          </div>

          {/* Directory Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {activeTab === "employees"
              ? filteredEmployees.map((emp) => (
                  <div
                    key={emp.id}
                    className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 flex flex-col justify-between hover:border-emerald-500/50 transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-lg font-bold text-white">{emp.name}</h4>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Available
                        </span>
                      </div>
                      <p className="text-xs text-emerald-400 font-medium">{emp.role}</p>
                      <p className="text-xs text-slate-400 mt-1">{emp.department}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-sky-400" />
                        {emp.floor}
                      </span>
                      <button
                        onClick={() => {
                          resetActivity();
                          alert(`Simulated: Notification dispatched to ${emp.name} via corporate Slack.`);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1 text-xs cursor-pointer shadow-md"
                      >
                        <Bell className="w-3.5 h-3.5" />
                        Notify Host
                      </button>
                    </div>
                  </div>
                ))
              : filteredDepartments.map((dept) => (
                  <div
                    key={dept.id}
                    className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 flex flex-col justify-between hover:border-emerald-500/50 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Compass className="w-4 h-4 text-emerald-400" />
                        <h4 className="text-lg font-bold text-white">{dept.name}</h4>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {dept.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs">
                      <span className="text-sky-300 font-semibold flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {dept.floor}
                      </span>
                      <span className="text-slate-400">Contact: {dept.contact}</span>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </main>

      <KioskFooter
        showStartConversationCTA={false}
        secondsRemaining={secondsRemaining}
        isWarning={isWarning}
      />
    </div>
  );
}
