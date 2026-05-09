"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useSidebar } from './SidebarProvider';
import {
  LayoutDashboard,
  Bot,
  Tags,
  User,
  Megaphone,
  Store,
  Mic,
  Trophy,
  History,
  ShoppingCart,
  Headset,
  Truck,
  Package,
  Calculator,
  Users,
  Bell,
  Moon,
  Sun,
  X,
  ClipboardList
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const menuGroups = [
  {
    title: 'PRINCIPAL',
    items: [
      { name: 'Tableau de bord', icon: LayoutDashboard, href: '/' },
    ]
  },
  {
    title: 'IA & E-COMMERCE',
    items: [
      { name: 'Analyse IA', icon: Bot, href: '/analyses' },
      { name: 'Historique Analyses', icon: ClipboardList, href: '/historique' },
      { name: 'Score et Prix', icon: Tags, href: '/score-et-prix' },
      { name: 'Avatar Client', icon: User, href: '/avatar' },
      { name: 'Analyse Concurrent', icon: Trophy, href: '/analyse-concurrent' },
      { name: 'Page Shopify', icon: Store, href: '/page-shopify' },
    ]
  },
  {
    title: 'MARKETING & VENTE',
    items: [
      { name: 'Publicité Facebook', icon: Megaphone, href: '/publicite-facebook' },
      { name: 'Script Voix Off', icon: Mic, href: '/script-voix-off' },
    ]
  },
  {
    title: 'OPÉRATIONS & CRM',
    items: [
      { name: 'Commandes', icon: ShoppingCart, href: '/commandes' },
      { name: 'Interface Closer', icon: Headset, href: '/interface-closer' },
      { name: 'Interface Livreur', icon: Truck, href: '/interface-livreur' },
      { name: 'Stock / Inventaire', icon: Package, href: '/stock' },
      { name: 'Historique Ventes', icon: History, href: '/historique-commandes' },
      { name: 'Comptabilité', icon: Calculator, href: '/comptabilite' },
    ]
  },
  {
    title: 'CONFIGURATION',
    items: [
      { name: 'Gestion Équipe', icon: Users, href: '/equipe' },
      { name: 'Mes Boutiques', icon: Store, href: '/boutiques' },
      { name: 'Base Clients', icon: User, href: '/clients' },
      { name: 'Notifications', icon: Bell, href: '/notifications' },
    ]
  }
];

export default function Sidebar() {
  const { theme, setTheme } = useTheme();
  const { isOpen, setIsOpen } = useSidebar();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-20 md:hidden backdrop-blur-sm transition-opacity" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={cn(
        "fixed top-0 left-0 h-screen w-64 bg-white dark:bg-slate-900 border-r-2 border-slate-100 dark:border-slate-800 flex flex-col z-30 transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Logo */}
        <div className="h-20 flex items-center justify-between px-8 border-b-2 border-slate-50 dark:border-slate-800">
          <div className="flex items-center gap-3 text-primary-600 dark:text-primary-500 font-black text-2xl tracking-tighter">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <span>EcomDash</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto scrollbar-hide py-6">
        {menuGroups.map((group, idx) => (
          <div key={idx} className="mb-8 px-4">
            <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3 px-4">
              {group.title}
            </h3>
            <ul className="space-y-1">
              {group.items.map((item, itemIdx) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <li key={itemIdx}>
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-200 group/link",
                        isActive 
                          ? "bg-primary-600 text-white shadow-xl shadow-primary-500/20 translate-x-1" 
                          : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary-600"
                      )}
                    >
                      <Icon className={cn("w-5 h-5 transition-transform group-hover/link:scale-110", isActive ? "text-white" : "text-slate-400 group-hover/link:text-primary-500")} />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Theme Toggle */}
      <div className="p-6 border-t-2 border-slate-50 dark:border-slate-800">
        <div className="bg-slate-100 dark:bg-slate-800 rounded-[1.5rem] p-1.5 flex items-center justify-between relative shadow-inner">
          <button 
            onClick={() => setTheme('light')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 relative z-10",
              mounted && theme !== 'dark' ? "bg-white shadow-lg text-primary-600 shadow-slate-200/50" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <Sun className="w-4 h-4" /> Clair
          </button>
          <button 
            onClick={() => setTheme('dark')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 relative z-10",
              mounted && theme === 'dark' ? "bg-slate-700 text-primary-400 shadow-lg" : "text-slate-400 hover:text-slate-300"
            )}
          >
            <Moon className="w-4 h-4" /> Sombre
          </button>
        </div>
      </div>
    </aside>
    </>
  );
}
