import Link from "next";
import { Monitor, LayoutDashboard, Shield, LogIn, Cpu, Database, Server, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-between p-8 md:p-16">
      {/* Top Header */}
      <div className="w-full max-w-6xl flex items-center justify-between pb-8 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center shadow-lg shadow-sky-500/30">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              AI Receptionist Enterprise
            </h1>
            <p className="text-xs text-slate-400">Phase 1 Technical Foundation</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="success" className="px-3 py-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Backend API v1 Operational
          </Badge>
          <Link href="/login">
            <Button variant="outline" size="sm">
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="w-full max-w-4xl text-center py-12 space-y-4">
        <Badge variant="default" className="text-xs px-3 py-1">
          Next.js 16 + FastAPI + PostgreSQL + Redis + Qdrant
        </Badge>
        <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Production Foundation for <br />
          <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            Physical AI Virtual Receptionists
          </span>
        </h2>
        <p className="text-lg text-slate-300 max-w-2xl mx-auto">
          High-performance touchscreen kiosk interface, async Python microservices, multi-tenant database design, and enterprise-grade observability.
        </p>
      </div>

      {/* Primary Navigation Cards */}
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-6">
        {/* Kiosk Mode */}
        <Link href="/kiosk" className="group">
          <Card className="h-full border-sky-500/30 bg-slate-900/80 hover:border-sky-400 hover:bg-slate-900 transition-all duration-200">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Monitor className="w-6 h-6 text-sky-400" />
              </div>
              <CardTitle className="text-lg text-sky-400">Kiosk Terminal</CardTitle>
              <CardDescription>
                Launch the physical touchscreen interface with digital human avatar & check-in triggers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <span className="text-xs font-mono text-sky-300 flex items-center gap-1">
                Route: /kiosk &rarr;
              </span>
            </CardContent>
          </Card>
        </Link>

        {/* Dashboard */}
        <Link href="/dashboard" className="group">
          <Card className="h-full hover:border-slate-700 hover:bg-slate-900/90 transition-all duration-200">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <LayoutDashboard className="w-6 h-6 text-indigo-400" />
              </div>
              <CardTitle className="text-lg">Visitor Dashboard</CardTitle>
              <CardDescription>
                Real-time visitor logs, host notifications, badge printing logs, and arrival metrics.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                Route: /dashboard &rarr;
              </span>
            </CardContent>
          </Card>
        </Link>

        {/* Admin Fleet */}
        <Link href="/admin" className="group">
          <Card className="h-full hover:border-slate-700 hover:bg-slate-900/90 transition-all duration-200">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 text-purple-400" />
              </div>
              <CardTitle className="text-lg">Fleet Management</CardTitle>
              <CardDescription>
                Multi-tenant configuration, hardware telemetry, buildings, and kiosk registration.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                Route: /admin &rarr;
              </span>
            </CardContent>
          </Card>
        </Link>

        {/* Authentication */}
        <Link href="/login" className="group">
          <Card className="h-full hover:border-slate-700 hover:bg-slate-900/90 transition-all duration-200">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <LogIn className="w-6 h-6 text-emerald-400" />
              </div>
              <CardTitle className="text-lg">Enterprise Auth</CardTitle>
              <CardDescription>
                Secure portal login for reception managers, security staff, and tenant administrators.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                Route: /login &rarr;
              </span>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Backend Infrastructure Verification Summary */}
      <div className="w-full max-w-6xl pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-slate-400">
            <Server className="w-4 h-4 text-sky-400" />
            FastAPI /api/v1/
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <Database className="w-4 h-4 text-emerald-400" />
            PostgreSQL 16 Async Engine
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
            Redis 7.2 Session Store
          </span>
        </div>
        <div>
          <span>AI Receptionist Enterprise © 2026. Production-Ready Technical Foundation.</span>
        </div>
      </div>
    </main>
  );
}
