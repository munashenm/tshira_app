"use client";

import { useState } from "react";
import { Save, ClipboardCheck, Loader2, AlertCircle, CheckCircle2, Building2, Globe, Mail, Phone, MapPin, Hash, Briefcase } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSimulation } from "@/lib/SimulationContext";
import { Role, CaseStatus } from "@prisma/client";
import { validateSAID, isValidSAPhone } from "@/lib/validation";

export default function DataCollectionForm({ 
  caseId, 
  currentStatus, 
  initialData,
  initialId,
  initialPhone,
  clientData
}: { 
  caseId: string; 
  currentStatus: CaseStatus;
  initialData?: string | null;
  initialId?: string | null;
  initialPhone?: string | null;
  clientData?: any;
}) {
  const [data, setData] = useState(initialData || "");
  const [idNumber, setIdNumber] = useState(initialId || "");
  const [phone, setPhone] = useState(initialPhone || "");
  
  // Business Fields
  const [ckNumber, setCkNumber] = useState(clientData?.ckNumber || "");
  const [companyName, setCompanyName] = useState(clientData?.companyName || "");
  const [tradingName, setTradingName] = useState(clientData?.tradingName || "");
  const [businessEmail, setBusinessEmail] = useState(clientData?.businessEmail || "");
  const [businessPhone, setBusinessPhone] = useState(clientData?.businessPhone || "");
  const [businessWebsite, setBusinessWebsite] = useState(clientData?.businessWebsite || "");
  const [businessAddress, setBusinessAddress] = useState(clientData?.businessAddress || "");

  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  
  const router = useRouter();
  const { currentPersona } = useSimulation();

  const canEdit = currentPersona?.role === Role.DATA_COLLECTION_OFFICER || currentPersona?.role === Role.ADMIN_OFFICER;
  const isCorrectStage = ["ASSIGNED_FOR_DATA_COLLECTION", "DATA_COLLECTION_IN_PROGRESS", "RETURNED_FOR_DATA_CORRECTION"].includes(currentStatus);
  const isAdminCaptured = !!(clientData?.idNumber || initialId);
  const identityReadOnly = isAdminCaptured && currentPersona?.role !== Role.ADMIN_OFFICER;

  const validate = () => {
    const newErrors: string[] = [];
    if (idNumber && idNumber.length !== 13) newErrors.push("ID Number must be exactly 13 digits.");
    if (idNumber && !validateSAID(idNumber)) newErrors.push("Invalid South African ID checksum.");
    if (phone && !isValidSAPhone(phone)) newErrors.push("Phone Number must be 10 digits and start with 0.");
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    
    setIsSaving(true);
    try {
      const res = await fetch(`/api/cases/${caseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          beneficiaryDetails: data,
          idNumber,
          phone,
          businessData: {
            ckNumber,
            companyName,
            tradingName,
            businessEmail,
            businessPhone,
            businessWebsite,
            businessAddress
          },
          status: currentStatus === "ASSIGNED_FOR_DATA_COLLECTION" ? "DATA_COLLECTION_IN_PROGRESS" : currentStatus,
          userId: currentPersona?.id
        }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!canEdit && !data) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* ── BENEFICIARY IDENTITY ── */}
      <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
              <ClipboardCheck className="w-6 h-6 text-emerald-500" />
              Beneficiary Identity
            </h3>
            <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">Personal Verification</p>
          </div>
          {canEdit && isCorrectStage && (
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? "Saving..." : "Save Dossier"}
            </button>
          )}
        </div>

        {errors.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 p-4 rounded-2xl space-y-1">
            {errors.map(err => (
              <div key={err} className="flex items-center gap-2 text-red-600 dark:text-red-400 text-xs font-bold">
                <AlertCircle className="w-4 h-4" /> {err}
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input 
            label="SA ID Number (13 Digits)" 
            value={idNumber} 
            onChange={(v) => setIdNumber(v.replace(/\D/g, ""))} 
            placeholder="9001015000081" 
            maxLength={13} 
            disabled={!isCorrectStage || identityReadOnly} 
            icon={idNumber && (validateSAID(idNumber) ? <CheckCircle2 className="text-emerald-500" /> : <AlertCircle className="text-red-500" />)} 
          />
          <Input 
            label="Mobile Contact (10 Digits)" 
            value={phone} 
            onChange={(v) => setPhone(v.replace(/\D/g, ""))} 
            placeholder="0820000000" 
            maxLength={10} 
            disabled={!isCorrectStage || identityReadOnly}
            icon={phone && (isValidSAPhone(phone) ? <CheckCircle2 className="text-emerald-500" /> : <AlertCircle className="text-red-500" />)} 
          />
        </div>
      </div>

      {/* ── BUSINESS REGISTRATION ── */}
      <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-8">
        <div>
          <h3 className="text-xl font-black flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
            <Building2 className="w-6 h-6 text-blue-500" />
            Business Registration
          </h3>
          <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">CK / Company Compliance Data</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="CK / Registration Number" value={ckNumber} onChange={setCkNumber} placeholder="2023/123456/07" icon={<Hash className="w-4 h-4 text-zinc-400" />} disabled={!isCorrectStage} />
          <Input label="Registered Company Name" value={companyName} onChange={setCompanyName} placeholder="Legal Name" icon={<Building2 className="w-4 h-4 text-zinc-400" />} disabled={!isCorrectStage} />
          <Input label="Trading Name (if different)" value={tradingName} onChange={setTradingName} placeholder="Marketing Name" icon={<Briefcase className="w-4 h-4 text-zinc-400" />} disabled={!isCorrectStage} />
          <Input label="Company Website" value={businessWebsite} onChange={setBusinessWebsite} placeholder="www.example.co.za" icon={<Globe className="w-4 h-4 text-zinc-400" />} disabled={!isCorrectStage} />
          <Input label="Company Email" type="email" value={businessEmail} onChange={setBusinessEmail} placeholder="info@company.co.za" icon={<Mail className="w-4 h-4 text-zinc-400" />} disabled={!isCorrectStage} />
          <Input label="Company Contact" value={businessPhone} onChange={setBusinessPhone} placeholder="012 000 0000" icon={<Phone className="w-4 h-4 text-zinc-400" />} disabled={!isCorrectStage} />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Business Physical Address</label>
          <div className="relative">
            <MapPin className="absolute left-4 top-4 w-4 h-4 text-zinc-400" />
            <textarea 
              value={businessAddress}
              onChange={(e) => setBusinessAddress(e.target.value)}
              disabled={!isCorrectStage}
              placeholder="Full business address..."
              className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl pl-12 pr-4 py-4 text-sm min-h-[100px] outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* ── OPERATIONAL NOTES ── */}
      <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
        <label className="text-xl font-black flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
           Fieldwork Notes
        </label>
        <textarea 
          value={data}
          onChange={(e) => setData(e.target.value)}
          disabled={!canEdit || !isCorrectStage}
          placeholder="Capture detailed site visit notes, business model observations..."
          className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-[24px] p-6 text-sm min-h-[160px] focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
        />
      </div>
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type = "text", maxLength, icon, disabled }: { label: string, value: string, onChange: (v: string) => void, placeholder?: string, type?: string, maxLength?: number, icon?: React.ReactNode, disabled?: boolean }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative">
        <input 
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-60"
        />
        {icon && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
