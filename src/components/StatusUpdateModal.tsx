"use client";

import { useState } from "react";
import { X, ChevronRight } from "lucide-react";
import { CaseStatus, Role } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useSimulation } from "@/lib/SimulationContext";

export default function StatusUpdateModal({ 
  caseId, 
  currentStatus,
  province
}: { 
  caseId: string; 
  currentStatus: CaseStatus;
  province: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { currentPersona } = useSimulation();

  const statuses: CaseStatus[] = [
    "RECEIVED_FROM_NYDA", "ASSIGNED_TO_PROVINCE", "ASSIGNED_FOR_DATA_COLLECTION", 
    "DATA_COLLECTION_IN_PROGRESS", "DATA_SUBMITTED", "PROVINCIAL_QUALITY_CHECK",
    "RETURNED_FOR_DATA_CORRECTION", "SUBMITTED_TO_HEAD_OFFICE", "ASSIGNED_TO_CONSULTANT",
    "DOCUMENT_IN_PROGRESS", "SUBMITTED_FOR_REVIEW", "RETURNED_TO_CONSULTANT",
    "INTERNALLY_REVIEWED", "SENT_TO_NYDA", "CLIENT_APPROVED", "READY_FOR_INVOICING",
    "INVOICED", "PAID", "CLOSED"
  ];

  const handleUpdate = async (newStatus: CaseStatus) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/cases/${caseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: newStatus,
          userId: currentPersona?.id 
        }),
      });
      if (res.ok) {
        setIsOpen(false);
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAllowed = (status: CaseStatus) => {
    if (!currentPersona) return false;
    const role = currentPersona.role;
    
    // Admin can move to any stage
    if (role === Role.ADMIN_OFFICER) return true;

    // Provincial Coordinator can move to provincial stages
    if (role === Role.PROVINCIAL_COORDINATOR && currentPersona.province === province) {
      return ["ASSIGNED_FOR_DATA_COLLECTION", "PROVINCIAL_QUALITY_CHECK", "SUBMITTED_TO_HEAD_OFFICE", "RETURNED_FOR_DATA_CORRECTION"].includes(status);
    }

    // DCO can move to data submitted
    if (role === Role.DATA_COLLECTION_OFFICER && currentPersona.province === province) {
      return ["DATA_COLLECTION_IN_PROGRESS", "DATA_SUBMITTED"].includes(status);
    }

    // Consultant can move to document in progress or review
    if (role === Role.BUSINESS_CONSULTANT) {
      return ["DOCUMENT_IN_PROGRESS", "SUBMITTED_FOR_REVIEW"].includes(status);
    }

    // Reviewer can move to reviewed or returned
    if (role === Role.REVIEWER) {
      return ["INTERNALLY_REVIEWED", "RETURNED_TO_CONSULTANT"].includes(status);
    }

    // Finance can move to invoiced, paid, closed
    if (role === Role.FINANCE) {
      return ["READY_FOR_INVOICING", "INVOICED", "PAID", "CLOSED"].includes(status);
    }

    return false;
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
      >
        <ChevronRight className="w-4 h-4" />
        Update Progress
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200">
        <div className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/50">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Advance Workflow</h2>
            <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest font-bold">Current: {currentStatus.replace(/_/g, ' ')}</p>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>
        
        <div className="p-8 max-h-[60vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-3">
          {statuses.map((status) => {
            const isCurrent = status === currentStatus;
            const allowed = isAllowed(status);
            
            return (
              <button
                key={status}
                disabled={isSubmitting || isCurrent || !allowed}
                onClick={() => handleUpdate(status)}
                className={`p-4 rounded-2xl text-left border transition-all flex items-center justify-between group ${
                  isCurrent 
                    ? "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/30 cursor-default" 
                    : allowed
                    ? "border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-blue-400"
                    : "border-zinc-100 dark:border-zinc-800 opacity-40 cursor-not-allowed grayscale"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isCurrent ? "text-blue-600" : allowed ? "text-zinc-400 group-hover:text-blue-500" : "text-zinc-300"}`}>
                    {isCurrent ? "Current Stage" : allowed ? "Available Action" : "Locked"}
                  </p>
                  <p className={`text-sm font-bold truncate ${isCurrent ? "text-blue-700 dark:text-blue-400" : "text-zinc-600 dark:text-zinc-400"}`}>
                    {status.replace(/_/g, ' ')}
                  </p>
                </div>
                {!isCurrent && allowed && <ChevronRight className={`w-4 h-4 text-zinc-300 group-hover:text-blue-500 transition-colors`} />}
              </button>
            );
          })}
        </div>

        <div className="p-8 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 flex justify-between items-center">
          <p className="text-xs text-zinc-500 italic">Available actions depend on your assigned role and province.</p>
          <button 
            onClick={() => setIsOpen(false)}
            className="px-6 py-3 text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
