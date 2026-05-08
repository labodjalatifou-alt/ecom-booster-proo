"use client";

import React from 'react';
import { Trophy, Globe, Search, ArrowUpRight } from 'lucide-react';

const countries = [
  { id: 'CI', name: 'Côte d\'Ivoire', flag: '🇨🇮', code: 'CI', lang: 'fr', color: 'bg-orange-50/50 border-orange-200 text-orange-600' },
  { id: 'SN', name: 'Sénégal', flag: '🇸🇳', code: 'SN', lang: 'fr', color: 'bg-emerald-50/50 border-emerald-200 text-emerald-600' },
  { id: 'ML', name: 'Mali', flag: '🇲🇱', code: 'ML', lang: 'fr', color: 'bg-amber-50/50 border-amber-200 text-amber-600' },
  { id: 'BF', name: 'Burkina Faso', flag: '🇧🇫', code: 'BF', lang: 'fr', color: 'bg-red-50/50 border-red-200 text-red-600' },
  { id: 'TG', name: 'Togo', flag: '🇹🇬', code: 'TG', lang: 'fr', color: 'bg-yellow-50/50 border-yellow-200 text-yellow-600' },
  { id: 'BJ', name: 'Bénin', flag: '🇧🇯', code: 'BJ', lang: 'fr', color: 'bg-green-50/50 border-green-200 text-green-600' },
  { id: 'NE', name: 'Niger', flag: '🇳🇪', code: 'NE', lang: 'fr', color: 'bg-orange-100/50 border-orange-200 text-orange-700' },
  { id: 'GN', name: 'Guinée', flag: '🇬🇳', code: 'GN', lang: 'fr', color: 'bg-red-100/50 border-red-200 text-red-700' },
  { id: 'GH', name: 'Ghana', flag: '🇬🇭', code: 'GH', lang: 'en', color: 'bg-blue-50/50 border-blue-200 text-blue-600' },
  { id: 'CM', name: 'Cameroun', flag: '🇨🇲', code: 'CM', lang: 'fr', color: 'bg-emerald-100/50 border-emerald-200 text-emerald-700' },
  { id: 'GA', name: 'Gabon', flag: '🇬🇦', code: 'GA', lang: 'fr', color: 'bg-teal-50/50 border-teal-200 text-teal-600' },
  { id: 'CG', name: 'Congo', flag: '🇨🇬', code: 'CG', lang: 'fr', color: 'bg-blue-100/50 border-blue-200 text-blue-700' },
  { id: 'CD', name: 'RDC', flag: '🇨🇩', code: 'CD', lang: 'fr', color: 'bg-blue-50/30 border-blue-100 text-blue-800' },
  { id: 'TD', name: 'Tchad', flag: '🇹🇩', code: 'TD', lang: 'fr', color: 'bg-indigo-50/50 border-indigo-200 text-indigo-600' },
  { id: 'MR', name: 'Mauritanie', flag: '🇲🇷', code: 'MR', lang: 'fr', color: 'bg-green-100/30 border-green-200 text-green-800' },
  { id: 'RW', name: 'Rwanda', flag: '🇷🇼', code: 'RW', lang: 'en', color: 'bg-sky-50/50 border-sky-200 text-sky-600' },
  { id: 'BI', name: 'Burundi', flag: '🇧🇮', code: 'BI', lang: 'fr', color: 'bg-rose-50/50 border-rose-200 text-rose-600' },
  { id: 'MG', name: 'Madagascar', flag: '🇲🇬', code: 'MG', lang: 'fr', color: 'bg-lime-50/50 border-lime-200 text-lime-600' },
  { id: 'MU', name: 'Maurice', flag: '🇲🇺', code: 'MU', lang: 'fr', color: 'bg-fuchsia-50/50 border-fuchsia-200 text-fuchsia-600' },
  { id: 'SC', name: 'Seychelles', flag: '🇸🇨', code: 'SC', lang: 'en', color: 'bg-cyan-50/50 border-cyan-200 text-cyan-600' },
];

export default function AnalyseConcurrentPage() {
  const productName = "Brosse Soufflante 5-en-1";
  const productEn = "5-in-1 Hair Dryer Brush";

  const handleCountryClick = (country: typeof countries[0]) => {
    const q = country.lang === 'en' ? encodeURIComponent(productEn) : encodeURIComponent(productName);
    const url = `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=${country.code}&q=${q}&search_type=keyword_unordered&media_type=all`;
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto pb-10 px-4 text-slate-800 dark:text-slate-100 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Trophy className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em]">Veille Concurrentielle</span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter">Analyse Concurrent</h2>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3.5rem] p-8 md:p-16 shadow-sm mb-12">
        <h3 className="text-2xl font-black mb-12 tracking-tight text-center italic text-slate-400">Cliquez sur un pays pour ouvrir la bibliothèque publicitaire 🚀</h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
          {countries.map((country, i) => (
            <button 
              key={i} 
              onClick={() => handleCountryClick(country)}
              className={`relative h-28 md:h-32 rounded-[2.5rem] p-6 flex flex-col items-center justify-center transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:scale-105 border-2 group ${country.color} animate-in zoom-in duration-300`}
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <div className="absolute top-2 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <span className="text-4xl mb-2 group-hover:scale-110 transition-transform drop-shadow-sm">{country.flag}</span>
              <h4 className="text-[10px] font-black uppercase tracking-widest">{country.name}</h4>
              <span className="text-[8px] font-bold uppercase opacity-60 mt-1">{country.lang === 'fr' ? 'Français' : 'English'}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
