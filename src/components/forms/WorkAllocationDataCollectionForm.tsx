"use client";

import React, { useState } from "react";
import { ClipboardList, Save, Loader2, User, Calendar } from "lucide-react";
import { useSimulation } from "@/lib/SimulationContext";
import { buildCapturedClientFields } from "@/lib/captured-client-data";
import CapturedClientFields from "./CapturedClientFields";

interface WorkAllocationDataCollectionFormProps {
  caseId: string;
  initialData?: any;
  clientData?: any;
  caseData?: any;
  onSave?: () => void;
}

export default function WorkAllocationDataCollectionForm({ caseId, initialData, clientData, caseData, onSave }: WorkAllocationDataCollectionFormProps) {
  const { currentPersona } = useSimulation();
  const captured = buildCapturedClientFields(caseData, clientData);
  const [data, setData] = useState<any>({
    date: new Date().toISOString().split("T")[0],
    coordinatorName: caseData?.coordinator?.name || "",
    officerName: caseData?.dco?.name || "",
    ...captured,
    ...initialData,
  });
  const [isSaving, setIsSaving] = useState(false);

  const updateField = (field: string, value: string) => {
    setData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/forms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formType: "WORK_ALLOCATION_DATA_COLLECTION",
          data,
          submittedBy: currentPersona?.name,
        }),
      });
      if (res.ok && onSave) onSave();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
      <div className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/50">
        <div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-green-500" />
            Work Allocation
          </h3>
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">Provincial Coordinator to Data Collection Officer</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Allocation
        </button>
      </div>

      <div className="p-8 space-y-6">
        <CapturedClientFields data={captured} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <FormField label="Date" value={data.date} onChange={(v: string) => updateField("date", v)} icon={<Calendar />} type="date" />
          <FormField label="Name of Provincial Coordinator" value={data.coordinatorName} onChange={(v: string) => updateField("coordinatorName", v)} icon={<User />} />
          <div className="md:col-span-2">
            <FormField label="Name of Data Collection Officer" value={data.officerName} onChange={(v: string) => updateField("officerName", v)} icon={<User />} />
          </div>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, value, onChange, icon, type = "text" }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{label}</label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400">
          {React.cloneElement(icon, { className: "w-full h-full" })}
        </div>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
        />
      </div>
    </div>
  );
}
