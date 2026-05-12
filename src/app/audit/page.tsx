"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, History, Search, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

type AuditEntry = {
  id: string;
  createdAt: string;
  status: string;
  comments: string | null;
  user: { name: string | null; role: string } | null;
  case: { clientName: string; nydaReference: string | null };
};

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/audit?limit=200")
      .then(r => r.json())
      .then(data => {
        setLogs(data);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  const filteredLogs = logs.filter(log => 
    log.case.clientName.toLowerCase().includes(search.toLowerCase()) || 
    (log.user?.name || '').toLowerCase().includes(search.toLowerCase()) ||
    log.status.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-8 space-y-8 bg-zinc-50 dark:bg-zinc-950 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Audit Trail</h1>
          </div>
          <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400">
            Immutable log of all system status changes, approvals, and workflow progressions.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col h-[75vh]">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              placeholder="Search by client, user, or status..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-indigo-500">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Loading immutable ledger...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-400">
              <History className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-medium">No audit logs found matching your criteria.</p>
            </div>
          ) : (
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-200 dark:before:via-zinc-800 before:to-transparent">
              {filteredLogs.map((log, i) => (
                <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  {/* Icon */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-zinc-900 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <History className="w-4 h-4" />
                  </div>
                  {/* Card */}
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        {format(new Date(log.createdAt), "MMM d, yyyy • HH:mm:ss")}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                        {log.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-1">
                      <span className="text-indigo-600 dark:text-indigo-400">{log.user?.name || 'System'}</span> updated status to {log.status.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-zinc-500 mb-2">
                      For Case: <Link href={`#`} className="font-medium hover:underline">{log.case.clientName}</Link>
                    </p>
                    {log.comments && (
                      <div className="bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded-lg text-xs italic text-zinc-600 dark:text-zinc-400 border-l-2 border-zinc-200 dark:border-zinc-700">
                        "{log.comments}"
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
