"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // ── Routes publiques/externes SANS sidebar ni header du SaaS ──
  // /s/[slug] = la boutique publiée (doit ressembler à un site externe type Shopify).
  // /terms, /privacy = pages légales standalone.
  const PUBLIC_PREFIXES = ['/s/', '/terms', '/privacy'];
  const isPublicRoute = PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(p));

  // ── Éditeur de boutique : pas de padding auto, l'éditeur gère son plein écran ──
  const isEditor = pathname.startsWith('/boutiques/') && pathname.split('/').length === 3;

  if (isPublicRoute) {
    // Boutique publique : rendu brut, AUCUN chrome du SaaS.
    return <>{children}</>;
  }

  // ── Dashboard ─────────────────────────────────────────────────────
  const isEmployee = false; // false = vue Admin complète (sidebar + header)

  if (isEditor) {
    // Éditeur boutique = plein écran sans sidebar SaaS (comme Shopify Theme Editor).
    return (
      <div className="flex min-h-screen">
        <main className="flex-1 overflow-hidden p-0 w-full">{children}</main>
      </div>
    );
  }

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
