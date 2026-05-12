"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MapPin, Mail, Phone, CreditCard, Printer, ArrowLeft, MessageCircle, Briefcase } from "lucide-react";
import Link from "next/link";

interface SystemSettings {
  orgName: string; orgEmail: string; orgPhone: string; orgAddress: string;
  orgLogoUrl: string; orgWebsite: string;
  invoicePaymentDays: number; invoiceBankName: string; invoiceBankAccount: string;
  invoiceBranchCode: string; invoiceAccountType: string; invoiceVatNumber: string;
  invoiceTerms: string; invoiceNotes: string;
}

interface InvoiceCase {
  id: string; clientName: string; outputType: string; province: string;
  nydaReference?: string; invoiceNumber?: string; invoiceDate?: string;
  actualCost?: number; status: string;
  client?: { name: string; idNumber: string; phone?: string; email?: string; address?: string; province: string };
  coordinator?: { name: string };
}

export default function InvoicePage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<InvoiceCase | null>(null);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/cases/${id}`).then(r => { if (!r.ok) { setNotFound(true); return null; } return r.json(); }),
      fetch("/api/settings").then(r => r.json()),
    ]).then(([caseData, settingsData]) => {
      if (caseData) setData(caseData);
      if (settingsData && !settingsData.error) setSettings(settingsData);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-zinc-500 font-medium">Loading invoice...</p>
      </div>
    </div>
  );

  if (notFound || !data) return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="text-center">
        <p className="text-2xl font-bold text-zinc-900 mb-2">Invoice Not Found</p>
        <p className="text-zinc-500 mb-6">This case does not exist.</p>
        <Link href="/finance" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all">Back to Finance</Link>
      </div>
    </div>
  );

  const s = settings;
  const invoiceDate = data.invoiceDate ? new Date(data.invoiceDate) : new Date();
  const dueDate = new Date(invoiceDate);
  dueDate.setDate(dueDate.getDate() + (s?.invoicePaymentDays ?? 30));
  const amount = data.actualCost || 0;
  const client = data.client;

  const shareOnWhatsApp = () => {
    const url = `${window.location.origin}/finance/invoice/${id}`;
    window.open(`https://wa.me/?text=Invoice%20from%20${encodeURIComponent(s?.orgName || "Tshira")}%3A%20${encodeURIComponent(url)}`, "_blank");
  };

  return (
    <div className="bg-zinc-100 min-h-screen py-8 px-4">
      {/* Controls */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden flex-wrap gap-3">
        <Link href="/finance" className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Finance
        </Link>
        <div className="flex gap-3">
          <button onClick={shareOnWhatsApp} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all">
            <MessageCircle className="w-4 h-4" /> WhatsApp
          </button>
          <button onClick={() => window.print()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/30">
            <Printer className="w-4 h-4" /> Download / Print Invoice
          </button>
        </div>
      </div>

      {/* Invoice Document */}
      <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden print:shadow-none print:rounded-none print:m-0">
        {/* Header */}
        <div className="bg-zinc-900 text-white px-12 py-10 flex justify-between items-start flex-wrap gap-6 print:bg-zinc-900 print:text-white" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' } as any}>
          <div className="space-y-3">
            {s?.orgLogoUrl || true ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s?.orgLogoUrl || "/logo.png"} alt={s?.orgName || "Logo"} className="h-16 object-contain mb-2" />
            ) : (
              <div className="flex items-center gap-3 mb-2">
                <Briefcase className="w-10 h-10 text-blue-500" />
              </div>
            )}
            <div>
              <p className="text-xl font-black tracking-tight">{s?.orgName || "Tshira Emporium"}</p>
              <p className="text-zinc-400 text-[10px] uppercase tracking-widest font-bold">NYDA Contracted Service Provider</p>
            </div>
            <div className="text-[11px] text-zinc-400 space-y-0.5 pt-1">
              {s?.orgAddress && <p>{s.orgAddress}</p>}
              {s?.orgEmail && <p>{s.orgEmail}</p>}
              {s?.orgPhone && <p>{s.orgPhone}</p>}
              {s?.orgWebsite && <p>{s.orgWebsite}</p>}
              {s?.invoiceVatNumber && <p>VAT: {s.invoiceVatNumber}</p>}
            </div>
          </div>
          <div className="text-right">
            <p className="text-zinc-400 text-xs font-black uppercase tracking-widest mb-2">Tax Invoice</p>
            <p className="text-5xl font-black text-white">{data.invoiceNumber || "DRAFT"}</p>
            <div className="mt-4 space-y-1 text-sm">
              <div className="flex justify-between gap-8"><span className="text-zinc-400">Date:</span><span className="font-bold">{invoiceDate.toLocaleDateString("en-ZA", { dateStyle: "long" })}</span></div>
              <div className="flex justify-between gap-8"><span className="text-zinc-400">Due:</span><span className="font-bold text-amber-400">{dueDate.toLocaleDateString("en-ZA", { dateStyle: "long" })}</span></div>
              <div className="flex justify-between gap-8"><span className="text-zinc-400">Status:</span>
                <span className={`font-bold ${data.status === "PAID" ? "text-emerald-400" : "text-amber-400"}`}>{data.status === "PAID" ? "PAID" : "OUTSTANDING"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bill To / Project */}
        <div className="px-12 py-10 grid grid-cols-1 md:grid-cols-2 gap-12 border-b border-zinc-100">
          <div>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Bill To</p>
            <p className="text-xl font-bold text-zinc-900">{client?.name || data.clientName}</p>
            <div className="mt-3 space-y-1.5">
              {(client?.idNumber) && <div className="flex items-center gap-2 text-sm text-zinc-500"><CreditCard className="w-4 h-4 text-zinc-300" />SA ID: {client.idNumber}</div>}
              {client?.phone && <div className="flex items-center gap-2 text-sm text-zinc-500"><Phone className="w-4 h-4 text-zinc-300" />{client.phone}</div>}
              {client?.email && <div className="flex items-center gap-2 text-sm text-zinc-500"><Mail className="w-4 h-4 text-zinc-300" />{client.email}</div>}
              <div className="flex items-center gap-2 text-sm text-zinc-500"><MapPin className="w-4 h-4 text-zinc-300" />{client?.address || client?.province || data.province}</div>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Project Reference</p>
            <div className="space-y-2 text-sm">
              {[
                ["NYDA Reference", data.nydaReference || "—"],
                ["Province", data.province.replace(/_/g, " ")],
                ["Deliverable", data.outputType.replace(/_/g, " ")],
                ...(data.coordinator ? [["Coordinator", data.coordinator.name]] : []),
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-[13px]"><span className="text-zinc-400">{k}</span><span className="font-bold text-zinc-900">{v}</span></div>
              ))}
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="px-12 py-10">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-zinc-900">
                <th className="text-left text-[10px] font-black text-zinc-400 uppercase tracking-widest pb-4">Description</th>
                <th className="text-right text-[10px] font-black text-zinc-400 uppercase tracking-widest pb-4">Qty</th>
                <th className="text-right text-[10px] font-black text-zinc-400 uppercase tracking-widest pb-4">Amount (ZAR)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-zinc-100">
                <td className="py-6">
                  <p className="font-bold text-zinc-900">NYDA {data.outputType.replace(/_/g, " ")} Development Services</p>
                  <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed max-w-lg">Professional services for {client?.name || data.clientName}: data collection, document development, quality review, and NYDA submission.</p>
                </td>
                <td className="py-6 text-right text-sm font-bold text-zinc-700">1</td>
                <td className="py-6 text-right font-bold text-zinc-900 text-lg whitespace-nowrap">R {amount.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>

          <div className="flex justify-end mt-8">
            <div className="w-72 space-y-3">
              <div className="flex justify-between text-[13px]"><span className="text-zinc-400">Subtotal</span><span className="font-bold">R {amount.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}</span></div>
              <div className="flex justify-between text-[13px]"><span className="text-zinc-400">VAT {s?.invoiceVatNumber ? "(15%)" : "(0% — Exempt)"}</span><span className="font-bold">R 0.00</span></div>
              <div className="border-t-2 border-zinc-900 pt-4 flex justify-between items-center">
                <span className="text-lg font-black text-zinc-900">TOTAL DUE</span>
                <span className="text-2xl font-black text-blue-600">R {amount.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Banking */}
        {(s?.invoiceBankName || s?.invoiceBankAccount) && (
          <div className="px-12 py-8 bg-zinc-50 border-t border-zinc-100 print:bg-zinc-50" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' } as any}>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Banking Details</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[13px]">
              {s.invoiceBankName && <div><p className="text-zinc-400 text-[10px] uppercase font-bold">Bank</p><p className="font-bold text-zinc-900">{s.invoiceBankName}</p></div>}
              {s.invoiceBankAccount && <div><p className="text-zinc-400 text-[10px] uppercase font-bold">Account</p><p className="font-bold text-zinc-900">{s.invoiceBankAccount}</p></div>}
              {s.invoiceBranchCode && <div><p className="text-zinc-400 text-[10px] uppercase font-bold">Branch</p><p className="font-bold text-zinc-900">{s.invoiceBranchCode}</p></div>}
              {s.invoiceAccountType && <div><p className="text-zinc-400 text-[10px] uppercase font-bold">Type</p><p className="font-bold text-zinc-900">{s.invoiceAccountType}</p></div>}
            </div>
            <p className="text-xs text-zinc-400 mt-4">Reference: <strong className="text-zinc-700">{data.invoiceNumber || id.slice(0, 10)}</strong></p>
          </div>
        )}

        {/* Terms & Footer */}
        {s?.invoiceTerms && (
          <div className="px-12 py-6 border-t border-zinc-100">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Terms & Conditions</p>
            <p className="text-[10px] text-zinc-500 leading-relaxed italic">{s.invoiceTerms}</p>
          </div>
        )}
        <div className="px-12 py-6 border-t border-zinc-100 text-center">
          <p className="text-xs text-zinc-400">{s?.invoiceNotes || "Thank you for your business."}</p>
          <p className="text-[10px] text-zinc-300 mt-1 uppercase tracking-tighter">Generated {new Date().toLocaleString()} · This is a computer-generated tax invoice.</p>
        </div>
      </div>

      <style>{`
        @media print {
          body { 
            background: white !important; 
            color: #000 !important; 
            margin: 0 !important; 
            padding: 0 !important; 
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important;
          }
          .print\\:hidden { display: none !important; }
          .max-w-4xl { 
            max-width: 100% !important; 
            margin: 0 !important; 
            width: 100% !important; 
            box-shadow: none !important;
            border-radius: 0 !important;
          }
          .bg-zinc-100 { background: white !important; }
          .shadow-2xl { box-shadow: none !important; }
          .rounded-3xl { border-radius: 0 !important; }
          
          /* Enforce high-contrast dark header background for print */
          .bg-zinc-900 { 
            background-color: #18181b !important; 
            color: #ffffff !important; 
          }
          .bg-zinc-900 * {
            color: #ffffff !important;
          }
          .bg-zinc-900 .text-zinc-400 {
            color: #a1a1aa !important;
          }
          .bg-zinc-50 {
            background-color: #f4f4f5 !important;
          }
          
          /* Prevent layout breaks */
          table { page-break-inside: avoid; }
          tr { page-break-inside: avoid; }
          
          /* Adjust padding for clean fit on standard A4 page */
          .px-12 { padding-left: 2.5rem !important; padding-right: 2.5rem !important; }
          .py-10 { padding-top: 2rem !important; padding-bottom: 2rem !important; }
        }
      `}</style>
    </div>
  );
}
