"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Loader2, Info } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AssignmentResponseBanner({ caseId }: { caseId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAction = async (accept: boolean) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/cases/${caseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acceptAssignment: accept })
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to process assignment action.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 sm:p-6 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in slide-in-from-top-4">
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
        <div>
          <h3 className="text-sm font-bold text-amber-900 dark:text-amber-50">Pending Assignment</h3>
          <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">You have been allocated to this work item. Please accept or decline to proceed.</p>
        </div>
      </div>
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <button 
          onClick={() => handleAction(false)}
          disabled={loading}
          className="flex-1 sm:flex-none px-4 py-2 bg-white dark:bg-zinc-900 text-red-600 text-xs font-bold uppercase tracking-widest rounded-lg border border-red-200 dark:border-red-900/30 hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
        >
          <XCircle className="w-4 h-4" /> Decline
        </button>
        <button 
          onClick={() => handleAction(true)}
          disabled={loading}
          className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          Accept Work
        </button>
      </div>
    </div>
  );
}
