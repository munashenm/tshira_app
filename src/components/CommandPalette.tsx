"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Search, 
  Briefcase, 
  Users, 
  Settings, 
  FileText, 
  CreditCard,
  TrendingUp,
  X,
  Command,
  ArrowRight
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  const toggle = useCallback(() => setIsOpen((open) => !open), []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggle();
      }
      if (e.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [toggle]);

  const items = [
    { icon: <Briefcase />, label: "View All Work Items", href: "/cases", category: "Navigation" },
    { icon: <Users />, label: "Client Database", href: "/clients", category: "Navigation" },
    { icon: <CreditCard />, label: "Operational Expenses", href: "/finance/expenses", category: "Navigation" },
    { icon: <TrendingUp />, label: "Management Reports", href: "/reports", category: "Navigation" },
    { icon: <Settings />, label: "System Settings", href: "/settings", category: "Settings" },
    { icon: <FileText />, label: "Create New Case", href: "/cases", action: "OPEN_MODAL", category: "Actions" },
  ].filter(item => item.label.toLowerCase().includes(query.toLowerCase()));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] p-4 bg-zinc-950/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-[32px] shadow-2xl shadow-black/20 border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Search Input */}
        <div className="relative p-6 border-b border-zinc-100 dark:border-zinc-800">
          <Search className="absolute left-10 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input 
            autoFocus
            placeholder="Search cases, clients, or commands... (e.g. 'Expenses')"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-zinc-800/50 border-none rounded-2xl pl-14 pr-12 py-5 text-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
          />
          <div className="absolute right-10 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
            <span className="text-[10px] font-black text-zinc-400">ESC</span>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
          {items.length > 0 ? (
            <div className="space-y-6 pb-4">
              {["Navigation", "Actions", "Settings"].map(category => {
                const categoryItems = items.filter(i => i.category === category);
                if (categoryItems.length === 0) return null;
                
                return (
                  <div key={category} className="space-y-2">
                    <p className="px-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">{category}</p>
                    <div className="space-y-1">
                      {categoryItems.map((item, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            router.push(item.href);
                            setIsOpen(false);
                          }}
                          className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800 group transition-all text-left"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-zinc-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                              {item.icon}
                            </div>
                            <span className="font-bold text-zinc-900 dark:text-zinc-50">{item.label}</span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:translate-x-1 group-hover:text-blue-500 transition-all" />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center">
              <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-800 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Command className="w-8 h-8 text-zinc-200" />
              </div>
              <p className="text-zinc-500 font-medium">No results found for "{query}"</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded text-[10px] font-bold text-zinc-500">↑↓</span>
              <span className="text-[10px] font-bold text-zinc-400 uppercase">Navigate</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded text-[10px] font-bold text-zinc-500">ENTER</span>
              <span className="text-[10px] font-bold text-zinc-400 uppercase">Select</span>
            </div>
          </div>
          <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">TSHIRA COMMAND PALETTE v1.0</p>
        </div>
      </div>
    </div>
  );
}
