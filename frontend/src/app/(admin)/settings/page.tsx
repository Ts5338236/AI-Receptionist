"use client";

import React, { useState } from "react";
import { Settings, Shield, Bell, Key, Globe, Database, Save, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [tenantName, setTenantName] = useState("Horizon Technologies Inc.");
  const [timezone, setTimezone] = useState("America/New_York");
  const [requireBadge, setRequireBadge] = useState(true);
  const [voiceGreeting, setVoiceGreeting] = useState(
    "Welcome to Horizon Technologies. Please tap an option or speak to check in."
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Enterprise Settings & Policies
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure tenant branding, kiosk operational parameters, and access controls.
          </p>
        </div>
        {saved && (
          <Badge variant="success" className="px-3 py-1 flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Settings Saved Successfully
          </Badge>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Organization Branding & General */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-sky-400" />
              <CardTitle>Organization Profile</CardTitle>
            </div>
            <CardDescription>
              Basic organizational identity displayed on physical kiosks and visitor badges.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2 font-semibold">
                  Tenant Organization Name
                </label>
                <input
                  type="text"
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2 font-semibold">
                  Default Timezone
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-500"
                >
                  <option value="America/New_York">Eastern Time (US & Canada)</option>
                  <option value="America/Chicago">Central Time (US & Canada)</option>
                  <option value="America/Denver">Mountain Time (US & Canada)</option>
                  <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                  <option value="UTC">UTC Universal</option>
                  <option value="Europe/London">London / GMT</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Kiosk Voice & Welcome Experience */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-400" />
              <CardTitle>Virtual Receptionist Experience</CardTitle>
            </div>
            <CardDescription>
              Define the AI avatar greeting phrasing and touchscreen arrival interaction rules.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2 font-semibold">
                Default Voice Greeting Phrasing
              </label>
              <textarea
                rows={3}
                value={voiceGreeting}
                onChange={(e) => setVoiceGreeting(e.target.value)}
                className="w-full p-4 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/40 border border-slate-800">
              <div>
                <span className="block font-medium text-white text-sm">
                  Require Physical Thermal Badge Printing
                </span>
                <span className="block text-xs text-slate-400">
                  When enabled, kiosks automatically signal connected badge printers on check-in.
                </span>
              </div>
              <input
                type="checkbox"
                checked={requireBadge}
                onChange={(e) => setRequireBadge(e.target.checked)}
                className="w-5 h-5 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Security & Access Keys */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              <CardTitle>Terminal API & Security Credentials</CardTitle>
            </div>
            <CardDescription>
              Manage hardware kiosk pairing keys and webhook dispatch endpoints.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="block text-xs uppercase tracking-wider text-slate-400 font-semibold">
                  Kiosk Fleet Enrollment Key
                </span>
                <span className="block font-mono text-sm text-slate-200 mt-1">
                  kiosk_live_enroll_99a8b7c6d5e4f3a2b1
                </span>
              </div>
              <Button type="button" variant="outline" size="sm">
                Rotate Key
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button type="submit" className="flex items-center gap-2 px-8">
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
