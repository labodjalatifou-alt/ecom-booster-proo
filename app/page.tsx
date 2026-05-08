"use client";

import React from 'react';
import StatCards from '@/components/dashboard/StatCards';
import SalesChart from '@/components/dashboard/SalesChart';
import TopProducts from '@/components/dashboard/TopProducts';
import PerformanceWidget from '@/components/dashboard/PerformanceWidget';
import { LayoutDashboard } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto pb-10 px-4 animate-in fade-in duration-500">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <LayoutDashboard className="w-5 h-5 text-primary-600" />
            </div>
            <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em]">Vue d'ensemble</span>
          </div>
          <h2 className="text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tighter">Tableau de bord</h2>
          <p className="text-slate-400 text-sm mt-1 font-medium italic">Analysez la santé de vos boutiques en temps réel.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 p-6 rounded-[2rem] shadow-sm text-center min-w-[140px]">
            <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Status Shopify</span>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-black text-emerald-600">Connecté</span>
            </div>
          </div>
        </div>
      </div>

      <StatCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <SalesChart />
        <TopProducts />
      </div>

      <PerformanceWidget />
    </div>
  );
}
