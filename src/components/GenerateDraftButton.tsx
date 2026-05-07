"use client";

import { useState } from "react";
import { FileText, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSimulation } from "@/lib/SimulationContext";

export default function GenerateDraftButton({ caseId }: { caseId: string }) {
  const [loading, setLoading] = useState(false);
  const { currentPersona } = useSimulation();
  const router = useRouter();

  if (!currentPersona || !["ADMIN_OFFICER", "BUSINESS_CONSULTANT"].includes(currentPersona.role)) return null;

  const handleGenerate = async () => {
    if (!confirm("Generate an AI-powered Business Plan draft based on beneficiary details?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/generate-draft`, { method: "POST" });
      if (res.ok) {
        alert("Draft generated successfully! View it in the Documents tab.");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleGenerate}
      disabled={loading}
      className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all group shadow-sm"
    >
      {loading ? <Clock className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4 text-blue-500" />}
      {loading ? "Generating..." : "Generate AI Draft"}
    </button>
  );
}
