"use client";

import React, { useState } from "react";
import { Bell, LogOut, ChevronDown, ShieldCheck, UserCircle } from "lucide-react";
import { useSimulation, Persona } from "@/lib/SimulationContext";
import { useRouter } from "next/navigation";
import GlobalSearch from "./GlobalSearch";
import { Role, Province } from "@prisma/client";

export default function TopNav() {
  const { currentPersona, setPersona } = useSimulation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPersonaSwitcher, setShowPersonaSwitcher] = useState(false);
  const router = useRouter();

  const handleSignOut = () => {
    localStorage.removeItem("tshira_auth");
    localStorage.removeItem("demo_persona");
    router.push("/login");
  };

  const personas: Persona[] = [
    { id: "admin-1", name: "Admin Officer", role: Role.ADMIN_OFFICER, province: null },
    { id: "coord-lim", name: "Limpopo Coordinator", role: Role.PROVINCIAL_COORDINATOR, province: Province.LIMPOPO },
    { id: "dco-mpu", name: "Mpumalanga DCO", role: Role.DATA_COLLECTION_OFFICER, province: Province.MPUMALANGA },
    { id: "cons-gau", name: "Gauteng Consultant", role: Role.BUSINESS_CONSULTANT, province: Province.GAUTENG },
    { id: "rev-1", name: "Senior Reviewer", role: Role.REVIEWER, province: null },
    { id: "fin-1", name: "Finance Manager", role: Role.FINANCE, province: null },
  ];

  const notifications = [
    { id: 1, title: "New Case Assigned", message: "You have been assigned to NYDA-2024-001", time: "2m ago", unread: true },
    { id: 2, title: "Document Returned", message: "Business Plan was returned for correction", time: "1h ago", unread: true },
    { id: 3, title: "SLA Warning", message: "A case is approaching its SLA deadline", time: "3h ago", unread: false },
  ];

  return (
    <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between gap-4">
      <div className="flex-1 max-w-lg">
        <GlobalSearch />
      </div>

      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-zinc-900" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-4 w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[24px] shadow-2xl p-6 z-50 animate-in slide-in-from-top-2">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-sm font-bold">Notifications</h4>
                <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Mark all read</button>
              </div>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {notifications.map(n => (
                  <div key={n.id} className="flex gap-4 group cursor-pointer">
                    <div className={`w-2 h-2 mt-2 rounded-full shrink-0 ${n.unread ? "bg-blue-500" : "bg-transparent"}`} />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-zinc-900 dark:text-zinc-50 group-hover:text-blue-600 transition-colors">{n.title}</p>
                      <p className="text-[11px] text-zinc-500 leading-relaxed">{n.message}</p>
                      <p className="text-[10px] text-zinc-400 font-medium">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-xs font-bold text-zinc-400 hover:text-zinc-600 transition-colors text-center">
                View All Activity
              </button>
            </div>
          )}
        </div>

        {/* User Profile / Persona Switcher */}
        <div className="flex items-center gap-3 pl-4 border-l border-zinc-100 dark:border-zinc-800 relative">
          <button 
            onClick={() => setShowPersonaSwitcher(!showPersonaSwitcher)}
            className="text-right hidden sm:block hover:bg-zinc-50 dark:hover:bg-zinc-800 p-2 rounded-xl transition-all"
          >
            <div className="flex items-center gap-2">
              <div>
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{currentPersona?.name || "Loading..."}</p>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{currentPersona?.role?.replace(/_/g, ' ')}</p>
              </div>
              <ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform ${showPersonaSwitcher ? 'rotate-180' : ''}`} />
            </div>
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
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20 text-sm">
            {currentPersona?.name?.charAt(0) || "?"}
          </div>
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
