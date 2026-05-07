"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, FileText, Receipt, X, Save, Mail } from "lucide-react";
import { CaseStatus, Role } from "@prisma/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSimulation } from "@/lib/SimulationContext";

export default function FinanceActions({ 
  caseId, 
  status 
}: { 
  caseId: string; 
  status: CaseStatus;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [invoiceDetails, setInvoiceDetails] = useState({
    invoiceNumber: "",
    actualCost: ""
  });
  
  const router = useRouter();
  const { currentPersona } = useSimulation();

  const handleUpdate = async (newStatus: CaseStatus, extraData: any = {}) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/cases/${caseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: newStatus,
          comments: `Finance update: Moved to ${newStatus}`,
          ...extraData
        }),
      });
      if (res.ok) {
        setShowInvoiceForm(false);
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
    <div className="flex justify-end gap-2 relative">
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

      {(status === "CLIENT_APPROVED" || status === "READY_FOR_INVOICING") && !showInvoiceForm && (
        <button 
          onClick={() => setShowInvoiceForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
        >
          <Receipt className="w-4 h-4" />
          Generate Invoice
        </button>
      )}

      {showInvoiceForm && (
        <div className="absolute right-0 bottom-full mb-2 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-4 z-50 animate-in slide-in-from-bottom-2">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400">Invoice Details</h4>
            <button onClick={() => setShowInvoiceForm(false)} className="p-1 hover:bg-zinc-100 rounded-full">
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            <input 
              placeholder="Invoice Number" 
              value={invoiceDetails.invoiceNumber}
              onChange={(e) => setInvoiceDetails({...invoiceDetails, invoiceNumber: e.target.value})}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-3 py-2 text-xs"
            />
            <input 
              type="number"
              placeholder="Amount (ZAR)" 
              value={invoiceDetails.actualCost}
              onChange={(e) => setInvoiceDetails({...invoiceDetails, actualCost: e.target.value})}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-3 py-2 text-xs"
            />
            <button 
              onClick={() => handleUpdate(CaseStatus.INVOICED, { 
                invoiceNumber: invoiceDetails.invoiceNumber, 
                actualCost: parseFloat(invoiceDetails.actualCost),
                invoiceDate: new Date()
              })}
              className="w-full bg-blue-600 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-2"
            >
              <Save className="w-3 h-3" />
              Finalize Invoice
            </button>
          </div>
        </div>
      )}

      {status === "INVOICED" && (
        <div className="flex gap-2">
          <Link 
            href={`/finance/invoice/${caseId}`}
            target="_blank"
            className="text-xs font-bold text-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 border border-zinc-200 dark:border-zinc-700"
          >
            Print
            <FileText className="w-3 h-3" />
          </Link>
          <button 
            onClick={() => handleUpdate(CaseStatus.INVOICED, { comments: "Invoice emailed to client" })}
            className="text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 border border-blue-100 dark:border-blue-900/30"
          >
            Email
            <Mail className="w-3 h-3" />
          </button>
          <button 
            onClick={() => handleUpdate(CaseStatus.PAID)}
            disabled={isSubmitting}
            className="text-xs font-bold text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1"
          >
            Confirm Payment
            <CheckCircle2 className="w-3 h-3" />
          </button>
        </div>
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
