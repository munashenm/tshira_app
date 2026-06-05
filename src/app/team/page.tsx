import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Shield, 
  MapPin,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Briefcase
} from "lucide-react";
import { Role, Province } from "@prisma/client";
import EditUserModal from "@/components/EditUserModal";
import AddUserModal from "@/components/AddUserModal";

export default async function TeamPage() {
  const users = await prisma.user.findMany({
    orderBy: { role: 'asc' },
    include: {
      provinceAssignments: true,
      history: {
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { case: { select: { clientName: true, nydaReference: true } } }
      }
    }
  });

  const roles = Object.values(Role);

  return (
    <div className="p-8 space-y-8 bg-zinc-50 dark:bg-zinc-950 min-h-screen">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Team Management</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">Manage user roles, provincial assignments, and system access.</p>
        </div>
        <AddUserModal />
      </div>

      <div className="space-y-12">
        {roles.map((role) => {
          const roleUsers = users.filter(u => u.role === role);
          if (roleUsers.length === 0) return null;

          return (
            <div key={role} className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
                <h2 className="text-xs font-black text-zinc-400 uppercase tracking-[0.3em] px-4 whitespace-nowrap">
                  {role.replace(/_/g, ' ')}s
                </h2>
                <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {roleUsers.map((user) => (
                  <div key={user.id} className="bg-white dark:bg-zinc-900 rounded-[32px] p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/5 to-transparent pointer-events-none" />
                    
                    <div className="flex justify-between items-start mb-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors shadow-lg ${
                        role === 'ADMIN_OFFICER' ? 'bg-zinc-900 text-white shadow-zinc-900/10' :
                        role === 'PROVINCIAL_COORDINATOR' ? 'bg-blue-600 text-white shadow-blue-600/10' :
                        role === 'DATA_COLLECTION_OFFICER' ? 'bg-emerald-500 text-white shadow-emerald-500/10' :
                        role === 'BUSINESS_CONSULTANT' ? 'bg-amber-500 text-white shadow-amber-500/10' :
                        'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                      }`}>
                        {role === 'ADMIN_OFFICER' && <Shield className="w-7 h-7" />}
                        {role === 'PROVINCIAL_COORDINATOR' && <MapPin className="w-7 h-7" />}
                        {role === 'DATA_COLLECTION_OFFICER' && <Users className="w-7 h-7" />}
                        {role === 'BUSINESS_CONSULTANT' && <Briefcase className="w-7 h-7" />}
                        {role === 'REVIEWER' && <CheckCircle2 className="w-7 h-7" />}
                      </div>
                      <EditUserModal user={user} />
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-50">{user.name}</h3>
                        <p className="text-xs text-zinc-400 font-medium mt-1 truncate">{user.email}</p>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-4 border-t border-zinc-50 dark:border-zinc-800">
                        {user.province && (
                          <span className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                            <MapPin className="w-3 h-3" />
                            {user.province.replace(/_/g, ' ')}
                          </span>
                        )}
                        {user.provinceAssignments?.map((a) => (
                          <span key={a.id} className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center gap-2">
                            <MapPin className="w-3 h-3" />
                            +{a.province.replace(/_/g, ' ')}
                          </span>
                        ))}
                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${user.active ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-red-50 text-red-600'}`}>
                          {user.active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {user.active ? 'Live' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
