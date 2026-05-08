"use client";

import { Province, CaseStatus } from "@prisma/client";
import { MapPin, ChevronRight, Briefcase } from "lucide-react";
import Link from "next/link";

interface ProvinceData {
  province: Province;
  count: number;
  statusBreakdown: Record<string, number>;
}

export default function ProvincialBreakdown({ data }: { data: any[] }) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-[32px] sm:rounded-[40px] p-5 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
      <div className="flex justify-between items-center mb-6 sm:mb-8">
        <div>
          <h3 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-500" />
            Provincial Pipeline
          </h3>
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">Live status across all regions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.values(Province).map((prov) => {
          const provStats = data.find((ps: any) => ps.province === prov);
          const count = provStats?._count?.id || 0;
          
          return (
            <div key={prov} className="p-5 rounded-3xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 group hover:border-blue-500 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-white dark:bg-zinc-900 w-10 h-10 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:text-blue-500 transition-colors shadow-sm">
                  <MapPin className="w-5 h-5" />
                </div>
                <span className="text-xl font-black text-zinc-900 dark:text-zinc-50">{count}</span>
              </div>
              <p className="font-bold text-sm text-zinc-900 dark:text-zinc-50 mb-1">{prov.replace(/_/g, ' ')}</p>
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Total Active Cases</p>
                <Link href={`/cases?province=${prov}`} className="text-blue-600 hover:underline">
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              
              {count > 0 && (
                <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                   <div className="flex justify-between text-[9px] font-black text-zinc-400 uppercase">
                     <span>Data Collection</span>
                     <span className="text-orange-500">Active</span>
                   </div>
                   <div className="h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '60%' }} />
                   </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
