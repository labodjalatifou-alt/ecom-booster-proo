"use client";

import React, { useEffect, useState } from 'react';
import { Calculator, TrendingUp, TrendingDown, DollarSign, Target, Wallet, BarChart3, ArrowUpRight, ArrowDownRight, PieChart, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

function parsePrice(val: any): number {
  if (!val) return 0;
  const str = String(val).replace(/\s/g, '').replace(/[^\d.,]/g, '').replace(',', '.');
  return parseFloat(str) || 0;
}

export default function ComptabilitePage() {
  const [loading, setLoading] = useState(true);
  const [revenue, setRevenue] = useState(0);
  const [deliveredCount, setDeliveredCount] = useState(0);
  const [pendingRevenue, setPendingRevenue] = useState(0);
  const [cancelledCount, setCancelledCount] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('price, status');

        if (!error && data) {
          const delivered = data.filter(o => o.status === 'Livré');
          const pending = data.filter(o => o.status === 'Confirmé');
          const cancelled = data.filter(o => o.status === 'Annulé');

          setRevenue(delivered.reduce((acc, o) => acc + parsePrice(o.price), 0));
          setDeliveredCount(delivered.length);
          setPendingRevenue(pending.reduce((acc, o) => acc + parsePrice(o.price), 0));
          setCancelledCount(cancelled.length);
        }
      } catch (err) {
        console.error('Comptabilité fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const fmt = (n: number) => new Intl.NumberFormat('fr-FR').format(Math.round(n));

  const stats = [
    {
      label: "Chiffre d'Affaires",
      val: `${fmt(revenue)} FCFA`,
      sub: `${deliveredCount} colis livrés`,
      icon: Wallet,
      color: 'emerald',
      trend: 'up'
    },
    {
      label: "En Attente (Confirmés)",
      val: `${fmt(pendingRevenue)} FCFA`,
      sub: 'Cash à collecter',
      icon: DollarSign,
      color: 'blue',
      trend: 'up'
    },
    {
      label: "Livraisons Annulées",
      val: `${cancelledCount} colis`,
      sub: 'Non récupérés',
      icon: TrendingDown,
      color: 'amber',
      trend: 'down'
    },
    {
      label: "Profit Estimé",
      val: `${fmt(revenue)} FCFA`,
      sub: 'Sur colis livrés',
      icon: TrendingUp,
      color: 'purple',
      trend: 'up'
    },
  ];

  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600',
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600',
  };

  return (
    <div className="max-w-7xl mx-auto pb-10 px-4 text-slate-800 dark:text-slate-100 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <Calculator className="w-5 h-5 text-primary-600" />
            </div>
            <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em]">Trésorerie & Marges</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter">Comptabilité</h2>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-40">
          <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-7 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-2xl mb-5 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3 ${colorMap[stat.color]}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <div className="flex items-end gap-2 flex-wrap">
                  <h3 className="text-lg font-black tracking-tight">{stat.val}</h3>
                  <span className={`text-[9px] font-black flex items-center gap-0.5 ${stat.trend === 'up' ? 'text-emerald-500' : 'text-red-400'}`}>
                    {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {stat.sub}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Barres */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-9 shadow-sm">
              <h3 className="text-lg font-black mb-8 flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-primary-600" /> Répartition des Revenus
              </h3>

              {revenue === 0 && pendingRevenue === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                  <BarChart3 className="w-12 h-12 mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Aucune donnée disponible</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-1">Les données s'afficheront après les premières livraisons.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {[
                    { label: "Revenus Livrés", val: revenue, max: revenue + pendingRevenue, color: 'bg-emerald-500' },
                    { label: "Revenus En Attente", val: pendingRevenue, max: revenue + pendingRevenue, color: 'bg-blue-500' },
                  ].map((item, i) => {
                    const pct = item.max > 0 ? Math.round((item.val / item.max) * 100) : 0;
                    return (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{item.label}</span>
                          <span className="text-sm font-black">{fmt(item.val)} FCFA <span className="text-slate-400 text-[10px]">({pct}%)</span></span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${item.color} rounded-full transition-all duration-700`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ROI Card */}
            <div className="bg-slate-900 rounded-[2.5rem] p-9 text-white shadow-2xl relative overflow-hidden">
              <PieChart className="absolute top-0 right-0 w-40 h-40 text-white/5 -mr-12 -mt-12" />
              <h3 className="text-base font-black mb-6 flex items-center gap-3 relative z-10">
                <Target className="w-5 h-5 text-emerald-400" /> Résumé Financier
              </h3>
              <div className="space-y-5 relative z-10">
                {[
                  { label: 'CA Total (Livré)', val: `${fmt(revenue)} FCFA`, color: 'text-emerald-400' },
                  { label: 'En Attente', val: `${fmt(pendingRevenue)} FCFA`, color: 'text-blue-400' },
                  { label: 'Colis Livrés', val: `${deliveredCount}`, color: 'text-white' },
                  { label: 'Annulés', val: `${cancelledCount}`, color: 'text-red-400' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">{item.label}</span>
                    <span className={`text-sm font-black ${item.color}`}>{item.val}</span>
                  </div>
                ))}

                <div className="pt-5 border-t border-white/10">
                  <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-2">Conseil</p>
                  <p className="text-[11px] font-bold text-white/70 italic leading-relaxed">
                    {deliveredCount === 0
                      ? "Dès que les premières livraisons sont effectuées, vos stats apparaîtront ici."
                      : `Votre taux de livraison est de ${Math.round((deliveredCount / (deliveredCount + cancelledCount || 1)) * 100)}%. Visez 80%+ pour maximiser la rentabilité.`
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
