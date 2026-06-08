"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Shield, MapPin, Save, Key, CheckCircle2, AlertTriangle, Settings, User, Mail, History, Activity } from "lucide-react";
import { Role, Province } from "@prisma/client";
import { useRouter } from "next/navigation";
import { getClientActor } from "@/lib/client-auth";

export default function EditUserModal({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<"details" | "permissions" | "password" | "logs">("details");
  
  // Details State
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [district, setDistrict] = useState(user.district || "");
  const [municipality, setMunicipality] = useState(user.municipality || "");
  
  // Permissions State
  const [role, setRole] = useState<Role>(user.role);
  const [province, setProvince] = useState<Province | "">(user.province || "");
  const [additionalProvinces, setAdditionalProvinces] = useState<Province[]>(
    (user.provinceAssignments || []).map((a: { province: Province }) => a.province)
  );
  const [active, setActive] = useState<boolean>(user.active ?? true);
  
  // Password State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const actor = getClientActor();
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, email, phone, district, municipality,
          role, province: province || null, active,
          additionalProvinces: additionalProvinces.filter(p => p !== province),
          userId: actor?.id 
        }),
      });
      if (res.ok) {
        setIsOpen(false);
        router.refresh();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "Passwords do not match." });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }
    setIsSubmitting(true);
    try {
      const actor = getClientActor();
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword, userId: actor?.id }),
      });
      if (res.ok) {
        setPasswordMsg({ type: "success", text: "Password updated successfully." });
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordMsg({ type: "error", text: "Failed to update password." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center w-10 h-10 bg-zinc-50 hover:bg-blue-50 dark:bg-zinc-800/50 dark:hover:bg-blue-900/20 text-zinc-500 hover:text-blue-600 rounded-xl transition-all group"
        title="Manage User"
      >
        <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
      </button>
    );
  }

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/50 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Manage Team Member</h2>
              <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest font-bold">{user.name} · {user.role.replace(/_/g, ' ')}</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-100 dark:border-zinc-800 px-8 gap-6 shrink-0 overflow-x-auto no-scrollbar">
          {(["details", "permissions", "password", "logs"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
                tab === t 
                  ? "text-blue-600 border-b-2 border-blue-600" 
                  : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              }`}
            >
              {t === "details" && "Personal Details"}
              {t === "permissions" && "Role & Rights"}
              {t === "password" && "Security"}
              {t === "logs" && "Activity Logs"}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto p-8">
          {tab === "details" && (
            <form id="details-form" onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                    <User className="w-3 h-3" /> Full Name
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                    <Mail className="w-3 h-3" /> Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                    <MapPin className="w-3 h-3" /> Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                    <MapPin className="w-3 h-3" /> District
                  </label>
                  <input
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                    <MapPin className="w-3 h-3" /> Local Municipality
                  </label>
                  <input
                    value={municipality}
                    onChange={(e) => setMunicipality(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </form>
          )}

          {tab === "permissions" && (
            <form id="permissions-form" onSubmit={handleUpdate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                  <Shield className="w-3 h-3" /> System Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {Object.values(Role).map(r => (
                    <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-3 h-3" /> Provincial Assignment
                </label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value as Province)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Head Office / Unassigned</option>
                  {Object.values(Province).map(p => (
                    <option key={p} value={p}>{p.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-3 h-3" /> Additional Provinces (Cross-Branch)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(Province).filter(p => p !== province).map(p => (
                    <label key={p} className="flex items-center gap-2 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={additionalProvinces.includes(p)}
                        onChange={(e) => {
                          if (e.target.checked) setAdditionalProvinces([...additionalProvinces, p]);
                          else setAdditionalProvinces(additionalProvinces.filter(x => x !== p));
                        }}
                        className="rounded text-blue-600"
                      />
                      <span className="text-[10px] font-bold uppercase">{p.replace(/_/g, " ")}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="w-5 h-5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Account Active</p>
                    <p className="text-xs text-zinc-500">Uncheck to disable this user's login access entirely.</p>
                  </div>
                </label>
              </div>
            </form>
          )}

          {tab === "password" && (
            <form id="password-form" onSubmit={handlePasswordReset} className="space-y-6">
              {passwordMsg && (
                <div className={`flex items-center gap-3 p-4 rounded-2xl text-sm font-medium ${passwordMsg.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"}`}>
                  {passwordMsg.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
                  {passwordMsg.text}
                </div>
              )}
              
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 mb-6">
                <p className="text-sm text-amber-800 dark:text-amber-400 flex items-center gap-2 font-bold mb-1">
                  <Key className="w-4 h-4" /> Current Password
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-500">
                  {user.password ? `The user's current password is: ${user.password}` : "No password set for this user."}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">New Password</label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-zinc-400 uppercase tracking-widest">Confirm New Password</label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </form>
          )}

          {tab === "logs" && (
            <div className="space-y-4">
              {(!user.history || user.history.length === 0) ? (
                <div className="text-center py-10">
                  <History className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
                  <p className="text-sm text-zinc-500">No activity logs found for this user.</p>
                </div>
              ) : (
                user.history.map((h: any) => (
                  <div key={h.id} className="flex gap-4 items-start p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0 mt-0.5">
                      <Activity className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                        {h.status.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">
                        Case: <span className="font-semibold">{h.case?.clientName}</span> ({h.case?.nydaReference})
                      </p>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-2">
                        {new Date(h.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50 shrink-0">
          {(tab === "details" || tab === "permissions") && (
            <button
              form={`${tab}-form`}
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {isSubmitting ? "Saving Changes..." : "Save Changes"}
            </button>
          )}
          {tab === "password" && (
            <button
              form="password-form"
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              <Key className="w-5 h-5" />
              {isSubmitting ? "Updating Password..." : "Update Password"}
            </button>
          )}
          {tab === "logs" && (
            <button
              onClick={() => setIsOpen(false)}
              className="w-full bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 font-bold py-3.5 rounded-2xl transition-all"
            >
              Close Logs
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
