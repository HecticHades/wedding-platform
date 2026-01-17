"use client";

import { useState } from "react";
import { Menu, LogOut, Bell } from "lucide-react";
import { DashboardSidebar } from "./DashboardSidebar";
import { MobileBottomNav } from "./MobileBottomNav";

interface DashboardShellProps {
  children: React.ReactNode;
  subdomain: string;
  userEmail: string;
  signOutAction: () => Promise<void>;
}

export function DashboardShell({
  children,
  subdomain,
  userEmail,
  signOutAction,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* Sidebar */}
      <DashboardSidebar
        subdomain={subdomain}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="lg:pl-60">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-[#e8e4e0]">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-[#e8e4e0] text-[#3d3936]"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Spacer for desktop */}
            <div className="hidden lg:block" />

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-[#e8e4e0] text-[#3d3936]/70 hover:text-[#3d3936] transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#c4a4a4] rounded-full" />
              </button>

              {/* User menu */}
              <div className="flex items-center gap-3 pl-3 border-l border-[#e8e4e0]">
                <span className="text-sm text-[#3d3936]/70 hidden sm:inline">
                  {userEmail}
                </span>
                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[#3d3936]/70 hover:text-[#3d3936] hover:bg-[#e8e4e0] transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6 pb-24 lg:pb-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <MobileBottomNav />
    </div>
  );
}
