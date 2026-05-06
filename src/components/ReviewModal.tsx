"use client";

import { useState } from "react";
import { X, CheckCircle2, AlertCircle, MessageSquare } from "lucide-react";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleReview = async (isApproved: boolean) => {
    setIsSubmitting(true);
    
    let nextStatus: CaseStatus = currentStatus;
    
    // Logic for quality check transitions
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
      <div className="bg-white dark:bg-zinc-900 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
        <div className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Quality Review</h2>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="space-y-3">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-3 h-3" />
              Reviewer Comments / Feedback
            </label>
            <textarea 
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Provide specific feedback or checklist results..."
              className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 min-h-[120px] transition-all outline-none"
            />
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => handleReview(true)}
              disabled={isSubmitting}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
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
              Return for Correction
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
