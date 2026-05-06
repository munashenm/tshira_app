"use client";

import { useState, useEffect } from "react";
import { X, UserPlus, Search, CheckCircle2 } from "lucide-react";
import { Role } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useSimulation } from "@/lib/SimulationContext";

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export default function UserAssignmentModal({ 
  caseId, 
  role,
  label,
  caseProvince
}: { 
  caseId: string; 
  role: Role;
  label: string;
  caseProvince: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { currentPersona } = useSimulation();

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/users?role=${role}`);
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
    setIsSubmitting(true);
    const fieldMap: Record<Role, string> = {
      PROVINCIAL_COORDINATOR: "coordinatorId",
      DATA_COLLECTION_OFFICER: "dcoId",
      BUSINESS_CONSULTANT: "consultantId",
      REVIEWER: "reviewerId",
      ADMIN_OFFICER: "adminId",
      FINANCE: "financeId"
    };

    const field = fieldMap[role];
    try {
      const res = await fetch(`/api/cases/${caseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: userId }),
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

  const canAssign = () => {
    if (!currentPersona) return false;
    const myRole = currentPersona.role;
    
    // Admin can assign anyone
    if (myRole === Role.ADMIN_OFFICER) return true;

    // Provincial Coordinator can assign DCOs in their province
    if (myRole === Role.PROVINCIAL_COORDINATOR && role === Role.DATA_COLLECTION_OFFICER && currentPersona.province === caseProvince) {
      return true;
    }

    return false;
  };

  const allowed = canAssign();

  if (!isOpen) {
    return (
      <button 
        disabled={!allowed}
        onClick={() => setIsOpen(true)}
        className={`text-xs font-bold px-2 py-1 rounded transition-all ${
          allowed 
            ? "text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20" 
            : "text-zinc-300 cursor-not-allowed"
        }`}
      >
        {allowed ? `Assign ${label}` : "Locked"}
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200">
        <div className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/50">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Assign {label}</h2>
            <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest font-bold">Role: {role.replace(/_/g, ' ')}</p>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>
        
        <div className="p-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              placeholder="Search team members..." 
              className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="space-y-2 max-h-[40vh] overflow-y-auto">
            {isLoading ? (
              <p className="text-center py-8 text-zinc-400">Finding available team members...</p>
            ) : users.length === 0 ? (
              <p className="text-center py-8 text-zinc-400">No users found with this role.</p>
            ) : (
              users.map((u) => (
                <button
                  key={u.id}
                  disabled={isSubmitting}
                  onClick={() => handleAssign(u.id)}
                  className="w-full p-4 rounded-2xl text-left border border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-blue-200 dark:hover:border-blue-900/30 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-500 transition-colors">
                      <UserPlus className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{u.name}</p>
                      <p className="text-xs text-zinc-500">{u.email}</p>
                    </div>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-zinc-200 group-hover:text-blue-500 transition-colors" />
                </button>
              ))
            )}
          </div>
        </div>

        <div className="p-8 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 flex justify-end">
          <button 
            onClick={() => setIsOpen(false)}
            className="px-6 py-3 text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
