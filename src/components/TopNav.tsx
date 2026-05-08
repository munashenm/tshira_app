"use client";

import React, { useState } from "react";
import { Bell, LogOut, ChevronDown, ShieldCheck, Menu } from "lucide-react";
import { useSimulation, Persona } from "@/lib/SimulationContext";
import { useRouter } from "next/navigation";
import GlobalSearch from "./GlobalSearch";
import { Role, Province } from "@prisma/client";
import NotificationCenter from "./NotificationCenter";

interface TopNavProps {
  onMenuClick: () => void;
}

export default function TopNav({ onMenuClick }: TopNavProps) {
  const { currentPersona, setPersona } = useSimulation();
  const [showPersonaSwitcher, setShowPersonaSwitcher] = useState(false);
  const router = useRouter();

  const handleSignOut = () => {
    fetch("/api/auth/logout", { method: "POST" }).finally(() => {
      localStorage.removeItem("tshira_auth");
      localStorage.removeItem("demo_persona");
      router.push("/login");
    });
  };

  const personas: Persona[] = [
    { id: "admin-1", name: "Admin Officer", role: Role.ADMIN_OFFICER, province: null },
    { id: "coord-lim", name: "Limpopo Coordinator", role: Role.PROVINCIAL_COORDINATOR, province: Province.LIMPOPO },
    { id: "dco-mpu", name: "Mpumalanga DCO", role: Role.DATA_COLLECTION_OFFICER, province: Province.MPUMALANGA },
    { id: "cons-gau", name: "Gauteng Consultant", role: Role.BUSINESS_CONSULTANT, province: Province.GAUTENG },
    { id: "rev-1", name: "Senior Reviewer", role: Role.REVIEWER, province: null },
    { id: "fin-1", name: "Finance Manager", role: Role.FINANCE, province: null },
    { id: "nyda-1", name: "NYDA Oversight", role: Role.NYDA, province: null },
  ];

  return (
    <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-6 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex-1 max-w-lg">
          <GlobalSearch />
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-4">
        {/* Notification Bell */}
        <NotificationCenter />

        {/* User Profile / Persona Switcher */}
        <div className="flex items-center gap-2 lg:gap-3 pl-2 lg:pl-4 border-l border-zinc-100 dark:border-zinc-800 relative">
          <button 
            onClick={() => setShowPersonaSwitcher(!showPersonaSwitcher)}
            className="flex items-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 p-1 sm:p-2 rounded-xl transition-all"
          >
            <div className="text-right hidden lg:block">
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{currentPersona?.name || "Loading..."}</p>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{currentPersona?.role?.replace(/_/g, ' ')}</p>
            </div>
            <div className="w-8 h-8 lg:w-9 lg:h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20 text-sm shrink-0">
              {currentPersona?.name?.charAt(0) || "?"}
            </div>
            <ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform hidden sm:block ${showPersonaSwitcher ? 'rotate-180' : ''}`} />
          </button>

          {showPersonaSwitcher && (
            <div className="absolute top-full mt-4 right-0 w-72 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[24px] shadow-2xl p-2 z-50 animate-in slide-in-from-top-2">
              <div className="p-3 border-b border-zinc-100 dark:border-zinc-800">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Select Persona</p>
              </div>
              <div className="space-y-1 mt-1">
                {personas.map((persona) => (
                  <button
                    key={persona.id}
                    onClick={() => {
                      setPersona(persona);
                      setShowPersonaSwitcher(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                      currentPersona?.id === persona.id 
                        ? "bg-blue-50 dark:bg-blue-900/20" 
                        : "hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      currentPersona?.id === persona.id ? "bg-blue-500 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                    }`}>
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{persona.name}</p>
                      <p className="text-[10px] text-zinc-500 font-medium">
                        {persona.role.replace(/_/g, ' ')}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          <button
            onClick={handleSignOut}
            title="Sign Out"
            className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
