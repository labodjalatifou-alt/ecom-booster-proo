"use client";

import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useStore } from '../StoreProvider';

const periodData = {
  '1D': [
    { name: '08:00', sales: 120000 },
    { name: '10:00', sales: 450000 },
    { name: '12:00', sales: 890000 },
    { name: '14:00', sales: 550000 },
    { name: '16:00', sales: 1200000 },
    { name: '18:00', sales: 980000 },
    { name: '20:00', sales: 300000 },
  ],
  '1M': [
    { name: 'Sem 1', sales: 4500000 },
    { name: 'Sem 2', sales: 7800000 },
    { name: 'Sem 3', sales: 12500000 },
    { name: 'Sem 4', sales: 9200000 },
  ],
  '3M': [
    { name: 'Mars', sales: 25000000 },
    { name: 'Avril', sales: 38000000 },
    { name: 'Mai', sales: 45000000 },
  ],
  '1Y': [
    { name: 'Jan', sales: 15000000 },
    { name: 'Fév', sales: 8000000 },
    { name: 'Mar', sales: 19000000 },
    { name: 'Avr', sales: 5000000 },
    { name: 'Mai', sales: 29000000 },
    { name: 'Juin', sales: 45000000 },
    { name: 'Juil', sales: 18000000 },
    { name: 'Août', sales: 22000000 },
    { name: 'Sep', sales: 34000000 },
    { name: 'Oct', sales: 8000000 },
    { name: 'Nov', sales: 32000000 },
    { name: 'Déc', sales: 27000000 },
  ]
};

export default function SalesChart() {
  const { currency } = useStore();
  const [period, setPeriod] = useState<keyof typeof periodData>('1Y');

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border-2 border-slate-100 dark:border-slate-800 shadow-sm col-span-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tighter">Performance Ventes</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Chiffre d'Affaires Encaissé</p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
          {Object.keys(periodData).map((p) => (
            <button 
              key={p} 
              onClick={() => setPeriod(p as keyof typeof periodData)}
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
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={periodData[period]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
              tickFormatter={(value) => value >= 1000000 ? `${value / 1000000}M` : `${value / 1000}K`}
            />
            <Tooltip 
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
              itemStyle={{ fontWeight: 900, fontSize: '12px', textTransform: 'uppercase' }}
              labelStyle={{ fontWeight: 900, color: '#64748b', marginBottom: '4px' }}
              formatter={(value: any) => [`${new Intl.NumberFormat('fr-FR').format(Number(value))} ${currency}`, 'Ventes']}
            />
            <Bar dataKey="sales" radius={[8, 8, 8, 8]} barSize={period === '1Y' ? 20 : 40}>
              {periodData[period].map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={index === periodData[period].length - 1 ? '#2b59ff' : '#cbd5e1'} 
                  className="transition-all duration-500 hover:fill-primary-400"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
