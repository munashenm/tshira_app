"use client";

import React, { useState } from "react";
import { ClipboardList, ChevronDown } from "lucide-react";
import WorkAllocationForm from "./WorkAllocationForm";
import WorkAllocationConsultantForm from "./WorkAllocationConsultantForm";
import WorkAllocationDataCollectionForm from "./WorkAllocationDataCollectionForm";

interface WorkAllocationManagerProps {
  caseId: string;
  caseData: any;
  clientData: any;
  formResponses: any[];
}

export default function WorkAllocationManager({ caseId, caseData, clientData, formResponses }: WorkAllocationManagerProps) {
  const [selectedForm, setSelectedForm] = useState("ADMIN_TO_COORD");

  const forms = [
    { id: "ADMIN_TO_COORD", label: "Work Allocation (Admin to Provincial Coordinator)" },
    { id: "ADMIN_TO_CONSULTANT", label: "Work Allocation (Admin to Business Consultants)" },
    { id: "COORD_TO_DATA", label: "Work Allocation (Provincial Coordinator to Data Collection Officer)" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-500" />
            Select Allocation Form
          </h3>
          <p className="text-xs text-zinc-500 mt-1">Choose the appropriate work allocation document to complete.</p>
        </div>
        
        <div className="relative min-w-[280px]">
          <select 
            value={selectedForm}
            onChange={(e) => setSelectedForm(e.target.value)}
            className="w-full appearance-none bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-4 pr-10 py-3 text-sm font-bold text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
          >
            {forms.map(f => (
              <option key={f.id} value={f.id}>{f.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 pointer-events-none" />
        </div>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        {selectedForm === "ADMIN_TO_COORD" && (
          <WorkAllocationForm 
            caseId={caseId}
            caseData={caseData}
            clientData={clientData}
            initialData={formResponses.find(r => r.formType === "WORK_ALLOCATION_ADMIN_TO_COORD")?.data || formResponses.find(r => r.formType === "WORK_ALLOCATION")?.data}
          />
        )}
        
        {selectedForm === "ADMIN_TO_CONSULTANT" && (
          <WorkAllocationConsultantForm 
            caseId={caseId}
            caseData={caseData}
            clientData={clientData}
            initialData={formResponses.find(r => r.formType === "WORK_ALLOCATION_CONSULTANT")?.data}
          />
        )}

        {selectedForm === "COORD_TO_DATA" && (
          <WorkAllocationDataCollectionForm 
            caseId={caseId}
            caseData={caseData}
            clientData={clientData}
            initialData={formResponses.find(r => r.formType === "WORK_ALLOCATION_DATA_COLLECTION")?.data}
          />
        )}
      </div>
    </div>
  );
}
