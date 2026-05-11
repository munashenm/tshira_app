"use client";

import React, { useState } from "react";
import { 
  ClipboardList, 
  Save, 
  Loader2,
  User,
  MapPin,
  Building,
  Briefcase,
  Calendar
} from "lucide-react";
import { useSimulation } from "@/lib/SimulationContext";

interface WorkAllocationConsultantFormProps {
  caseId: string;
  initialData?: any;
  clientData?: any;
  caseData?: any;
  onSave?: () => void;
}

export default function WorkAllocationConsultantForm({ caseId, initialData, clientData, caseData, onSave }: WorkAllocationConsultantFormProps) {
  const { currentPersona } = useSimulation();
  const [data, setData] = useState<any>({
    date: new Date().toISOString().split('T')[0],
    coordinatorName: caseData?.coordinator?.name || "",
    clientName: caseData?.clientName || clientData?.name || "",
    idNumber: clientData?.idNumber || "",
    businessName: clientData?.businessName || "",
    voucherNumber: caseData?.nydaReference || "",
    serviceRequired: caseData?.outputType?.replace(/_/g, ' ') || "",
    province: caseData?.province?.replace(/_/g, ' ') || "",
    district: "",
    municipality: "",
    consultantName: caseData?.consultant?.name || "",
    ...initialData
  });
  const [isSaving, setIsSaving] = useState(false);

  const updateField = (field: string, value: string) => {
    setData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/forms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formType: "WORK_ALLOCATION_CONSULTANT",
          data,
          submittedBy: currentPersona?.name
        }),
      });
      if (res.ok && onSave) onSave();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
      <div className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/50">
        <div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-amber-500" />
            Work Allocation
          </h3>
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">Admin to Business Consultants</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Allocation
        </button>
      </div>

      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField 
            label="Date" 
            value={data.date} 
            onChange={(v: string) => updateField("date", v)} 
            icon={<Calendar />} 
            type="date"
          />
          <FormField 
            label="Name of Provincial Coordinator" 
            value={data.coordinatorName} 
            onChange={(v: string) => updateField("coordinatorName", v)} 
            icon={<User />} 
          />
          <FormField 
            label="Name of the Client" 
            value={data.clientName} 
            onChange={(v: string) => updateField("clientName", v)} 
            icon={<User />} 
          />
          <FormField 
            label="ID Number" 
            value={data.idNumber} 
            onChange={(v: string) => updateField("idNumber", v)} 
            icon={<Briefcase />} 
          />
          <FormField 
            label="Business Name" 
            value={data.businessName} 
            onChange={(v: string) => updateField("businessName", v)} 
            icon={<Building />} 
          />
          <FormField 
            label="Voucher Number" 
            value={data.voucherNumber} 
            onChange={(v: string) => updateField("voucherNumber", v)} 
            icon={<ClipboardList />} 
          />
          <FormField 
            label="Service Required" 
            value={data.serviceRequired} 
            onChange={(v: string) => updateField("serviceRequired", v)} 
            icon={<Briefcase />} 
          />
          <FormField 
            label="Province" 
            value={data.province} 
            onChange={(v: string) => updateField("province", v)} 
            icon={<MapPin />} 
          />
          <FormField 
            label="District" 
            value={data.district} 
            onChange={(v: string) => updateField("district", v)} 
            icon={<MapPin />} 
          />
          <FormField 
            label="Local Municipality" 
            value={data.municipality} 
            onChange={(v: string) => updateField("municipality", v)} 
            icon={<MapPin />} 
          />
          <div className="md:col-span-2">
            <FormField 
              label="Name of Business Consultant" 
              value={data.consultantName} 
              onChange={(v: string) => updateField("consultantName", v)} 
              icon={<User />} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, value, onChange, icon, type = "text" }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{label}</label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400">
          {React.cloneElement(icon, { className: "w-full h-full" })}
        </div>
        <input 
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
        />
      </div>
    </div>
  );
}
