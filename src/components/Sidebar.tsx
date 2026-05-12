"use client";

import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  FileText, 
  Settings, 
  LogOut,
  CalendarDays,
  Receipt,
  TrendingDown,
  UserCircle,
  X,
  ClipboardList,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = () => {
    fetch("/api/auth/logout", { method: "POST" }).finally(() => {
      localStorage.removeItem("tshira_auth");
      localStorage.removeItem("demo_persona");
      router.push("/login");
    });
  };

  const menuItems = [
    { icon: <LayoutDashboard />, label: "Dashboard", href: "/" },
    { icon: <Briefcase />, label: "Workflow Tasks", href: "/cases" },
    { icon: <Users />, label: "Clients", href: "/clients" },
    { icon: <CalendarDays />, label: "Requisitions", href: "/requisitions" },
    { icon: <Receipt />, label: "Billing", href: "/finance" },
    { icon: <TrendingDown />, label: "Expenses", href: "/finance/expenses" },
    { icon: <UserCircle />, label: "Team", href: "/team" },
    { icon: <FileText />, label: "Reports", href: "/reports" },
    { icon: <ShieldCheck />, label: "Audit Trail", href: "/audit" },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 
          flex flex-col h-screen transition-transform duration-300 lg:translate-x-0 lg:sticky lg:top-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="p-8 flex flex-col h-full overflow-y-auto">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Tshira</span>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => (
              <SidebarItem 
                key={item.href}
                icon={item.icon} 
                label={item.label} 
                href={item.href} 
                active={item.href === "/" ? pathname === "/" : item.href === "/finance" ? pathname === "/finance" : pathname.startsWith(item.href)} 
                onClick={onClose}
              />
            ))}
          </nav>

          <div className="mt-auto pt-8 border-t border-zinc-100 dark:border-zinc-800">
            <nav className="space-y-1">
              <SidebarItem 
                icon={<Settings />} 
                label="Settings" 
                href="/settings" 
                active={pathname === "/settings"} 
                onClick={onClose}
              />
              <button 
                onClick={handleSignOut}
                className="w-full flex items-center gap-4 px-4 py-3 text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-semibold">Sign Out</span>
              </button>
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
}

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
  onClick?: () => void;
}

function SidebarItem({ icon, label, href, active = false, onClick }: SidebarItemProps) {
  return (
    <Link 
      href={href}
      onClick={onClick}
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
