"use client";

import { FileText } from "lucide-react";

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()}
      className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all group shadow-lg shadow-zinc-800/20"
    >
      <FileText className="w-4 h-4 text-zinc-400 group-hover:text-white" />
      Export Dossier
    </button>
  );
}
