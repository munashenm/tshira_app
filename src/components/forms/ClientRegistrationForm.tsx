"use client";

import React, { useState } from "react";
import { 
  UserCheck, 
  Save, 
  Loader2, 
  Calendar, 
  MapPin, 
  Building2, 
  Briefcase,
  ClipboardList
} from "lucide-react";
import { useRouter } from "next/navigation";

interface ClientRegistrationFormProps {
  caseData: any;
}

export default function ClientRegistrationForm({ caseData }: ClientRegistrationFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch(`/api/cases/${caseData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminOffice: data.adminOffice,
          voucherAppNumber: data.voucherAppNumber,
          dateAllocatedToCoordinator: data.dateAllocatedToCoordinator ? new Date(data.dateAllocatedToCoordinator as string) : null,
          dateAllocatedToConsultant: data.dateAllocatedToConsultant ? new Date(data.dateAllocatedToConsultant as string) : null,
          dateCompleted: data.dateCompleted ? new Date(data.dateCompleted as string) : null,
          clientUpdate: {
            district: data.district,
            municipality: data.municipality,
            address: data.address
          }
        }),
      });
      if (res.ok) router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
      <div className="px-10 py-8 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/50">
        <div>
          <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 flex items-center gap-3">
            <UserCheck className="w-8 h-8 text-blue-600" />
            Client Registration
          </h3>
          <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">Full Case Profile & Administrative Details</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="p-10 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Admin Info */}
          <Section label="Administrative Context">
            <InputField label="Admin Office" name="adminOffice" defaultValue={caseData.adminOffice} icon={<Building2 className="w-4 h-4" />} />
            <InputField label="Voucher Application #" name="voucherAppNumber" defaultValue={caseData.voucherAppNumber} icon={<ClipboardList className="w-4 h-4" />} />
          </Section>

          {/* Allocation Dates */}
          <Section label="Workflow Allocation">
            <DateField label="Allocated to Coordinator" name="dateAllocatedToCoordinator" defaultValue={caseData.dateAllocatedToCoordinator} />
            <DateField label="Allocated to Consultant" name="dateAllocatedToConsultant" defaultValue={caseData.dateAllocatedToConsultant} />
          </Section>

          {/* Completion */}
          <Section label="Project Lifecycle">
            <DateField label="Date Completed" name="dateCompleted" defaultValue={caseData.dateCompleted} />
            <DateField label="Date Invoiced" name="invoiceDate" defaultValue={caseData.invoiceDate} disabled />
          </Section>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-zinc-100 dark:border-zinc-800">
          <ReadOnlyField label="Client Name" value={caseData.clientName} />
          <ReadOnlyField label="SA ID Number" value={caseData.client?.idNumber} />
          <ReadOnlyField label="Phone Number" value={caseData.client?.phone} />
          <ReadOnlyField label="Email Address" value={caseData.client?.email} />
          <ReadOnlyField label="Voucher Number" value={caseData.voucherAppNumber || caseData.nydaReference} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-zinc-100 dark:border-zinc-800">
          <Section label="Location & Demographics">
            <InputField label="District" name="district" defaultValue={caseData.client?.district} icon={<MapPin className="w-4 h-4" />} />
            <InputField label="Local Municipality" name="municipality" defaultValue={caseData.client?.municipality} icon={<MapPin className="w-4 h-4" />} />
          </Section>
          
          <div className="space-y-3">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Full Physical Address</label>
            <textarea 
              name="address"
              defaultValue={caseData.client?.address}
              placeholder="Residential address..."
              className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-5 text-sm min-h-[100px] focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
            />
          </div>
        </div>

        <div className="pt-6 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/30 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? "Saving..." : "Update Registration Record"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Section({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-2">{label}</h4>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

function InputField({ label, name, defaultValue, icon, disabled }: { label: string, name: string, defaultValue?: string, icon?: React.ReactNode, disabled?: boolean }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative">
        <input 
          name={name}
          defaultValue={defaultValue || ""}
          disabled={disabled}
          className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-xl pl-5 pr-10 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50"
        />
        {icon && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="space-y-2 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{label}</label>
      <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{value || "—"}</p>
    </div>
  );
}

function DateField({ label, name, defaultValue, disabled }: { label: string, name: string, defaultValue?: any, disabled?: boolean }) {
  const dateStr = defaultValue ? new Date(defaultValue).toISOString().split('T')[0] : "";
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative">
        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input 
          type="date"
          name={name}
          defaultValue={dateStr}
          disabled={disabled}
          className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50"
        />
      </div>
    </div>
  );
}
