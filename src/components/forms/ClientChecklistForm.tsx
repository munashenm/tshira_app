"use client";

import React, { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  Circle, 
  User, 
  Calendar, 
  FileCheck, 
  Save, 
  Loader2 
} from "lucide-react";
import { useSimulation } from "@/lib/SimulationContext";

interface ClientChecklistFormProps {
  caseId: string;
  initialData?: any;
  onSave?: () => void;
}

const DOCUMENTS = [
  "Certified ID copy",
  "Company registration certificate",
  "Tax clearance",
  "Fica document for the business",
  "Fica document for the client",
  "3 comparable quotations",
  "Financial statement/ management account"
];

export default function ClientChecklistForm({ caseId, initialData, onSave }: ClientChecklistFormProps) {
  const [data, setData] = useState<any>(initialData || {});
  const [isSaving, setIsSaving] = useState(false);
  const { currentPersona } = useSimulation();

  const updateItem = (docName: string, field: string, value: string) => {
    setData((prev: any) => ({
      ...prev,
      [docName]: {
        ...(prev[docName] || {}),
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/forms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formType: "CLIENT_DOCUMENT_CHECKLIST",
          data,
          submittedBy: currentPersona?.name
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
    <div className="space-y-6">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/50">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-500" />
              Compliance Checklist
            </h3>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">Verification of Required Documents</p>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Status
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50/50 dark:bg-zinc-800/30 text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest">Document Name</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest">Date Received</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest">Received By</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {DOCUMENTS.map((doc) => {
                const item = data[doc] || {};
                const isComplete = item.date && item.receivedBy;

                return (
                  <tr key={doc} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{doc}</p>
                    </td>
                    <td className="px-8 py-5">
                      <div className="relative w-40">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                        <input 
                          type="date"
                          value={item.date || ""}
                          onChange={(e) => updateItem(doc, "date", e.target.value)}
                          className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="relative w-48">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                        <input 
                          type="text"
                          value={item.receivedBy || ""}
                          onChange={(e) => updateItem(doc, "receivedBy", e.target.value)}
                          placeholder="Staff Name"
                          className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      {isComplete ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Received
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 text-[10px] font-black uppercase rounded-full">
                          <Circle className="w-3 h-3" /> Pending
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
