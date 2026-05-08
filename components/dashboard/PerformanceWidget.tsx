"use client";

import React, { useEffect, useState } from 'react';
import { useStore } from '../StoreProvider';
import { Trophy, Users, Bike, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function PerformanceWidget() {
  const { selectedStore, currency } = useStore();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({
    closers: [],
    livreurs: [],
    tunnel: { delivered: 0, rto: 0, cancelled: 0, pending: 0, totalConfirmed: 0 }
  });

  useEffect(() => {
    async function fetchPerformance() {
      setLoading(true);
      try {
        let query = supabase.from('orders').select('*');
        if (selectedStore !== 'ALL') {
          query = query.eq('city', selectedStore === 'ABIDJAN' ? 'Abidjan' : selectedStore === 'DAKAR' ? 'Dakar' : 'Conakry');
        }
        const { data: orders, error } = await query;
        if (error) throw error;

        if (orders) {
          // Tunnel Stats
          const totalConfirmed = orders.filter(o => ['Confirmé', 'Livré', 'Annulé'].includes(o.status)).length;
          const delivered = orders.filter(o => o.status === 'Livré').length;
          const cancelled = orders.filter(o => o.status === 'Annulé').length;
          const pending = orders.filter(o => o.status === 'En cours').length;
          const deliveryRate = totalConfirmed > 0 ? Math.round((delivered / totalConfirmed) * 100) : 0;
          const rtoRate = totalConfirmed > 0 ? Math.round((cancelled / totalConfirmed) * 100) : 0;

          // Closers Leaderboard (Simulé pour l'instant car closer_id est UUID)
          const closers = [
            { name: 'Fatou Diop', confirmed: orders.filter(o => o.status === 'Confirmé').length, rate: '92%' },
          ];

          // Livreurs Leaderboard
          const livreurs = [
            { name: 'Ibrahim Touré', delivered: delivered, success: `${deliveryRate}%`, cash: new Intl.NumberFormat('fr-FR').format(orders.filter(o => o.status === 'Livré').reduce((acc, curr) => acc + parseInt(curr.price.replace(/\s/g, '')), 0)) },
          ];

          setData({
            closers,
            livreurs,
            tunnel: { delivered: deliveryRate, rto: rtoRate, cancelled: 4, pending: pending, totalConfirmed: totalConfirmed }
          });
        }
      } catch (err) {
        console.error('Error fetching performance:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPerformance();
  }, [selectedStore]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
      {/* Closer Leaderboard */}
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border-2 border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-2xl">
              <Users className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tighter">Performance Closers</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Taux de Confirmation</p>
            </div>
          </div>
          <Trophy className="w-8 h-8 text-amber-400" />
        </div>

        <div className="space-y-4">
          {data.closers.map((closer: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl group hover:bg-primary-50 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center font-black text-sm shadow-sm">
                  #{idx + 1}
                </div>
                <div>
                  <div className="font-black text-slate-800 dark:text-slate-100 text-sm">{closer.name}</div>
                  <div className="text-[10px] font-black text-primary-500 uppercase">{closer.confirmed} Confirmés</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-primary-600">{closer.rate}</div>
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Succès</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Livreur Leaderboard */}
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border-2 border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl">
              <Bike className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tighter">Performance Livreurs</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cash & Livraisons</p>
            </div>
          </div>
          <TrendingUp className="w-8 h-8 text-emerald-500" />
        </div>

        <div className="space-y-4">
          {data.livreurs.map((livreur: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl group hover:bg-emerald-50 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center font-black text-sm shadow-sm">
                  #{idx + 1}
                </div>
                <div>
                  <div className="font-black text-slate-800 dark:text-slate-100 text-sm">{livreur.name}</div>
                  <div className="text-[10px] font-black text-emerald-500 uppercase">{livreur.delivered} Livrés</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-black text-slate-800 dark:text-slate-100">{livreur.cash} {currency}</div>
                <div className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">{livreur.success} Succès</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tunnel Widget (Full Width) */}
      <div className="bg-slate-900 text-white rounded-[3rem] p-10 col-span-1 lg:col-span-2 shadow-2xl overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 blur-[100px] -mr-32 -mt-32"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <h3 className="text-3xl font-black tracking-tighter mb-2">Tunnel Opérationnel</h3>
            <p className="text-xs font-black text-white/40 uppercase tracking-[0.3em]">Santé globale du business</p>
          </div>
          
          <div className="flex gap-8">
            <div className="text-center">
              <div className="text-3xl font-black text-emerald-400">{data.tunnel.delivered}%</div>
              <div className="text-[9px] font-black text-white/30 uppercase tracking-widest mt-1">Livraison (DSR)</div>
            </div>
            <div className="w-px h-12 bg-white/10 hidden md:block"></div>
            <div className="text-center">
              <div className="text-3xl font-black text-amber-400">{data.tunnel.rto}%</div>
              <div className="text-[9px] font-black text-white/30 uppercase tracking-widest mt-1">Retours (RTO)</div>
            </div>
            <div className="w-px h-12 bg-white/10 hidden md:block"></div>
            <div className="text-center">
              <div className="text-3xl font-black text-red-500">{data.tunnel.cancelled}%</div>
              <div className="text-[9px] font-black text-white/30 uppercase tracking-widest mt-1">Annulations</div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 flex items-center gap-4">
             <div className="p-3 bg-emerald-500/20 rounded-xl"><CheckCircle2 className="w-6 h-6 text-emerald-400" /></div>
             <div>
               <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">Confirmées</div>
               <div className="text-xl font-black">{data.tunnel.totalConfirmed}</div>
             </div>
          </div>
          <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 flex items-center gap-4">
             <div className="p-3 bg-amber-500/20 rounded-xl"><TrendingUp className="w-6 h-6 text-amber-400" /></div>
             <div>
               <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">En cours</div>
               <div className="text-xl font-black">{data.tunnel.pending}</div>
             </div>
          </div>
          <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 flex items-center gap-4">
             <div className="p-3 bg-red-500/20 rounded-xl"><AlertCircle className="w-6 h-6 text-red-400" /></div>
             <div>
               <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">Problèmes</div>
               <div className="text-xl font-black">0</div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
