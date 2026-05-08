"use client";

import React, { useState } from "react";
import { History, FileText, ClipboardCheck, Info } from "lucide-react";

export default function CaseTabs({ 
  overview, 
  documents, 
  fieldwork, 
  history,
  showFieldwork = true
}: { 
  overview: React.ReactNode; 
  documents: React.ReactNode; 
  fieldwork: React.ReactNode; 
  history: React.ReactNode;
  showFieldwork?: boolean;
}) {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "Overview", icon: Info },
    { id: "documents", label: "Documents", icon: FileText },
    ...(showFieldwork ? [{ id: "fieldwork", label: "Fieldwork", icon: ClipboardCheck }] : []),
    { id: "history", label: "Audit Log", icon: History },
  ];

  return (
    <div className="space-y-8">
      {/* Tab Navigation */}
      <div className="flex items-center gap-2 p-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-2xl w-full sm:w-fit overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                isActive 
                  ? "bg-white dark:bg-zinc-800 text-blue-600 shadow-sm" 
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        {activeTab === "overview" && overview}
        {activeTab === "documents" && documents}
        {activeTab === "fieldwork" && fieldwork}
        {activeTab === "history" && history}
      </div>
    </div>
  );
}
