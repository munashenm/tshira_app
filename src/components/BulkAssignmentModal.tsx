"use client";

import { useState, useEffect } from "react";
import { X, UserPlus, Search, CheckCircle2, Loader2, Users } from "lucide-react";
import { Role, Province } from "@prisma/client";
import { useRouter } from "next/navigation";
import { getClientActor } from "@/lib/client-auth";

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  province?: Province;
}

export default function BulkAssignmentModal({ 
  caseIds,
  onClose,
  onSuccess
}: { 
  caseIds: string[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [step, setStep] = useState<"select_role" | "select_user">("select_role");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (selectedRole) {
      fetchUsers(selectedRole);
    }
  }, [selectedRole]);

  const fetchUsers = async (role: Role) => {
    setIsLoading(true);
    try {
      const actor = getClientActor();
      const actorId = actor?.id ? `&actorId=${encodeURIComponent(actor.id)}` : "";
      const res = await fetch(`/api/users?role=${role}${actorId}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssign = async (userId: string) => {
    if (!selectedRole) return;
    setIsSubmitting(true);
    
    const fieldMap: Partial<Record<Role, string>> = {
      PROVINCIAL_COORDINATOR: "coordinatorId",
      DATA_COLLECTION_OFFICER: "dcoId",
      BUSINESS_CONSULTANT: "consultantId",
      REVIEWER: "reviewerId",
    };

    const field = fieldMap[selectedRole];
    try {
      const actor = getClientActor();
      const res = await fetch(`/api/cases/bulk`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          caseIds,
          userId: actor?.id,
          [field!]: userId,
          comments: `Bulk assigned to ${selectedRole.replace(/_/g, ' ')}`
        }),
      });
      if (res.ok) {
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const roles: { id: Role; label: string; desc: string }[] = [
    { id: "PROVINCIAL_COORDINATOR", label: "Provincial Coordinator", desc: "Assign to a provincial lead" },
    { id: "DATA_COLLECTION_OFFICER", label: "Data Collection Officer", desc: "Assign for on-site data gathering" },
    { id: "BUSINESS_CONSULTANT", label: "Business Consultant", desc: "Assign for document development" },
    { id: "REVIEWER", label: "Quality Reviewer", desc: "Assign for internal quality check" },
  ];

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-xl rounded-[32px] shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200">
        <div className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Bulk Assignment</span>
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Updating {caseIds.length} Cases</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>
        
        <div className="p-8">
          {step === "select_role" ? (
            <div className="space-y-4">
              <p className="text-sm text-zinc-500 mb-6">Select which role you would like to assign these cases to.</p>
              <div className="grid grid-cols-1 gap-3">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => { setSelectedRole(r.id); setStep("select_user"); }}
                    className="flex items-center justify-between p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:border-blue-200 dark:hover:border-blue-900/30 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all text-left group"
                  >
                    <div>
                      <p className="font-bold text-zinc-900 dark:text-zinc-50">{r.label}</p>
                      <p className="text-xs text-zinc-500">{r.desc}</p>
                    </div>
                    <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                      <UserPlus className="w-4 h-4" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setStep("select_role")}
                  className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  ← Back to roles
                </button>
                <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />
                <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">Select {selectedRole?.replace(/_/g, ' ')}</p>
              </div>

              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input 
                  autoFocus
                  placeholder="Search team members..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Finding available users...</p>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-sm text-zinc-500">No users found with this role.</p>
                  </div>
                ) : (
                  filteredUsers.map((u) => (
                    <button
                      key={u.id}
                      disabled={isSubmitting}
                      onClick={() => handleAssign(u.id)}
                      className="w-full p-4 rounded-2xl text-left border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-blue-200 dark:hover:border-blue-900/30 transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-500 transition-colors">
                          <UserPlus className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{u.name}</p>
                            {u.province && (
                              <span className="text-[10px] font-black bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-500">
                                {u.province}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-500 mt-0.5">{u.email}</p>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-200 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-500 transition-all">
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-8 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 flex justify-between items-center">
          <p className="text-xs text-zinc-500">
            Selected: <span className="font-bold text-zinc-900 dark:text-zinc-50">{caseIds.length} items</span>
          </p>
          <button 
            onClick={onClose}
            className="px-6 py-3 text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
