import { prisma } from "@/lib/db";
import { Receipt, TrendingDown, AlertCircle, CheckCircle2, Clock } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function ExpensesPage() {
  const [cases, requisitions] = await Promise.all([
    prisma.case.findMany({
      where: { actualCost: { not: null } },
      orderBy: { invoiceDate: 'desc' },
      select: {
        id: true,
        clientName: true,
        nydaReference: true,
        outputType: true,
        province: true,
        actualCost: true,
        invoiceNumber: true,
        invoiceDate: true,
        status: true,
        paymentStatus: true,
      }
    }),
    prisma.requisition.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true } } }
    })
  ]);

  const totalInvoiced = cases.reduce((sum, c) => sum + (c.actualCost || 0), 0);
  const totalRequisitions = requisitions.reduce((sum, r) => sum + (r.estimatedCost || 0), 0);
  const paidCases = cases.filter(c => c.status === "PAID" || c.status === "CLOSED");
  const totalCollected = paidCases.reduce((sum, c) => sum + (c.actualCost || 0), 0);
  const outstanding = totalInvoiced - totalCollected;

  return (
    <div className="p-8 space-y-8 bg-zinc-50 dark:bg-zinc-950 min-h-screen">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Expenses & Revenue</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">Complete financial overview — invoiced work, operational costs, and collections.</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Invoiced" value={`R ${totalInvoiced.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} icon={<Receipt className="w-5 h-5" />} color="blue" />
        <StatCard title="Collected" value={`R ${totalCollected.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} icon={<CheckCircle2 className="w-5 h-5" />} color="green" />
        <StatCard title="Outstanding" value={`R ${outstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} icon={<AlertCircle className="w-5 h-5" />} color="orange" />
        <StatCard title="Operational Costs" value={`R ${totalRequisitions.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} icon={<TrendingDown className="w-5 h-5" />} color="red" />
      </div>

      {/* Invoice Records */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-800/20">
          <h3 className="font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-blue-500" />
            Project Revenue
          </h3>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-zinc-100 dark:border-zinc-800">
              <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Client / Project</th>
              <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Invoice No</th>
              <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Invoice Date</th>
              <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Amount (ZAR)</th>
              <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {cases.map((c) => (
              <tr key={c.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                <td className="px-8 py-5">
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{c.clientName}</p>
                  <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider mt-0.5">{c.outputType.replace(/_/g, ' ')} • {c.province}</p>
                </td>
                <td className="px-8 py-5">
                  <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                    {c.invoiceNumber || "—"}
                  </span>
                </td>
                <td className="px-8 py-5 text-sm text-zinc-500">
                  {c.invoiceDate ? new Date(c.invoiceDate).toLocaleDateString() : "—"}
                </td>
                <td className="px-8 py-5">
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                    R {c.actualCost?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <PaymentBadge status={c.status} />
                </td>
              </tr>
            ))}
            {cases.length === 0 && (
              <tr>
                <td colSpan={5} className="px-8 py-16 text-center text-zinc-400 text-sm">
                  No invoiced projects yet. Generate invoices from the Finance tab.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Operational Expenses (Requisitions) */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-800/20">
          <h3 className="font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-red-500" />
            Operational Expenses (Requisitions)
          </h3>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-zinc-100 dark:border-zinc-800">
              <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Purpose</th>
              <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Requested By</th>
              <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Province</th>
              <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Date</th>
              <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Est. Cost</th>
              <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {requisitions.map((r) => (
              <tr key={r.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                <td className="px-8 py-5">
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{r.purpose}</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">{r.location}</p>
                </td>
                <td className="px-8 py-5 text-sm text-zinc-600 dark:text-zinc-400">{r.user.name}</td>
                <td className="px-8 py-5 text-sm text-zinc-600 dark:text-zinc-400">{r.province}</td>
                <td className="px-8 py-5 text-sm text-zinc-500">{new Date(r.dateTime).toLocaleDateString()}</td>
                <td className="px-8 py-5">
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                    {r.estimatedCost ? `R ${r.estimatedCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "—"}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <ReqBadge status={r.status} />
                </td>
              </tr>
            ))}
            {requisitions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-8 py-16 text-center text-zinc-400 text-sm">
                  No requisitions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: string; icon: React.ReactNode; color: string }) {
  const styles: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    green: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
    orange: "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
    red: "bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400",
  };
  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${styles[color]}`}>
        {icon}
      </div>
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{title}</p>
      <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">{value}</p>
    </div>
  );
}

function PaymentBadge({ status }: { status: string }) {
  const isPaid = status === "PAID" || status === "CLOSED";
  const isInvoiced = status === "INVOICED";
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
      isPaid ? "bg-emerald-50 text-emerald-600" : isInvoiced ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"
    }`}>
      {isPaid ? "Collected" : isInvoiced ? "Invoiced" : status.replace(/_/g, ' ')}
    </span>
  );
}

function ReqBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    APPROVED: "bg-emerald-50 text-emerald-600",
    COMPLETED: "bg-blue-50 text-blue-600",
    REJECTED: "bg-red-50 text-red-500",
    SUBMITTED: "bg-orange-50 text-orange-600",
    DRAFT: "bg-zinc-100 text-zinc-500",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles[status] || "bg-zinc-100 text-zinc-500"}`}>
      {status}
    </span>
  );
}
