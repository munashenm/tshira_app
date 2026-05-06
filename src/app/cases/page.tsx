import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  ChevronRight,
  Filter,
  Search
} from "lucide-react";
import Link from "next/link";
import { CaseStatus, Province } from "@prisma/client";

export default async function CasesPage({
  searchParams,
}: {
  searchParams: { province?: string };
}) {
  const selectedProvince = searchParams.province as Province | undefined;
  
  const cases = await prisma.case.findMany({
    where: selectedProvince ? { province: selectedProvince } : {},
    orderBy: { createdAt: 'desc' },
    include: {
      coordinator: true,
      dco: true,
      consultant: true,
      reviewer: true
    }
  });

  return (
    <div className="p-8 space-y-8 bg-zinc-50 dark:bg-zinc-950 min-h-screen">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Work Items</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">Manage and track NYDA projects across all provinces.</p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input 
            placeholder="Search by client or reference..." 
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
          />
        </div>
        <div className="flex gap-2 bg-white dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <a 
            href="/cases"
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${!selectedProvince ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50' : 'text-zinc-500 hover:text-zinc-700'}`}
          >
            All
          </a>
          {Object.values(Province).map((p) => (
            <a 
              key={p}
              href={`/cases?province=${p}`}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${selectedProvince === p ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50' : 'text-zinc-500 hover:text-zinc-700'}`}
            >
              {p.slice(0, 3)}
            </a>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {cases.map((c) => (
          <Link 
            key={c.id} 
            href={`/cases/${c.id}`}
            className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900/50 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-500 transition-colors">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-zinc-900 dark:text-zinc-50">{c.clientName}</h3>
                    <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                      {c.nydaReference || "NO REF"}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-zinc-500">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {c.province}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(c.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-right hidden md:block">
                  <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Status</div>
                  <StatusBadge status={c.status} />
                </div>
                <div className="text-right hidden lg:block min-w-[120px]">
                  <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Type</div>
                  <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{c.outputType.replace('_', ' ')}</div>
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </Link>
        ))}
        {cases.length === 0 && (
          <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
            <Briefcase className="w-12 h-12 text-zinc-200 dark:text-zinc-800 mx-auto mb-4" />
            <p className="text-zinc-500">No work items found for this selection.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: CaseStatus }) {
  // Simple mapping for demo
  const isActionNeeded = status.includes('RETURNED') || status === 'RECEIVED_FROM_NYDA';
  const isDone = status === 'CLOSED' || status === 'PAID';

  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
      isActionNeeded ? "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400" :
      isDone ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400" :
      "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
    }`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}
