"use client";

import { useState, useEffect } from "react";
import { Province } from "@prisma/client";
import { 
  Plus, 
  Search, 
  Filter, 
  DollarSign, 
  FileText, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  X,
  Camera,
  Loader2,
  TrendingUp,
  PieChart
} from "lucide-react";
import { useSimulation } from "@/lib/SimulationContext";

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  status: string;
  province?: string;
  paymentMethod?: string;
  receiptUrl?: string | null;
  createdAt: string;
  case?: { clientName: string; nydaReference: string };
  user: { name: string };
  coordinator?: { name: string } | null;
  dco?: { name: string } | null;
}

const EXPENSE_CATEGORIES = ["ALL", "TRAVEL", "MEALS", "PRINTING", "OFFICE", "ACCOMMODATION", "ENTERTAINMENT", "AIRTIME_DATA"];

export default function ExpensesPage() {
  const { currentPersona } = useSimulation();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetchExpenses();
  }, [currentPersona]);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/expenses");
      if (res.ok) {
        const data = await res.json();
        setExpenses(data);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateExpenseStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchExpenses();
      } else {
        alert("Failed to update status. Only admins can approve expenses.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const pendingCount = expenses.filter(e => e.status === "PENDING").length;

  if (loading) return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">Calculating costs...</p>
    </div>
  );

  return (
    <div className="p-8 space-y-8 bg-zinc-50 dark:bg-zinc-950 min-h-screen">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">Operational Expenses</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">Track travel, printing, and site-visit costs across your province.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl shadow-blue-500/30 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Log New Expense
        </button>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Total Provincial Spend</p>
          <p className="text-4xl font-black text-zinc-900 dark:text-zinc-50">R {totalAmount.toLocaleString("en-ZA")}</p>
          <div className="flex items-center gap-2 mt-4 text-emerald-500 font-bold text-xs">
            <TrendingUp className="w-4 h-4" />
            Within Monthly Budget
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Awaiting Approval</p>
          <p className="text-4xl font-black text-zinc-900 dark:text-zinc-50">{pendingCount}</p>
          <div className="flex items-center gap-2 mt-4 text-amber-500 font-bold text-xs">
            <Clock className="w-4 h-4" />
            Ready for Finance Review
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Top Category</p>
          <p className="text-4xl font-black text-zinc-900 dark:text-zinc-50">Travel</p>
          <div className="flex items-center gap-2 mt-4 text-blue-500 font-bold text-xs">
            <PieChart className="w-4 h-4" />
            42% of total spend
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input 
            placeholder="Search by description or team member..." 
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        <div className="bg-white dark:bg-zinc-900 p-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex gap-2">
          {EXPENSE_CATEGORIES.map(cat => (
            <button 
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === cat ? "bg-zinc-900 text-white" : "text-zinc-400 hover:text-zinc-900"}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-[40px] border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50/50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
              <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Date / Description</th>
              <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Category</th>
              <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Province / Team</th>
              <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Payment</th>
              <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Amount</th>
              <th className="px-8 py-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
            {expenses.filter(e => filter === "ALL" || e.category === filter).map((e) => (
              <tr key={e.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-zinc-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                      {e.category === "TRAVEL" ? <MapPin className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{e.description}</p>
                      <p className="text-xs text-zinc-400 mt-0.5">{new Date(e.createdAt).toLocaleDateString("en-ZA", { dateStyle: "long" })}</p>
                      {e.receiptUrl && (
                        <a href={e.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-blue-600 hover:underline mt-1 inline-block">
                          View Receipt
                        </a>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="text-[10px] font-black px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-lg uppercase">{e.category}</span>
                </td>
                <td className="px-8 py-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-blue-600 uppercase">{e.province?.replace(/_/g, " ") || "—"}</p>
                    <p className="text-xs text-zinc-500">PC: {e.coordinator?.name || "—"}</p>
                    <p className="text-xs text-zinc-500">DCO: {e.dco?.name || "—"}</p>
                    <p className="text-xs text-zinc-400">By: {e.user.name}</p>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="text-[10px] font-black px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-lg uppercase">{e.paymentMethod?.replace(/_/g, " ") || "—"}</span>
                </td>
                <td className="px-8 py-6">
                  <p className="text-sm font-black text-zinc-900 dark:text-zinc-50">R {e.amount.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}</p>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase border ${
                      e.status === "APPROVED" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                      e.status === "REJECTED" ? "bg-red-50 text-red-600 border-red-100" :
                      "bg-amber-50 text-amber-600 border-amber-100"
                    }`}>
                      {e.status}
                    </span>
                    {currentPersona?.role === 'ADMIN_OFFICER' && e.status === 'PENDING' && (
                      <div className="flex items-center gap-1 ml-2">
                        <button 
                          onClick={() => updateExpenseStatus(e.id, 'APPROVED')}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                          title="Approve"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => updateExpenseStatus(e.id, 'REJECTED')}
                          className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Decline"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {expenses.length === 0 && (
              <tr>
                <td colSpan={6} className="py-32 text-center">
                  <DollarSign className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
                  <p className="text-zinc-500 font-medium">No expenses logged yet.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <CreateExpenseModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => { setIsModalOpen(false); fetchExpenses(); }} 
        />
      )}
    </div>
  );
}

function CreateExpenseModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const { currentPersona } = useSimulation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receiptName, setReceiptName] = useState("");
  const [coordinators, setCoordinators] = useState<{ id: string; name: string | null }[]>([]);
  const [dcos, setDcos] = useState<{ id: string; name: string | null }[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>(currentPersona?.province || "LIMPOPO");

  useEffect(() => {
    const loadTeam = async () => {
      const [pcRes, dcoRes] = await Promise.all([
        fetch(`/api/users?role=PROVINCIAL_COORDINATOR&province=${selectedProvince}`),
        fetch(`/api/users?role=DATA_COLLECTION_OFFICER&province=${selectedProvince}`),
      ]);
      if (pcRes.ok) setCoordinators(await pcRes.json());
      if (dcoRes.ok) setDcos(await dcoRes.json());
    };
    void loadTeam();
  }, [selectedProvince]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const receipt = formData.get("receipt") as File | null;
    if (!receipt?.size) {
      alert("Please attach a receipt or proof of payment.");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        onSuccess();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to submit expense.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-lg max-h-[90vh] flex flex-col rounded-[32px] shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200">
        <div className="shrink-0 px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/50">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Log Expense</h2>
            <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest font-bold">Requested by {currentPersona?.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
          <div className="space-y-4 overflow-y-auto p-8">
            <div>
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Province</label>
              <select
                name="province"
                required
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="w-full mt-2 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl px-4 py-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {Object.values(Province).map((p) => (
                  <option key={p} value={p}>{p.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Provincial Coordinator</label>
                <select name="coordinatorId" className="w-full mt-2 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl px-4 py-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="">Select PC...</option>
                  {coordinators.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Data Collection Officer</label>
                <select name="dcoId" className="w-full mt-2 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl px-4 py-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="">Select DCO...</option>
                  {dcos.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Category</label>
              <select name="category" required className="w-full mt-2 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl px-4 py-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="TRAVEL">Travel / Fuel</option>
                <option value="MEALS">Meals / Subsistence</option>
                <option value="PRINTING">Printing / Stationery</option>
                <option value="OFFICE">Office Supplies</option>
                <option value="ACCOMMODATION">Accommodation</option>
                <option value="ENTERTAINMENT">Entertainment</option>
                <option value="AIRTIME_DATA">Airtime / Data</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Method of Payment</label>
              <select name="paymentMethod" required className="w-full mt-2 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl px-4 py-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="CASH">Cash</option>
                <option value="EFT">EFT / Bank Transfer</option>
                <option value="CARD">Personal Card</option>
                <option value="COMPANY_CARD">Company Card</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Amount (ZAR)</label>
              <input name="amount" type="number" step="0.01" required placeholder="0.00" className="w-full mt-2 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl px-4 py-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Description</label>
              <textarea name="description" required placeholder="Describe the reason for this expense..." className="w-full mt-2 bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl px-4 py-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]" />
            </div>
            <div>
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Receipt / Proof of Payment *</label>
              <label className="mt-2 flex flex-col items-center p-6 border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-[24px] text-center group hover:border-blue-500 transition-all cursor-pointer">
                <Camera className="w-8 h-8 text-zinc-200 group-hover:text-blue-500 mb-2 transition-colors" />
                <p className="text-xs font-bold text-zinc-400">{receiptName || "Click to attach receipt (PDF, JPG, PNG)"}</p>
                <input
                  type="file"
                  name="receipt"
                  required
                  accept="image/*,.pdf"
                  className="sr-only"
                  onChange={(ev) => setReceiptName(ev.target.files?.[0]?.name || "")}
                />
              </label>
            </div>
          </div>

          <div className="shrink-0 flex gap-4 px-8 py-5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50">
            <button type="button" onClick={onClose} className="flex-1 py-4 text-sm font-bold text-zinc-500 hover:text-zinc-900">Cancel</button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
              Submit Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
