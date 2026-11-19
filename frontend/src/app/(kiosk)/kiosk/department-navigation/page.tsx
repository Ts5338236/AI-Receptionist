"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Compass,
  Building2,
  MapPin,
  Users,
  ChevronRight,
  Search,
  Navigation,
  ChevronLeft,
} from "lucide-react";
import { StatusBanner } from "@/components/kiosk/status-banner";
import { KioskFooter } from "@/components/kiosk/kiosk-footer";
import { useLanguage } from "@/context/language-context";
import { useKioskSession } from "@/hooks/use-kiosk-session";
import {
  departmentService,
  DepartmentInfo,
} from "@/services/department-service";

export default function DepartmentNavigationPage() {
  const { t } = useLanguage();
  const { secondsRemaining, isWarning, resetActivity } = useKioskSession({
    timeoutSeconds: 90,
    homePath: "/kiosk",
  });

  const [departments, setDepartments] = useState<DepartmentInfo[]>([]);
  const [selectedDept, setSelectedDept] = useState<DepartmentInfo | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  React.useEffect(() => {
    departmentService.getDepartments().then((data) => {
      setDepartments(data);
      if (data.length > 0) setSelectedDept(data[0]);
    });
  }, []);

  const filteredDepartments = departments.filter((dept) => {
    const q = searchQuery.toLowerCase();
    return (
      dept.name.toLowerCase().includes(q) ||
      dept.floor.toLowerCase().includes(q) ||
      dept.description.toLowerCase().includes(q)
    );
  });

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-slate-950">
      <StatusBanner showBackToHome={true} />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 flex flex-col justify-between overflow-hidden">
        <div className="flex-1 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl p-6 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Compass className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                  {t.actionDepartment} & Wayfinding
                </h1>
                <p className="text-xs md:text-sm text-slate-400">
                  Interactive building floors, departments, and conference room navigation
                </p>
              </div>
            </div>

            <Link
              href="/kiosk"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold hover:bg-slate-700 transition"
            >
              <ChevronLeft className="w-4 h-4" />
              {t.backToHomeBtn}
            </Link>
          </div>

          {/* Search bar */}
          <div className="pt-4 pb-4 shrink-0">
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search department, floor, or room..."
                value={searchQuery}
                onChange={(e) => {
                  resetActivity();
                  setSearchQuery(e.target.value);
                }}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>
          </div>

          {/* Master-Detail Wayfinding Grid */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 overflow-hidden min-h-0">
            {/* Department List */}
            <div className="md:col-span-5 overflow-y-auto space-y-2 pr-1">
              {filteredDepartments.map((dept) => {
                const isSelected = selectedDept?.id === dept.id;
                return (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => {
                      resetActivity();
                      setSelectedDept(dept);
                    }}
                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between min-h-[72px] ${
                      isSelected
                        ? "bg-purple-950/60 border-purple-500 text-white shadow-lg shadow-purple-500/10"
                        : "bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:text-white"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-purple-400" />
                        <span className="font-bold text-sm">{dept.name}</span>
                      </div>
                      <span className="block text-xs text-purple-300 font-mono mt-1">
                        {dept.floor} • {dept.wing}
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-500 shrink-0" />
                  </button>
                );
              })}
            </div>

            {/* Department Wayfinding Detail */}
            <div className="md:col-span-7 bg-slate-950/70 rounded-2xl border border-slate-800/80 p-6 flex flex-col justify-between overflow-y-auto">
              {selectedDept ? (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono text-purple-400 uppercase tracking-wider font-semibold">
                      <MapPin className="w-4 h-4" />
                      <span>{selectedDept.floor} • {selectedDept.wing}</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mt-1">
                      {selectedDept.name}
                    </h2>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      {selectedDept.description}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
                    <Users className="w-5 h-5 text-purple-400 shrink-0" />
                    <div className="text-xs">
                      <span className="text-slate-400">Department Lead: </span>
                      <span className="text-white font-semibold">{selectedDept.lead}</span>
                    </div>
                  </div>

                  {/* Conference & Meeting Rooms */}
                  <div>
                    <span className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-2 font-semibold">
                      Meeting Rooms & Labs
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedDept.meetingRooms.map((room, idx) => (
                        <div
                          key={idx}
                          className="px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 font-medium"
                        >
                          {room}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Step-by-Step Wayfinding */}
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono text-purple-400 uppercase tracking-wider mb-3 font-semibold">
                      <Navigation className="w-4 h-4" />
                      <span>Walking Directions from this Kiosk</span>
                    </div>
                    <ol className="space-y-2 text-xs text-slate-300">
                      {selectedDept.wayfindingDirections.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
                  Select a department to view wayfinding directions
                </div>
              )}

              <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Phase 2 Kiosk Wayfinding Subsystem</span>
                <span>Interactive 3D Floor Map scheduled for Phase 3</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <KioskFooter secondsRemaining={secondsRemaining} isWarning={isWarning} />
    </div>
  );
}
