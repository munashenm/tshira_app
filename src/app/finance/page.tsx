import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';
import { 
  Receipt, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  FileText,
  TrendingUp,
  ArrowRight
} from "lucide-react";
import { CaseStatus } from "@prisma/client";
import FinanceActions from "@/components/FinanceActions";

export default async function FinancePage() {
  const cases = await prisma.case.findMany({
    where: {
      status: {
        in: ["CLIENT_APPROVED", "READY_FOR_INVOICING", "INVOICED", "PAID", "CLOSED"]
      }
    },
    orderBy: { updatedAt: 'desc' }
  });

  const stats = {
    ready: cases.filter(c => c.status === "CLIENT_APPROVED" || c.status === "READY_FOR_INVOICING").length,
    invoiced: cases.filter(c => c.status === "INVOICED").length,
    paid: cases.filter(c => c.status === "PAID").length,
    totalValue: cases.reduce((acc, curr) => acc + (curr.actualCost || 0), 0)
  };

  return (
    <div className="p-8 space-y-8 bg-zinc-50 dark:bg-zinc-950 min-h-screen">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Invoicing Tracker</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">Monitor approved work and manage payment status.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FinanceStatCard 
          title="Ready to Invoice" 
          value={stats.ready} 
          icon={<Clock className="w-5 h-5" />} 
          color="orange" 
        />
        <FinanceStatCard 
          title="Invoiced (Pending)" 
          value={stats.invoiced} 
          icon={<FileText className="w-5 h-5" />} 
          color="blue" 
        />
        <FinanceStatCard 
          title="Total Paid" 
          value={stats.paid} 
          icon={<CheckCircle2 className="w-5 h-5" />} 
          color="green" 
        />
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/30 dark:bg-zinc-800/20">
          <h3 className="font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-zinc-400" />
            Billing Overview
          </h3>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-100 dark:border-zinc-800">
              <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Beneficiary & Type</th>
              <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Invoice No</th>
              <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Amount (ZAR)</th>
              <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Status</th>
              <th className="px-8 py-5 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {cases.map((c) => (
              <tr key={c.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{c.clientName}</span>
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">{c.outputType.replace(/_/g, ' ')}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  {c.invoiceNumber ? (
                    <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                      {c.invoiceNumber}
                    </span>
                  ) : (
                    <span className="text-xs text-zinc-300 italic">Pending</span>
                  )}
                </td>
                <td className="px-8 py-6">
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                    R {c.actualCost?.toLocaleString(undefined, {minimumFractionDigits: 2}) || '0.00'}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <StatusBadge status={c.status} />
                </td>
                <td className="px-8 py-6 text-right">
                  <FinanceActions caseId={c.id} status={c.status} />
                </td>
              </tr>
            ))}
            {cases.length === 0 && (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center">
                  <Receipt className="w-12 h-12 text-zinc-200 dark:text-zinc-800 mx-auto mb-4" />
                  <p className="text-zinc-500 font-medium">No projects are currently ready for invoicing.</p>
                  <p className="text-xs text-zinc-400 mt-1">Projects will appear here once they are client-approved.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FinanceStatCard({ title, value, icon, color }: { title: string, value: number, icon: React.ReactNode, color: string }) {
  const styles: Record<string, string> = {
    orange: "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    green: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
  };

  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${styles[color]}`}>
        {icon}
      </div>
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{title}</p>
      <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: CaseStatus }) {
  const styles: Record<string, string> = {
    CLIENT_APPROVED: "bg-blue-50 text-blue-600",
    READY_FOR_INVOICING: "bg-orange-50 text-orange-600",
    INVOICED: "bg-purple-50 text-purple-600",
    PAID: "bg-emerald-50 text-emerald-600",
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border border-current/20 ${styles[status] || 'bg-zinc-100'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}
