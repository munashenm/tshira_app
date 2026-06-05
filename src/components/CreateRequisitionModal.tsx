"use client";

import { useState, useEffect, useMemo } from "react";
import { X, Plus, Calendar, MapPin, Info, Clock, Hash } from "lucide-react";
import { Province } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useSimulation } from "@/lib/SimulationContext";

interface ClientOption {
  id: string;
  name: string;
  companyName: string | null;
  province?: string;
}

export default function CreateRequisitionModal({
  clients,
  dcos,
  actorProvince,
}: {
  clients: ClientOption[];
  dcos: { id: string; name: string | null }[];
  actorProvince: string | null;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { currentPersona } = useSimulation();

  const isProvincialUser =
    currentPersona?.role === "PROVINCIAL_COORDINATOR" || currentPersona?.role === "DATA_COLLECTION_OFFICER";

  const [selectedProvince, setSelectedProvince] = useState<string>(actorProvince || currentPersona?.province || "LIMPOPO");

  useEffect(() => {
    if (actorProvince) {
      setSelectedProvince(actorProvince);
    } else if (currentPersona?.province) {
      setSelectedProvince(currentPersona.province);
    }
  }, [actorProvince, currentPersona]);

  const provinceClients = useMemo(
    () => clients.filter((c) => !c.province || c.province === selectedProvince),
    [clients, selectedProvince]
  );

  const [formData, setFormData] = useState({
    location: "",
    meetingDate: "",
    meetingTime: "",
    meetingReference: "",
    purpose: "",
    isClientVisit: false,
    clientId: "",
    dcoId: "",
    estimatedCost: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.isClientVisit) {
      if (!formData.clientId) {
        alert("Please select a client for this visit.");
        return;
      }
      if (!formData.dcoId) {
        alert("A Data Collection Officer must be assigned for client visits.");
        return;
      }
      if (!formData.meetingReference.trim()) {
        alert("Meeting venue reference number is required for client visits.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const dateTime = new Date(`${formData.meetingDate}T${formData.meetingTime || "09:00"}`).toISOString();
      const res = await fetch("/api/requisitions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: formData.location,
          purpose: formData.purpose,
          isClientVisit: formData.isClientVisit,
          clientId: formData.clientId,
          dcoId: formData.dcoId || null,
          province: selectedProvince,
          dateTime,
          meetingTime: formData.meetingTime,
          meetingReference: formData.meetingReference,
          estimatedCost: formData.estimatedCost,
        }),
      });
      if (res.ok) {
        setIsOpen(false);
        setFormData({
          location: "",
          meetingDate: "",
          meetingTime: "",
          meetingReference: "",
          purpose: "",
          isClientVisit: false,
          clientId: "",
          dcoId: "",
          estimatedCost: 0,
        });
        router.refresh();
      } else {
        const errData = await res.json();
        alert(`Submission Failed: ${errData.error || "Please check your inputs and try again."}`);
      }
    } catch (error) {
      console.error(error);
      alert("Submission Failed: Network error or server is offline.");
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
        <Plus className="w-5 h-5" />
        New Requisition
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="px-8 py-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/50">
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Create Space Booking</h2>
              <div className="mt-2">
                {isProvincialUser ? (
                  <span className="text-xs font-bold uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl px-3 py-1">
                    {selectedProvince.replace(/_/g, " ")}
                  </span>
                ) : (
                  <select
                    value={selectedProvince}
                    onChange={(e) => {
                      setSelectedProvince(e.target.value);
                      setFormData((prev) => ({ ...prev, clientId: "", dcoId: "" }));
                    }}
                    className="text-xs font-bold uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-none rounded-xl px-3 py-1 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.values(Province).map((p) => (
                      <option key={p} value={p}>
                        {p.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
            <button type="button" onClick={() => setIsOpen(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
              <X className="w-5 h-5 text-zinc-400" />
            </button>
          </div>

          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Location / Venue</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  required
                  placeholder="e.g. Regus Co-working, Polokwane"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Meeting Reference Number{formData.isClientVisit ? " *" : ""}
              </label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  placeholder="Booking / venue reference number"
                  value={formData.meetingReference}
                  onChange={(e) => setFormData({ ...formData, meetingReference: e.target.value })}
                  required={formData.isClientVisit}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Date of Meeting</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    required
                    type="date"
                    value={formData.meetingDate}
                    onChange={(e) => setFormData({ ...formData, meetingDate: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Time of Meeting</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    required
                    type="time"
                    value={formData.meetingTime}
                    onChange={(e) => setFormData({ ...formData, meetingTime: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Estimated Cost (R)</label>
              <input
                type="number"
                placeholder="0.00"
                value={formData.estimatedCost}
                onChange={(e) => setFormData({ ...formData, estimatedCost: parseFloat(e.target.value) })}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Purpose / Motivation</label>
              <textarea
                required
                placeholder="Details of the client visit or data collection task..."
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px] resize-none"
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={formData.isClientVisit}
                onChange={(e) => setFormData({ ...formData, isClientVisit: e.target.checked, clientId: "", dcoId: "" })}
                className="w-5 h-5 rounded-lg border-zinc-200 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 transition-colors">This is a client/beneficiary visit</span>
            </label>

            {formData.isClientVisit && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Client to be met (your province only)</label>
                  <select
                    required
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                  >
                    <option value="">Select a client...</option>
                    {provinceClients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.companyName ? `(${c.companyName})` : ""}
                      </option>
                    ))}
                  </select>
                  {provinceClients.length === 0 && (
                    <p className="text-xs text-amber-600">No clients found in {selectedProvince.replace(/_/g, " ")}.</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Assign Data Collection Officer *</label>
                  <select
                    required
                    value={formData.dcoId}
                    onChange={(e) => setFormData({ ...formData, dcoId: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                  >
                    <option value="">Select DCO...</option>
                    {dcos.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  {dcos.length === 0 && (
                    <p className="text-xs text-amber-600">No DCOs assigned to {selectedProvince.replace(/_/g, " ")}. Add one in Team first.</p>
                  )}
                </div>
              </div>
            )}

            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex gap-3">
              <Info className="w-5 h-5 text-blue-500 shrink-0" />
              <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                Requisitions require Admin approval, then Finance confirmation. The assigned DCO will be notified once Finance confirms the booking.
              </p>
            </div>
          </div>

          <div className="p-8 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 flex justify-end gap-3">
            <button type="button" onClick={() => setIsOpen(false)} className="px-6 py-3 text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit Requisition"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
