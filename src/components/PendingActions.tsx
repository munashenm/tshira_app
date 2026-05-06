"use client";

import React from "react";
import { useSimulation } from "@/lib/SimulationContext";
import { AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function PendingActions({ counts }: { counts: Record<string, number> }) {
  const { currentPersona } = useSimulation();
  
  if (!currentPersona) return null;

  const role = currentPersona.role;
  const count = counts[role] || 0;

  if (count === 0) {
    return (
      <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-3xl p-6 flex items-center gap-4">
        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-bold text-emerald-800 dark:text-emerald-400">You're all caught up!</p>
          <p className="text-xs text-emerald-600/70 dark:text-emerald-500/50 font-medium">No pending actions for your role at the moment.</p>
        </div>
      </div>
    );
  }

  const roleLabels: Record<string, string> = {
    ADMIN_OFFICER: "Work Items awaiting allocation",
    PROVINCIAL_COORDINATOR: "Tasks needing provincial review or assignment",
    DATA_COLLECTION_OFFICER: "Cases awaiting fieldwork data collection",
    BUSINESS_CONSULTANT: "Documents in development or returned for correction",
    REVIEWER: "Documents awaiting quality assurance review",
    FINANCE: "Approved items ready for invoicing"
  };

  return (
    <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group">
      {/* Decorative circle */}
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />
      
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/30">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <p className="text-blue-100 text-xs font-bold uppercase tracking-[0.2em] mb-1">Action Required</p>
            <p className="text-2xl font-bold">{count} {roleLabels[role] || "Tasks pending your action"}</p>
          </div>
        </div>
        
        <Link 
          href="/cases" 
          className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors shadow-lg shadow-black/10 active:scale-95"
        >
          View Tasks
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
