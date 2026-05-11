"use client";

import React, { useEffect, useState } from 'react';
import { Truck, ShoppingBag, ArrowUpRight, ArrowDownRight, Clock, CheckCircle2, RefreshCw } from 'lucide-react';
import { useStore } from '../StoreProvider';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { useAppSounds } from '@/lib/hooks/useAppSounds';
import { sanitizeError } from '@/lib/utils';
import ConfirmationModal from '@/components/ConfirmationModal';

export default function StatCards() {
  const { currency, selectedStore } = useStore();
  const { playSound } = useAppSounds();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    caLivre: 0,
    cashInTransit: 0,
    deliveryRate: 0,
    pendingOrders: 0
  });
  const [period, setPeriod] = useState('ALL'); // TODAY, YESTERDAY, 30D, 90D, ALL
  const [showMarkReceivedConfirm, setShowMarkReceivedConfirm] = useState(false);

  useEffect(() => {
    async function fetchMetrics(silent = false) {
      if (!silent) setLoading(true);
      try {
        let query = supabase.from('orders').select('*');
        
        // Filtrage par période
        const now = new Date();
        if (period === 'TODAY') {
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
          query = query.gte('created_at', today);
        } else if (period === 'YESTERDAY') {
          const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toISOString();
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
          query = query.gte('created_at', yesterday).lt('created_at', today);
        } else if (period === '30D') {
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
          query = query.gte('created_at', thirtyDaysAgo);
        } else if (period === '90D') {
          const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
          query = query.gte('created_at', ninetyDaysAgo);
        }

        // Filtrage par boutique (utilise l'ID réel de la boutique depuis la DB)
        if (selectedStore) {
          query = query.eq('store_id', selectedStore);
        }

        const { data, error } = await query;
        if (error) throw error;

        if (data) {
          const parsePrice = (p: string) => { 
            if (typeof p === 'number') return p;
            const n = parseFloat((String(p) || '0').replace(/\s/g, '')); 
            return isNaN(n) ? 0 : n; 
          };

          const caLivre = data
            .filter(o => o.status === 'Livré')
            .reduce((acc, curr) => acc + (curr.cash_collected || parsePrice(curr.price)), 0);
          
          const cashInTransit = data
            .filter(o => o.status === 'Livré' && !o.cash_received)
            .reduce((acc, curr) => acc + (curr.cash_collected || parsePrice(curr.price)), 0);

          const deliveredCount = data.filter(o => o.status === 'Livré').length;
          const confirmedCount = data.filter(o => ['Confirmé', 'Livré', 'Annulé'].includes(o.status)).length;
          const deliveryRate = confirmedCount > 0 ? Math.round((deliveredCount / confirmedCount) * 100) : 0;

          const pendingOrders = data.filter(o => o.status === 'A Confirmer').length;

          setMetrics({ caLivre, cashInTransit, deliveryRate, pendingOrders });
        }
      } catch (err) {
        console.error('Error fetching metrics:', err);
      } finally {
        if (!silent) setLoading(false);
      }
    }

    fetchMetrics();
    
    // Abonnement en temps réel
    const channel = supabase
      .channel('stat-cards-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchMetrics(true);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedStore, period]);

  const stats = [
    {
      title: 'CA Livré',
      value: loading ? '...' : `${new Intl.NumberFormat('fr-FR').format(metrics.caLivre)} ${currency}`,
      trend: '+0%',
      isPositive: true,
      icon: CheckCircle2,
      color: 'bg-emerald-100 text-emerald-600',
    },
    {
      title: 'Cash in Transit',
      value: loading ? '...' : `${new Intl.NumberFormat('fr-FR').format(metrics.cashInTransit)} ${currency}`,
      trend: 'En attente',
      isPositive: null,
      icon: Clock,
      color: 'bg-amber-100 text-amber-600',
      action: "Valider Encaissement"
    },
    {
      title: 'Taux Livraison',
      value: loading ? '...' : `${metrics.deliveryRate}%`,
      trend: '+0%',
      isPositive: true,
      icon: Truck,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Commandes à Confirmer',
      value: loading ? '...' : `${metrics.pendingOrders}`,
      trend: 'À traiter',
      isPositive: null,
      icon: ShoppingBag,
      color: 'bg-primary-100 text-primary-600',
    }
  ];

  async function syncShopify() {
    const url = selectedStore ? `/api/sync-shopify?storeId=${selectedStore}` : '/api/sync-shopify';
    toast.promise(
      fetch(url).then(res => res.json()),
      {
        loading: 'Synchronisation Shopify...',
        success: (data) => `Synchronisé : ${data.count} commandes !`,
        error: 'Erreur de synchronisation',
      }
    );
  }

  async function handleMarkReceived() {
    setShowMarkReceivedConfirm(false);
    const { error } = await supabase
      .from('orders')
      .update({ cash_received: true })
      .eq('status', 'Livré')
      .eq('cash_received', false);
    
    if (error) {
      toast.error(sanitizeError(error));
    } else {
      toast.success("Cash validé !");
    }
  }

  return (
    <>
    <div className="flex justify-end items-center gap-4 mb-4">
      <div className="flex bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-1 shadow-sm">
        {[
          { id: 'TODAY', label: 'Aujourd\'hui' },
          { id: 'YESTERDAY', label: 'Hier' },
          { id: '30D', label: '30 Jours' },
          { id: '90D', label: '90 Jours' },
          { id: 'ALL', label: 'Tout' }
        ].map((p) => (
          <button
            key={p.id}
            onClick={() => setPeriod(p.id)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              period === p.id 
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <button 
        onClick={() => syncShopify()}
        className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-primary-600 hover:border-primary-100 transition-all shadow-sm"
      >
        <RefreshCw className="w-4 h-4" />
        Sync Shopify
      </button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div key={idx} className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border-2 border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-xl hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-300 group relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-4 rounded-2xl ${stat.color} dark:bg-opacity-20 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-6 h-6" />
              </div>
              {stat.isPositive !== null && (
                <div className={`flex items-center text-xs font-black uppercase tracking-widest ${stat.isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                  {stat.isPositive ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                  {stat.trend}
                </div>
              )}
              {stat.isPositive === null && (
                 <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                   {stat.trend}
                 </div>
              )}
            </div>
            
            <div className="mt-2">
              <h3 className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{stat.title}</h3>
              <p className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tighter">{stat.value}</p>
            </div>

            {stat.action && metrics.cashInTransit > 0 && (
              <button 
                onClick={(e) => { e.stopPropagation(); setShowMarkReceivedConfirm(true); }}
                className="mt-4 py-2 px-4 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-lg shadow-amber-500/20"
              >
                {stat.action}
              </button>
            )}
          </div>
        );
      })}
    </div>
    <ConfirmationModal
      isOpen={showMarkReceivedConfirm}
      onClose={() => setShowMarkReceivedConfirm(false)}
      onConfirm={handleMarkReceived}
      title="Valider l'Encaissement ?"
      message="Voulez-vous marquer tout le cash en transit comme reçu et transféré en comptabilité ?"
      confirmLabel="Valider tout"
      variant="warning"
    />
    </>
  );
}
