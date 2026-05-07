import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';
import { 
  Users, 
  MapPin, 
  Search,
  ChevronRight,
  CreditCard,
  Phone,
  Briefcase
} from "lucide-react";
import Link from "next/link";
import { Province } from "@prisma/client";
import CreateClientModal from "@/components/CreateClientModal";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q || "";
  
  const clients = await prisma.client.findMany({
    where: query ? {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { idNumber: { contains: query, mode: 'insensitive' } }
      ]
    } : {},
    orderBy: { name: 'asc' },
    include: {
      cases: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  });

  return (
    <div className="p-8 space-y-8 bg-zinc-50 dark:bg-zinc-950 min-h-screen">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Beneficiary Database</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">Centralized record of all clients and their project history.</p>
        </div>
        <div className="flex gap-3">
          <CreateClientModal provinces={Object.values(Province)} />
        </div>
      </div>

      <div className="flex gap-4">
        <form className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input 
            name="q"
            defaultValue={query}
            placeholder="Search by Name or SA ID Number..." 
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
          />
          <button type="submit" className="hidden">Search</button>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {clients.map((client) => (
          <div 
            key={client.id} 
            className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-500 font-bold text-xl">
                  {client.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{client.name}</h3>
                  <div className="flex flex-wrap items-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">
                      <CreditCard className="w-3.5 h-3.5" />
                      {client.idNumber}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">
                      <MapPin className="w-3.5 h-3.5" />
                      {client.province}
                    </div>
                    {client.phone && (
                      <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">
                        <Phone className="w-3.5 h-3.5" />
                        {client.phone}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-12 lg:border-l lg:border-zinc-100 dark:lg:border-zinc-800 lg:pl-12">
                <div className="text-left">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Active Projects</p>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-blue-500" />
                    <span className="text-lg font-bold">{client.cases.length}</span>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Latest Progress</p>
                  <div className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                    {client.cases[0]?.status.replace(/_/g, ' ') || "No projects"}
                  </div>
                </div>
                <Link 
                  href={`/clients/${client.id}`}
                  className="bg-zinc-50 dark:bg-zinc-800 p-3 rounded-xl hover:bg-blue-600 hover:text-white transition-all text-zinc-400"
                >
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
        {clients.length === 0 && (
          <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
            <Users className="w-12 h-12 text-zinc-200 dark:text-zinc-800 mx-auto mb-4" />
            <p className="text-zinc-500 font-medium">No clients found matching your search.</p>
            <p className="text-xs text-zinc-400 mt-1">Try searching by Name or ID Number.</p>
          </div>
        )}
      </div>
    </div>
  );
}
