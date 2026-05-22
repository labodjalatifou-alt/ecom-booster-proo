"use client";

import React from 'react';
import StatCards from '@/components/dashboard/StatCards';
import TopProducts from '@/components/dashboard/TopProducts';
import TeamEarnings from '@/components/dashboard/TeamEarnings';
import { LayoutDashboard } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto pb-10 px-2 md:px-4 text-slate-800 dark:text-slate-100 animate-in fade-in duration-500">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <LayoutDashboard className="w-5 h-5 text-primary-600" />
            </div>
            <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em]">Vue d'ensemble</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tighter">Tableau de bord</h2>
          <p className="text-slate-400 text-sm mt-1 font-medium italic">Analysez la santé de vos boutiques en temps réel.</p>
        </div>
      </div>

      <StatCards />

      {/* Commission Tracker */}
      <div className="mb-8">
        <TeamEarnings />
      </div>

      <TopProducts />
    </div>
  );
}
