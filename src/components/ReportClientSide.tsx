"use client";

import React from "react";
import { Printer } from "lucide-react";

export function PrintReportButton({ label = "Print Report" }: { label?: string }) {
  return (
    <button 
      onClick={() => window.print()}
      className="flex items-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-zinc-900/20 active:scale-95 transition-all print:hidden"
    >
      <Printer className="w-4 h-4" />
      {label}
    </button>
  );
}

export function ReportUserSelector({ users, placeholder, paramName }: { users: any[], placeholder: string, paramName: string }) {
  return (
    <select 
      onChange={(e) => {
        const val = e.target.value;
        const url = new URL(window.location.href);
        if (val) url.searchParams.set(paramName, val);
        else url.searchParams.delete(paramName);
        window.location.href = url.toString();
      }}
      className="bg-zinc-100 border-none rounded-lg px-3 py-1 text-xs focus:ring-0 print:hidden"
    >
      <option value="">{placeholder}</option>
      {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
    </select>
  );
}
