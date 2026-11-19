"use client";

import React from "react";
import Link from "next/link";
import {
  UserCheck,
  Calendar,
  Users,
  Compass,
  Info,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
import { useLanguage } from "@/context/language-context";

interface QuickActionItem {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  gradient: string;
  badge?: string;
}

export function QuickActions() {
  const { t } = useLanguage();

  const actions: QuickActionItem[] = [
    {
      id: "checkin",
      title: t.actionCheckIn,
      description: t.actionCheckInDesc,
      href: "/kiosk/visitor-check-in",
      icon: <UserCheck className="w-7 h-7 text-white" />,
      gradient: "from-sky-500 to-blue-600 shadow-sky-500/20",
      badge: "Fast Pass",
    },
    {
      id: "appointment",
      title: t.actionAppointment,
      description: t.actionAppointmentDesc,
      href: "/kiosk/appointments",
      icon: <Calendar className="w-7 h-7 text-white" />,
      gradient: "from-indigo-500 to-indigo-700 shadow-indigo-500/20",
    },
    {
      id: "employee",
      title: t.actionEmployee,
      description: t.actionEmployeeDesc,
      href: "/kiosk/employee-directory",
      icon: <Users className="w-7 h-7 text-white" />,
      gradient: "from-emerald-500 to-teal-700 shadow-emerald-500/20",
    },
    {
      id: "department",
      title: t.actionDepartment,
      description: t.actionDepartmentDesc,
      href: "/kiosk/department-navigation",
      icon: <Compass className="w-7 h-7 text-white" />,
      gradient: "from-purple-500 to-violet-700 shadow-purple-500/20",
    },
    {
      id: "info",
      title: t.actionInfo,
      description: t.actionInfoDesc,
      href: "/kiosk/assistance",
      icon: <Info className="w-7 h-7 text-white" />,
      gradient: "from-amber-500 to-orange-600 shadow-amber-500/20",
    },
    {
      id: "assistance",
      title: t.actionAssistance,
      description: t.actionAssistanceDesc,
      href: "/kiosk/assistance",
      icon: <HelpCircle className="w-7 h-7 text-white" />,
      gradient: "from-rose-500 to-pink-700 shadow-rose-500/20",
      badge: "Live Concierge",
    },
  ];

  return (
    <section className="w-full max-w-6xl mx-auto px-6 py-4 select-none">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            {t.quickActionsTitle}
          </h2>
          <p className="text-xs md:text-sm text-slate-400">
            {t.quickActionsSubtitle}
          </p>
        </div>
      </div>

      {/* Touch Screen 6-Card Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {actions.map((act) => (
          <Link
            key={act.id}
            href={act.href}
            className="group relative flex flex-col justify-between p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-sky-500/60 hover:bg-slate-800/60 active:scale-[0.98] transition-all duration-200 shadow-lg backdrop-blur-md"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${act.gradient} flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}
                >
                  {act.icon}
                </div>
                {act.badge && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400">
                    {act.badge}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-sky-300 transition-colors">
                {act.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {act.description}
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-400 mt-4 group-hover:translate-x-1 transition-transform">
              <span>Open</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
