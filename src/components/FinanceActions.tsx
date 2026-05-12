"use client";

import { useState } from "react";
import { CheckCircle2, FileText, Receipt, X, Save, Mail, Printer, MessageCircle, Loader2 } from "lucide-react";
import { CaseStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getClientActor } from "@/lib/client-auth";

type DeliveryMethod = "email" | "whatsapp" | "print" | null;

export default function FinanceActions({
  caseId,
  status
}: {
  caseId: string;
  status: CaseStatus;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [generatingNumber, setGeneratingNumber] = useState(false);
  const [invoiceDetails, setInvoiceDetails] = useState({
    invoiceNumber: "",
    actualCost: ""
  });

  const router = useRouter();

  const handleUpdate = async (newStatus: CaseStatus, extraData: Record<string, unknown> = {}) => {
    setIsSubmitting(true);
    try {
      const actor = getClientActor();
      const res = await fetch(`/api/cases/${caseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          userId: actor?.id,
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

  const handleOpenInvoiceForm = async () => {
    setGeneratingNumber(true);
    try {
      const actor = getClientActor();
      const res = await fetch("/api/invoices/generate", {
        method: "POST",
        headers: actor?.id ? { "x-actor-id": actor.id } : undefined,
      });
      if (res.ok) {
        const { invoiceNumber } = await res.json();
        setInvoiceDetails(prev => ({ ...prev, invoiceNumber }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingNumber(false);
      setShowInvoiceForm(true);
    }
  };

  const handleDelivery = (method: DeliveryMethod) => {
    if (method === "print") {
      window.open(`/finance/invoice/${caseId}`, "_blank");
    } else if (method === "whatsapp") {
      window.open(`https://wa.me/?text=Please%20find%20your%20invoice%20at%3A%20${encodeURIComponent(window.location.origin)}/finance/invoice/${caseId}`, "_blank");
    } else if (method === "email") {
      handleUpdate(CaseStatus.INVOICED, { comments: "Invoice sent via email" });
    }
  };

  return (
    <div className="flex justify-end gap-2 relative">
      {/* Generate Invoice — only for completed/approved cases */}
      {(status === "CLIENT_APPROVED" || status === "READY_FOR_INVOICING") && !showInvoiceForm && (
        <button
          onClick={handleOpenInvoiceForm}
          disabled={generatingNumber}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-60 cursor-pointer"
        >
          {generatingNumber ? <Loader2 className="w-4 h-4 animate-spin" /> : <Receipt className="w-4 h-4" />}
          {generatingNumber ? "Generating..." : "Generate Invoice"}
        </button>
      )}

      {/* Helper indicator if case is not completed/approved and not yet invoiced/paid */}
      {(!["CLIENT_APPROVED", "READY_FOR_INVOICING", "INVOICED", "PAID", "CLOSED"].includes(status)) && (
        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800/60 px-3 py-1.5 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50">
          Work In Progress
        </span>
      )}

      {/* Invoice form with auto-generated number */}
      {showInvoiceForm && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-[9998]" 
            onClick={() => setShowInvoiceForm(false)} 
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl p-6 z-[9999] animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5">
              <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400">Create Invoice</h4>
              <button onClick={() => setShowInvoiceForm(false)} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-all">
                <X className="w-4 h-4 text-zinc-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Invoice Number</label>
                <div className="relative">
                  <input
                    placeholder="Auto-generated"
                    value={invoiceDetails.invoiceNumber}
                    onChange={(e) => setInvoiceDetails({ ...invoiceDetails, invoiceNumber: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-blue-500 outline-none font-mono font-bold text-blue-700 dark:text-blue-400"
                  />
                </div>
                <p className="text-[10px] text-zinc-400">Auto-generated — edit if needed</p>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Amount (ZAR)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={invoiceDetails.actualCost}
                  onChange={(e) => setInvoiceDetails({ ...invoiceDetails, actualCost: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <button
                disabled={!invoiceDetails.invoiceNumber || !invoiceDetails.actualCost || isSubmitting}
                onClick={() => handleUpdate(CaseStatus.INVOICED, {
                  invoiceNumber: invoiceDetails.invoiceNumber,
                  actualCost: parseFloat(invoiceDetails.actualCost),
                  invoiceDate: new Date()
                })}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 disabled:opacity-40 hover:scale-[1.01] transition-all cursor-pointer shadow-lg shadow-blue-500/20"
              >
                {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                {isSubmitting ? "Saving..." : "Save & Mark Invoiced"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Delivery options after invoicing */}
      {status === "INVOICED" && (
        <div className="flex gap-2 items-center flex-wrap justify-end">
          <Link
            href={`/finance/invoice/${caseId}`}
            target="_blank"
            className="text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-700"
          >
            <Printer className="w-3.5 h-3.5" /> Print
          </Link>
          <button
            onClick={() => handleDelivery("whatsapp")}
            className="text-xs font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 border border-emerald-100 dark:border-emerald-900/30"
          >
            <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
          </button>
          <button
            onClick={() => handleDelivery("email")}
            className="text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 border border-blue-100 dark:border-blue-900/30"
          >
            <Mail className="w-3.5 h-3.5" /> Email
          </button>
          <button
            onClick={() => handleUpdate(CaseStatus.PAID)}
            disabled={isSubmitting}
            className="text-xs font-bold text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Confirm Paid
          </button>
        </div>
      )}

      {status === "PAID" && (
        <button
          onClick={() => handleUpdate(CaseStatus.CLOSED)}
          disabled={isSubmitting}
          className="text-xs font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
        >
          <FileText className="w-3.5 h-3.5" /> Close Case
        </button>
      )}
    </div>
  );
}
