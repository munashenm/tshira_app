import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';
import { 
  ArrowLeft, 
  User, 
  MapPin, 
  Clock, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  FileUp,
  History,
  Send
} from "lucide-react";
import Link from "next/link";
import { CaseStatus, Role } from "@prisma/client";
import StatusUpdateModal from "@/components/StatusUpdateModal";
import UserAssignmentModal from "@/components/UserAssignmentModal";
import ReviewModal from "@/components/ReviewModal";
import UploadDocumentModal from "@/components/UploadDocumentModal";
import DataCollectionForm from "@/components/DataCollectionForm";
import CaseTabs from "@/components/CaseTabs";
import GenerateDraftButton from "@/components/GenerateDraftButton";
import PrintButton from "@/components/PrintButton";
import BusinessPlanForm from "@/components/forms/BusinessPlanForm";
import ClientChecklistForm from "@/components/forms/ClientChecklistForm";
import ClientRegistrationForm from "@/components/forms/ClientRegistrationForm";
import WorkAllocationManager from "@/components/forms/WorkAllocationManager";
import AssignmentResponseBanner from "@/components/AssignmentResponseBanner";

import { getSessionActorFromCookies } from "@/lib/session";

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  if (!id) return <div className="p-8 text-center text-red-500 font-bold">Error: No Case ID provided in the URL.</div>;
  
  const c = await prisma.case.findUnique({
    where: { id },
    include: {
      coordinator: true,
      dco: true,
      consultant: true,
      reviewer: true,
      documents: true,
      client: true,
      history: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 20
      },
      formResponses: true
    }
  });

  if (!c) return <div className="p-8 text-center">Case not found.</div>;

  const actor = await getSessionActorFromCookies();
  let pendingAssignment = false;
  if (actor) {
    if (c.coordinatorId === actor.id && !c.coordinatorAcceptedAt) pendingAssignment = true;
    if (c.dcoId === actor.id && !c.dcoAcceptedAt) pendingAssignment = true;
    if (c.consultantId === actor.id && !c.consultantAcceptedAt) pendingAssignment = true;
  }

  const isAssignedToUser = actor && (c.coordinatorId === actor.id || c.dcoId === actor.id || c.consultantId === actor.id);
  const isInvoiced = c.invoiceNumber != null || c.status === "INVOICED" || c.status === "PAID";

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 bg-zinc-50 dark:bg-zinc-950 min-h-screen pb-24">
      <Link href="/cases" className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" />
        Back to Workflow Tasks
      </Link>

      {pendingAssignment && <AssignmentResponseBanner caseId={c.id} />}

      <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
        <div className="space-y-2 w-full">
          {/* Print-only Logo Header */}
          <div className="hidden print:flex items-center gap-6 mb-8 border-b-2 border-zinc-900 pb-8 w-full">
            <img src="/logo.png" alt="Tshira Logo" className="h-16 object-contain" />
            <div>
              <h1 className="text-2xl font-black">TSHIRA EMPORIUM</h1>
              <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold">Workflow Management Dossier</p>
            </div>
            <div className="ml-auto text-right text-[10px] text-zinc-400">
              <p>Generated: {new Date().toLocaleString()}</p>
              <p>Reference: {c.nydaReference || c.id}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{c.clientName}</h1>
            <span className="text-[11px] sm:text-sm font-bold text-zinc-400 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1 rounded-full">
              {c.nydaReference || "REF-PENDING"}
            </span>
            {c.priority !== "NORMAL" && (
              <span className={`text-[9px] sm:text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${c.priority === "CRITICAL" ? "bg-red-500 text-white" : "bg-orange-500 text-white"}`}>
                {c.priority}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">Project type: {c.outputType.replace(/_/g, ' ')} • Received on {new Date(c.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
          <GenerateDraftButton caseId={c.id} />
          <PrintButton />
          <ReviewModal caseId={c.id} currentStatus={c.status} currentUserRole={actor?.role} />
          <StatusUpdateModal caseId={c.id} currentStatus={c.status} province={c.province} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <CaseTabs 
            overview={
              <div className="space-y-8">
                <ClientRegistrationForm caseData={c} />
                
                {/* Status Timeline Card */}
                <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <h3 className="text-lg font-bold mb-6 sm:mb-8 flex items-center gap-2">
                    <History className="w-5 h-5 text-blue-500" />
                    Workflow Progression
                  </h3>
                  <div className="relative pl-6 sm:pl-8 space-y-8 sm:space-y-10 border-l-2 border-zinc-100 dark:border-zinc-800 ml-2 sm:ml-4">
                    <TimelineStep status="RECEIVED_FROM_NYDA" currentStatus={c.status} date={c.createdAt.toLocaleDateString()} label="Work Ingested" />
                    <TimelineStep status="ASSIGNED_TO_PROVINCE" currentStatus={c.status} label="Provincial Allocation" user={c.coordinator?.name} />
                    <TimelineStep status="ASSIGNED_FOR_DATA_COLLECTION" currentStatus={c.status} label="Fieldwork Dispatched" user={c.dco?.name} />
                    <TimelineStep status="DATA_SUBMITTED" currentStatus={c.status} label="Data Submitted & Quality Check" />
                    <TimelineStep status="ASSIGNED_TO_CONSULTANT" currentStatus={c.status} label="Document Development" user={c.consultant?.name} />
                    <TimelineStep status="SUBMITTED_FOR_REVIEW" currentStatus={c.status} label="Quality Assurance Review" user={c.reviewer?.name} />
                    <TimelineStep status="CLIENT_APPROVED" currentStatus={c.status} label="NYDA System Approval" />
                    <TimelineStep status="INVOICED" currentStatus={c.status} label="Finance & Invoicing" />
                  </div>
                </div>
              </div>
            }
            allocation={
              <div className="space-y-8">
                <WorkAllocationManager 
                  caseId={c.id}
                  caseData={c}
                  clientData={c.client}
                  formResponses={c.formResponses}
                />
                
                <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <h3 className="text-lg font-bold mb-6">Team Assignment List</h3>
                  <div className="space-y-6">
                    <UserRow roleName="Coordinator" role={Role.PROVINCIAL_COORDINATOR} name={c.coordinator?.name} caseId={c.id} province={c.province} acceptedAt={c.coordinatorAcceptedAt} />
                    <UserRow roleName="Field Officer" role={Role.DATA_COLLECTION_OFFICER} name={c.dco?.name} caseId={c.id} province={c.province} acceptedAt={c.dcoAcceptedAt} />
                    <UserRow roleName="Consultant" role={Role.BUSINESS_CONSULTANT} name={c.consultant?.name} caseId={c.id} province={c.province} acceptedAt={c.consultantAcceptedAt} />
                    <UserRow roleName="Reviewer" role={Role.REVIEWER} name={c.reviewer?.name} caseId={c.id} province={c.province} />
                  </div>
                </div>
              </div>
            }
            documents={
              <div className="space-y-8">
                <ClientChecklistForm 
                  caseId={c.id} 
                  initialData={c.formResponses.find(r => r.formType === "CLIENT_DOCUMENT_CHECKLIST")?.data} 
                />
                
                <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h3 className="text-lg font-bold">Project Documents</h3>
                    <UploadDocumentModal caseId={c.id} />
                  </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {c.documents.map((doc) => (
                    <div key={doc.id} className="p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-blue-500 shrink-0">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{doc.name}</p>
                        <p className="text-[11px] text-zinc-500">{doc.type} • {new Date(doc.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                  {c.documents.length === 0 && (
                    <div className="col-span-1 md:col-span-2 py-10 text-center border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-2xl">
                      <FileText className="w-8 h-8 text-zinc-200 mx-auto mb-2" />
                      <p className="text-sm text-zinc-400">No documents uploaded yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          }
            fieldwork={
              c.outputType === "BUSINESS_PLAN" || c.outputType === "Business_Plan" || c.outputType === "Business Plan" ? (
                <BusinessPlanForm 
                  caseId={c.id} 
                  initialData={c.formResponses.find(r => r.formType === "BUSINESS_PLAN_QUESTIONNAIRE")?.data} 
                />
              ) : (
                <DataCollectionForm 
                  caseId={c.id} 
                  currentStatus={c.status} 
                  initialData={c.beneficiaryDetails} 
                  initialId={c.client?.idNumber}
                  initialPhone={c.client?.phone}
                  clientData={c.client}
                />
              )
            }
            history={
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <h3 className="text-lg font-bold mb-6">Full Audit Log</h3>
                <div className="space-y-6">
                  {c.history?.map((h) => (
                    <div key={h.id} className="flex gap-3 sm:gap-4">
                      <div className="w-8 h-8 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                        <History className="w-4 h-4 text-zinc-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-1">
                          <div>
                            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{h.status.replace(/_/g, ' ')}</p>
                            {h.user?.name && <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-0.5">By {h.user.name}</p>}
                          </div>
                          <span className="text-[9px] sm:text-[10px] text-zinc-400 font-medium uppercase">{new Date(h.createdAt).toLocaleString()}</span>
                        </div>
                        {h.comments && <p className="text-xs text-zinc-500 mt-2 p-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-100 dark:border-zinc-800 italic">{h.comments}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            }
          />
        </div>

        <div className="space-y-6 sm:space-y-8">

          <div className="bg-blue-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-500/20">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-6 h-6" />
              <h3 className="text-lg font-bold">SLA Tracker</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-blue-100 text-sm">Remaining Time</p>
                <p className="text-2xl sm:text-3xl font-bold">5 Days</p>
              </div>
              <div className="h-2 bg-blue-500/50 rounded-full overflow-hidden">
                <div className="h-full bg-white w-[30%]" />
              </div>
              <p className="text-[10px] sm:text-xs text-blue-100 italic">Deadline: {new Date(c.slaDeadline || c.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
            </div>
          </div>

          <div className={`rounded-3xl p-6 sm:p-8 shadow-sm border ${isInvoiced ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-900/30 text-emerald-900 dark:text-emerald-50" : "bg-white border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50"}`}>
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className={`w-6 h-6 ${isInvoiced ? "text-emerald-500" : "text-zinc-400"}`} />
              <h3 className="text-lg font-bold">Invoice Status</h3>
            </div>
            {isInvoiced ? (
              <div>
                <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">Processed</p>
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-600/70 dark:text-emerald-400/70 mt-2">Work has been invoiced</p>
                {c.invoiceNumber && <p className="text-xs font-mono mt-1 text-emerald-700 dark:text-emerald-300">Inv: {c.invoiceNumber}</p>}
              </div>
            ) : (
              <div>
                <p className="text-2xl sm:text-3xl font-black text-zinc-300 dark:text-zinc-700">Pending</p>
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mt-2">Not yet invoiced</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @media print {
          body { background: white !important; margin: 0; }
          .print\\:hidden, button, a[href="/cases"] { display: none !important; }
          .max-w-4xl, .p-8 { padding: 0 !important; max-width: 100% !important; }
          .bg-zinc-50, .dark\\:bg-zinc-950 { background: white !important; }
          .shadow-sm, .shadow-xl { shadow: none !important; border: 1px solid #eee !important; }
          .lg\\:grid-cols-3 { grid-template-cols: 1fr !important; }
          .lg\\:col-span-2 { grid-column: span 1 / span 1 !important; }
        }
      `}</style>
    </div>
  );
}

function TimelineStep({ status, currentStatus, label, date, user }: { status: CaseStatus, currentStatus: CaseStatus, label: string, date?: string, user?: string | null }) {
  const statuses = [
    "RECEIVED_FROM_NYDA", "ASSIGNED_TO_PROVINCE", "ASSIGNED_FOR_DATA_COLLECTION", 
    "DATA_COLLECTION_IN_PROGRESS", "DATA_SUBMITTED", "PROVINCIAL_QUALITY_CHECK",
    "RETURNED_FOR_DATA_CORRECTION", "SUBMITTED_TO_HEAD_OFFICE", "ASSIGNED_TO_CONSULTANT",
    "DOCUMENT_IN_PROGRESS", "SUBMITTED_FOR_REVIEW", "RETURNED_TO_CONSULTANT",
    "INTERNALLY_REVIEWED", "SENT_TO_NYDA", "CLIENT_APPROVED", "READY_FOR_INVOICING",
    "INVOICED", "PAID", "CLOSED"
  ];
  
  const currentIndex = statuses.indexOf(currentStatus);
  const stepIndex = statuses.indexOf(status);
  
  const isCompleted = stepIndex < currentIndex || currentStatus === "CLOSED";
  const isCurrent = currentStatus === status;

  return (
    <div className="relative">
      <div className={`absolute -left-[41px] w-5 h-5 rounded-full border-4 border-white dark:border-zinc-950 transition-colors duration-500 ${
        isCompleted ? "bg-green-500" : isCurrent ? "bg-blue-500" : "bg-zinc-200 dark:bg-zinc-800"
      }`} />
      <div>
        <div className="flex justify-between items-start">
          <p className={`text-sm font-bold ${isCompleted || isCurrent ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-400"}`}>
            {label}
          </p>
          {date && <span className="text-xs text-zinc-400 font-medium">{date}</span>}
        </div>
        {user && <p className="text-xs text-zinc-500 mt-0.5">Assigned: {user}</p>}
        {isCurrent && (
          <div className="mt-2 flex gap-2">
            <span className="px-2 py-0.5 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] font-black tracking-tighter uppercase rounded">Active Stage</span>
          </div>
        )}
      </div>
    </div>
  );
}

function UserRow({ roleName, role, name, caseId, province, acceptedAt }: { roleName: string, role: Role, name?: string | null, caseId: string, province: string, acceptedAt?: Date | null }) {
  return (
    <div className="flex items-center justify-between group">
      <div>
        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{roleName}</p>
        <p className={`text-sm font-semibold flex items-center gap-2 ${name ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-300 italic"}`}>
          {name || "Unassigned"}
          {name && !acceptedAt && (
            <span className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-full uppercase tracking-widest font-black">
              Pending
            </span>
          )}
        </p>
      </div>
      <UserAssignmentModal caseId={caseId} role={role} label={roleName} caseProvince={province} />
    </div>
  );
}

