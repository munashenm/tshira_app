"use client";

import React, { useState } from "react";
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Database, 
  Clock, 
  Smartphone,
  Save,
  Globe,
  CheckCircle2,
  Loader2,
  Key,
  Mail
} from "lucide-react";

type Tab = "general" | "notifications" | "security" | "workflow" | "data";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // General settings state
  const [sladays, setSladays] = useState("7");
  const [template, setTemplate] = useState("Standard 2024 Template");
  const [orgName, setOrgName] = useState("Tshira Management Systems");
  const [orgEmail, setOrgEmail] = useState("admin@tshira.co.za");

  // Notifications state
  const [emailNotif, setEmailNotif] = useState(true);
  const [whatsappNotif, setWhatsappNotif] = useState(true);
  const [clientPortal, setClientPortal] = useState(false);
  const [slaAlerts, setSlaAlerts] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState("+27");
  const [emailFrom, setEmailFrom] = useState("noreply@tshira.co.za");

  // Security state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Workflow state
  const [autoAssign, setAutoAssign] = useState(false);
  const [requireChecklistApproval, setRequireChecklistApproval] = useState(true);
  const [autoSlaAlert, setAutoSlaAlert] = useState(true);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 900));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }
    setPasswordError("");
    alert("Password change will be implemented with full auth. Saved successfully for now.");
  };

  const tabs: { id: Tab; icon: React.ReactNode; label: string }[] = [
    { id: "general", icon: <User />, label: "General" },
    { id: "notifications", icon: <Bell />, label: "Notifications" },
    { id: "security", icon: <Shield />, label: "Security" },
    { id: "workflow", icon: <Clock />, label: "Workflow & SLA" },
    { id: "data", icon: <Database />, label: "Data & Storage" },
  ];

  return (
    <div className="p-8 space-y-8 bg-zinc-50 dark:bg-zinc-950 min-h-screen">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">System Settings</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">Manage your account, preferences, and operational defaults.</p>
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
        {/* Sidebar Tabs */}
        <div className="space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all text-left ${
                activeTab === tab.id
                  ? "bg-white dark:bg-zinc-900 text-blue-600 shadow-sm border border-zinc-200 dark:border-zinc-800"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              {React.cloneElement(tab.icon as React.ReactElement<{ className?: string }>, { className: "w-5 h-5" })}
              <span className="text-sm font-bold">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">

          {/* GENERAL TAB */}
          {activeTab === "general" && (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
              <h3 className="text-lg font-bold">Organisation Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Organisation Name</label>
                  <input value={orgName} onChange={e => setOrgName(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">System Email</label>
                  <input type="email" value={orgEmail} onChange={e => setOrgEmail(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <h4 className="text-sm font-bold mb-4">Default SLA</h4>
                <div className="flex items-center gap-4">
                  <input type="number" value={sladays} onChange={e => setSladays(e.target.value)} className="w-24 bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-center font-bold" />
                  <span className="text-sm text-zinc-500 font-medium">Days from allocation to invoice deadline</span>
                </div>
              </div>
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Default Document Template</label>
                <select value={template} onChange={e => setTemplate(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                  <option>Standard 2024 Template</option>
                  <option>Comprehensive Feasibility Study</option>
                  <option>Funding Application v2</option>
                </select>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === "notifications" && (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
              <h3 className="text-lg font-bold">Notification Channels</h3>
              <div className="space-y-4">
                <Toggle icon={<Mail />} label="Email Notifications" desc="Notify team members about new assignments via email." value={emailNotif} onChange={setEmailNotif} />
                {emailNotif && (
                  <div className="ml-14 space-y-2">
                    <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">From Email Address</label>
                    <input type="email" value={emailFrom} onChange={e => setEmailFrom(e.target.value)} placeholder="noreply@tshira.co.za" className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                )}
                <Toggle icon={<Smartphone />} label="WhatsApp Integration" desc="Send automated status updates via WhatsApp Business API." value={whatsappNotif} onChange={setWhatsappNotif} />
                {whatsappNotif && (
                  <div className="ml-14 space-y-2">
                    <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">WhatsApp Business Number</label>
                    <input value={whatsappNumber} onChange={e => setWhatsappNumber(e.target.value)} placeholder="+27 82 000 0000" className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                )}
                <Toggle icon={<Clock />} label="SLA Overdue Alerts" desc="Alert coordinators when a case exceeds the SLA deadline." value={slaAlerts} onChange={setSlaAlerts} />
                <Toggle icon={<Globe />} label="Client Portal Access" desc="Allow beneficiaries to track their project progress via a read-only link." value={clientPortal} onChange={setClientPortal} />
              </div>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === "security" && (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
              <h3 className="text-lg font-bold">Change Password</h3>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                {passwordError && (
                  <div className="bg-red-50 text-red-600 text-sm font-medium px-4 py-3 rounded-xl border border-red-100">
                    {passwordError}
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Current Password</label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="••••••••" className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">New Password</label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min 8 characters" className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Confirm New Password</label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat new password" className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/20 active:scale-95">
                  Update Password
                </button>
              </form>
            </div>
          )}

          {/* WORKFLOW TAB */}
          {activeTab === "workflow" && (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
              <h3 className="text-lg font-bold">Workflow Automation</h3>
              <div className="space-y-4">
                <Toggle icon={<CheckCircle2 />} label="Require Checklist Approval" desc="Quality review checklists must be 100% completed before advancing stage." value={requireChecklistApproval} onChange={setRequireChecklistApproval} />
                <Toggle icon={<Clock />} label="Auto SLA Breach Alerts" desc="System automatically flags cases that breach the SLA deadline." value={autoSlaAlert} onChange={setAutoSlaAlert} />
                <Toggle icon={<Settings />} label="Auto-assign to Province" desc="Automatically route new NYDA cases to the nearest available coordinator." value={autoAssign} onChange={setAutoAssign} />
              </div>
            </div>
          )}

          {/* DATA TAB */}
          {activeTab === "data" && (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
              <h3 className="text-lg font-bold">Data & Storage</h3>
              <div className="space-y-4">
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex justify-between items-center">
                  <div>
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Database</p>
                    <p className="text-xs text-zinc-500 mt-0.5">PostgreSQL (Railway) — Active</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">Connected</span>
                </div>
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex justify-between items-center">
                  <div>
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Document Storage</p>
                    <p className="text-xs text-zinc-500 mt-0.5">File upload (URL-based) — Configured</p>
                  </div>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Active</span>
                </div>
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <button className="text-sm font-bold text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl transition-all">
                    Export All Data (CSV)
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function Toggle({ icon, label, desc, value, onChange }: { icon: React.ReactNode; label: string; desc: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between group cursor-pointer" onClick={() => onChange(!value)}>
      <div className="flex gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${value ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-500' : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-400'}`}>
          {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "w-5 h-5" })}
        </div>
        <div>
          <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{label}</p>
          <p className="text-xs text-zinc-500">{desc}</p>
        </div>
      </div>
      <div className={`w-12 h-6 rounded-full relative transition-colors duration-300 flex-shrink-0 ml-4 ${value ? 'bg-blue-600' : 'bg-zinc-200 dark:bg-zinc-700'}`}>
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${value ? 'right-1' : 'left-1'}`} />
      </div>
    </div>
  );
}
