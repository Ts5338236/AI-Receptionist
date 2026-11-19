"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export interface ActionCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  gradient?: string;
  badge?: string;
  className?: string;
  onClick?: () => void;
}

export function ActionCard({
  title,
  description,
  href,
  icon,
  gradient = "from-sky-500 to-blue-600",
  badge,
  className = "",
  onClick,
}: ActionCardProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group relative flex flex-col justify-between p-6 rounded-3xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-sky-500/50 shadow-xl hover:shadow-2xl hover:shadow-sky-500/10 transition-all duration-300 active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-sky-500/30 overflow-hidden min-h-[140px] md:min-h-[170px] ${className}`}
    >
      {/* Background Ambient Glow */}
      <div
        className={`absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-gradient-to-br ${gradient} opacity-10 group-hover:opacity-20 blur-2xl transition-opacity duration-300 pointer-events-none`}
      />

      <div className="flex items-start justify-between gap-4">
        {/* Large Tactile Icon */}
        <div
          className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg shrink-0 group-hover:scale-105 transition-transform duration-300`}
        >
          {icon}
        </div>

        {badge && (
          <span className="px-3 py-1 rounded-full text-[11px] font-bold font-mono tracking-wider uppercase bg-sky-500/15 border border-sky-500/30 text-sky-300 shadow-sm">
            {badge}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-end justify-between gap-2">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-white group-hover:text-sky-300 transition-colors">
            {title}
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1 line-clamp-2">
            {description}
          </p>
        </div>

        <div className="w-9 h-9 rounded-xl bg-slate-800/80 group-hover:bg-sky-500 flex items-center justify-center text-slate-400 group-hover:text-white transition-all shrink-0">
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </Link>
  );
}
