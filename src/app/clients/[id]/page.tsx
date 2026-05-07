import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  Home,
  Briefcase,
  Clock,
  ChevronRight,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { CaseStatus } from "@prisma/client";

export const dynamic = 'force-dynamic';

export default async function ClientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      cases: {
        orderBy: { createdAt: 'desc' },
        include: {
          coordinator: { select: { name: true } },
          consultant: { select: { name: true } },
          documents: true,
        }
      }
    }
  });

  if (!client) return notFound();

  const activeCases = client.cases.filter(c => c.status !== 'CLOSED' && c.status !== 'PAID');
  const completedCases = client.cases.filter(c => c.status === 'CLOSED' || c.status === 'PAID');
  const totalInvoiced = client.cases.reduce((sum, c) => sum + (c.actualCost || 0), 0);

  return (
    <div className="p-8 space-y-8 bg-zinc-50 dark:bg-zinc-950 min-h-screen">
      <Link href="/clients" className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors text-sm font-medium">
        <ArrowLeft className="w-4 h-4" />
        Back to Beneficiary Database
      </Link>

      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-blue-500/30">
              {client.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{client.name}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <div className="flex items-center gap-1.5 text-sm font-medium text-zinc-500">
                  <CreditCard className="w-4 h-4" />
                  SA ID: {client.idNumber}
                </div>
                <div className="flex items-center gap-1.5 text-sm font-medium text-zinc-500">
                  <MapPin className="w-4 h-4" />
                  {client.province.replace(/_/g, ' ')}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 lg:border-l lg:border-zinc-100 dark:lg:border-zinc-800 lg:pl-8">
            <div className="text-center">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Total Projects</p>
              <p className="text-3xl font-black text-zinc-900 dark:text-zinc-50">{client.cases.length}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Active</p>
              <p className="text-3xl font-black text-blue-600">{activeCases.length}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Total Invoiced</p>
              <p className="text-2xl font-black text-emerald-600">R {totalInvoiced.toLocaleString(undefined, { minimumFractionDigits: 0 })}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-6">Contact Details</h3>
            <div className="space-y-5">
              {client.phone ? (
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-zinc-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center">
                    <Phone className="w-4 h-4 text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Phone</p>
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{client.phone}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-zinc-400 italic">No phone on record</p>
              )}
              {client.email && (
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-zinc-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center">
                    <Mail className="w-4 h-4 text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Email</p>
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{client.email}</p>
                  </div>
                </div>
              )}
              {client.address && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-zinc-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center shrink-0">
                    <Home className="w-4 h-4 text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Address</p>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 leading-relaxed">{client.address}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-6">Client Since</h3>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{new Date(client.createdAt).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long' })}</p>
            <p className="text-xs text-zinc-400 mt-1">First registered in system</p>
          </div>
        </div>

        {/* Project History */}
        <div className="lg:col-span-2 space-y-6">
          {activeCases.length > 0 && (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-blue-500" />
                Active Projects ({activeCases.length})
              </h3>
              <div className="space-y-4">
                {activeCases.map(c => (
                  <CaseCard key={c.id} c={c} />
                ))}
              </div>
            </div>
          )}

          {completedCases.length > 0 && (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Completed Projects ({completedCases.length})
              </h3>
              <div className="space-y-4">
                {completedCases.map(c => (
                  <CaseCard key={c.id} c={c} completed />
                ))}
              </div>
            </div>
          )}

          {client.cases.length === 0 && (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-16 border border-dashed border-zinc-200 dark:border-zinc-800 text-center">
              <Briefcase className="w-12 h-12 text-zinc-200 dark:text-zinc-800 mx-auto mb-4" />
              <p className="text-zinc-500 font-medium">No projects on record for this client yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CaseCard({ c, completed = false }: { c: any; completed?: boolean }) {
  return (
    <Link
      href={`/cases/${c.id}`}
      className="flex items-center justify-between p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:border-blue-200 dark:hover:border-blue-900/50 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all group"
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${completed ? 'bg-emerald-50 text-emerald-500' : 'bg-blue-50 text-blue-500'}`}>
          <Briefcase className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{c.outputType.replace(/_/g, ' ')}</p>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-[10px] text-zinc-400 font-mono">{c.nydaReference || c.id.slice(0, 10)}</span>
            <span className="text-[10px] text-zinc-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(c.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {c.actualCost && (
          <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
            R {c.actualCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        )}
        <StatusPill status={c.status} />
        <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
      </div>
    </Link>
  );
}

function StatusPill({ status }: { status: CaseStatus }) {
  const isComplete = status === 'CLOSED' || status === 'PAID';
  const isWarning = status.includes('RETURNED');
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
      isComplete ? 'bg-emerald-50 text-emerald-600' :
      isWarning ? 'bg-orange-50 text-orange-600' :
      'bg-blue-50 text-blue-600'
    }`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}
