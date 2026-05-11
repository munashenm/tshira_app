"use client";

import React, { useState, useEffect } from "react";
import { 
  Save, 
  Loader2, 
  CheckCircle2, 
  Building2, 
  Users, 
  TrendingUp, 
  Target, 
  ShieldCheck, 
  Briefcase, 
  DollarSign, 
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  AlertCircle
} from "lucide-react";
import { useSimulation } from "@/lib/SimulationContext";
import { motion, AnimatePresence } from "framer-motion";

interface BusinessPlanFormProps {
  caseId: string;
  initialData?: any;
  onSave?: () => void;
}

const SECTIONS = [
  { id: "identity", label: "Business Identity", icon: Building2 },
  { id: "strategic", label: "Vision & Mission", icon: Target },
  { id: "swot", label: "SWOT Analysis", icon: ShieldCheck },
  { id: "market", label: "Market & Clients", icon: TrendingUp },
  { id: "operations", label: "Location & Operations", icon: Briefcase },
  { id: "hr", label: "Human Resources", icon: Users },
  { id: "finance", label: "Financial Plan", icon: DollarSign },
];

export default function BusinessPlanForm({ caseId, initialData, onSave }: BusinessPlanFormProps) {
  const [activeSection, setActiveSection] = useState("identity");
  const [formData, setFormData] = useState<any>(initialData || {});
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { currentPersona } = useSimulation();

  const updateField = (section: string, field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/forms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formType: "BUSINESS_PLAN_QUESTIONNAIRE",
          data: formData,
          submittedBy: currentPersona?.name
        }),
      });
      if (res.ok) {
        setLastSaved(new Date());
        if (onSave) onSave();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const nextSection = () => {
    const currentIndex = SECTIONS.findIndex(s => s.id === activeSection);
    if (currentIndex < SECTIONS.length - 1) {
      setActiveSection(SECTIONS[currentIndex + 1].id);
    }
  };

  const prevSection = () => {
    const currentIndex = SECTIONS.findIndex(s => s.id === activeSection);
    if (currentIndex > 0) {
      setActiveSection(SECTIONS[currentIndex - 1].id);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-[700px]">
      {/* Sidebar Navigation */}
      <div className="lg:w-72 shrink-0">
        <div className="sticky top-24 bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-6 ml-4 mt-2">Questionnaire Sections</p>
          <nav className="space-y-1">
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                    isActive 
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                      : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-50"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-zinc-400"}`} />
                  {section.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 px-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? "Saving..." : "Save Progress"}
            </button>
            {lastSaved && (
              <p className="text-[10px] text-zinc-400 text-center mt-3 font-medium flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                Saved {lastSaved.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-200 dark:border-zinc-800 p-10 shadow-sm min-h-full flex flex-col"
          >
            <SectionTitle 
              title={SECTIONS.find(s => s.id === activeSection)?.label || ""} 
              description={`Provide detailed information for the ${activeSection} component of the business plan.`}
            />

            <div className="flex-1 mt-10 space-y-8">
              {activeSection === "identity" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormField label="Name of the business" value={formData.identity?.businessName} onChange={(v: string) => updateField("identity", "businessName", v)} />
                  <FormField label="Registration Number" value={formData.identity?.regNumber} onChange={(v: string) => updateField("identity", "regNumber", v)} />
                  <FormField label="Tax Number" value={formData.identity?.taxNumber} onChange={(v: string) => updateField("identity", "taxNumber", v)} />
                  <FormField label="Voucher No" value={formData.identity?.voucherNo} onChange={(v: string) => updateField("identity", "voucherNo", v)} />
                  <FormField label="COIDA Reg Number" value={formData.identity?.coidaNumber} onChange={(v: string) => updateField("identity", "coidaNumber", v)} />
                  <FormField label="PAYE Reg Number" value={formData.identity?.payeNumber} onChange={(v: string) => updateField("identity", "payeNumber", v)} />
                  <FormField label="UIF Reg Number" value={formData.identity?.uifNumber} onChange={(v: string) => updateField("identity", "uifNumber", v)} />
                  <FormField label="Physical Address" value={formData.identity?.address} onChange={(v: string) => updateField("identity", "address", v)} isTextArea />
                  <FormField label="Province" value={formData.identity?.province} onChange={(v: string) => updateField("identity", "province", v)} />
                  <FormField label="District" value={formData.identity?.district} onChange={(v: string) => updateField("identity", "district", v)} />
                  <FormField label="Local Municipality" value={formData.identity?.municipality} onChange={(v: string) => updateField("identity", "municipality", v)} />
                  <FormField label="Highest Education" value={formData.identity?.education} onChange={(v: string) => updateField("identity", "education", v)} />
                  
                  <div className="md:col-span-2 mt-4">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4 ml-1">Names of the Directors (Name & ID)</p>
                    <textarea
                      value={formData.identity?.directors || ""}
                      onChange={(e) => updateField("identity", "directors", e.target.value)}
                      placeholder="1. Name Surname - ID Number&#10;2. Name Surname - ID Number..."
                      className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5 text-sm min-h-[120px] focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                    />
                  </div>
                </div>
              )}

              {activeSection === "strategic" && (
                <div className="space-y-8">
                  <FormField label="Vision of the business" value={formData.strategic?.vision} onChange={(v: string) => updateField("strategic", "vision", v)} isTextArea />
                  <FormField label="Mission of the business" value={formData.strategic?.mission} onChange={(v: string) => updateField("strategic", "mission", v)} isTextArea />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField label="When did you start this business?" value={formData.strategic?.startDate} onChange={(v: string) => updateField("strategic", "startDate", v)} />
                    <FormField label="Why did you start this business?" value={formData.strategic?.startReason} onChange={(v: string) => updateField("strategic", "startReason", v)} />
                  </div>
                </div>
              )}

              {activeSection === "swot" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormField label="Strengths" value={formData.swot?.strengths} onChange={(v: string) => updateField("swot", "strengths", v)} isTextArea />
                  <FormField label="Weaknesses" value={formData.swot?.weaknesses} onChange={(v: string) => updateField("swot", "weaknesses", v)} isTextArea />
                  <FormField label="Opportunities" value={formData.swot?.opportunities} onChange={(v: string) => updateField("swot", "opportunities", v)} isTextArea />
                  <FormField label="Threats" value={formData.swot?.threats} onChange={(v: string) => updateField("swot", "threats", v)} isTextArea />
                </div>
              )}

              {activeSection === "market" && (
                <div className="space-y-8">
                  <FormField label="What community needs or problems do you want to solve?" value={formData.market?.needs} onChange={(v: string) => updateField("market", "needs", v)} isTextArea />
                  <FormField label="What service or product are you providing?" value={formData.market?.product} onChange={(v: string) => updateField("market", "product", v)} isTextArea />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField label="Who are your potential clients?" value={formData.market?.potentialClients} onChange={(v: string) => updateField("market", "potentialClients", v)} />
                    <FormField label="Where are your potential customers based?" value={formData.market?.customerBase} onChange={(v: string) => updateField("market", "customerBase", v)} />
                  </div>
                  <FormField label="What is the profile of your potential customers (age, lifestyle, income)?" value={formData.market?.customerProfile} onChange={(v: string) => updateField("market", "customerProfile", v)} isTextArea />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField label="What is the size of your market in rand value?" value={formData.market?.marketSize} onChange={(v: string) => updateField("market", "marketSize", v)} />
                    <FormField label="Percentage of market to capture & strategy" value={formData.market?.marketStrategy} onChange={(v: string) => updateField("market", "marketStrategy", v)} />
                  </div>
                </div>
              )}

              {activeSection === "operations" && (
                <div className="space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField label="Place (Rural/Urban)" value={formData.operations?.place} onChange={(v: string) => updateField("operations", "place", v)} />
                    <FormField label="Office (Rented or Owned)" value={formData.operations?.officeStatus} onChange={(v: string) => updateField("operations", "officeStatus", v)} />
                    <FormField label="Factory/Farm Size" value={formData.operations?.size} onChange={(v: string) => updateField("operations", "size", v)} />
                    <FormField label="Electricity & Services" value={formData.operations?.services} onChange={(v: string) => updateField("operations", "services", v)} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FormField label="Parking space" value={formData.operations?.parking} onChange={(v: string) => updateField("operations", "parking", v)} />
                    <FormField label="Security" value={formData.operations?.security} onChange={(v: string) => updateField("operations", "security", v)} />
                    <FormField label="Production Process" value={formData.operations?.process} onChange={(v: string) => updateField("operations", "process", v)} />
                  </div>
                  <FormField label="Who are your suppliers & why chose them?" value={formData.operations?.suppliers} onChange={(v: string) => updateField("operations", "suppliers", v)} isTextArea />
                </div>
              )}

              {activeSection === "hr" && (
                <div className="space-y-8">
                  <FormField label="Management Team & Roles" value={formData.hr?.management} onChange={(v: string) => updateField("hr", "management", v)} isTextArea placeholder="Name - Role - Experience..." />
                  <FormField label="Who are you going to employ & their roles?" value={formData.hr?.employees} onChange={(v: string) => updateField("hr", "employees", v)} isTextArea />
                  <FormField label="Salary/Wage estimates" value={formData.hr?.salaries} onChange={(v: string) => updateField("hr", "salaries", v)} />
                </div>
              )}

              {activeSection === "finance" && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField label="Amount required (ZAR)" value={formData.finance?.amountRequired} onChange={(v: string) => updateField("finance", "amountRequired", v)} />
                    <FormField label="Own contribution (ZAR)" value={formData.finance?.contribution} onChange={(v: string) => updateField("finance", "contribution", v)} />
                  </div>
                  <FormField label="Use of funds (Item/Price list)" value={formData.finance?.useOfFunds} onChange={(v: string) => updateField("finance", "useOfFunds", v)} isTextArea />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FormField label="Items sold per month" value={formData.finance?.salesVolume} onChange={(v: string) => updateField("finance", "salesVolume", v)} />
                    <FormField label="Unit selling price" value={formData.finance?.unitPrice} onChange={(v: string) => updateField("finance", "unitPrice", v)} />
                    <FormField label="Break-even Point" value={formData.finance?.breakEven} onChange={(v: string) => updateField("finance", "breakEven", v)} />
                  </div>
                </div>
              )}
            </div>

            <div className="mt-12 pt-8 border-t border-zinc-100 dark:border-zinc-800 flex justify-between">
              <button
                onClick={prevSection}
                disabled={activeSection === SECTIONS[0].id}
                className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 font-bold transition-all disabled:opacity-30"
              >
                <ChevronLeft className="w-5 h-5" />
                Previous Section
              </button>
              
              <button
                onClick={nextSection}
                disabled={activeSection === SECTIONS[SECTIONS.length - 1].id}
                className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 px-6 py-3 rounded-2xl font-bold transition-all disabled:opacity-30"
              >
                Next Section
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function SectionTitle({ title, description }: { title: string, description: string }) {
  return (
    <div className="space-y-2">
      <h2 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">{title}</h2>
      <p className="text-zinc-500 dark:text-zinc-400 font-medium">{description}</p>
    </div>
  );
}

function FormField({ label, value, onChange, isTextArea = false, placeholder }: { label: string, value: string, onChange: (v: string) => void, isTextArea?: boolean, placeholder?: string }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between ml-1">
        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{label}</label>
        <HelpCircle className="w-3.5 h-3.5 text-zinc-300" />
      </div>
      {isTextArea ? (
        <textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5 text-sm min-h-[120px] focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
        />
      ) : (
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
        />
      )}
    </div>
  );
}
