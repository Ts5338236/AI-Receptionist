import React from "react";
import { Monitor, Plus, HardDrive, Cpu, Radio, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const MOCK_KIOSKS = [
  {
    id: "d1a8e0f4-5b2c-4991-9e77-24819d9b6271",
    deviceCode: "KIOSK-LOBBY-01",
    name: "Main Lobby Entrance Terminal",
    building: "Tower A (Main HQ)",
    ipAddress: "192.168.10.45",
    status: "online",
    heartbeat: "2s ago",
    camera: "Active",
    printer: "Ready",
  },
  {
    id: "f4b2c1d9-7a3e-4882-8e12-35928d1c7382",
    deviceCode: "KIOSK-EAST-02",
    name: "East Wing Security Gate",
    building: "Tower B (R&D)",
    ipAddress: "192.168.10.46",
    status: "online",
    heartbeat: "5s ago",
    camera: "Active",
    printer: "Ready",
  },
  {
    id: "c8e2b7a1-3d9f-4112-9a34-46039e2d8493",
    deviceCode: "KIOSK-EXEC-03",
    name: "Executive Suite 14th Fl",
    building: "Tower A (Main HQ)",
    ipAddress: "192.168.10.48",
    status: "maintenance",
    heartbeat: "45m ago",
    camera: "Standby",
    printer: "Low Paper",
  },
];

export default function AdminFleetPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Kiosk Fleet & Terminal Hardware
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage physical AI virtual receptionist kiosks, telemetry, and building assignments.
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Register New Kiosk
        </Button>
      </div>

      {/* Fleet Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Terminals</CardTitle>
            <Monitor className="w-4 h-4 text-sky-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">3</div>
            <p className="text-xs text-slate-400 mt-1">2 Online • 1 Maintenance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Fleet Health</CardTitle>
            <Radio className="w-4 h-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-400">98.9%</div>
            <p className="text-xs text-slate-400 mt-1">Uptime past 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Active Tenant</CardTitle>
            <Cpu className="w-4 h-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">Horizon Global</div>
            <p className="text-xs text-purple-400 mt-1">Enterprise Dedicated Tier</p>
          </CardContent>
        </Card>
      </div>

      {/* Fleet Devices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registered Physical Kiosks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400 bg-slate-900/40">
                <tr>
                  <th className="px-4 py-3">Device Code</th>
                  <th className="px-4 py-3">Terminal Name</th>
                  <th className="px-4 py-3">Building / Location</th>
                  <th className="px-4 py-3">IP Address</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Last Heartbeat</th>
                  <th className="px-4 py-3">Peripherals</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                {MOCK_KIOSKS.map((kiosk) => (
                  <tr key={kiosk.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-sky-400">
                      {kiosk.deviceCode}
                    </td>
                    <td className="px-4 py-3.5 font-sans font-medium text-white">
                      {kiosk.name}
                    </td>
                    <td className="px-4 py-3.5 font-sans text-slate-300">{kiosk.building}</td>
                    <td className="px-4 py-3.5 text-slate-400">{kiosk.ipAddress}</td>
                    <td className="px-4 py-3.5">
                      {kiosk.status === "online" ? (
                        <Badge variant="success">Online</Badge>
                      ) : (
                        <Badge variant="destructive">Maintenance</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-slate-400">{kiosk.heartbeat}</td>
                    <td className="px-4 py-3.5 font-sans text-slate-300 text-[11px]">
                      Cam: {kiosk.camera} | Print: {kiosk.printer}
                    </td>
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
