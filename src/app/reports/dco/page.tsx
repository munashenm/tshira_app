import { prisma } from "@/lib/db";
import { Role } from "@prisma/client";
import { MapPin, User, FileText, Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";
import React from "react";
import { PrintReportButton, ReportUserSelector } from "@/components/ReportClientSide";

export const dynamic = 'force-dynamic';

export default async function DCOReportPage({
  searchParams,
}: {
  searchParams: Promise<{ dcoId?: string }>;
}) {
  const params = await searchParams;
  const dcoId = params.dcoId;

  const dcos = await prisma.user.findMany({
    where: { role: Role.DATA_COLLECTION_OFFICER },
    orderBy: { name: 'asc' }
  });

  const selectedDco = dcoId ? dcos.find(d => d.id === dcoId) : null;
  
  const cases = selectedDco ? await prisma.case.findMany({
    where: { dcoId: selectedDco.id },
    include: { client: true },
    orderBy: { createdAt: 'desc' }
  }) : [];

  return (
    <div className="p-8 space-y-8 bg-zinc-50 dark:bg-zinc-950 min-h-screen pb-24">
      <div className="flex justify-between items-center print:hidden">
        <Link href="/reports" className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Reports
        </Link>
        {selectedDco && (
          <PrintReportButton label="Print DCO Form" />
        )}
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm print:shadow-none print:border-none print:p-0">
        <div className="space-y-8">
          {/* Form Header */}
          <div className="flex justify-between items-start border-b-2 border-zinc-900 pb-8">
            <div className="space-y-1">
              <h1 className="text-3xl font-black tracking-tight text-zinc-900">DATA COLLECTION OFFICER CLIENTS</h1>
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">NYDA Workflow Management System</p>
            </div>
            <img src="/logo.png" alt="Logo" className="h-12 object-contain" />
          </div>

          {/* DCO Info Grid */}
          <div className="grid grid-cols-2 gap-y-6 gap-x-12">
            <div className="border-b border-zinc-200 py-2">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Name of the DCO</p>
              <div className="flex justify-between items-center mt-1">
                <p className="text-sm font-bold">{selectedDco?.name || "________________________________"}</p>
                {!selectedDco && (
                  <ReportUserSelector 
                    users={dcos} 
                    placeholder="Select DCO..." 
                    paramName="dcoId" 
                  />
                )}
              </div>
            </div>
            <div className="border-b border-zinc-200 py-2">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Province</p>
              <p className="text-sm font-bold mt-1">{selectedDco?.province?.replace(/_/g, ' ') || "________________________________"}</p>
            </div>
            <div className="border-b border-zinc-200 py-2">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">District</p>
              <p className="text-sm font-bold mt-1">________________________________</p>
            </div>
            <div className="border-b border-zinc-200 py-2">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Local Municipality</p>
              <p className="text-sm font-bold mt-1">________________________________</p>
            </div>
          </div>

          {/* Table */}
          <div className="mt-8">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-t-2 border-b-2 border-zinc-900">
                  <th className="py-4 px-4 text-left text-[10px] font-black uppercase tracking-widest border-r border-zinc-200">Name of Client</th>
                  <th className="py-4 px-4 text-left text-[10px] font-black uppercase tracking-widest border-r border-zinc-200">ID Number</th>
                  <th className="py-4 px-4 text-left text-[10px] font-black uppercase tracking-widest border-r border-zinc-200">Voucher Number</th>
                  <th className="py-4 px-4 text-left text-[10px] font-black uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {cases.map((c, i) => (
                  <tr key={c.id}>
                    <td className="py-4 px-4 text-sm font-bold border-r border-zinc-200">{c.clientName}</td>
                    <td className="py-4 px-4 text-sm border-r border-zinc-200">{c.client?.idNumber || "—"}</td>
                    <td className="py-4 px-4 text-sm border-r border-zinc-200">{c.nydaReference || "—"}</td>
                    <td className="py-4 px-4 text-[10px] font-black uppercase tracking-tighter">{c.status.replace(/_/g, ' ')}</td>
                  </tr>
                ))}
                {/* Empty rows to reach at least 15 */}
                {Array.from({ length: Math.max(0, 15 - cases.length) }).map((_, i) => (
                  <tr key={`empty-${i}`} className="h-12">
                    <td className="border-r border-zinc-200 px-4"></td>
                    <td className="border-r border-zinc-200 px-4"></td>
                    <td className="border-r border-zinc-200 px-4"></td>
                    <td className="px-4"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Signatures */}
          <div className="mt-16 grid grid-cols-2 gap-12 border-t border-zinc-100 pt-12">
            <div className="space-y-4">
              <div className="border-b border-zinc-900 h-10 w-full"></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-center">DCO Signature</p>
            </div>
            <div className="space-y-4">
              <div className="border-b border-zinc-900 h-10 w-full"></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-center">Manager Signature / Date</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body { background: white !important; margin: 0; padding: 0 !important; }
          .bg-zinc-50, .dark\\:bg-zinc-950 { background: white !important; }
          .shadow-sm { box-shadow: none !important; }
          table { width: 100% !important; border: 1px solid black !important; }
          th, td { border: 1px solid black !important; }
          .border-zinc-200 { border-color: black !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
    </div>
  );
}
