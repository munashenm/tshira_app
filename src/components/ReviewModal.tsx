"use client";

import { useState } from "react";
import { X, CheckCircle2, AlertCircle, MessageSquare, ClipboardList, Check } from "lucide-react";
import { CaseStatus } from "@prisma/client";
import { useRouter } from "next/navigation";

export default function ReviewModal({ 
  caseId, 
  currentStatus 
}: { 
  caseId: string; 
  currentStatus: CaseStatus;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [comments, setComments] = useState("");
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const isProvincial = currentStatus === "PROVINCIAL_QUALITY_CHECK";
  
  const provincialChecklist = [
    "Beneficiary identity verified",
    "All data collection forms uploaded",
    "Fieldwork photos/proof attached",
    "Data accuracy cross-checked"
  ];

  const consultantChecklist = [
    "NYDA document template followed",
    "Financial projections included",
    "Compliance checklist completed",
    "Quality of content verified"
  ];

  const activeChecklist = isProvincial ? provincialChecklist : consultantChecklist;

  const toggleCheck = (item: string) => {
    setChecklist(prev => ({ ...prev, [item]: !prev[item] }));
  };

  const allChecked = activeChecklist.every(item => checklist[item]);

  const handleReview = async (isApproved: boolean) => {
    setIsSubmitting(true);
    
    let nextStatus: CaseStatus = currentStatus;
    
    if (currentStatus === "PROVINCIAL_QUALITY_CHECK") {
      nextStatus = isApproved ? "SUBMITTED_TO_HEAD_OFFICE" : "RETURNED_FOR_DATA_CORRECTION";
    } else if (currentStatus === "SUBMITTED_FOR_REVIEW") {
      nextStatus = isApproved ? "INTERNALLY_REVIEWED" : "RETURNED_TO_CONSULTANT";
    }

    try {
      const res = await fetch(`/api/cases/${caseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus, comments }),
      });
      if (res.ok) {
        setIsOpen(false);
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isReviewStage = currentStatus === "PROVINCIAL_QUALITY_CHECK" || currentStatus === "SUBMITTED_FOR_REVIEW";

  if (!isReviewStage) return null;

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
      >
        <CheckCircle2 className="w-4 h-4" />
        Perform Quality Check
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200">
        <div className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/50">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Quality Assurance Review</h2>
            <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest font-bold">
              {isProvincial ? "Provincial Quality Check" : "Internal Document Review"}
            </p>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>
        
        <div className="p-8 space-y-8">
          {/* Checklist Section */}
          <div className="space-y-4">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              Compliance Checklist
            </label>
            <div className="grid grid-cols-1 gap-2">
              {activeChecklist.map((item) => (
                <button 
                  key={item}
                  onClick={() => toggleCheck(item)}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                    checklist[item] 
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/10 dark:border-emerald-900/30 dark:text-emerald-400" 
                      : "bg-zinc-50 border-zinc-100 text-zinc-600 dark:bg-zinc-800/50 dark:border-zinc-800"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                    checklist[item] ? "bg-emerald-500 border-emerald-500 text-white" : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                  }`}>
                    {checklist[item] && <Check className="w-3 h-3" />}
                  </div>
                  <span className="text-sm font-medium">{item}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Reviewer Comments / Feedback
            </label>
            <textarea 
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Provide specific feedback or detailed checklist results..."
              className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 min-h-[120px] transition-all outline-none"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              onClick={() => handleReview(true)}
              disabled={isSubmitting || !allChecked}
              className={`flex-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 ${!allChecked ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
            >
              <CheckCircle2 className="w-5 h-5" />
              Approve & Proceed
            </button>
            <button 
              onClick={() => handleReview(false)}
              disabled={isSubmitting}
              className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/20 font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              <AlertCircle className="w-5 h-5" />
              Return
            </button>
          </div>
          {!allChecked && (
            <p className="text-[10px] text-zinc-400 text-center font-bold uppercase tracking-widest animate-pulse">
              Complete the checklist above to enable approval
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
