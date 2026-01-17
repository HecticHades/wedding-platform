"use client";

import { useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopBar } from "./AdminTopBar";

interface AdminShellProps {
  children: React.ReactNode;
  userEmail: string;
  signOutAction: () => Promise<void>;
}

export function AdminShell({
  children,
  userEmail,
  signOutAction,
}: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <AdminTopBar
          userEmail={userEmail}
          onMenuClick={() => setSidebarOpen(true)}
          signOutAction={signOutAction}
        />

        {/* Page content */}
        <main className="p-4 lg:p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
