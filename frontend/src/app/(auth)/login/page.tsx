"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Cpu, ShieldCheck, ArrowRight, Lock, Mail, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Client-side validation
    if (!email || !password) {
      setErrorMessage("Please enter both your corporate email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrorMessage(
          errorData.detail || "Authentication failed. Please verify your credentials."
        );
        setLoading(false);
        return;
      }

      const tokenData = await response.json();
      if (typeof window !== "undefined") {
        localStorage.setItem("access_token", tokenData.access_token);
        localStorage.setItem("refresh_token", tokenData.refresh_token);
      }

      // Redirect to enterprise dashboard
      window.location.href = "/dashboard";
    } catch (err: unknown) {
      // If backend is not currently running or network issue, provide descriptive fallback
      setErrorMessage(
        "Unable to connect to authentication server. For development preview, verify FastAPI backend on port 8000."
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-sky-500 mx-auto flex items-center justify-center shadow-xl shadow-sky-500/30">
            <Cpu className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Enterprise Sign In
          </h2>
          <p className="text-sm text-slate-400">
            Access the AI Receptionist Fleet & Visitor Portal
          </p>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2 font-semibold">
                Corporate Email
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-500 absolute left-4 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@enterprise.ai"
                  className="w-full h-12 pl-12 pr-4 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 mb-2 font-semibold">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-500 absolute left-4 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-12 pl-12 pr-4 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 text-sm"
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-12 mt-2">
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying Credentials...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In to Console
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="pt-4 border-t border-slate-800/80 text-center">
            <Link
              href="/"
              className="text-xs text-slate-400 hover:text-sky-400 transition-colors"
            >
              &larr; Back to Portal Homepage
            </Link>
          </div>
        </div>

        {/* Security Notice */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Secured with Multi-Tenant RBAC & TLS 1.3</span>
        </div>
      </div>
    </div>
  );
}
