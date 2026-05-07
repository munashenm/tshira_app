import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Briefcase, MapPin, Mail, Phone, CreditCard, Receipt } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const c = await prisma.case.findUnique({
    where: { id },
    include: {
      client: true,
      coordinator: true
    }
  });

  if (!c || !c.client) return notFound();

  return (
    <div className="bg-white min-h-screen p-12 text-zinc-900 font-sans">
      {/* Print Controls (Hidden on print) */}
      <div className="mb-8 flex justify-between items-center print:hidden bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
        <div>
          <h1 className="text-xl font-bold">Invoice Preview</h1>
          <p className="text-sm text-zinc-500">Review and print the professional invoice for {c.clientName}.</p>
        </div>
        <button 
          onClick={() => window.print()}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
        >
          Print Invoice
        </button>
      </div>

      {/* Invoice Content */}
      <div className="max-w-4xl mx-auto border border-zinc-200 p-16 rounded-[32px] shadow-sm bg-white">
        <div className="flex justify-between items-start mb-16">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                <Briefcase className="w-6 h-6" />
              </div>
              <span className="text-2xl font-black tracking-tighter">TSHIRA APP</span>
            </div>
            <div className="text-sm text-zinc-500 space-y-1">
              <p>Head Office: Limpopo, South Africa</p>
              <p>Email: admin@tshira.co.za</p>
              <p>Website: www.tshira.co.za</p>
            </div>
          </div>
          <div className="text-right space-y-2">
            <h2 className="text-5xl font-black text-zinc-100 uppercase tracking-tighter mb-4">Invoice</h2>
            <p className="text-sm font-bold text-zinc-400">INVOICE NO: <span className="text-zinc-900">{c.invoiceNumber || 'PENDING'}</span></p>
            <p className="text-sm font-bold text-zinc-400">DATE: <span className="text-zinc-900">{c.invoiceDate?.toLocaleDateString() || new Date().toLocaleDateString()}</span></p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-16 mb-16">
          <div className="space-y-4">
            <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest border-b pb-2">Bill To:</h3>
            <div className="space-y-2">
              <p className="text-xl font-bold text-zinc-900">{c.client.name}</p>
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <CreditCard className="w-4 h-4" />
                ID: {c.client.idNumber}
              </div>
              {c.client.phone && (
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                  <Phone className="w-4 h-4" />
                  {c.client.phone}
                </div>
              )}
              {c.client.email && (
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                  <Mail className="w-4 h-4" />
                  {c.client.email}
                </div>
              )}
              <div className="flex items-start gap-2 text-sm text-zinc-500 max-w-[200px]">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                {c.client.address || c.client.province}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest border-b pb-2">Project Details:</h3>
            <div className="space-y-2">
              <p className="text-sm font-bold text-zinc-900">Reference: {c.nydaReference || c.id}</p>
              <p className="text-sm text-zinc-500">Province: {c.province}</p>
              <p className="text-sm text-zinc-500">Deliverable: {c.outputType.replace(/_/g, ' ')}</p>
            </div>
          </div>
        </div>

        <table className="w-full mb-16">
          <thead>
            <tr className="bg-zinc-900 text-white">
              <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest rounded-l-xl">Description</th>
              <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-widest rounded-r-xl">Amount (ZAR)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            <tr>
              <td className="px-6 py-8">
                <p className="font-bold text-zinc-900">NYDA {c.outputType.replace(/_/g, ' ')} Development</p>
                <p className="text-sm text-zinc-500 mt-1">Professional services for data collection, document development, and internal review.</p>
              </td>
              <td className="px-6 py-8 text-right font-bold text-zinc-900 text-xl">
                R {c.actualCost?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="flex justify-end mb-16">
          <div className="w-64 space-y-4">
            <div className="flex justify-between items-center text-sm font-bold text-zinc-400">
              <span>SUBTOTAL</span>
              <span className="text-zinc-900">R {c.actualCost?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</span>
            </div>
            <div className="flex justify-between items-center text-sm font-bold text-zinc-400">
              <span>TAX (0%)</span>
              <span className="text-zinc-900">R 0.00</span>
            </div>
            <div className="border-t-2 border-zinc-900 pt-4 flex justify-between items-center">
              <span className="text-lg font-black text-zinc-900">TOTAL DUE</span>
              <span className="text-2xl font-black text-blue-600">R {c.actualCost?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-dashed border-zinc-200 pt-8 text-center space-y-2">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Thank you for your business</p>
          <p className="text-[10px] text-zinc-300">Generated by Tshira Workflow System • {new Date().toLocaleString()}</p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          .max-w-4xl { max-width: 100% !important; border: none !important; box-shadow: none !important; p: 0 !important; }
        }
      `}} />
    </div>
  );
}
