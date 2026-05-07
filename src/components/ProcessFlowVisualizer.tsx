"use client";

import React from "react";
import { 
  CheckCircle2, 
  Clock, 
  User, 
  ArrowRight,
  Activity,
  ShieldCheck,
  CreditCard,
  Send
} from "lucide-react";
import { motion } from "framer-motion";

const FLOW_STEPS = [
  { id: 1, activity: "Log into ERP", responsible: "Admin officer", time: "Immediate" },
  { id: 2, activity: "Voucher Management", responsible: "Admin officer", time: "Immediate" },
  { id: 3, activity: "Work Plan Status", responsible: "Admin officer", time: "Immediate" },
  { id: 4, activity: "Open Client Folder", responsible: "Admin officer", time: "Immediate" },
  { id: 5, activity: "Capture Client Info", responsible: "Admin officer", time: "Immediate" },
  { id: 6, activity: "Allocate to Consultant", responsible: "Admin Officer", time: "Immediate" },
  { id: 7, activity: "Develop Work Plan", responsible: "Business Consultant", time: "Immediate" },
  { id: 8, activity: "Allocate to PC", responsible: "Admin office", time: "Immediate" },
  { id: 9, activity: "Allocate to DCO", responsible: "Provincial Coordinator", time: "Immediate" },
  { id: 10, activity: "Arrange Meeting", responsible: "Provincial Coordinator", time: "Immediate" },
  { id: 11, activity: "CEO Approval (T&S)", responsible: "CEO", time: "1 day" },
  { id: 12, activity: "DCO Interview", responsible: "DCO", time: "1 day" },
  { id: 13, activity: "Consolidate Data", responsible: "DCO", time: "1 day" },
  { id: 14, activity: "Send to PC", responsible: "DCO", time: "1 day" },
  { id: 15, activity: "PC Consolidation", responsible: "PO", time: "1 day" },
  { id: 16, activity: "Send to Head Office", responsible: "PO", time: "Immediate" },
  { id: 17, activity: "Consultant Allocation", responsible: "Admin Officer", time: "Immediate" },
  { id: 18, activity: "Develop Document", responsible: "Business Consultant", time: "2 days" },
  { id: 19, activity: "Quality Review", responsible: "Senior Consultant", time: "1 day" },
  { id: 20, activity: "Client Approval", responsible: "Business Consultant", time: "-" },
  { id: 21, activity: "Prepare Invoice", responsible: "Senior Admin", time: "-" },
  { id: 22, activity: "Supporting Docs", responsible: "Senior Admin", time: "Immediate" },
  { id: 23, activity: "Send to CEO", responsible: "Senior Admin", time: "Immediate" },
  { id: 24, activity: "Final Submission", responsible: "CEO", time: "Immediate" },
];

export default function ProcessFlowVisualizer({ currentStep = 1 }: { currentStep?: number }) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-600" />
            Standard Operating Procedure
          </h3>
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">SLA & Process Flow Tracking</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest">
          {FLOW_STEPS.length} Steps Defined
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {FLOW_STEPS.map((step, idx) => {
          const isActive = idx + 1 === currentStep;
          const isCompleted = idx + 1 < currentStep;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className={`relative p-5 rounded-2xl border transition-all ${
                isActive 
                  ? "bg-blue-600 text-white border-transparent shadow-xl shadow-blue-500/20 scale-[1.02] z-10" 
                  : isCompleted
                    ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                    : "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? "text-blue-100" : "opacity-50"}`}>
                  Step {step.id}
                </span>
                {isCompleted && <CheckCircle2 className="w-4 h-4" />}
                {isActive && <Clock className="w-4 h-4 animate-pulse" />}
              </div>
              <p className={`text-sm font-bold leading-tight ${isActive ? "text-white" : "text-zinc-900 dark:text-zinc-50"}`}>
                {step.activity}
              </p>
              <div className="mt-4 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-[10px] font-medium">
                  <User className={`w-3 h-3 ${isActive ? "text-blue-100" : "text-zinc-400"}`} />
                  {step.responsible}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-medium">
                  <Clock className={`w-3 h-3 ${isActive ? "text-blue-100" : "text-zinc-400"}`} />
                  {step.time}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-12 bg-zinc-900 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-blue-600/20 to-transparent pointer-events-none" />
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shrink-0">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <div>
            <h4 className="text-lg font-black uppercase tracking-widest">Compliance Requirements</h4>
            <p className="text-zinc-400 text-sm mt-1 max-w-2xl">
              All projects must adhere to this 24-step verification process to ensure zero-defect delivery and faster invoicing.
            </p>
          </div>
          <button className="ml-auto bg-white text-zinc-900 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-50 transition-all">
            View Full SOP Guide
          </button>
        </div>
      </div>
    </div>
  );
}
