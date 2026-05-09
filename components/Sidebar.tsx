"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useSidebar } from './SidebarProvider';
import {
  LayoutDashboard,
  LineChart,
  Bot,
  Tags,
  UserSquare2,
  User,
  Users,
  Megaphone,
  Store,
  Mic,
  FileText,
  Trophy,
  History,
  ShoppingCart,
  Headset,
  Truck,
  Package,
  Calculator,
  Contact,
  Bell,
  Link as LinkIcon,
  Moon,
  Sun,
  X
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
      { name: 'Analyse', icon: Bot, href: '/analyses' },
      { name: 'Score et Prix', icon: Tags, href: '/score-et-prix' },
      { name: 'Avatar', icon: User, href: '/avatar' },
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
      { name: 'Commande', icon: ShoppingCart, href: '/commandes' },
      { name: 'Historique', icon: History, href: '/historique-commandes' },
      { name: 'Interface Closer', icon: Headset, href: '/interface-closer' },
      { name: 'Interface Livreur', icon: Truck, href: '/interface-livreur' },
      { name: 'Stock', icon: Package, href: '/stock' },
      { name: 'Comptabilité', icon: Calculator, href: '/comptabilite' },
    ]
  },
  {
    title: 'ADMINISTRATION',
    items: [
      { name: 'Équipe', icon: Users, href: '/equipe' },
      { name: 'Boutique', icon: Store, href: '/boutiques' },
      { name: 'Notification', icon: Bell, href: '/notifications' },
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
        "fixed top-0 left-0 h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-30 transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-primary-600 dark:text-primary-500 font-bold text-xl tracking-tight">
            <ShoppingCart className="w-6 h-6" />
            <span>EcomDash</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto scrollbar-hide py-4">
        {menuGroups.map((group, idx) => (
          <div key={idx} className="mb-6 px-4">
            <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-2">
              {group.title}
            </h3>
            <ul className="space-y-1">
              {group.items.map((item, itemIdx) => {
                const Icon = item.icon;
                const isActive = pathname === item.href && item.href !== '#';
                return (
                  <li key={itemIdx}>
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-95",
                        isActive 
                          ? "bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400 shadow-sm" 
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200"
                      )}
                    >
                      <Icon className={cn("w-5 h-5", isActive ? "text-primary-600 dark:text-primary-400" : "text-slate-400 dark:text-slate-500")} />
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
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <div className="bg-slate-100 dark:bg-slate-800/50 rounded-xl p-1 flex items-center justify-between relative shadow-inner">
          <button 
            onClick={() => setTheme('light')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all duration-300 relative z-10",
              mounted && theme !== 'dark' ? "bg-white shadow-sm text-primary-600 dark:text-primary-500 ring-1 ring-slate-200/50" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <Sun className="w-4 h-4" /> Clair
          </button>
          <button 
            onClick={() => setTheme('dark')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all duration-300 relative z-10",
              mounted && theme === 'dark' ? "bg-slate-700 text-primary-400 shadow-sm ring-1 ring-slate-600" : "text-slate-500 hover:text-slate-300"
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
