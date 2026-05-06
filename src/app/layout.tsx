import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import DemoRoleSwitcher from "@/components/DemoRoleSwitcher";
import { SimulationProvider } from "@/lib/SimulationContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NYDA Workflow System",
  description: "Internal management system for NYDA projects",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-zinc-50 dark:bg-zinc-950 flex`}>
        <SimulationProvider>
          <DemoRoleSwitcher />
          <Sidebar />
          <div className="flex-1 overflow-x-hidden">
            {children}
          </div>
        </SimulationProvider>
      </body>
    </html>
  );
}
