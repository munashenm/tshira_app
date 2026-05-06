"use client";

import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  FileText, 
  Settings, 
  LogOut,
  CalendarDays,
  Receipt
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

export default function Sidebar() {
  const pathname = usePathname();

  const router = useRouter();

  const handleSignOut = () => {
    localStorage.removeItem("tshira_auth");
    router.push("/login");
  };

  return (
    <aside className="w-72 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col h-screen sticky top-0">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Briefcase className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">NYDA Flow</span>
        </div>

        <nav className="space-y-1">
          <SidebarItem icon={<LayoutDashboard />} label="Dashboard" href="/" active={pathname === "/"} />
          <SidebarItem icon={<Briefcase />} label="Work Items" href="/cases" active={pathname.startsWith("/cases")} />
          <SidebarItem icon={<CalendarDays />} label="Requisitions" href="/requisitions" active={pathname === "/requisitions"} />
          <SidebarItem icon={<Receipt />} label="Finance" href="/finance" active={pathname === "/finance"} />
          <SidebarItem icon={<Users />} label="Team" href="/team" active={pathname === "/team"} />
          <SidebarItem icon={<FileText />} label="Reports" href="/reports" active={pathname === "/reports"} />
        </nav>
      </div>

      <div className="mt-auto p-8 border-t border-zinc-100 dark:border-zinc-800">
        <nav className="space-y-1">
          <SidebarItem icon={<Settings />} label="Settings" href="/settings" active={pathname === "/settings"} />
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center gap-4 px-4 py-3 text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-semibold">Sign Out</span>
          </button>
        </nav>
      </div>
    </aside>
  );
}

function SidebarItem({ icon, label, href, active = false }: { icon: React.ReactNode, label: string, href: string, active?: boolean }) {
  return (
    <Link 
      href={href}
      className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
        active 
          ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
          : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-50"
      }`}
    >
      {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "w-5 h-5" })}
      <span className="text-sm font-semibold">{label}</span>
    </Link>
  );
}
