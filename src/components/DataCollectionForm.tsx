"use client";

import { useState } from "react";
import { Save, ClipboardCheck, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSimulation } from "@/lib/SimulationContext";
import { Role, CaseStatus } from "@prisma/client";

export default function DataCollectionForm({ 
  caseId, 
  currentStatus, 
  initialData 
}: { 
  caseId: string; 
  currentStatus: CaseStatus;
  initialData?: string | null;
}) {
  const [data, setData] = useState(initialData || "");
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const { currentPersona } = useSimulation();

  const canEdit = currentPersona?.role === Role.DATA_COLLECTION_OFFICER || currentPersona?.role === Role.ADMIN_OFFICER;
  const isCorrectStage = ["ASSIGNED_FOR_DATA_COLLECTION", "DATA_COLLECTION_IN_PROGRESS", "RETURNED_FOR_DATA_CORRECTION"].includes(currentStatus);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/cases/${caseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          beneficiaryDetails: data,
          status: currentStatus === "ASSIGNED_FOR_DATA_COLLECTION" ? "DATA_COLLECTION_IN_PROGRESS" : currentStatus
        }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!canEdit && !data) return null;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5 text-emerald-500" />
          Fieldwork Data Collection
        </h3>
        {canEdit && isCorrectStage && (
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Progress
          </button>
        )}
      </div>

      <div className="space-y-4">
        <p className="text-sm text-zinc-500">Capture client details, site visit notes, and beneficiary information here.</p>
        <textarea 
          value={data}
          onChange={(e) => setData(e.target.value)}
          disabled={!canEdit || !isCorrectStage}
          placeholder="Start typing fieldwork notes..."
          className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-6 text-sm min-h-[200px] focus:ring-2 focus:ring-emerald-500 outline-none transition-all disabled:bg-zinc-50/50"
        />
      </div>

      {!isCorrectStage && data && (
        <p className="text-[10px] text-zinc-400 mt-4 uppercase font-bold tracking-widest italic text-right">
          Read-only: Work has moved past the data collection stage.
        </p>
      )}
    </div>
  );
}
