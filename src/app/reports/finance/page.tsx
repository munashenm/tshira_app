import { prisma } from "@/lib/db";
import { CaseStatus, Province } from "@prisma/client";
import { 
  BarChart3, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  Printer,
  TrendingUp,
  FileText,
  MapPin
} from "lucide-react";
import Link from "next/link";
import React from "react";
import { PrintReportButton } from "@/components/ReportClientSide";

export const dynamic = 'force-dynamic';

export default async function FinanceReconciliationPage() {
  const cases = await prisma.case.findMany({
    where: {
      status: {
        in: [
          CaseStatus.CLIENT_APPROVED,
          CaseStatus.READY_FOR_INVOICING,
          CaseStatus.INVOICED,
          CaseStatus.PAID,
          CaseStatus.CLOSED
        ]
      }
    },
    include: {
      client: true,
      coordinator: true
    },
    orderBy: { updatedAt: 'desc' }
  });

  const readyToInvoice = cases.filter(c => c.status === CaseStatus.CLIENT_APPROVED || c.status === CaseStatus.READY_FOR_INVOICING);
  const invoiced = cases.filter(c => c.status === CaseStatus.INVOICED);
  const paid = cases.filter(c => c.status === CaseStatus.PAID || c.status === CaseStatus.CLOSED);

  const totalValue = cases.reduce((acc, c) => acc + (c.actualCost || c.estimatedCost || 0), 0);
  const pendingValue = readyToInvoice.reduce((acc, c) => acc + (c.actualCost || c.estimatedCost || 0), 0);
  const outstandingValue = invoiced.reduce((acc, c) => acc + (c.actualCost || c.estimatedCost || 0), 0);
  const paidValue = paid.reduce((acc, c) => acc + (c.actualCost || c.estimatedCost || 0), 0);

  // Province Breakdown
  const provinceStats = Object.values(Province).map(p => {
    const provinceCases = cases.filter(c => c.province === p);
    return {
      province: p,
      count: provinceCases.length,
      value: provinceCases.reduce((acc, c) => acc + (c.actualCost || c.estimatedCost || 0), 0)
    };
  }).filter(s => s.count > 0);

  return (
    <div className="p-8 space-y-8 bg-zinc-50 dark:bg-zinc-950 min-h-screen pb-24">
      <div className="flex justify-between items-center print:hidden">
        <Link href="/reports" className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Reports
        </Link>
        <PrintReportButton label="Print Reconciliation Report" />
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-12 border border-zinc-200 dark:border-zinc-800 shadow-sm print:shadow-none print:border-none print:p-0">
        <div className="space-y-12">
          {/* Form Header */}
          <div className="flex justify-between items-start border-b-4 border-zinc-900 pb-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tighter text-zinc-900 uppercase">FINANCE RECONCILIATION REPORT</h1>
              <p className="text-zinc-500 text-xs font-black uppercase tracking-widest">Confidential Financial Summary · Tshira Emporium</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-zinc-900">{new Date().toLocaleDateString()}</p>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Report Date</p>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <MetricCard 
              label="Ready to Invoice" 
              value={`R ${pendingValue.toLocaleString()}`} 
              subValue={`${readyToInvoice.length} Projects`}
              icon={<Clock className="w-5 h-5 text-amber-500" />}
              color="amber"
            />
            <MetricCard 
              label="Outstanding (Invoiced)" 
              value={`R ${outstandingValue.toLocaleString()}`} 
              subValue={`${invoiced.length} Projects`}
              icon={<AlertCircle className="w-5 h-5 text-blue-500" />}
              color="blue"
            />
            <MetricCard 
              label="Total Paid" 
              value={`R ${paidValue.toLocaleString()}`} 
              subValue={`${paid.length} Projects`}
              icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
              color="emerald"
            />
            <MetricCard 
              label="Grand Total Revenue" 
              value={`R ${totalValue.toLocaleString()}`} 
              subValue={`${cases.length} Total Approved`}
              icon={<TrendingUp className="w-5 h-5 text-zinc-900" />}
              color="zinc"
            />
          </div>

          {/* Province Analysis */}
          <div className="space-y-6">
            <h2 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Regional Financial Breakdown
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {provinceStats.map(stat => (
                <div key={stat.province} className="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-xs font-black uppercase tracking-widest text-zinc-500">{stat.province.replace(/_/g, ' ')}</p>
                    <span className="px-2 py-1 bg-white dark:bg-zinc-800 rounded-lg text-[10px] font-bold text-zinc-400 border border-zinc-100 dark:border-zinc-700">
                      {stat.count} Projects
                    </span>
                  </div>
                  <p className="text-2xl font-black text-zinc-900 dark:text-zinc-50">R {stat.value.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Transaction Table */}
          <div className="space-y-6">
            <h2 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Outstanding & Pending Invoices
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-zinc-900 text-white">
                    <th className="py-4 px-6 text-left text-[10px] font-black uppercase tracking-widest border-r border-white/10">Beneficiary</th>
                    <th className="py-4 px-6 text-left text-[10px] font-black uppercase tracking-widest border-r border-white/10">Voucher / Ref</th>
                    <th className="py-4 px-6 text-left text-[10px] font-black uppercase tracking-widest border-r border-white/10">Province</th>
                    <th className="py-4 px-6 text-left text-[10px] font-black uppercase tracking-widest border-r border-white/10">Status</th>
                    <th className="py-4 px-6 text-right text-[10px] font-black uppercase tracking-widest">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-zinc-900 border-b-2 border-zinc-900">
                  {cases.map((c) => (
                    <tr key={c.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="py-4 px-6 text-sm font-bold border-r border-zinc-200">{c.clientName}</td>
                      <td className="py-4 px-6 text-xs text-zinc-500 border-r border-zinc-200">{c.nydaReference || "—"}</td>
                      <td className="py-4 px-6 text-xs font-bold text-zinc-500 border-r border-zinc-200">{c.province}</td>
                      <td className="py-4 px-6 border-r border-zinc-200">
                        <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter ${
                          c.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' :
                          c.status === 'INVOICED' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {c.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right text-sm font-black text-zinc-900">
                        R {(c.actualCost || c.estimatedCost || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {cases.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-zinc-400 font-medium italic">
                        No financial records found for the current filter.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-zinc-50">
                    <td colSpan={4} className="py-4 px-6 text-sm font-black uppercase text-right border-r border-zinc-200">Grand Total</td>
                    <td className="py-4 px-6 text-right text-lg font-black text-zinc-900">R {totalValue.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Approval Signatures */}
          <div className="mt-24 grid grid-cols-2 gap-24 pt-12 border-t border-zinc-100">
            <div className="space-y-4">
              <div className="border-b-2 border-zinc-900 h-12 w-full"></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-center">Finance Manager / Accountant</p>
            </div>
            <div className="space-y-4">
              <div className="border-b-2 border-zinc-900 h-12 w-full"></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-center">Chief Operations Officer / Date</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body { background: white !important; margin: 0; padding: 0 !important; }
          .bg-zinc-50, .dark\\:bg-zinc-950 { background: white !important; }
          .shadow-sm { box-shadow: none !important; }
          table { width: 100% !important; border: 2px solid black !important; }
          th, td { border: 1px solid black !important; }
          .bg-zinc-900 { background: black !important; color: white !important; }
          .text-zinc-900 { color: black !important; }
          .text-zinc-500, .text-zinc-400 { color: #666 !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
    </div>
  );
}

function MetricCard({ label, value, subValue, icon, color }: { label: string, value: string, subValue: string, icon: React.ReactNode, color: string }) {
  return (
    <div className={`p-6 rounded-[32px] border transition-all ${
      color === 'amber' ? 'bg-amber-50/30 border-amber-100' :
      color === 'blue' ? 'bg-blue-50/30 border-blue-100' :
      color === 'emerald' ? 'bg-emerald-50/30 border-emerald-100' :
      'bg-zinc-50 border-zinc-200'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-xl ${
          color === 'amber' ? 'bg-amber-100' :
          color === 'blue' ? 'bg-blue-100' :
          color === 'emerald' ? 'bg-emerald-100' :
          'bg-zinc-200'
        }`}>
          {icon}
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{label}</p>
      </div>
      <p className="text-2xl font-black text-zinc-900">{value}</p>
      <p className="text-xs text-zinc-500 font-bold mt-1">{subValue}</p>
    </div>
  );
}
