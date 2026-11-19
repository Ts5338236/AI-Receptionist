import Link from "next/link";
import { LayoutDashboard, Shield, Monitor, Bell, User, LogOut, Cpu, Settings } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between">
        <div className="space-y-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-white tracking-tight text-sm">
                AI Receptionist
              </span>
              <span className="block text-[10px] text-slate-400 font-mono">
                ENTERPRISE
              </span>
            </div>
          </Link>

          <nav className="space-y-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-sky-400" />
              Visitor Dashboard
            </Link>
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Shield className="w-4 h-4 text-purple-400" />
              Kiosk Fleet & Devices
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Settings className="w-4 h-4 text-amber-400" />
              Settings & Policies
            </Link>
            <Link
              href="/kiosk"
              target="_blank"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Monitor className="w-4 h-4 text-emerald-400" />
              Open Live Kiosk ↗
            </Link>
          </nav>
        </div>

        {/* User footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
              <User className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <span className="block font-medium text-white">Admin Operator</span>
              <span className="block text-slate-500 text-[10px]">admin@enterprise.ai</span>
            </div>
          </div>
          <Link href="/login" title="Logout" className="text-slate-400 hover:text-red-400">
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
