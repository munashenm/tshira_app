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
  XCircle
} from "lucide-react";
import { Role, Province } from "@prisma/client";
import EditUserModal from "@/components/EditUserModal";
import AddUserModal from "@/components/AddUserModal";

export default async function TeamPage() {
  const users = await prisma.user.findMany({
    orderBy: { role: 'asc' },
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <div key={user.id} className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-500 transition-colors">
                <Users className="w-6 h-6" />
              </div>
              <EditUserModal user={user} />
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-zinc-50">{user.name}</h3>
                <div className="flex items-center gap-2 text-sm text-zinc-500 mt-1">
                  <Mail className="w-3.5 h-3.5" />
                  {user.email}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30 flex items-center gap-1.5">
                  <Shield className="w-3 h-3" />
                  {user.role.replace(/_/g, ' ')}
                </span>
                {user.province && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 flex items-center gap-1.5">
                    <MapPin className="w-3 h-3" />
                    {user.province}
                  </span>
                )}
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 ${user.active ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-red-50 text-red-600'}`}>
                  {user.active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  {user.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
