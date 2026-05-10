"use client";

import React, { useEffect, useState } from 'react';
import { Users, Headset, Truck, DollarSign, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useStore } from '../StoreProvider';

const COMMISSION_CLOSER = 500;  // par confirmation
const COMMISSION_LIVREUR = 1000; // par livraison

export default function TeamEarnings() {
  const { currency, selectedStore } = useStore();
  const [loading, setLoading] = useState(true);
  const [closerEarnings, setCloserEarnings] = useState(0);
  const [livreurEarnings, setLivreurEarnings] = useState(0);
  const [confirmedCount, setConfirmedCount] = useState(0);
  const [deliveredCount, setDeliveredCount] = useState(0);
  const [livreurCashCollected, setLivreurCashCollected] = useState(0);
  const [netRevenue, setNetRevenue] = useState(0);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        let query = supabase.from('orders').select('*');
        
        if (selectedStore !== 'ALL') {
          query = query.eq('store_id', selectedStore);
        }
        
        const { data, error } = await query;
        if (error) throw error;
        
        if (data) {
          const confirmed = data.filter(o => o.status === 'Confirmé' || o.status === 'Livré');
          const delivered = data.filter(o => o.status === 'Livré');
          
          const cCount = confirmed.length;
          const dCount = delivered.length;
          
          setConfirmedCount(cCount);
          setDeliveredCount(dCount);
          
          const closerTotal = cCount * COMMISSION_CLOSER;
          const livreurTotal = dCount * COMMISSION_LIVREUR;
          
          setCloserEarnings(closerTotal);
          setLivreurEarnings(livreurTotal);
          
          // Cash collecté par les livreurs
          const cashCollected = delivered.reduce((acc, o) => {
            return acc + (o.cash_collected || parseFloat(String(o.price || '0').replace(/\s/g, '')));
          }, 0);
          setLivreurCashCollected(cashCollected);
          
          // Revenu net = Cash collecté - commissions livreur - commissions closer
          setNetRevenue(cashCollected - closerTotal - livreurTotal);
        }
      } catch (err) {
        console.error('Team earnings error:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
    
    const channel = supabase
      .channel('team-earnings-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchData())
      .subscribe();
    
    return () => { supabase.removeChannel(channel); };
  }, [selectedStore]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-10 shadow-sm">
        <div className="flex items-center justify-center py-10 gap-3 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-widest">Calcul des commissions...</span>
        </div>
      </div>
    );
  }

  const fmt = (n: number) => new Intl.NumberFormat('fr-FR').format(n);

  return (
    <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl">
          <Users className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-lg font-black tracking-tight">Commissions Équipe</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Closer: {COMMISSION_CLOSER} {currency}/confirm · Livreur: {COMMISSION_LIVREUR} {currency}/livraison</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Closer Earnings */}
        <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/10 border border-amber-200 dark:border-amber-800">
          <Headset className="absolute -right-2 -bottom-2 w-16 h-16 text-amber-200 dark:text-amber-800/30" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Headset className="w-4 h-4 text-amber-600" />
              <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest">Closer</span>
            </div>
            <p className="text-xl font-black text-amber-700">{fmt(closerEarnings)} {currency}</p>
            <p className="text-[9px] font-bold text-amber-500 mt-1">{confirmedCount} confirmations × {COMMISSION_CLOSER}</p>
          </div>
        </div>

        {/* Livreur Earnings */}
        <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 border border-blue-200 dark:border-blue-800">
          <Truck className="absolute -right-2 -bottom-2 w-16 h-16 text-blue-200 dark:text-blue-800/30" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Truck className="w-4 h-4 text-blue-600" />
              <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Livreur</span>
            </div>
            <p className="text-xl font-black text-blue-700">{fmt(livreurEarnings)} {currency}</p>
            <p className="text-[9px] font-bold text-blue-500 mt-1">{deliveredCount} livraisons × {COMMISSION_LIVREUR}</p>
          </div>
        </div>

        {/* Total Commissions */}
        <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-800/10 border border-rose-200 dark:border-rose-800">
          <DollarSign className="absolute -right-2 -bottom-2 w-16 h-16 text-rose-200 dark:text-rose-800/30" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-4 h-4 text-rose-600" />
              <span className="text-[9px] font-black text-rose-600 uppercase tracking-widest">Total Commissions</span>
            </div>
            <p className="text-xl font-black text-rose-700">{fmt(closerEarnings + livreurEarnings)} {currency}</p>
            <p className="text-[9px] font-bold text-rose-500 mt-1">À déduire du CA</p>
          </div>
        </div>

        {/* Net Revenue */}
        <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/10 border border-emerald-200 dark:border-emerald-800">
          <DollarSign className="absolute -right-2 -bottom-2 w-16 h-16 text-emerald-200 dark:text-emerald-800/30" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Revenu Net</span>
            </div>
            <p className="text-xl font-black text-emerald-700">{fmt(netRevenue)} {currency}</p>
            <p className="text-[9px] font-bold text-emerald-500 mt-1">CA - Commissions</p>
          </div>
        </div>
      </div>

      {/* Progress bars */}
      <div className="space-y-3">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Part Closer</span>
            <span className="text-[9px] font-black text-amber-600">{livreurCashCollected > 0 ? Math.round((closerEarnings / livreurCashCollected) * 100) : 0}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full transition-all duration-700" style={{ width: `${livreurCashCollected > 0 ? (closerEarnings / livreurCashCollected) * 100 : 0}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Part Livreur</span>
            <span className="text-[9px] font-black text-blue-600">{livreurCashCollected > 0 ? Math.round((livreurEarnings / livreurCashCollected) * 100) : 0}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all duration-700" style={{ width: `${livreurCashCollected > 0 ? (livreurEarnings / livreurCashCollected) * 100 : 0}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
