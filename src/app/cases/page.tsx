"use client";

import { useState, useEffect } from "react";
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  ChevronRight,
  Search,
  CheckSquare,
  Square,
  Users,
  Filter,
  ArrowUpDown,
  Download,
  Loader2,
  CheckCircle2,
  FileText
} from "lucide-react";
import Link from "next/link";
import { CaseStatus, Province, User, Role } from "@prisma/client";
import BulkAssignmentModal from "@/components/BulkAssignmentModal";
import CreateCaseForm from "@/components/CreateCaseForm";
import { getClientActor } from "@/lib/client-auth";
import { useSimulation } from "@/lib/SimulationContext";

type CaseWithRelations = any; // We'll fetch client-side for interactivity

export default function CasesPage() {
  const [cases, setCases] = useState<CaseWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [provinceFilter, setProvinceFilter] = useState<Province | "ALL">("ALL");
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const { currentPersona } = useSimulation();
  
  const isAdmin = currentPersona?.role === Role.ADMIN_OFFICER;

  useEffect(() => {
    fetchCases();
  }, []);

  const exportToPDF = async () => {
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");
      
      const doc = new jsPDF("l", "pt", "a4");
      doc.setFontSize(16);
      doc.text("Tshira Workflow Management - Cases Export", 40, 40);
      doc.setFontSize(10);
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, 40, 55);
      
      const headers = [
        ['NYDA Reference', 'Client Name', 'Output Type', 'Province', 'Status', 'Coordinator']
      ];
      
      const rows = filteredCases.map(c => [
        c.nydaReference || 'N/A',
        c.clientName,
        c.outputType,
        c.province.replace('_', ' '),
        c.status.replace(/_/g, ' '),
        c.coordinator?.name || 'Unassigned'
      ]);
      
      autoTable(doc, {
        head: headers,
        body: rows,
        startY: 70,
        theme: "striped",
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] }
      });
      
      doc.save(`tshira-cases-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Failed to export PDF.");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      // Basic CSV Parser: NYDA Reference, Client Name, Province, Output Type
      const lines = text.split('\n').filter(line => line.trim().length > 0);
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const cases = lines.slice(1).map(line => {
        const values = line.split(',');
        return {
          nydaReference: values[0]?.trim(),
          clientName: values[1]?.trim(),
          province: values[2]?.trim().toUpperCase(),
          outputType: values[3]?.trim()
        };
      });

      const res = await fetch("/api/cases/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cases }),
      });

      if (res.ok) {
        alert(`Successfully imported ${cases.length} cases!`);
        await fetchCases();
      } else {
        alert("Failed to import cases. Ensure the CSV matches: Reference,Client Name,Province,Output Type");
      }
    } catch (err) {
      console.error(err);
      alert("Error parsing CSV");
    } finally {
      setIsImporting(false);
      e.target.value = ''; // Reset input
    }
  };

  const fetchCases = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cases");
      if (res.ok) {
        const data = await res.json();
        setCases(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredCases = cases.filter(c => {
    const matchesSearch = 
      c.clientName.toLowerCase().includes(search.toLowerCase()) ||
      (c.nydaReference?.toLowerCase().includes(search.toLowerCase()));
    const matchesProvince = provinceFilter === "ALL" || c.province === provinceFilter;
    return matchesSearch && matchesProvince;
  });

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredCases.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCases.map(c => c.id));
    }
  };

  if (loading) return (
    <div className="p-8 flex flex-col items-center justify-center min-h-screen gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">Loading Projects...</p>
    </div>
  );

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 bg-zinc-50 dark:bg-zinc-950 min-h-screen relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Workflow Tasks</h1>
          <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 mt-2">Manage and track {cases.length} NYDA projects across South Africa.</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
          {isAdmin && (
            <>
              <CreateCaseForm provinces={Object.values(Province)} />
              <button 
                onClick={() => document.getElementById("csv-upload")?.click()}
                disabled={isImporting}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
              >
                {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
                {isImporting ? "Importing..." : "Import Batch"}
              </button>
              <input 
                id="csv-upload" 
                type="file" 
                accept=".csv" 
                className="hidden" 
                onChange={handleFileUpload} 
              />
            </>
          )}
          <a href="/api/export/cases" className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all">
            <Download className="w-4 h-4" /> Export CSV
          </a>
          <button onClick={exportToPDF} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all cursor-pointer">
            <FileText className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input 
            placeholder="Search by client or reference..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none shadow-sm"
          />
        </div>
        <div className="flex gap-2 bg-white dark:bg-zinc-900 p-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setProvinceFilter("ALL")}
            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap ${provinceFilter === "ALL" ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-zinc-400 hover:text-zinc-900'}`}
          >
            All
          </button>
          {Object.values(Province).map((p) => (
            <button 
              key={p}
              onClick={() => setProvinceFilter(p)}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap ${provinceFilter === p ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-zinc-400 hover:text-zinc-900'}`}
            >
              {p.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-50 bg-zinc-900 text-white px-6 sm:px-8 py-4 rounded-[28px] sm:rounded-[32px] shadow-2xl flex flex-col sm:flex-row items-center gap-4 sm:gap-8 animate-in slide-in-from-bottom-8 duration-300">
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
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white text-zinc-900 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-zinc-100 transition-all active:scale-95"
            >
              <Users className="w-4 h-4" /> Bulk Assign
            </button>
            <button 
              onClick={() => setSelectedIds([])}
              className="flex-1 sm:flex-none text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-white px-4 py-2.5 rounded-2xl transition-all text-center"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:gap-4">
        {/* Select All Toggle */}
        <div className="flex items-center gap-4 px-4 sm:px-6 py-1">
          <button 
            onClick={toggleSelectAll}
            className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
          >
            {selectedIds.length === filteredCases.length && filteredCases.length > 0 ? (
              <CheckSquare className="w-4 h-4 text-blue-500" />
            ) : (
              <Square className="w-4 h-4" />
            )}
            Select All
          </button>
        </div>

        {filteredCases.map((c) => (
          <div 
            key={c.id} 
            className={`group bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border transition-all flex items-start sm:items-center gap-3 sm:gap-4 ${
              selectedIds.includes(c.id) 
                ? "border-blue-500 ring-2 ring-blue-50 dark:ring-blue-900/10 shadow-lg" 
                : "border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md"
            }`}
          >
            <button 
              onClick={() => toggleSelect(c.id)}
              className="shrink-0 p-1.5 sm:p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition-all mt-1 sm:mt-0"
            >
              {selectedIds.includes(c.id) ? (
                <CheckSquare className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              ) : (
                <Square className="w-5 h-5 sm:w-6 sm:h-6 text-zinc-200 dark:text-zinc-800" />
              )}
            </button>
            
            <Link href={`/cases/${c.id}`} className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className={`hidden sm:flex w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-[22px] items-center justify-center transition-colors shrink-0 ${
                  selectedIds.includes(c.id) ? "bg-blue-600 text-white" : "bg-zinc-50 dark:bg-zinc-800 text-zinc-400 group-hover:bg-zinc-100 dark:group-hover:bg-zinc-700"
                }`}>
                  <Briefcase className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                    <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-50 truncate">{c.clientName}</h3>
                    <span className="w-fit text-[9px] font-black tracking-widest uppercase text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-lg border border-zinc-200 dark:border-zinc-700">
                      {c.nydaReference || "NO REF"}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-[11px] sm:text-xs font-medium text-zinc-500">
                    <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800/50 px-2 py-0.5 sm:py-1 rounded-lg">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                      {c.province.replace('_', ' ')}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="hidden sm:inline">Received: </span>{new Date(c.createdAt).toLocaleDateString('en-ZA', { dateStyle: 'medium' })}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className={`w-3.5 h-3.5 ${c.coordinatorId ? 'text-emerald-500' : 'text-zinc-200'}`} />
                      <span className="truncate max-w-[80px] sm:max-w-none">{c.coordinator?.name || "Unassigned"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-10">
                <div className="text-left sm:text-right">
                  <div className="text-[9px] sm:text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1 sm:mb-2">Status</div>
                  <StatusBadge status={c.status} />
                </div>
                <div className="text-right hidden sm:block md:hidden lg:block min-w-[140px]">
                  <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Project Type</div>
                  <div className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{c.outputType.replace(/_/g, ' ')}</div>
                </div>
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-zinc-200 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          </div>
        ))}

        {filteredCases.length === 0 && (
          <div className="text-center py-32 bg-white dark:bg-zinc-900 rounded-[40px] border-2 border-dashed border-zinc-200 dark:border-zinc-800">
            <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-800 rounded-[32px] flex items-center justify-center mx-auto mb-6">
              <Filter className="w-10 h-10 text-zinc-200 dark:text-zinc-700" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">No matches found</h3>
            <p className="text-zinc-500 mt-2">Try adjusting your filters or search terms.</p>
            <button onClick={() => { setSearch(""); setProvinceFilter("ALL"); }} className="mt-6 text-blue-600 font-bold hover:underline">Clear all filters</button>
          </div>
        )}
      </div>

      {showBulkModal && (
        <BulkAssignmentModal 
          caseIds={selectedIds}
          onClose={() => setShowBulkModal(false)}
          onSuccess={() => {
            fetchCases();
            setSelectedIds([]);
          }}
        />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: CaseStatus }) {
  const isActionNeeded = status.includes('RETURNED') || status === 'RECEIVED_FROM_NYDA';
  const isDone = status === 'CLOSED' || status === 'PAID';

  return (
    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase border ${
      isActionNeeded ? "bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-900/30" :
      isDone ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30" :
      "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30"
    }`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}
