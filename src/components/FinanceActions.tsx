"use client";

import { useState } from "react";
import { CheckCircle2, FileText, Receipt, X, Save, Mail, Printer, MessageCircle } from "lucide-react";
import { CaseStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
  const [showDelivery, setShowDelivery] = useState(false);
  const [invoiceDetails, setInvoiceDetails] = useState({
    invoiceNumber: "",
    actualCost: ""
  });
  
  const router = useRouter();

  const handleUpdate = async (newStatus: CaseStatus, extraData: Record<string, unknown> = {}) => {
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
        setShowDelivery(false);
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
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
      {/* STEP 1: Show Generate Invoice for any case not yet invoiced */}
      {(status !== "INVOICED" && status !== "PAID" && status !== "CLOSED") && !showInvoiceForm && (
        <button 
          onClick={() => setShowInvoiceForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
        >
          <Receipt className="w-4 h-4" />
          Generate Invoice
        </button>
      )}

      {/* STEP 2: Invoice creation form */}
      {showInvoiceForm && (
        <div className="absolute right-0 bottom-full mb-2 w-72 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-5 z-50 animate-in slide-in-from-bottom-2">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400">Invoice Details</h4>
            <button onClick={() => setShowInvoiceForm(false)} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full">
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            <input 
              placeholder="Invoice Number (e.g. INV-001)" 
              value={invoiceDetails.invoiceNumber}
              onChange={(e) => setInvoiceDetails({...invoiceDetails, invoiceNumber: e.target.value})}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <input 
              type="number"
              placeholder="Amount (ZAR)" 
              value={invoiceDetails.actualCost}
              onChange={(e) => setInvoiceDetails({...invoiceDetails, actualCost: e.target.value})}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <p className="text-[10px] text-zinc-400 font-medium">Delivery method will be selected after saving.</p>
            <button 
              disabled={!invoiceDetails.invoiceNumber || !invoiceDetails.actualCost || isSubmitting}
              onClick={() => handleUpdate(CaseStatus.INVOICED, { 
                invoiceNumber: invoiceDetails.invoiceNumber, 
                actualCost: parseFloat(invoiceDetails.actualCost),
                invoiceDate: new Date()
              })}
              className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 disabled:opacity-40 hover:bg-blue-700 transition-all"
            >
              <Save className="w-3 h-3" />
              Save Invoice
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Delivery options after invoicing */}
      {status === "INVOICED" && (
        <div className="flex gap-2 items-center">
          <Link 
            href={`/finance/invoice/${caseId}`}
            target="_blank"
            className="text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-700"
            title="Print Invoice"
          >
            <Printer className="w-3.5 h-3.5" />
            Print
          </Link>
          <button 
            onClick={() => handleDelivery("whatsapp")}
            className="text-xs font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 border border-emerald-100 dark:border-emerald-900/30"
            title="Send via WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            WhatsApp
          </button>
          <button 
            onClick={() => handleDelivery("email")}
            className="text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 border border-blue-100 dark:border-blue-900/30"
            title="Send via Email"
          >
            <Mail className="w-3.5 h-3.5" />
            Email
          </button>
          <button 
            onClick={() => handleUpdate(CaseStatus.PAID)}
            disabled={isSubmitting}
            className="text-xs font-bold text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Confirm Paid
          </button>
        </div>
      )}

      {status === "PAID" && (
        <button 
          onClick={() => handleUpdate(CaseStatus.CLOSED)}
          disabled={isSubmitting}
          className="text-xs font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
        >
          <FileText className="w-3.5 h-3.5" />
          Close Case
        </button>
      )}
    </div>
  );
}
