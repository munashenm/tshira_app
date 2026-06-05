"use client";

import React from "react";
import { User, CreditCard, Phone, Mail, MapPin, ClipboardList, Briefcase, Building } from "lucide-react";

interface CapturedClientFieldsProps {
  data: {
    clientName?: string;
    idNumber?: string;
    phone?: string;
    email?: string;
    address?: string;
    businessName?: string;
    voucherNumber?: string;
    serviceRequired?: string;
    province?: string;
    district?: string;
    municipality?: string;
  };
  title?: string;
}

export default function CapturedClientFields({ data, title = "Client Details (Captured by Admin)" }: CapturedClientFieldsProps) {
  const fields = [
    { label: "Client Name", value: data.clientName, icon: <User className="w-4 h-4" /> },
    { label: "ID Number", value: data.idNumber, icon: <CreditCard className="w-4 h-4" /> },
    { label: "Voucher Number", value: data.voucherNumber, icon: <ClipboardList className="w-4 h-4" /> },
    { label: "Phone", value: data.phone, icon: <Phone className="w-4 h-4" /> },
    { label: "Email", value: data.email, icon: <Mail className="w-4 h-4" /> },
    { label: "Business Name", value: data.businessName, icon: <Building className="w-4 h-4" /> },
    { label: "Service Required", value: data.serviceRequired, icon: <Briefcase className="w-4 h-4" /> },
    { label: "Province", value: data.province, icon: <MapPin className="w-4 h-4" /> },
    { label: "District", value: data.district, icon: <MapPin className="w-4 h-4" /> },
    { label: "Municipality", value: data.municipality, icon: <MapPin className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">{title}</h4>
        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Read-only</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
        {fields.map((field) => (
          <div key={field.label} className="space-y-1">
            <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{field.label}</label>
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              <span className="text-zinc-400">{field.icon}</span>
              <span>{field.value || "—"}</span>
            </div>
          </div>
        ))}
        {data.address && (
          <div className="md:col-span-2 space-y-1">
            <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Physical Address</label>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{data.address}</p>
          </div>
        )}
      </div>
    </div>
  );
}
