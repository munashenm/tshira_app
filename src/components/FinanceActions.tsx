"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, FileText, Receipt } from "lucide-react";
import { CaseStatus, Role } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useSimulation } from "@/lib/SimulationContext";

export default function FinanceActions({ 
  caseId, 
  status 
}: { 
  caseId: string; 
  status: CaseStatus;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { currentPersona } = useSimulation();

  const handleUpdate = async (newStatus: CaseStatus) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/cases/${caseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: newStatus,
          comments: `Finance update: Moved to ${newStatus}`
        }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFinance = currentPersona?.role === Role.FINANCE || currentPersona?.role === Role.ADMIN_OFFICER;

  if (!isFinance) return null;

  return (
    <div className="flex justify-end gap-2">
      {status === "CLIENT_APPROVED" && (
        <button 
          onClick={() => handleUpdate(CaseStatus.READY_FOR_INVOICING)}
          disabled={isSubmitting}
          className="text-xs font-bold text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1"
        >
          Mark Ready
          <ArrowRight className="w-3 h-3" />
        </button>
      )}
      {status === "READY_FOR_INVOICING" && (
        <button 
          onClick={() => handleUpdate(CaseStatus.INVOICED)}
          disabled={isSubmitting}
          className="text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1"
        >
          Generate Invoice
          <Receipt className="w-3 h-3" />
        </button>
      )}
      {status === "INVOICED" && (
        <button 
          onClick={() => handleUpdate(CaseStatus.PAID)}
          disabled={isSubmitting}
          className="text-xs font-bold text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1"
        >
          Confirm Payment
          <CheckCircle2 className="w-3 h-3" />
        </button>
      )}
      {status === "PAID" && (
        <button 
          onClick={() => handleUpdate(CaseStatus.CLOSED)}
          disabled={isSubmitting}
          className="text-xs font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1"
        >
          Close Case
          <FileText className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
