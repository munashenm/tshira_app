"use client";

import { useState } from "react";
import { Users, Briefcase, MapPin, Search, AlertCircle, Clock, Square, CheckSquare, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import BulkAssignmentModal from "@/components/BulkAssignmentModal";
import { Province, Role } from "@prisma/client";

export default function AllocationClient({ initialCases, users }: { initialCases: any[], users: any[] }) {
  const [cases, setCases] = useState(initialCases);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [filterType, setFilterType] = useState<"ALL" | "UNASSIGNED">("UNASSIGNED");

  const unassignedCases = cases.filter(c => 
    !c.coordinatorId || 
    (!c.dcoId && c.status !== "RECEIVED_FROM_NYDA") || 
    (!c.consultantId && c.status === "ASSIGNED_TO_CONSULTANT") ||
    (!c.reviewerId && c.status === "SUBMITTED_FOR_REVIEW")
  );

  const filteredCases = (filterType === "UNASSIGNED" ? unassignedCases : cases).filter(c => 
    c.clientName.toLowerCase().includes(search.toLowerCase()) || 
    c.nydaReference?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredCases.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCases.map(c => c.id));
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 bg-zinc-50 dark:bg-zinc-950 min-h-screen relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Work Allocation</h1>
          <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 mt-2">Manage workloads and assign tasks to team members.</p>
        </div>
        <div className="flex bg-white dark:bg-zinc-900 p-1 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <button 
            onClick={() => setFilterType("UNASSIGNED")}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${filterType === "UNASSIGNED" ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' : 'text-zinc-500 hover:text-zinc-900'}`}
          >
            Needs Allocation ({unassignedCases.length})
          </button>
          <button 
            onClick={() => setFilterType("ALL")}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${filterType === "ALL" ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50' : 'text-zinc-500 hover:text-zinc-900'}`}
          >
            All Work ({cases.length})
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input 
            placeholder="Search cases..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none shadow-sm"
          />
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-50 bg-zinc-900 text-white px-6 sm:px-8 py-4 rounded-[32px] shadow-2xl flex flex-col sm:flex-row items-center gap-4 sm:gap-8 animate-in slide-in-from-bottom-8 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {selectedIds.length}
            </div>
            <p className="text-sm font-bold">Items Selected</p>
          </div>
          <div className="hidden sm:block h-6 w-px bg-zinc-700" />
          <div className="flex gap-3 w-full sm:w-auto">
            <button 
              onClick={() => setShowBulkModal(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white text-zinc-900 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-zinc-100 transition-all"
            >
              <Users className="w-4 h-4" /> Assign Selected
            </button>
            <button 
              onClick={() => setSelectedIds([])}
              className="flex-1 sm:flex-none text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-white px-4 py-2.5 rounded-2xl transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        {filteredCases.length > 0 && (
          <div className="flex items-center gap-4 px-6 py-1">
            <button onClick={toggleSelectAll} className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-zinc-900 transition-colors">
              {selectedIds.length === filteredCases.length ? <CheckSquare className="w-4 h-4 text-blue-500" /> : <Square className="w-4 h-4" />}
              Select All
            </button>
          </div>
        )}

        {filteredCases.map(c => (
          <div key={c.id} className={`bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-6 border transition-all flex items-start gap-4 ${selectedIds.includes(c.id) ? "border-blue-500 shadow-md ring-2 ring-blue-50 dark:ring-blue-900/20" : "border-zinc-200 dark:border-zinc-800 shadow-sm"}`}>
            <button onClick={() => toggleSelect(c.id)} className="mt-1">
              {selectedIds.includes(c.id) ? <CheckSquare className="w-6 h-6 text-blue-600" /> : <Square className="w-6 h-6 text-zinc-200 dark:text-zinc-700" />}
            </button>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <Link href={`/cases/${c.id}`} className="text-lg font-bold hover:text-blue-600 transition-colors">
                    {c.clientName}
                  </Link>
                  <p className="text-xs text-zinc-500 mt-1 flex items-center gap-2">
                    <MapPin className="w-3 h-3" /> {c.province.replace('_', ' ')} • {c.outputType.replace(/_/g, ' ')}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-500">
                    {c.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <AllocationStatus role="Coordinator" user={c.coordinator} />
                <AllocationStatus role="DCO" user={c.dco} />
                <AllocationStatus role="Consultant" user={c.consultant} />
                <AllocationStatus role="Reviewer" user={c.reviewer} />
              </div>
            </div>
          </div>
        ))}

        {filteredCases.length === 0 && (
          <div className="text-center py-24 bg-white dark:bg-zinc-900 rounded-[40px] border-2 border-dashed border-zinc-200 dark:border-zinc-800">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold">All caught up!</h3>
            <p className="text-zinc-500 mt-2">No cases match your current filters.</p>
          </div>
        )}
      </div>

      {showBulkModal && (
        <BulkAssignmentModal 
          caseIds={selectedIds}
          onClose={() => setShowBulkModal(false)}
          onSuccess={() => {
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}

function AllocationStatus({ role, user }: { role: string, user: any }) {
  return (
    <div>
      <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{role}</p>
      {user ? (
        <p className="text-xs font-bold text-zinc-900 dark:text-zinc-50 mt-1 truncate">{user.name}</p>
      ) : (
        <p className="text-xs font-medium text-orange-500 mt-1 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> Unassigned
        </p>
      )}
    </div>
  );
}
