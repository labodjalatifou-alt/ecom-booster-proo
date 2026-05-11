"use client";

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useStore } from '../StoreProvider';
import { supabase } from '@/lib/supabase';
import { format, startOfYear, eachMonthOfInterval, isSameMonth, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

const EMPTY_YEAR_DATA = [
  'Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'
].map(name => ({ name, sales: 0 }));

const EMPTY_MONTH_DATA = [
  { name: 'Sem 1', sales: 0 }, { name: 'Sem 2', sales: 0 },
  { name: 'Sem 3', sales: 0 }, { name: 'Sem 4', sales: 0 }
];

const EMPTY_DAY_DATA = [
  { name: '08:00', sales: 0 }, { name: '12:00', sales: 0 },
  { name: '16:00', sales: 0 }, { name: '20:00', sales: 0 }
];

const EMPTY_3M_DATA = [
  { name: 'Mois 1', sales: 0 }, { name: 'Mois 2', sales: 0 }, { name: 'Mois 3', sales: 0 }
];

export default function SalesChart() {
  const { currency, selectedStore } = useStore();
  const [period, setPeriod] = useState('1Y');
  const [data, setData] = useState<any[]>(EMPTY_YEAR_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChartData() {
      setLoading(true);
      try {
        let query = supabase.from('orders').select('price, created_at, status').eq('status', 'Livré');

        if (selectedStore) {
          query = query.eq('store_id', selectedStore);
        }

        const { data: orders, error } = await query;
        if (error) throw error;

        if (!orders || orders.length === 0) {
          setData(getEmptyData(period));
          return;
        }

        let formattedData: any[] = [];

        if (period === '1Y') {
          const months = eachMonthOfInterval({
            start: startOfYear(new Date()),
            end: new Date(),
          });
          formattedData = months.map(month => {
            const monthSales = orders
              .filter(o => isSameMonth(parseISO(o.created_at), month))
              .reduce((acc, curr) => {
                const price = parseFloat(curr.price || '0');
                return acc + (isNaN(price) ? 0 : price);
              }, 0);
            return { name: format(month, 'MMM', { locale: fr }), sales: Math.round(monthSales) };
          });
        } else {
          formattedData = getEmptyData(period);
        }

        setData(formattedData);
      } catch (err) {
        console.error('[SalesChart] Error:', err);
        setData(getEmptyData(period));
      } finally {
        setLoading(false);
      }
    }

    fetchChartData();

    const channel = supabase
      .channel('sales-chart-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchChartData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [period, selectedStore]);

  function getEmptyData(p: string) {
    if (p === '1Y') return EMPTY_YEAR_DATA;
    if (p === '1M') return EMPTY_MONTH_DATA;
    if (p === '3M') return EMPTY_3M_DATA;
    return EMPTY_DAY_DATA;
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border-2 border-slate-100 dark:border-slate-800 shadow-sm col-span-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tighter">Performance Ventes</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Chiffre d'Affaires Encaissé</p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
          {['1D', '1M', '3M', '1Y'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                period === p
                  ? 'bg-white dark:bg-slate-700 text-primary-600 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="h-80 w-full">
        {loading ? (
          <div className="flex items-center justify-center h-full text-slate-300 text-xs font-black uppercase tracking-widest animate-pulse">
            Chargement...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
                dy={15}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
                tickFormatter={(value) =>
                  value >= 1000000 ? `${value / 1000000}M` : value >= 1000 ? `${value / 1000}K` : value
                }
              />
              <Tooltip
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
                itemStyle={{ fontWeight: 900, fontSize: '12px', textTransform: 'uppercase' }}
                labelStyle={{ fontWeight: 900, color: '#64748b', marginBottom: '4px' }}
                formatter={(value: any) => [
                  `${new Intl.NumberFormat('fr-FR').format(Number(value))} ${currency}`,
                  'Ventes'
                ]}
              />
              <Bar dataKey="sales" radius={[8, 8, 8, 8]} barSize={period === '1Y' ? 20 : 40}>
                {data.map((entry, index, array) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === array.length - 1 ? '#2b59ff' : '#cbd5e1'}
                    className="transition-all duration-500"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
