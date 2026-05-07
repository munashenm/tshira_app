import { prisma } from "@/lib/db";
import { BarChart3, PieChart, Download, FileSpreadsheet, TrendingUp, AlertCircle, CheckCircle2, Clock, DollarSign, MapPin } from "lucide-react";
import { Province, CaseStatus } from "@prisma/client";
import Link from "next/link";
import React from "react";

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  const [
    totalCases,
    casesByProvince,
    casesByStatus,
    casesByType,
    allCases,
    totalRevenue,
    overdueCount,
    totalClients,
  ] = await Promise.all([
    prisma.case.count(),
    prisma.case.groupBy({ by: ['province'], _count: { id: true } }),
    prisma.case.groupBy({ by: ['status'], _count: { id: true } }),
    prisma.case.groupBy({ by: ['outputType'], _count: { id: true } }),
    prisma.case.findMany({ select: { createdAt: true, updatedAt: true, status: true, slaDeadline: true, actualCost: true } }),
    prisma.case.aggregate({ _sum: { actualCost: true }, where: { status: { in: ['INVOICED', 'PAID', 'CLOSED'] } } }),
    prisma.case.count({ where: { slaDeadline: { lt: new Date() }, status: { notIn: ['CLOSED', 'PAID'] } } }),
    prisma.client.count(),
  ]);

  const statusCounts = casesByStatus.reduce((acc, s) => { acc[s.status] = s._count.id; return acc; }, {} as Record<string, number>);

  const completedCases = allCases.filter(c => c.status === 'PAID' || c.status === 'CLOSED');
  const avgDays = completedCases.length > 0
    ? Math.round(completedCases.reduce((sum, c) => sum + (new Date(c.updatedAt).getTime() - new Date(c.createdAt).getTime()), 0) / completedCases.length / (1000 * 60 * 60 * 24))
    : 0;

  const withinSla = allCases.filter(c => {
    if (c.status === 'PAID' || c.status === 'CLOSED') return true;
    if (!c.slaDeadline) return true;
    return new Date(c.slaDeadline) > new Date();
  }).length;
  const slaPercentage = totalCases > 0 ? Math.round((withinSla / totalCases) * 100) : 100;

  // Approaching SLA (within 2 days)
  const twoDaysFromNow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
  const approachingSla = allCases.filter(c =>
    c.slaDeadline &&
    new Date(c.slaDeadline) <= twoDaysFromNow &&
    new Date(c.slaDeadline) > new Date() &&
    c.status !== 'PAID' && c.status !== 'CLOSED'
  ).length;

  return (
    <div className="p-8 space-y-8 bg-zinc-50 dark:bg-zinc-950 min-h-screen">
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Management Reports</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">Live operational performance metrics across all 6 provinces.</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/reports/dco"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 transition-all"
          >
            <User className="w-4 h-4" />
            DCO List
          </Link>
          <Link
            href="/reports/coordinator"
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-purple-500/20 transition-all"
          >
            <BarChart3 className="w-4 h-4" />
            PC Recording
          </Link>
          <a
            href="/api/export/cases"
            className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-2.5 rounded-xl text-sm font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export CSV
          </a>
        </div>
      </div>

      {/* Top Level Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard label="Total Cases" value={totalCases} trend={`${totalClients} unique clients`} icon={<TrendingUp className="w-5 h-5" />} />
        <MetricCard label="SLA Compliance" value={`${slaPercentage}%`} trend="Target: 95%" icon={<Clock className="w-5 h-5" />} status={slaPercentage > 90 ? 'success' : 'warning'} />
        <MetricCard label="Avg. Completion" value={avgDays > 0 ? `${avgDays}d` : "—"} trend={`${completedCases.length} completed`} icon={<CheckCircle2 className="w-5 h-5" />} />
        <MetricCard label="Overdue (SLA)" value={overdueCount} trend={`${approachingSla} approaching`} icon={<AlertCircle className="w-5 h-5" />} status={overdueCount > 0 ? 'warning' : 'success'} />
        <MetricCard label="Revenue (ZAR)" value={`R ${(totalRevenue._sum.actualCost || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`} trend="Invoiced + Paid" icon={<DollarSign className="w-5 h-5" />} status="success" />
      </div>

      {/* Alerts */}
      {(overdueCount > 0 || approachingSla > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {overdueCount > 0 && (
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl p-5 flex items-center gap-4">
              <AlertCircle className="w-8 h-8 text-red-500 shrink-0" />
              <div>
                <p className="font-bold text-red-700 dark:text-red-400">{overdueCount} case{overdueCount > 1 ? 's' : ''} past SLA deadline</p>
                <p className="text-sm text-red-500 mt-0.5">Immediate attention required.</p>
              </div>
              <Link href="/cases?filter=overdue" className="ml-auto text-xs font-bold text-red-600 hover:underline">View →</Link>
            </div>
          )}
          {approachingSla > 0 && (
            <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-2xl p-5 flex items-center gap-4">
              <Clock className="w-8 h-8 text-orange-500 shrink-0" />
              <div>
                <p className="font-bold text-orange-700 dark:text-orange-400">{approachingSla} case{approachingSla > 1 ? 's' : ''} approaching SLA (within 48h)</p>
                <p className="text-sm text-orange-500 mt-0.5">Prioritise these immediately.</p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Provincial Distribution */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <h3 className="text-lg font-bold mb-8 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-500" /> Volume by Province
          </h3>
          <div className="space-y-5">
            {Object.values(Province).map((p) => {
              const count = casesByProvince.find(c => c.province === p)?._count.id || 0;
              const pct = totalCases > 0 ? (count / totalCases) * 100 : 0;
              return (
                <div key={p} className="space-y-1.5">
                  <div className="flex justify-between text-sm font-bold text-zinc-700 dark:text-zinc-300">
                    <span>{p.replace(/_/g, ' ')}</span>
                    <span className="text-zinc-400">{count} cases ({Math.round(pct)}%)</span>
                  </div>
                  <div className="h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Operational Funnel */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <h3 className="text-lg font-bold mb-8 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-purple-500" /> Operational Funnel
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <MiniCard label="New / Received" value={(statusCounts['RECEIVED_FROM_NYDA'] || 0) + (statusCounts['ASSIGNED_TO_PROVINCE'] || 0)} color="blue" />
            <MiniCard label="Data Collection" value={(statusCounts['ASSIGNED_FOR_DATA_COLLECTION'] || 0) + (statusCounts['DATA_COLLECTION_IN_PROGRESS'] || 0) + (statusCounts['DATA_SUBMITTED'] || 0)} color="orange" />
            <MiniCard label="In Development" value={(statusCounts['ASSIGNED_TO_CONSULTANT'] || 0) + (statusCounts['DOCUMENT_IN_PROGRESS'] || 0)} color="purple" />
            <MiniCard label="Under Review" value={(statusCounts['SUBMITTED_FOR_REVIEW'] || 0) + (statusCounts['PROVINCIAL_QUALITY_CHECK'] || 0) + (statusCounts['INTERNALLY_REVIEWED'] || 0)} color="indigo" />
            <MiniCard label="Sent to NYDA" value={statusCounts['SENT_TO_NYDA'] || 0} color="sky" />
            <MiniCard label="Completed" value={(statusCounts['PAID'] || 0) + (statusCounts['CLOSED'] || 0)} color="green" />
          </div>
        </div>

        {/* Output Type Breakdown */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <h3 className="text-lg font-bold mb-8 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-500" /> By Deliverable Type
          </h3>
          <div className="space-y-5">
            {casesByType.sort((a, b) => b._count.id - a._count.id).map(t => {
              const pct = totalCases > 0 ? (t._count.id / totalCases) * 100 : 0;
              return (
                <div key={t.outputType} className="space-y-1.5">
                  <div className="flex justify-between text-sm font-bold text-zinc-700 dark:text-zinc-300">
                    <span>{t.outputType.replace(/_/g, ' ')}</span>
                    <span className="text-zinc-400">{t._count.id}</span>
                  </div>
                  <div className="h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <h3 className="text-lg font-bold mb-8 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-amber-500" /> Financial Summary
          </h3>
          <div className="space-y-5">
            {[
              { label: "Total Invoiced", status: ["INVOICED"], color: "blue" },
              { label: "Confirmed Paid", status: ["PAID", "CLOSED"], color: "green" },
            ].map(async ({ label, status, color }) => {
              const result = await prisma.case.aggregate({ _sum: { actualCost: true }, where: { status: { in: status as CaseStatus[] } } });
              const val = result._sum.actualCost || 0;
              return (
                <div key={label} className="flex justify-between items-center p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50">
                  <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{label}</p>
                  <p className={`text-xl font-black ${color === 'green' ? 'text-emerald-600' : 'text-blue-600'}`}>
                    R {val.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
              );
            })}
            <div className="flex justify-between items-center p-4 rounded-2xl border-2 border-zinc-200 dark:border-zinc-700">
              <p className="text-sm font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-widest">Outstanding</p>
              <p className="text-xl font-black text-orange-600">
                R {((totalRevenue._sum.actualCost || 0) - 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, trend, icon, status }: { label: string; value: string | number; trend: string; icon: React.ReactNode; status?: 'success' | 'warning' }) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${status === 'warning' ? 'bg-orange-50 text-orange-600' : status === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
        {icon}
      </div>
      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-black mt-1 text-zinc-900 dark:text-zinc-50">{value}</p>
      <p className="text-xs text-zinc-400 mt-1 font-medium">{trend}</p>
    </div>
  );
}

function MiniCard({ label, value, color }: { label: string; value: number; color: string }) {
  const styles: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-900/20",
    orange: "bg-orange-50 text-orange-700 dark:bg-orange-900/20",
    purple: "bg-purple-50 text-purple-700 dark:bg-purple-900/20",
    indigo: "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20",
    sky: "bg-sky-50 text-sky-700 dark:bg-sky-900/20",
    green: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20",
  };
  return (
    <div className={`p-5 rounded-2xl ${styles[color]}`}>
      <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{label}</p>
      <p className="text-3xl font-black mt-1">{value}</p>
    </div>
  );
}
