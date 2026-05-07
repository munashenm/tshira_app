import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock, Circle, AlertCircle, Briefcase, MapPin, CreditCard } from "lucide-react";
import { CaseStatus } from "@prisma/client";

export const dynamic = 'force-dynamic';

const WORKFLOW_STAGES: { status: CaseStatus; label: string }[] = [
  { status: "RECEIVED_FROM_NYDA", label: "Received from NYDA" },
  { status: "ASSIGNED_TO_PROVINCE", label: "Assigned to Province" },
  { status: "ASSIGNED_FOR_DATA_COLLECTION", label: "Assigned for Data Collection" },
  { status: "DATA_COLLECTION_IN_PROGRESS", label: "Data Collection in Progress" },
  { status: "DATA_SUBMITTED", label: "Data Submitted" },
  { status: "PROVINCIAL_QUALITY_CHECK", label: "Provincial Quality Check" },
  { status: "SUBMITTED_TO_HEAD_OFFICE", label: "Submitted to Head Office" },
  { status: "ASSIGNED_TO_CONSULTANT", label: "Assigned to Consultant" },
  { status: "DOCUMENT_IN_PROGRESS", label: "Document in Progress" },
  { status: "SUBMITTED_FOR_REVIEW", label: "Submitted for Review" },
  { status: "INTERNALLY_REVIEWED", label: "Internally Reviewed" },
  { status: "SENT_TO_NYDA", label: "Sent to NYDA" },
  { status: "CLIENT_APPROVED", label: "Client Approved ✓" },
  { status: "INVOICED", label: "Invoiced" },
  { status: "PAID", label: "Payment Received ✓" },
];

export default async function ClientTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const workCase = await prisma.case.findUnique({
    where: { id },
    include: {
      history: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (!workCase) return notFound();

  const currentIndex = WORKFLOW_STAGES.findIndex(s => s.status === workCase.status);
  const progressPct = Math.round(((currentIndex + 1) / WORKFLOW_STAGES.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-blue-50/30 to-zinc-50 flex flex-col items-center justify-start py-12 px-4">
      {/* Header */}
      <div className="w-full max-w-2xl mb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold mb-6">
          <Briefcase className="w-4 h-4" />
          Tshira Management Systems — Project Tracker
        </div>
        <h1 className="text-3xl font-black text-zinc-900">{workCase.clientName}</h1>
        <p className="text-zinc-500 mt-2">{workCase.outputType.replace(/_/g, ' ')} Project</p>
        <div className="flex items-center justify-center gap-4 mt-3">
          <span className="flex items-center gap-1.5 text-sm text-zinc-500"><MapPin className="w-4 h-4" />{workCase.province.replace(/_/g,' ')}</span>
          {workCase.nydaReference && (
            <span className="flex items-center gap-1.5 text-sm text-zinc-500"><CreditCard className="w-4 h-4" />Ref: {workCase.nydaReference}</span>
          )}
        </div>
      </div>

      {/* Progress Card */}
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-zinc-200 shadow-xl overflow-hidden mb-6">
        <div className="p-8 border-b border-zinc-100">
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm font-black text-zinc-400 uppercase tracking-widest">Overall Progress</p>
            <span className="text-2xl font-black text-blue-600">{progressPct}%</span>
          </div>
          <div className="h-3 bg-zinc-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-1000"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-sm font-bold text-zinc-700 mt-4">
            Current stage: <span className="text-blue-600">{workCase.status.replace(/_/g,' ')}</span>
          </p>
          {workCase.slaDeadline && (
            <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Target completion: {new Date(workCase.slaDeadline).toLocaleDateString('en-ZA', { dateStyle: 'long' })}
            </p>
          )}
        </div>

        {/* Stages */}
        <div className="p-8 space-y-4">
          <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-6">Project Stages</p>
          {WORKFLOW_STAGES.map((stage, i) => {
            const isDone = i < currentIndex;
            const isCurrent = i === currentIndex;
            const isFuture = i > currentIndex;
            return (
              <div key={stage.status} className={`flex items-center gap-4 ${isFuture ? 'opacity-40' : ''}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${isDone ? 'bg-emerald-500 text-white' : isCurrent ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-zinc-100 text-zinc-300'}`}>
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : isCurrent ? <Clock className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                </div>
                <div className="flex-1 flex justify-between items-center">
                  <p className={`text-sm font-bold ${isCurrent ? 'text-blue-700' : isDone ? 'text-zinc-900' : 'text-zinc-400'}`}>{stage.label}</p>
                  {isDone && <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Done</span>}
                  {isCurrent && <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest animate-pulse">In Progress</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-zinc-400 text-center mt-4">
        This is a read-only view. For enquiries contact Tshira Management Systems.
      </p>
    </div>
  );
}
