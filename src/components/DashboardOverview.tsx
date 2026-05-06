import { prisma } from "@/lib/db";
import { 
  Users, 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  MapPin,
  FileText
} from "lucide-react";
import CreateCaseForm from "./CreateCaseForm";
import { Province } from "@prisma/client";
import Link from "next/link";

export default async function DashboardOverview() {
  const stats = await prisma.case.groupBy({
    by: ['status'],
    _count: {
      id: true
    }
  });

  const provinceStats = await prisma.case.groupBy({
    by: ['province'],
    _count: {
      id: true
    }
  });

  const totalCases = await prisma.case.count();
  
  const recentCases = await prisma.case.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { dco: true }
  });
  
  // Mapping statuses to simplified categories
  const statusCounts = stats.reduce((acc, curr) => {
    acc[curr.status] = curr._count.id;
    return acc;
  }, {} as Record<string, number>);

  const overdueCount = await prisma.case.count({
    where: {
      slaDeadline: { lt: new Date() },
      status: { notIn: ['CLOSED', 'PAID'] }
    }
  });

  const pendingCollection = (statusCounts['ASSIGNED_FOR_DATA_COLLECTION'] || 0) + (statusCounts['DATA_COLLECTION_IN_PROGRESS'] || 0);
  const pendingReview = (statusCounts['PROVINCIAL_QUALITY_CHECK'] || 0) + (statusCounts['SUBMITTED_FOR_REVIEW'] || 0);

  return (
    <div className="p-8 space-y-8 bg-zinc-50 dark:bg-zinc-950 min-h-screen">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Operations Dashboard</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">Real-time overview of NYDA workflow across 6 provinces.</p>
        </div>
        <div className="flex items-center gap-4">
          <CreateCaseForm provinces={Object.values(Province)} />
          <div className="bg-white dark:bg-zinc-900 px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm h-fit">
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Work Items: </span>
            <span className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{totalCases}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard 
          title="Received Work" 
          value={statusCounts['RECEIVED_FROM_NYDA'] || 0} 
          icon={<Briefcase className="w-5 h-5" />}
          color="blue"
        />
        <StatCard 
          title="Data Collection" 
          value={pendingCollection} 
          icon={<Clock className="w-5 h-5" />}
          color="orange"
        />
        <StatCard 
          title="Quality Review" 
          value={pendingReview} 
          icon={<AlertCircle className="w-5 h-5" />}
          color="purple"
        />
        <StatCard 
          title="Ready for Invoice" 
          value={statusCounts['CLIENT_APPROVED'] || 0} 
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="green"
        />
        <StatCard 
          title="Overdue (SLA)" 
          value={overdueCount} 
          icon={<AlertCircle className="w-5 h-5" />}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Province Breakdown */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-zinc-400" />
            Provincial Distribution
          </h3>
          <div className="space-y-4">
            {['LIMPOPO', 'MPUMALANGA', 'GAUTENG', 'NORTH_WEST', 'FREE_STATE', 'NORTHERN_CAPE'].map((prov) => {
              const count = provinceStats.find(s => s.province === prov)?._count.id || 0;
              const percentage = totalCases > 0 ? (count / totalCases) * 100 : 0;
              return (
                <div key={prov} className="space-y-2">
                  <div className="flex justify-between text-sm font-medium text-zinc-600 dark:text-zinc-300">
                    <span>{prov.replace('_', ' ')}</span>
                    <span>{count} Cases</span>
                  </div>
                  <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-500 ease-out" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Activity Mockup */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5 text-zinc-400" />
            Active Tasks
          </h3>
          <div className="space-y-6">
            {recentCases.map((c) => (
              <ActivityItem 
                key={c.id}
                id={c.id}
                title={`${c.outputType} #${c.nydaReference || c.id.slice(0,8)}`}
                status={c.status}
                province={c.province}
                time={new Date(c.createdAt).toLocaleDateString()}
              />
            ))}
            {recentCases.length === 0 && (
              <p className="text-sm text-zinc-500 text-center py-4">No active work items found.</p>
            )}
          </div>
          <button className="w-full mt-8 py-3 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition-colors">
            View All Work Items
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string, value: number, icon: React.ReactNode, color: string }) {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30",
    orange: "bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-900/30",
    purple: "bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-900/30",
    green: "bg-green-50 text-green-600 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30",
    red: "bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30",
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2.5 rounded-xl border ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{title}</h4>
        <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{value}</p>
      </div>
    </div>
  );
}

function ActivityItem({ id, title, status, province, time }: { id: string, title: string, status: string, province: string, time: string }) {
  return (
    <Link href={`/cases/${id}`} className="flex items-start gap-4 group cursor-pointer">
      <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 shrink-0 group-hover:scale-150 transition-transform" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 truncate group-hover:text-blue-500 transition-colors">{title}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-500">{province}</span>
          <span className="text-zinc-300 dark:text-zinc-700">•</span>
          <span className="text-xs text-zinc-400">{time}</span>
        </div>
      </div>
      <div className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
        {status}
      </div>
    </Link>
  );
}
