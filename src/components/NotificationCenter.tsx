"use client";

import { useState, useEffect } from "react";
import { Bell, X, Check, Briefcase } from "lucide-react";
import { useSimulation } from "@/lib/SimulationContext";
import { motion, AnimatePresence } from "framer-motion";

export default function NotificationCenter() {
  const { currentPersona } = useSimulation();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (currentPersona) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
      return () => clearInterval(interval);
    }
  }, [currentPersona]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`/api/notifications?userId=${currentPersona?.id}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setNotifications(notifications.filter(n => n.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = notifications.length;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-2xl transition-all group"
      >
        <Bell className="w-5 h-5 text-zinc-500 group-hover:text-blue-500 transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white dark:border-zinc-900 animate-in zoom-in duration-300">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-4 w-80 bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 z-50 overflow-hidden"
            >
              <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/50">
                <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-widest">Alerts Center</h3>
                <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Check className="w-6 h-6 text-zinc-300" />
                    </div>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">All caught up!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-50 dark:divide-zinc-800">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                        <div className="flex gap-4">
                          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500 shrink-0 mt-1">
                            <Briefcase className="w-4 h-4" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="text-xs font-bold text-zinc-900 dark:text-zinc-50 leading-snug">
                              {n.message}
                            </p>
                            {n.case && (
                              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                                Case: {n.case.clientName}
                              </p>
                            )}
                            <p className="text-[9px] text-zinc-400">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <button 
                            onClick={() => markAsRead(n.id)}
                            className="w-6 h-6 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:bg-blue-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="p-4 bg-zinc-50/50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800">
                <button className="w-full py-2 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">
                  View All Notifications
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
