"use client";

import { useState } from "react";
import { X, Shield, MapPin, UserPlus, Mail, Save, User, Key } from "lucide-react";
import { Role, Province } from "@prisma/client";
import { useRouter } from "next/navigation";
import { getClientActor } from "@/lib/client-auth";

export default function AddUserModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "password123", // Default for demo
    role: Role.DATA_COLLECTION_OFFICER as Role,
    province: "" as Province | "",
    phone: "",
    district: "",
    municipality: ""
  });
  const [additionalProvinces, setAdditionalProvinces] = useState<Province[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const actor = getClientActor();
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          userId: actor?.id,
          province: formData.province || null,
          additionalProvinces,
        }),
      });
      if (res.ok) {
        setIsOpen(false);
        setFormData({
            name: "",
            email: "",
            password: "password123",
            role: Role.DATA_COLLECTION_OFFICER as Role,
            province: "" as Province | "",
            phone: "",
            district: "",
            municipality: ""
        });
        setAdditionalProvinces([]);
        router.refresh();
      } else {
          const err = await res.json();
          alert(err.error || "Failed to add user");
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
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/20 transition-all active:scale-95"
      >
        <UserPlus className="w-5 h-5" />
        Add Team Member
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-lg max-h-[90vh] flex flex-col rounded-[32px] shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200">
        <div className="shrink-0 px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/50">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Add Team Member</h2>
            <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest font-bold">Create New System User</p>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
          <div className="overflow-y-auto p-8 space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input 
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="John Doe"
                className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input 
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="john@tshira.co.za"
                className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Phone Number</label>
            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input 
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="+27 82 123 4567"
                className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">System Role</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.values(Role).map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setFormData({...formData, role: r})}
                    className={`p-4 rounded-2xl border text-left transition-all ${formData.role === r ? 'bg-blue-600 border-transparent text-white shadow-lg shadow-blue-500/20' : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-blue-500'}`}
                  >
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1">{r.replace(/_/g, ' ')}</p>
                    <p className={`text-[9px] leading-tight ${formData.role === r ? 'text-blue-100' : 'text-zinc-400'}`}>
                      {r === 'ADMIN_OFFICER' && "Full system access & oversight."}
                      {r === 'PROVINCIAL_COORDINATOR' && "Regional management & allocation."}
                      {r === 'DATA_COLLECTION_OFFICER' && "Fieldwork & data capture."}
                      {r === 'BUSINESS_CONSULTANT' && "Plan development & strategy."}
                      {r === 'REVIEWER' && "Quality control & approvals."}
                    </p>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2 col-span-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Province (Regional Assignment)</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <select 
                  value={formData.province}
                  onChange={(e) => setFormData({...formData, province: e.target.value as Province})}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                >
                  <option value="">National / Head Office</option>
                  {Object.values(Province).map(p => (
                    <option key={p} value={p}>{p.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="space-y-2 col-span-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Additional Provinces (Cross-Branch Access)</label>
              <p className="text-[10px] text-zinc-400">Primary province above is their home branch. Select other provinces they may also work in.</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {Object.values(Province).filter(p => p !== formData.province).map(p => (
                  <label key={p} className="flex items-center gap-2 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                    <input
                      type="checkbox"
                      checked={additionalProvinces.includes(p)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAdditionalProvinces([...additionalProvinces, p]);
                        } else {
                          setAdditionalProvinces(additionalProvinces.filter(x => x !== p));
                        }
                      }}
                      className="rounded text-blue-600"
                    />
                    <span className="text-[10px] font-bold uppercase">{p.replace(/_/g, " ")}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">District</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input 
                  value={formData.district}
                  onChange={(e) => setFormData({...formData, district: e.target.value})}
                  placeholder="e.g. Capricorn"
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Local Municipality</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input 
                  value={formData.municipality}
                  onChange={(e) => setFormData({...formData, municipality: e.target.value})}
                  placeholder="e.g. Polokwane"
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>
          </div>

          <div className="shrink-0 px-8 py-5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50 flex gap-4">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {isSubmitting ? "Creating User..." : "Add User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
