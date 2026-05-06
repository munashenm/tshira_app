"use client";

import { useState } from "react";
import { X, Shield, MapPin, CheckCircle2, User, Mail, Save } from "lucide-react";
import { Role, Province } from "@prisma/client";
import { useRouter } from "next/navigation";

export default function EditUserModal({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState<Role>(user.role);
  const [province, setProvince] = useState<Province | "">(user.province || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, province: province || null }),
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

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-1.5 rounded-lg transition-all"
      >
        Edit Rights
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
        <div className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Manage Permissions</h2>
            <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest font-bold">{user.name}</p>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>
        
        <form onSubmit={handleUpdate} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-3 h-3" />
              System Role
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
              <MapPin className="w-3 h-3" />
              Provincial Assignment
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

          <div className="pt-4 flex gap-4">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {isSubmitting ? "Updating..." : "Save Permissions"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
