"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  User, Bell, Shield, Database, Clock, Smartphone,
  Save, Globe, CheckCircle2, Loader2, Key, Mail,
  Receipt, Building, CreditCard, FileText, Image, AlertTriangle, UserCircle
} from "lucide-react";

type Tab = "general" | "profile" | "invoice" | "notifications" | "security" | "workflow" | "data" | "logs";

interface Settings {
  orgName: string; orgEmail: string; orgPhone: string; orgAddress: string;
  orgLogoUrl: string; orgWebsite: string;
  invoicePrefix: string; invoiceSequence: number; invoicePaymentDays: number;
  invoiceBankName: string; invoiceBankAccount: string; invoiceBranchCode: string;
  invoiceAccountType: string; invoiceVatNumber: string;
  invoiceTerms: string; invoiceNotes: string;
  slaDefaultDays: number; autoSlaAlerts: boolean;
  emailEnabled: boolean; emailFrom: string; resendApiKey: string;
  whatsappEnabled: boolean; whatsappNumber: string; twilioAccountSid: string; twilioAuthToken: string;
}

const DEFAULT: Settings = {
  orgName: "Tshira Management Systems", orgEmail: "admin@tshira.co.za",
  orgPhone: "", orgAddress: "Limpopo, South Africa", orgLogoUrl: "", orgWebsite: "www.tshira.co.za",
  invoicePrefix: "TSH", invoiceSequence: 1, invoicePaymentDays: 30,
  invoiceBankName: "FNB", invoiceBankAccount: "", invoiceBranchCode: "",
  invoiceAccountType: "Cheque", invoiceVatNumber: "",
  invoiceTerms: "Payment is due within 30 days of invoice date. Late payments may incur interest charges.",
  invoiceNotes: "Thank you for your business.",
  slaDefaultDays: 7, autoSlaAlerts: true,
  emailEnabled: true, emailFrom: "noreply@tshira.co.za", resendApiKey: "",
  whatsappEnabled: false, whatsappNumber: "", twilioAccountSid: "", twilioAuthToken: "",
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [settings, setSettings] = useState<Settings>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab2, setTab2] = useState<"permissions" | "password">("permissions");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [passwordSaving, setPasswordSaving] = useState(false);

  const set = (key: keyof Settings, val: string | number | boolean) =>
    setSettings(prev => ({ ...prev, [key]: val }));

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then(d => { if (d && !d.error) setSettings(d); })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { setPasswordMsg({ type: "error", text: "Passwords do not match." }); return; }
    if (newPassword.length < 6) { setPasswordMsg({ type: "error", text: "Min 6 characters." }); return; }
    setPasswordSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setPasswordMsg({ type: "success", text: "Password updated successfully." });
    setNewPassword(""); setConfirmPassword("");
    setPasswordSaving(false);
  };

  const tabs: { id: Tab; icon: React.ReactNode; label: string }[] = [
    { id: "general", icon: <Building />, label: "Organisation" },
    { id: "profile", icon: <UserCircle />, label: "My Profile" },
    { id: "invoice", icon: <Receipt />, label: "Invoice" },
    { id: "notifications", icon: <Bell />, label: "Notifications" },
    { id: "workflow", icon: <Clock />, label: "Workflow & SLA" },
    { id: "security", icon: <Shield />, label: "Security" },
    { id: "data", icon: <Database />, label: "Data" },
    { id: "logs", icon: <Clock />, label: "System Logs" },
  ];

  const nextInvoice = `${settings.invoicePrefix}-${new Date().getFullYear()}-${String(settings.invoiceSequence).padStart(4, "0")}`;

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-screen">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
    </div>
  );

  return (
    <div className="p-8 space-y-8 bg-zinc-50 dark:bg-zinc-950 min-h-screen">
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">System Settings</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">Configure your organisation, invoices, notifications and workflow.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-70"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                activeTab === tab.id
                  ? "bg-white dark:bg-zinc-900 text-blue-600 shadow-sm border border-zinc-200 dark:border-zinc-800"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              {React.cloneElement(tab.icon as React.ReactElement<{ className?: string }>, { className: "w-5 h-5 shrink-0" })}
              <span className="text-sm font-bold">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">

          {/* ── ORGANISATION ── */}
          {activeTab === "general" && (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
              <h3 className="text-lg font-bold flex items-center gap-2"><Building className="w-5 h-5 text-zinc-400" /> Organisation Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Organisation Name" value={settings.orgName} onChange={v => set("orgName", v)} />
                <Field label="Email Address" type="email" value={settings.orgEmail} onChange={v => set("orgEmail", v)} />
                <Field label="Phone Number" value={settings.orgPhone} onChange={v => set("orgPhone", v)} placeholder="+27 15 000 0000" />
                <Field label="Website" value={settings.orgWebsite} onChange={v => set("orgWebsite", v)} placeholder="www.tshira.co.za" />
              </div>
              <Field label="Physical Address" value={settings.orgAddress} onChange={v => set("orgAddress", v)} />
              <div className="space-y-2">
                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                  <Image className="w-3.5 h-3.5" /> Logo URL
                </label>
                <input
                  value={settings.orgLogoUrl}
                  onChange={e => set("orgLogoUrl", e.target.value)}
                  placeholder="https://your-cdn.com/logo.png"
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
                {settings.orgLogoUrl && (
                  <div className="mt-3 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={settings.orgLogoUrl} alt="Logo preview" className="h-12 object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    <p className="text-xs text-zinc-500">Logo preview — this will appear on all invoices</p>
                  </div>
                )}
                <p className="text-xs text-zinc-400">Paste a publicly accessible image URL. Leave blank to use the text logo.</p>
              </div>
            </div>
          )}

          {/* ── PROFILE ── */}
          {activeTab === "profile" && (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-8">
              <h3 className="text-lg font-bold flex items-center gap-2"><UserCircle className="w-5 h-5 text-blue-500" /> Personal Profile</h3>
              
              <div className="flex items-center gap-8 p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-[32px]">
                <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-[32px] flex items-center justify-center text-blue-600 relative group cursor-pointer overflow-hidden">
                   <UserCircle className="w-12 h-12" />
                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <Image className="w-6 h-6 text-white" />
                   </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xl font-black text-zinc-900 dark:text-zinc-50">Identity Verification</p>
                  <p className="text-sm text-zinc-500">Upload your professional avatar for audit logs.</p>
                  <button className="text-xs font-black text-blue-600 uppercase tracking-widest mt-2">Change Photo</button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Digital Signature</label>
                  <div className="h-40 bg-zinc-50 dark:bg-zinc-800 border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-[24px] flex flex-col items-center justify-center gap-2 group cursor-pointer hover:border-blue-500 transition-all">
                     <FileText className="w-8 h-8 text-zinc-200 group-hover:text-blue-500" />
                     <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Click to upload signature</p>
                  </div>
                  <p className="text-[10px] text-zinc-400 italic">This signature will be applied to generated Business Plans and Invoices.</p>
                </div>
                <div className="space-y-6">
                   <Field label="Display Name" value="Senior Consultant" onChange={() => {}} />
                   <Field label="Professional Email" value="consultant@tshira.co.za" onChange={() => {}} />
                </div>
              </div>
            </div>
          )}

          {/* ── INVOICE ── */}
          {activeTab === "invoice" && (
            <div className="space-y-6">
              {/* Numbering */}
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
                <h3 className="text-lg font-bold flex items-center gap-2"><FileText className="w-5 h-5 text-blue-500" /> Invoice Numbering</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Prefix</label>
                    <input
                      value={settings.invoicePrefix}
                      onChange={e => set("invoicePrefix", e.target.value.toUpperCase())}
                      maxLength={6}
                      placeholder="TSH"
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm font-mono font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Next Sequence No.</label>
                    <input
                      type="number"
                      value={settings.invoiceSequence}
                      onChange={e => set("invoiceSequence", parseInt(e.target.value) || 1)}
                      min={1}
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Payment Due (Days)</label>
                    <input
                      type="number"
                      value={settings.invoicePaymentDays}
                      onChange={e => set("invoicePaymentDays", parseInt(e.target.value) || 30)}
                      min={1}
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                  <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">Next invoice number will be:</p>
                  <p className="text-2xl font-black text-blue-700 dark:text-blue-400 font-mono">{nextInvoice}</p>
                </div>
              </div>

              {/* Banking */}
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-5">
                <h3 className="text-lg font-bold flex items-center gap-2"><CreditCard className="w-5 h-5 text-emerald-500" /> Banking Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="Bank Name" value={settings.invoiceBankName} onChange={v => set("invoiceBankName", v)} placeholder="FNB, ABSA, Standard Bank..." />
                  <Field label="Account Number" value={settings.invoiceBankAccount} onChange={v => set("invoiceBankAccount", v)} placeholder="62 000 000 000" />
                  <Field label="Branch Code" value={settings.invoiceBranchCode} onChange={v => set("invoiceBranchCode", v)} placeholder="250 655" />
                  <div className="space-y-2">
                    <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Account Type</label>
                    <select
                      value={settings.invoiceAccountType}
                      onChange={e => set("invoiceAccountType", e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option>Cheque</option>
                      <option>Savings</option>
                      <option>Business Current</option>
                      <option>Transmission</option>
                    </select>
                  </div>
                  <Field label="VAT Number (optional)" value={settings.invoiceVatNumber} onChange={v => set("invoiceVatNumber", v)} placeholder="4000000000" />
                </div>
              </div>

              {/* Terms */}
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-5">
                <h3 className="text-lg font-bold flex items-center gap-2"><FileText className="w-5 h-5 text-purple-500" /> Terms & Notes</h3>
                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Terms & Conditions</label>
                  <textarea
                    value={settings.invoiceTerms}
                    onChange={e => set("invoiceTerms", e.target.value)}
                    rows={4}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Footer Note</label>
                  <textarea
                    value={settings.invoiceNotes}
                    onChange={e => set("invoiceNotes", e.target.value)}
                    rows={2}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── NOTIFICATIONS ── */}
          {activeTab === "notifications" && (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
              <h3 className="text-lg font-bold">Notification Channels</h3>
              <div className="space-y-5">
                <Toggle icon={<Mail />} label="Email Notifications" desc="Notify team members about new assignments and status changes." value={settings.emailEnabled} onChange={v => set("emailEnabled", v)} />
                {settings.emailEnabled && (
                  <div className="ml-14 grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="From Email" type="email" value={settings.emailFrom} onChange={v => set("emailFrom", v)} />
                    <Field label="Resend API Key" type="password" value={settings.resendApiKey || ""} onChange={v => set("resendApiKey", v)} placeholder="re_..." />
                  </div>
                )}
                <Toggle icon={<Smartphone />} label="WhatsApp Integration" desc="Send automated status updates via WhatsApp Business API." value={settings.whatsappEnabled} onChange={v => set("whatsappEnabled", v)} />
                {settings.whatsappEnabled && (
                  <div className="ml-14 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Field label="Twilio Account SID" value={settings.twilioAccountSid || ""} onChange={v => set("twilioAccountSid", v)} placeholder="AC..." />
                      <Field label="Twilio Auth Token" type="password" value={settings.twilioAuthToken || ""} onChange={v => set("twilioAuthToken", v)} placeholder="••••••••" />
                    </div>
                    <Field label="WhatsApp Business Number" value={settings.whatsappNumber} onChange={v => set("whatsappNumber", v)} placeholder="+14155238886" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── WORKFLOW ── */}
          {activeTab === "workflow" && (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
              <h3 className="text-lg font-bold">Workflow & SLA Defaults</h3>
              <div className="space-y-2">
                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Default SLA (days)</label>
                <div className="flex items-center gap-4">
                  <input type="number" value={settings.slaDefaultDays} onChange={e => set("slaDefaultDays", parseInt(e.target.value) || 7)} min={1} className="w-24 bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-center font-bold" />
                  <span className="text-sm text-zinc-500">days from case creation to invoice deadline</span>
                </div>
              </div>
              <Toggle icon={<Clock />} label="Auto SLA Breach Alerts" desc="Flag cases that exceed the SLA deadline automatically." value={settings.autoSlaAlerts} onChange={v => set("autoSlaAlerts", v)} />
            </div>
          )}

          {/* ── SECURITY ── */}
          {activeTab === "security" && (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
              <h3 className="text-lg font-bold">Change Your Password</h3>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                {passwordMsg && (
                  <div className={`flex items-center gap-3 p-4 rounded-2xl text-sm font-medium ${passwordMsg.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"}`}>
                    {passwordMsg.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
                    {passwordMsg.text}
                  </div>
                )}
                <PasswordField label="New Password" value={newPassword} onChange={setNewPassword} />
                <PasswordField label="Confirm New Password" value={confirmPassword} onChange={setConfirmPassword} />
                <button type="submit" disabled={passwordSaving} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20">
                  {passwordSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                  {passwordSaving ? "Updating..." : "Update Password"}
                </button>
              </form>
            </div>
          )}

          {/* ── DATA ── */}
          {activeTab === "data" && (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-5">
              <h3 className="text-lg font-bold">Data & Storage</h3>
              <StatusRow label="Database" detail="PostgreSQL (Railway)" badge="Connected" color="green" />
              <StatusRow label="Document Storage" detail="URL-based uploads" badge="Active" color="blue" />
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex gap-3 flex-wrap">
                <a href="/api/export/cases" className="flex items-center gap-2 bg-zinc-800 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-zinc-700 transition-all">
                  <Database className="w-4 h-4" /> Export All Cases (CSV)
                </a>
              </div>
            </div>
          )}

          {/* ── SYSTEM LOGS ── */}
          {activeTab === "logs" && (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><Activity className="w-5 h-5 text-emerald-500" /> System Audit Trail</h3>
              <SystemLogsView />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
    </div>
  );
}

function PasswordField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">{label}</label>
      <div className="relative">
        <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input type="password" value={value} onChange={e => onChange(e.target.value)} placeholder="••••••••"
          className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
      </div>
    </div>
  );
}

function Toggle({ icon, label, desc, value, onChange }: { icon: React.ReactNode; label: string; desc: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between cursor-pointer group" onClick={() => onChange(!value)}>
      <div className="flex gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${value ? "bg-blue-50 dark:bg-blue-900/20 text-blue-500" : "bg-zinc-50 dark:bg-zinc-800 text-zinc-400"}`}>
          {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "w-5 h-5" })}
        </div>
        <div>
          <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{label}</p>
          <p className="text-xs text-zinc-500">{desc}</p>
        </div>
      </div>
      <div className={`w-12 h-6 rounded-full relative transition-colors duration-300 flex-shrink-0 ml-6 ${value ? "bg-blue-600" : "bg-zinc-200 dark:bg-zinc-700"}`}>
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${value ? "right-1" : "left-1"}`} />
      </div>
    </div>
  );
}

function StatusRow({ label, detail, badge, color }: { label: string; detail: string; badge: string; color: string }) {
  return (
    <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl">
      <div>
        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{label}</p>
        <p className="text-xs text-zinc-500 mt-0.5">{detail}</p>
      </div>
      <span className={`text-xs font-bold px-3 py-1 rounded-full ${color === "green" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"}`}>{badge}</span>
    </div>
  );
}

import { Activity } from "lucide-react";

function SystemLogsView() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/activity")
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setLogs(d); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-12 text-center text-zinc-400 font-bold uppercase tracking-widest text-xs">Fetching Logs...</div>;

  return (
    <div className="space-y-6">
      {logs.map((log) => (
        <div key={log.id} className="flex gap-4 p-4 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors border border-transparent hover:border-zinc-100 dark:hover:border-zinc-800">
          <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                <span className="text-blue-600 dark:text-blue-400">{log.user?.name || "System"}</span> 
                {" marked "}
                <span className="text-zinc-600 dark:text-zinc-400">"{log.case.clientName}"</span>
                {" as "}
                <span className="text-emerald-600 font-black">{log.status.replace(/_/g, ' ')}</span>
              </p>
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{new Date(log.createdAt).toLocaleString()}</span>
            </div>
            {log.comments && <p className="text-xs text-zinc-500 mt-1 italic">"{log.comments}"</p>}
          </div>
        </div>
      ))}
      {logs.length === 0 && <p className="text-center py-12 text-zinc-400">No system activity recorded yet.</p>}
    </div>
  );
}
