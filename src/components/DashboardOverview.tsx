"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  MapPin,
  FileText,
  Activity,
  ChevronRight,
  TrendingUp,
  Loader2,
  Calendar
} from "lucide-react";
import { Province, CaseStatus, Role } from "@prisma/client";
import Link from "next/link";
import { useSimulation } from "@/lib/SimulationContext";
import CreateCaseForm from "./CreateCaseForm";

interface DashboardStats {
  totalCases: number;
  overdueCount: number;
  approachingSlaCount: number;
  statusCounts: Record<string, number>;
  provinceStats: { province: Province; _count: { id: number } }[];
  recentActivity: any[];
  myTasks: any[];
}

export default function DashboardOverview() {
  const { currentPersona } = useSimulation();
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [currentPersona]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const roleQuery = currentPersona ? `?role=${currentPersona.role}&userId=${currentPersona.id}&province=${currentPersona.province || ''}` : '';
      const res = await fetch(`/api/dashboard${roleQuery}`);
      if (res.ok) {
        const d = await res.json();
        setData(d);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">Analytics incoming...</p>
    </div>
  );

  const role = currentPersona?.role || "ADMIN_OFFICER";

  return (
    <div className="p-8 space-y-10 bg-zinc-50 dark:bg-zinc-950 min-h-screen">
      {/* Welcome Section */}
      <div className="flex justify-between items-end flex-wrap gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-200 dark:border-blue-900/30">
              {role.replace(/_/g, ' ')}
            </span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            Welcome, {currentPersona?.name || "Administrator"}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            {role === "ADMIN_OFFICER" 
              ? "System-wide overview of all NYDA operations." 
              : `Operational dashboard for ${currentPersona?.province?.replace(/_/g, ' ') || 'National'} territory.`}
          </p>
        </div>
        <div className="flex gap-3">
          <CreateCaseForm provinces={Object.values(Province)} />
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-500">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Active Projects</p>
              <p className="text-xl font-black text-zinc-900 dark:text-zinc-50">{data.totalCases}</p>
            </div>
          </div>
        </div>
      </div>

      {/* SLA Alerts */}
      {data.approachingSlaCount > 0 && (
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-[32px] p-6 text-white shadow-xl shadow-orange-500/20 flex items-center gap-6 animate-in slide-in-from-top-4 duration-500">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="font-black text-lg">SLA Deadline Approaching</p>
            <p className="text-orange-50 text-sm opacity-90">{data.approachingSlaCount} cases require immediate action to maintain provincial compliance.</p>
          </div>
          <Link href="/cases" className="bg-white text-orange-600 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-50 transition-all shadow-lg">
            Take Action
          </Link>
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="New Requests" value={data.statusCounts['RECEIVED_FROM_NYDA'] || 0} icon={<Briefcase />} color="blue" />
        <StatCard title="In Fieldwork" value={(data.statusCounts['DATA_COLLECTION_IN_PROGRESS'] || 0) + (data.statusCounts['DATA_SUBMITTED'] || 0)} icon={<MapPin />} color="orange" />
        <StatCard title="In Review" value={data.statusCounts['PROVINCIAL_QUALITY_CHECK'] || 0} icon={<CheckCircle2 />} color="purple" />
        <StatCard title="Overdue" value={data.overdueCount} icon={<AlertCircle />} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: My Tasks + Distribution */}
        <div className="lg:col-span-2 space-y-8">
          {/* Assigned to Me */}
          <div className="bg-white dark:bg-zinc-900 rounded-[40px] p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden relative">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  Your Priority Tasks
                </h3>
                <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">Directly Assigned to {currentPersona?.name}</p>
              </div>
              <Link href="/cases" className="text-xs font-black text-blue-600 hover:underline uppercase tracking-widest">View All</Link>
            </div>
            
            <div className="space-y-3">
              {data.myTasks.map((t) => (
                <Link key={t.id} href={`/cases/${t.id}`} className="flex items-center justify-between p-5 rounded-3xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 hover:border-blue-500 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white dark:bg-zinc-900 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:text-blue-500 transition-colors">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-zinc-900 dark:text-zinc-50">{t.clientName}</p>
                      <p className="text-xs text-zinc-500">{t.outputType} • {t.province}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg uppercase">
                      {t.status.replace(/_/g, ' ')}
                    </span>
                    <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              ))}
              {data.myTasks.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-800 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-zinc-200" />
                  </div>
                  <p className="text-sm text-zinc-500 font-medium">You're all caught up! No tasks assigned.</p>
                </div>
              )}
            </div>
          </div>

          {/* Distribution Map/Chart */}
          <div className="bg-white dark:bg-zinc-900 rounded-[40px] p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
             <h3 className="text-xl font-black mb-8 flex items-center gap-2">
               <MapPin className="w-5 h-5 text-zinc-400" />
               Regional Volume
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                {data.provinceStats.map(ps => {
                  const pct = Math.round((ps._count.id / data.totalCases) * 100);
                  return (
                    <div key={ps.province} className="space-y-2">
                      <div className="flex justify-between text-xs font-black text-zinc-400 uppercase tracking-widest">
                        <span>{ps.province.replace('_', ' ')}</span>
                        <span>{ps._count.id}</span>
                      </div>
                      <div className="h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
             </div>
          </div>
        </div>

        {/* Right Column: Global Activity Feed */}
        <div className="bg-white dark:bg-zinc-900 rounded-[40px] p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
          <h3 className="text-xl font-black mb-8 flex items-center gap-2 relative">
            <Activity className="w-5 h-5 text-emerald-500" />
            Live Operations
          </h3>
          <div className="space-y-8 relative">
            {data.recentActivity.map((act, i) => (
              <div key={act.id} className="flex gap-4 group">
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-3 h-3 rounded-full mt-1.5 transition-all ${i === 0 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-zinc-200 dark:bg-zinc-800'}`} />
                  {i !== data.recentActivity.length - 1 && <div className="flex-1 w-0.5 bg-zinc-100 dark:bg-zinc-800" />}
                </div>
                <div className="flex-1 pb-8 border-b border-zinc-50 dark:border-zinc-800 last:border-0">
                  <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mb-1">
                    {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-sm text-zinc-900 dark:text-zinc-50 leading-relaxed">
                    <span className="font-black text-blue-600 dark:text-blue-400">{act.user?.name || "System"}</span> 
                    {" "}{act.comments.toLowerCase().replace('document uploaded:', 'uploaded')}
                  </p>
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-2 flex items-center gap-1">
                    <Briefcase className="w-3 h-3" /> {act.case.clientName}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <Link href="/reports" className="w-full mt-4 py-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl text-center text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-all block border border-zinc-100 dark:border-zinc-800">
            View Analytics Report
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string, value: number, icon: React.ReactNode, color: "blue" | "orange" | "purple" | "red" }) {
  const configs = {
    blue: "bg-blue-500 shadow-blue-500/20",
    orange: "bg-orange-500 shadow-orange-500/20",
    purple: "bg-purple-500 shadow-purple-500/20",
    red: "bg-red-500 shadow-red-500/20"
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-all">
      <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 ${configs[color]}`} />
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl ${configs[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-1">{title}</p>
        <p className="text-4xl font-black text-zinc-900 dark:text-zinc-50">{value}</p>
      </div>
    </div>
  );
}
