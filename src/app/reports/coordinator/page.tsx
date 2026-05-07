import { prisma } from "@/lib/db";
import { Role, Province, CaseStatus } from "@prisma/client";
import { MapPin, User, FileText, Printer, ArrowLeft, BarChart3 } from "lucide-react";
import Link from "next/link";
import React from "react";

export const dynamic = 'force-dynamic';

export default async function CoordinatorReportPage({
  searchParams,
}: {
  searchParams: Promise<{ coordinatorId?: string, province?: string }>;
}) {
  const params = await searchParams;
  const coordinatorId = params.coordinatorId;
  const province = params.province as Province;

  const coordinators = await prisma.user.findMany({
    where: { role: Role.PROVINCIAL_COORDINATOR },
    orderBy: { name: 'asc' }
  });

  const selectedCoordinator = coordinatorId ? coordinators.find(c => c.id === coordinatorId) : null;
  
  // Stats Aggregation
  const filter: any = {};
  if (selectedCoordinator) filter.coordinatorId = selectedCoordinator.id;
  if (province) filter.province = province;

  const cases = await prisma.case.findMany({
    where: filter,
  });

  const totalVouchers = cases.length;
  const bpCount = cases.filter(c => c.outputType.includes("BUSINESS_PLAN")).length;
  const fsCount = cases.filter(c => c.outputType.includes("FEASIBILITY_STUDY")).length;
  
  const dataCollected = cases.filter(c => ["DATA_SUBMITTED", "PROVINCIAL_QUALITY_CHECK", "SUBMITTED_TO_HEAD_OFFICE", "ASSIGNED_TO_CONSULTANT", "DOCUMENT_IN_PROGRESS", "SUBMITTED_FOR_REVIEW", "INTERNALLY_REVIEWED", "SENT_TO_NYDA", "CLIENT_APPROVED", "READY_FOR_INVOICING", "INVOICED", "PAID", "CLOSED"].includes(c.status)).length;
  const dataUncollected = totalVouchers - dataCollected;

  const finalSubmitted = cases.filter(c => ["SENT_TO_NYDA", "CLIENT_APPROVED", "READY_FOR_INVOICING", "INVOICED", "PAID", "CLOSED"].includes(c.status)).length;
  const approvals = cases.filter(c => ["CLIENT_APPROVED", "READY_FOR_INVOICING", "INVOICED", "PAID", "CLOSED"].includes(c.status)).length;

  const invoiced = cases.filter(c => c.status === "INVOICED" || c.status === "PAID" || c.status === "CLOSED");
  const totalInvoiced = invoiced.length;
  const totalPaid = cases.filter(c => c.status === "PAID" || c.status === "CLOSED").length;
  const totalUnpaid = totalInvoiced - totalPaid;

  // Branch Breakdown
  const branches = Array.from(new Set(cases.map(c => c.adminOffice).filter(Boolean)));
  const branchStats = branches.map(b => ({
    name: b,
    count: cases.filter(c => c.adminOffice === b).length
  }));

  return (
    <div className="p-8 space-y-8 bg-zinc-50 dark:bg-zinc-950 min-h-screen pb-24">
      <div className="flex justify-between items-center print:hidden">
        <Link href="/reports" className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Reports
        </Link>
        {selectedCoordinator && (
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
          >
            <Printer className="w-4 h-4" />
            Print Recording Form
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-12 border border-zinc-200 dark:border-zinc-800 shadow-sm print:shadow-none print:border-none print:p-0">
        <div className="space-y-10">
          {/* Form Header */}
          <div className="flex justify-between items-start border-b-4 border-zinc-900 pb-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tighter text-zinc-900 uppercase">PROVINCIAL COORDINATOR VOUCHER RECORDING</h1>
              <p className="text-zinc-500 text-xs font-black uppercase tracking-widest">Official Management Record · Tshira Emporium</p>
            </div>
            <img src="/logo.png" alt="Logo" className="h-16 object-contain" />
          </div>

          {/* Metadata Section */}
          <div className="grid grid-cols-2 gap-12">
            <div className="space-y-1 border-b-2 border-zinc-100 pb-2">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Name of the Coordinator</p>
              <div className="flex justify-between items-center">
                <p className="text-lg font-bold text-zinc-900">{selectedCoordinator?.name || "________________________________"}</p>
                {!selectedCoordinator && (
                   <form className="print:hidden">
                    <select 
                      name="coordinatorId" 
                      onChange={(e) => (window.location.href = `?coordinatorId=${e.target.value}`)}
                      className="bg-zinc-100 border-none rounded-lg px-3 py-1 text-xs focus:ring-0"
                    >
                      <option value="">Select Coordinator...</option>
                      {coordinators.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </form>
                )}
              </div>
            </div>
            <div className="space-y-1 border-b-2 border-zinc-100 pb-2">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Province</p>
              <p className="text-lg font-bold text-zinc-900">{province || selectedCoordinator?.province?.replace(/_/g, ' ') || "________________________________"}</p>
            </div>
          </div>

          {/* Main Stats Table */}
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-zinc-900 text-white">
                <th className="py-4 px-6 text-left text-xs font-black uppercase tracking-widest">Description</th>
                <th className="py-4 px-6 text-center text-xs font-black uppercase tracking-widest">Qty</th>
                <th className="py-4 px-6 text-right text-xs font-black uppercase tracking-widest">Grand Total</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-zinc-900">
              {/* Vouchers */}
              <Row label="Total number of vouchers" value={totalVouchers} isHeader />
              
              {/* Branch Breakdown */}
              <Row label="Total number per branch" isHeader />
              {branchStats.map(b => (
                <Row key={b.name} label={`— ${b.name}`} value={b.count} indent />
              ))}
              {branchStats.length === 0 && <Row label="— (No branches recorded)" value="0" indent />}

              {/* Products */}
              <Row label="PRODUCTS" isHeader />
              <Row label="Total business plans" value={bpCount} indent />
              <Row label="Total feasibility studies" value={fsCount} indent />

              {/* Data Collection */}
              <Row label="DATA COLLECTED" isHeader />
              <Row label="Total data collected" value={dataCollected} indent />
              <Row label="Total data uncollected" value={dataUncollected} indent />

              {/* Final Products */}
              <Row label="FINAL PRODUCTS SUBMITTED" isHeader />
              <Row label="Business plans" value={cases.filter(c => c.outputType.includes("BUSINESS_PLAN") && ["SENT_TO_NYDA", "CLIENT_APPROVED", "READY_FOR_INVOICING", "INVOICED", "PAID", "CLOSED"].includes(c.status)).length} indent />
              <Row label="Feasibility studies" value={cases.filter(c => c.outputType.includes("FEASIBILITY_STUDY") && ["SENT_TO_NYDA", "CLIENT_APPROVED", "READY_FOR_INVOICING", "INVOICED", "PAID", "CLOSED"].includes(c.status)).length} indent />

              {/* Approvals */}
              <Row label="APPROVALS" isHeader />
              <Row label="Business plans" value={cases.filter(c => c.outputType.includes("BUSINESS_PLAN") && ["CLIENT_APPROVED", "READY_FOR_INVOICING", "INVOICED", "PAID", "CLOSED"].includes(c.status)).length} indent />
              <Row label="Feasibility studies" value={cases.filter(c => c.outputType.includes("FEASIBILITY_STUDY") && ["CLIENT_APPROVED", "READY_FOR_INVOICING", "INVOICED", "PAID", "CLOSED"].includes(c.status)).length} indent />

              {/* Invoices */}
              <Row label="INVOICES" isHeader />
              <Row label="Total invoiced" value={totalInvoiced} indent />
              <Row label="Total paid" value={totalPaid} indent />
              <Row label="Total unpaid" value={totalUnpaid} indent />
            </tbody>
          </table>

          {/* Footer Signatures */}
          <div className="mt-20 grid grid-cols-2 gap-24 pt-12 border-t border-zinc-100">
            <div className="space-y-4">
              <div className="border-b-2 border-zinc-900 h-12 w-full"></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-center">Provincial Coordinator Signature</p>
            </div>
            <div className="space-y-4">
              <div className="border-b-2 border-zinc-900 h-12 w-full"></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-center">Head Office Approval / Date</p>
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
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
    </div>
  );
}

function Row({ label, value, isHeader = false, indent = false }: { label: string, value?: string | number, isHeader?: boolean, indent?: boolean }) {
  return (
    <tr className={isHeader ? "bg-zinc-50 font-black" : ""}>
      <td className={`py-4 px-6 text-sm ${indent ? "pl-12 italic text-zinc-500" : "font-bold text-zinc-900"}`}>
        {label}
      </td>
      <td className="py-4 px-6 text-center text-sm font-bold">
        {value !== undefined ? value : ""}
      </td>
      <td className="py-4 px-6 text-right text-sm font-black">
        {value !== undefined ? value : ""}
      </td>
    </tr>
  );
}
