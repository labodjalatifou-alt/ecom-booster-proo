"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // ── Dashboard ─────────────────────────────────────────────────────
  // Bypass auth check, assume user is ADMIN for testing purposes
  const isEmployee = false; // Set to false to show sidebar/header for Admin

  return (
    <div className="flex min-h-screen">
      {!isEmployee && <Sidebar />}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${!isEmployee ? 'md:ml-64' : ''}`}>
        {!isEmployee && <Header />}
        <main className={`flex-1 overflow-auto ${isEmployee ? 'p-0' : 'p-4 md:p-8'}`}>
          {children}
        </main>
      </div>
    </div>
  );
}

