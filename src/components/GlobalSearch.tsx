"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Briefcase, Users, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface SearchResult {
  cases: { id: string; clientName: string; nydaReference: string | null; status: string; province: string; outputType: string }[];
  clients: { id: string; name: string; idNumber: string; province: string }[];
}

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.length < 2) {
      setResults(null);
      setIsOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(value)}`);
        const data = await res.json();
        setResults(data);
        setIsOpen(true);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  };

  const navigate = (href: string) => {
    setIsOpen(false);
    setQuery("");
    setResults(null);
    router.push(href);
  };

  const hasResults = results && (results.cases.length > 0 || results.clients.length > 0);

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => results && setIsOpen(true)}
          placeholder="Search cases, clients, references..."
          className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl pl-10 pr-10 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-zinc-400"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 animate-spin" />
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden z-[100] max-h-[400px] overflow-y-auto">
          {!hasResults && !isLoading && (
            <div className="px-5 py-8 text-center text-sm text-zinc-400">
              No results found for "{query}"
            </div>
          )}

          {results?.cases && results.cases.length > 0 && (
            <div>
              <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Briefcase className="w-3 h-3" /> Work Items
                </p>
              </div>
              {results.cases.map((c) => (
                <button
                  key={c.id}
                  onClick={() => navigate(`/cases/${c.id}`)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-left group"
                >
                  <div>
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{c.clientName}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">{c.outputType.replace(/_/g,' ')} • {c.province} • <span className="font-mono">{c.nydaReference || c.id.slice(0,10)}</span></p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold bg-zinc-100 dark:bg-zinc-700 text-zinc-500 px-2 py-0.5 rounded-full">
                      {c.status.replace(/_/g,' ')}
                    </span>
                    <ArrowRight className="w-3 h-3 text-zinc-300 group-hover:text-blue-500 transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {results?.clients && results.clients.length > 0 && (
            <div>
              <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Users className="w-3 h-3" /> Clients
                </p>
              </div>
              {results.clients.map((cl) => (
                <button
                  key={cl.id}
                  onClick={() => navigate(`/clients/${cl.id}`)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-left group"
                >
                  <div>
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{cl.name}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">SA ID: {cl.idNumber} • {cl.province}</p>
                  </div>
                  <ArrowRight className="w-3 h-3 text-zinc-300 group-hover:text-blue-500 transition-colors" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
