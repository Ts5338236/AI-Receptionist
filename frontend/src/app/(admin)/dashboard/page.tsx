import React from "react";
import { Users, Clock, ShieldCheck, Printer, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const MOCK_VISITORS = [
  {
    id: "1",
    name: "Jane Doe",
    company: "Acme Cloud Corp",
    host: "Sarah Jenkins",
    department: "Engineering",
    checkin: "10:14 AM",
    status: "checked_in",
    badge: "Printed (#1042)",
  },
  {
    id: "2",
    name: "Marcus Vance",
    company: "Apex Capital",
    host: "David Ross",
    department: "Finance",
    checkin: "09:45 AM",
    status: "checked_in",
    badge: "Printed (#1041)",
  },
  {
    id: "3",
    name: "Elena Rostova",
    company: "CyberShield Security",
    host: "Michael Chang",
    department: "SecOps",
    checkin: "09:12 AM",
    status: "checked_out",
    badge: "Returned",
  },
  {
    id: "4",
    name: "FedEx Express Courier",
    company: "FedEx Logistics",
    host: "Mailroom Team",
    department: "Operations",
    checkin: "08:50 AM",
    status: "completed",
    badge: "N/A",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Visitor Management Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time lobby occupancy, check-in feeds, and digital receptionist metrics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success" className="px-3 py-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-1.5" />
            Live Lobby Feed Active
          </Badge>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Visitors On-Premise
            </CardTitle>
            <Users className="w-4 h-4 text-sky-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">24</div>
            <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> +18% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Check-ins Today
            </CardTitle>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">87</div>
            <p className="text-xs text-slate-400 mt-1">Avg 4.2 check-ins / hr</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Avg Host Response
            </CardTitle>
            <Clock className="w-4 h-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">1.8 min</div>
            <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
              -35s improvement via Slack
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">
              Badges Issued
            </CardTitle>
            <Printer className="w-4 h-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">79</div>
            <p className="text-xs text-slate-400 mt-1">Thermal kiosk printer online</p>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Visitor Stream Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Visitor Registrations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400 bg-slate-900/40">
                <tr>
                  <th className="px-4 py-3">Visitor Name</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Host & Dept</th>
                  <th className="px-4 py-3">Check-In Time</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Badge</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                {MOCK_VISITORS.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3.5 font-sans font-semibold text-white">
                      {v.name}
                    </td>
                    <td className="px-4 py-3.5 text-slate-300">{v.company}</td>
                    <td className="px-4 py-3.5 text-slate-300">
                      {v.host}{" "}
                      <span className="text-slate-500 font-sans">({v.department})</span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-400">{v.checkin}</td>
                    <td className="px-4 py-3.5">
                      {v.status === "checked_in" ? (
                        <Badge variant="success">Checked In</Badge>
                      ) : (
                        <Badge variant="secondary">Completed</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-slate-400 font-sans">{v.badge}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
