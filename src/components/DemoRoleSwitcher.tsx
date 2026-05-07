"use client";

import { useState } from "react";
import { UserCircle, ChevronDown, ShieldCheck } from "lucide-react";
import { Role, Province } from "@prisma/client";
import { useSimulation, Persona } from "@/lib/SimulationContext";

export default function DemoRoleSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentPersona, setPersona } = useSimulation();

    const personas: Persona[] = [
      { id: "admin-1", name: "Admin Officer", role: Role.ADMIN_OFFICER, province: null },
      { id: "coord-lim", name: "Limpopo Coordinator", role: Role.PROVINCIAL_COORDINATOR, province: Province.LIMPOPO },
      { id: "dco-mpu", name: "Mpumalanga DCO", role: Role.DATA_COLLECTION_OFFICER, province: Province.MPUMALANGA },
      { id: "cons-gau", name: "Gauteng Consultant", role: Role.BUSINESS_CONSULTANT, province: Province.GAUTENG },
      { id: "rev-1", name: "Senior Reviewer", role: Role.REVIEWER, province: null },
      { id: "fin-1", name: "Finance Manager", role: Role.FINANCE, province: null },
    ];

  if (!currentPersona) return null;

  return (
    <div className="fixed top-6 right-8 z-[100]">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 pl-2 pr-4 py-2 rounded-2xl shadow-xl hover:shadow-2xl transition-all"
      >
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl flex items-center justify-center">
          <UserCircle className="w-6 h-6" />
        </div>
        <div className="text-left">
          <p className="text-[10px] font-black uppercase tracking-tighter text-blue-600">Simulating Identity</p>
          <p className="text-xs font-bold text-zinc-900 dark:text-zinc-50">{currentPersona.name}</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-72 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Select Persona</p>
          </div>
          <div className="p-2">
            {personas.map((persona) => (
              <button
                key={persona.name}
                onClick={() => {
                  setPersona(persona);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all ${
                  currentPersona.name === persona.name 
                    ? "bg-blue-50 dark:bg-blue-900/20" 
                    : "hover:bg-zinc-50 dark:hover:bg-zinc-800"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  currentPersona.name === persona.name ? "bg-blue-500 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                }`}>
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{persona.name}</p>
                  <p className="text-[10px] text-zinc-500 font-medium">
                    {persona.role.replace(/_/g, ' ')} {persona.province ? `• ${persona.province}` : ''}
                  </p>
                </div>
              </button>
            ))}
          </div>
          <div className="p-4 border-t border-zinc-100 dark:border-zinc-800">
            <p className="text-[10px] text-zinc-400 italic text-center leading-tight">
              Switching identities will adjust available actions and visibility across the system.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
