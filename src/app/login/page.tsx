"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Lock, Mail, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { useSimulation } from "@/lib/SimulationContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { setPersona } = useSimulation();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (res.ok) {
          const user = await res.json();
          const persona = {
            id: user.id,
            name: user.name || user.email,
            role: user.role,
            province: user.province || null,
          };
          localStorage.setItem("tshira_auth", JSON.stringify(persona));
          setPersona(persona);
          router.push("/");
        }
      } catch {
        // Stay on login.
      }
    };
    void checkSession();
  }, [router, setPersona]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const user = await res.json();
        const persona = {
          id: user.id,
          name: user.name || user.email,
          role: user.role,
          province: user.province || null,
        };

        localStorage.setItem("tshira_auth", JSON.stringify(persona));
        setPersona(persona);

        setTimeout(() => router.push("/"), 600);
      } else {
        const err = await res.json();
        setError(err.error || "Invalid email or password. Please try again.");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setTimeout(() => setIsLoading(false), 800);
    }
  };

  return (
    <div className="min-h-screen w-full bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-[440px] relative">
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 mb-6 animate-in fade-in zoom-in duration-700">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Tshira Logo" className="w-full h-full object-contain drop-shadow-xl" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Tshira Emporium</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-center font-medium">
            Workflow Management System
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-10 border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none animate-in fade-in slide-in-from-bottom-8 duration-700">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 p-4 rounded-2xl text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@tshira.co.za"
                  className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none text-zinc-900 dark:text-zinc-50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Password</label>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none text-zinc-900 dark:text-zinc-50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-4 font-bold shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-70"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-zinc-100 dark:border-zinc-800 text-center">
            <p className="text-sm text-zinc-500">
              Need access? <button className="font-bold text-blue-600 hover:text-blue-500">Contact IT Support</button>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-zinc-400 mt-12 font-medium">
          © 2026 Tshira Management Systems. All rights reserved.
        </p>
      </div>
    </div>
  );
}
