"use client";

import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from "recharts";

import React, { useState, useEffect } from "react";
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
  Calendar,
  CreditCard
} from "lucide-react";
import { Province, CaseStatus, Role } from "@prisma/client";
import Link from "next/link";
import { useSimulation } from "@/lib/SimulationContext";
import CreateCaseForm from "./CreateCaseForm";
import ProvincialBreakdown from "./ProvincialBreakdown";

interface DashboardStats {
  totalCases: number;
  overdueCount: number;
  approachingSlaCount: number;
  statusCounts: Record<string, number>;
  provinceStats: { province: Province; _count: { id: number } }[];
  recentActivity: any[];
  myTasks: any[];
  metrics: {
    pendingReviews: number;
    pendingDataCollection: number;
    readyForInvoicing: number;
  };
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
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-10 bg-zinc-50 dark:bg-zinc-950 min-h-screen">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-200 dark:border-blue-900/30">
              {role.replace(/_/g, ' ')}
            </span>
            {currentPersona?.province && (
              <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-zinc-200 dark:border-zinc-700">
                {currentPersona.province.replace(/_/g, ' ')}
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            Welcome, {currentPersona?.name || "Administrator"}
          </h1>
          <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400">
            {role === "ADMIN_OFFICER" 
              ? "System-wide overview of all NYDA operations." 
              : role === "NYDA" 
                ? "NYDA Oversight Dashboard - Track submissions and approvals."
                : `Operational dashboard for ${currentPersona?.province?.replace(/_/g, ' ') || 'National'} territory.`}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {(role === "ADMIN_OFFICER" || role === "NYDA") && (
            <CreateCaseForm provinces={Object.values(Province)} />
          )}
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4 flex-1 sm:flex-none">
            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-500 shrink-0">
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
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-[32px] p-5 sm:p-6 text-white shadow-xl shadow-orange-500/20 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 animate-in slide-in-from-top-4 duration-500">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="font-black text-base sm:text-lg">SLA Deadline Approaching</p>
            <p className="text-orange-50 text-xs sm:text-sm opacity-90">{data.approachingSlaCount} cases require immediate action to maintain provincial compliance.</p>
          </div>
          <Link href="/cases" className="w-full sm:w-auto bg-white text-orange-600 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-50 transition-all shadow-lg text-center">
            Take Action
          </Link>
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard title="New Requests" value={data.statusCounts['RECEIVED_FROM_NYDA'] || 0} icon={<Briefcase />} color="blue" />
        <StatCard 
          title={role === 'FINANCE' ? "Ready for Invoicing" : "In Review"} 
          value={role === 'FINANCE' ? data.metrics.readyForInvoicing : data.metrics.pendingReviews} 
          icon={role === 'FINANCE' ? <CreditCard /> : <CheckCircle2 />} 
          color="purple" 
        />
        <StatCard 
          title="Data Collection" 
          value={data.metrics.pendingDataCollection} 
          icon={<MapPin />} 
          color="orange" 
        />
        <StatCard title="Overdue" value={data.overdueCount} icon={<AlertCircle />} color="red" />


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left Column: My Tasks + Distribution */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          {/* Assigned to Me */}
          <div className="bg-white dark:bg-zinc-900 rounded-[32px] sm:rounded-[40px] p-5 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden relative">
            <div className="flex justify-between items-center mb-6 sm:mb-8">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  {role === 'FINANCE' ? 'Billing Queue' : 
                   role === 'REVIEWER' ? 'Pending Reviews' :
                   role === 'NYDA' ? 'Awaiting Final Approval' :
                   'Your Priority Tasks'}
                </h3>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">
                  {role === 'ADMIN_OFFICER' ? 'System-wide critical items' : `Directly Assigned to ${currentPersona?.name}`}
                </p>
              </div>
              <Link href="/cases" className="text-[10px] font-black text-blue-600 hover:underline uppercase tracking-widest">View All</Link>
            </div>
            
            <div className="space-y-3">
              {data.myTasks.map((t) => (
                <Link key={t.id} href={`/cases/${t.id}`} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 hover:border-blue-500 transition-all group gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white dark:bg-zinc-900 rounded-xl sm:rounded-2xl flex items-center justify-center text-zinc-400 group-hover:text-blue-500 transition-colors shrink-0">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-zinc-900 dark:text-zinc-50 truncate">{t.clientName}</p>
                      <p className="text-[11px] sm:text-xs text-zinc-500 truncate">{t.outputType} • {t.province}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <span className="text-[9px] sm:text-[10px] font-black px-2 sm:px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg uppercase whitespace-nowrap">
                      {t.status.replace(/_/g, ' ')}
                    </span>
                    <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              ))}
              {data.myTasks.length === 0 && (
                <div className="text-center py-8 sm:py-12">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-zinc-50 dark:bg-zinc-800 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-zinc-200" />
                  </div>
                  <p className="text-sm text-zinc-500 font-medium">You're all caught up! No tasks assigned.</p>
                </div>
              )}
            </div>
          </div>

          {/* Provincial Breakdown - Detailed for HO/NYDA */}
          {(role === "ADMIN_OFFICER" || role === "NYDA") && (
            <ProvincialBreakdown data={data.provinceStats} />
          )}

          {/* Distribution Map/Chart for others */}
          {role !== "ADMIN_OFFICER" && role !== "NYDA" && (
            <div className="bg-white dark:bg-zinc-900 rounded-[32px] sm:rounded-[40px] p-5 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <h3 className="text-lg sm:text-xl font-black mb-6 sm:mb-8 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-zinc-400" />
                Regional Volume & Status
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Bar Chart for Provinces */}
                <div className="h-64">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center mb-4">Volume by Province</p>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.provinceStats.map(p => ({ name: p.province.replace(/_/g, ' '), count: p._count.id }))}>
                      <XAxis dataKey="name" tick={{fontSize: 10, fill: '#888'}} tickLine={false} axisLine={false} />
                      <RechartsTooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'}} />
                      <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Pie Chart for Statuses */}
                <div className="h-64">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center mb-4">Active Status Distribution</p>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Object.entries(data.statusCounts).map(([key, val]) => ({ name: key.replace(/_/g, ' '), value: val }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {Object.keys(data.statusCounts).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'][index % 5]} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'}} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Global Activity Feed */}
        <div className="bg-white dark:bg-zinc-900 rounded-[32px] sm:rounded-[40px] p-5 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
          <h3 className="text-lg sm:text-xl font-black mb-6 sm:mb-8 flex items-center gap-2 relative">
            <Activity className="w-5 h-5 text-emerald-500" />
            Live Operations
          </h3>
          <div className="space-y-6 sm:space-y-8 relative">
            {data.recentActivity.map((act, i) => (
              <div key={act.id} className="flex gap-4 group">
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-3 h-3 rounded-full mt-1.5 transition-all ${i === 0 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-zinc-200 dark:bg-zinc-800'}`} />
                  {i !== data.recentActivity.length - 1 && <div className="flex-1 w-0.5 bg-zinc-100 dark:bg-zinc-800" />}
                </div>
                <div className="flex-1 pb-6 sm:pb-8 border-b border-zinc-50 dark:border-zinc-800 last:border-0">
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1">
                    {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-sm text-zinc-900 dark:text-zinc-50 leading-relaxed">
                    <span className="font-black text-blue-600 dark:text-blue-400">{act.user?.name || "System"}</span> 
                    {" "}{act.comments.toLowerCase().replace('document uploaded:', 'uploaded')}
                  </p>
                  <p className="text-[9px] sm:text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-2 flex items-center gap-1">
                    <Briefcase className="w-3 h-3" /> {act.case.clientName}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <Link href="/reports" className="w-full mt-4 py-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl text-center text-[10px] sm:text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 transition-all block border border-zinc-100 dark:border-zinc-800">
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
    <div className="bg-white dark:bg-zinc-900 rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-all">
      <div className={`absolute top-0 right-0 w-20 sm:w-24 h-20 sm:h-24 -mr-8 -mt-8 rounded-full opacity-10 ${configs[color]}`} />
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center text-white mb-4 sm:mb-6 shadow-xl ${configs[color]}`}>
        {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "w-5 h-5 sm:w-6 sm:h-6" })}
      </div>
      <div>
        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">{title}</p>
        <p className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-zinc-50">{value}</p>
      </div>
    </div>
  );
}
