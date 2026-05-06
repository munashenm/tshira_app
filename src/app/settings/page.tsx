import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Database, 
  Globe, 
  Clock, 
  Smartphone,
  Save
} from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="p-8 space-y-8 bg-zinc-50 dark:bg-zinc-950 min-h-screen">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">System Settings</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">Manage your account, preferences, and operational defaults.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/20 transition-all active:scale-95">
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Tabs */}
        <div className="space-y-1">
          <SettingsTab icon={<User />} label="General" active />
          <SettingsTab icon={<Bell />} label="Notifications" />
          <SettingsTab icon={<Shield />} label="Security" />
          <SettingsTab icon={<Clock />} label="Workflow & SLA" />
          <SettingsTab icon={<Database />} label="Data & Storage" />
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-8">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <h3 className="text-lg font-bold mb-8">Operational Defaults</h3>
            
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Default Turnaround Time (SLA)</label>
                  <div className="flex items-center gap-4">
                    <input type="number" defaultValue="7" className="w-24 bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all" />
                    <span className="text-sm text-zinc-500 font-medium">Days from allocation to invoice</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Business Plan Template</label>
                  <select className="w-full bg-zinc-50 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition-all">
                    <option>Standard 2024 Template</option>
                    <option>Comprehensive Feasibility Study</option>
                  </select>
                </div>
              </div>

              <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800">
                <h4 className="text-sm font-bold mb-6">Notification Channels</h4>
                <div className="space-y-4">
                  <ToggleOption 
                    icon={<Bell />} 
                    label="Email Notifications" 
                    desc="Notify team members about new assignments via email." 
                    active 
                  />
                  <ToggleOption 
                    icon={<Smartphone />} 
                    label="WhatsApp Integration" 
                    desc="Send automated status updates via WhatsApp Business API." 
                    active 
                  />
                  <ToggleOption 
                    icon={<Globe />} 
                    label="Client Portal Access" 
                    desc="Allow beneficiaries to track their progress via a read-only link." 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsTab({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
      active 
        ? "bg-white dark:bg-zinc-900 text-blue-600 shadow-sm border border-zinc-200 dark:border-zinc-800" 
        : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800"
    }`}>
      {React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5" })}
      <span className="text-sm font-bold">{label}</span>
    </button>
  );
}

function ToggleOption({ icon, label, desc, active = false }: { icon: React.ReactNode, label: string, desc: string, active?: boolean }) {
  return (
    <div className="flex items-center justify-between group">
      <div className="flex gap-4">
        <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-500 transition-colors">
          {icon}
        </div>
        <div>
          <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{label}</p>
          <p className="text-xs text-zinc-500">{desc}</p>
        </div>
      </div>
      <div className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${active ? 'bg-blue-600' : 'bg-zinc-200 dark:bg-zinc-800'}`}>
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${active ? 'right-1' : 'left-1'}`} />
      </div>
    </div>
  );
}

import React from "react";
