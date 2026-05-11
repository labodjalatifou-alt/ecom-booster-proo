"use client";

import React, { useState, useEffect } from 'react';
import { Trophy, Search, ArrowUpRight, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import EmptyAnalysisState from '@/components/dashboard/EmptyAnalysisState';

type Platform = 'facebook' | 'tiktok';

const countries = [
  // Afrique de l'Ouest
  { id: 'CI', name: "Côte d'Ivoire", flag: '🇨🇮', code: 'CI', capital: 'Abidjan', color: 'bg-orange-50/50 border-orange-200 text-orange-600' },
  { id: 'SN', name: 'Sénégal', flag: '🇸🇳', code: 'SN', capital: 'Dakar', color: 'bg-emerald-50/50 border-emerald-200 text-emerald-600' },
  { id: 'ML', name: 'Mali', flag: '🇲🇱', code: 'ML', capital: 'Bamako', color: 'bg-amber-50/50 border-amber-200 text-amber-600' },
  { id: 'BF', name: 'Burkina Faso', flag: '🇧🇫', code: 'BF', capital: 'Ouagadougou', color: 'bg-red-50/50 border-red-200 text-red-600' },
  { id: 'TG', name: 'Togo', flag: '🇹🇬', code: 'TG', capital: 'Lomé', color: 'bg-yellow-50/50 border-yellow-200 text-yellow-600' },
  { id: 'BJ', name: 'Bénin', flag: '🇧🇯', code: 'BJ', capital: 'Cotonou', color: 'bg-green-50/50 border-green-200 text-green-600' },
  { id: 'NE', name: 'Niger', flag: '🇳🇪', code: 'NE', capital: 'Niamey', color: 'bg-orange-100/50 border-orange-200 text-orange-700' },
  { id: 'GN', name: 'Guinée', flag: '🇬🇳', code: 'GN', capital: 'Conakry', color: 'bg-red-100/50 border-red-200 text-red-700' },
  { id: 'GH', name: 'Ghana', flag: '🇬🇭', code: 'GH', capital: 'Accra', color: 'bg-blue-50/50 border-blue-200 text-blue-600' },
  { id: 'NG', name: 'Nigeria', flag: '🇳🇬', code: 'NG', capital: 'Lagos', color: 'bg-green-100/50 border-green-200 text-green-700' },
  { id: 'SL', name: 'Sierra Leone', flag: '🇸🇱', code: 'SL', capital: 'Freetown', color: 'bg-teal-50/50 border-teal-200 text-teal-600' },
  { id: 'LR', name: 'Liberia', flag: '🇱🇷', code: 'LR', capital: 'Monrovia', color: 'bg-blue-100/30 border-blue-100 text-blue-800' },
  { id: 'GM', name: 'Gambie', flag: '🇬🇲', code: 'GM', capital: 'Banjul', color: 'bg-indigo-50/50 border-indigo-200 text-indigo-600' },
  { id: 'GW', name: 'Guinée-Bissau', flag: '🇬🇼', code: 'GW', capital: 'Bissau', color: 'bg-rose-50/50 border-rose-200 text-rose-600' },
  { id: 'CV', name: 'Cap-Vert', flag: '🇨🇻', code: 'CV', capital: 'Praia', color: 'bg-sky-50/50 border-sky-200 text-sky-600' },
  // Afrique Centrale
  { id: 'CM', name: 'Cameroun', flag: '🇨🇲', code: 'CM', capital: 'Douala', color: 'bg-emerald-100/50 border-emerald-200 text-emerald-700' },
  { id: 'GA', name: 'Gabon', flag: '🇬🇦', code: 'GA', capital: 'Libreville', color: 'bg-teal-50/50 border-teal-200 text-teal-600' },
  { id: 'CG', name: 'Congo', flag: '🇨🇬', code: 'CG', capital: 'Brazzaville', color: 'bg-blue-100/50 border-blue-200 text-blue-700' },
  { id: 'CD', name: 'RDC', flag: '🇨🇩', code: 'CD', capital: 'Kinshasa', color: 'bg-blue-50/30 border-blue-100 text-blue-800' },
  { id: 'TD', name: 'Tchad', flag: '🇹🇩', code: 'TD', capital: "N'Djamena", color: 'bg-indigo-50/50 border-indigo-200 text-indigo-600' },
  { id: 'CF', name: 'Centrafrique', flag: '🇨🇫', code: 'CF', capital: 'Bangui', color: 'bg-violet-50/50 border-violet-200 text-violet-600' },
  { id: 'GQ', name: 'Guinée Équat.', flag: '🇬🇶', code: 'GQ', capital: 'Malabo', color: 'bg-lime-50/50 border-lime-200 text-lime-700' },
  // Afrique de l'Est
  { id: 'RW', name: 'Rwanda', flag: '🇷🇼', code: 'RW', capital: 'Kigali', color: 'bg-sky-50/50 border-sky-200 text-sky-600' },
  { id: 'BI', name: 'Burundi', flag: '🇧🇮', code: 'BI', capital: 'Bujumbura', color: 'bg-rose-50/50 border-rose-200 text-rose-600' },
  { id: 'KE', name: 'Kenya', flag: '🇰🇪', code: 'KE', capital: 'Nairobi', color: 'bg-red-50/50 border-red-200 text-red-600' },
  { id: 'TZ', name: 'Tanzanie', flag: '🇹🇿', code: 'TZ', capital: 'Dar es Salaam', color: 'bg-cyan-50/50 border-cyan-200 text-cyan-600' },
  { id: 'UG', name: 'Ouganda', flag: '🇺🇬', code: 'UG', capital: 'Kampala', color: 'bg-amber-50/50 border-amber-200 text-amber-700' },
  { id: 'ET', name: 'Éthiopie', flag: '🇪🇹', code: 'ET', capital: 'Addis-Abeba', color: 'bg-green-50/50 border-green-200 text-green-800' },
  // Afrique du Nord
  { id: 'MA', name: 'Maroc', flag: '🇲🇦', code: 'MA', capital: 'Casablanca', color: 'bg-red-50/50 border-red-200 text-red-600' },
  { id: 'DZ', name: 'Algérie', flag: '🇩🇿', code: 'DZ', capital: 'Alger', color: 'bg-green-50/50 border-green-200 text-green-700' },
  { id: 'TN', name: 'Tunisie', flag: '🇹🇳', code: 'TN', capital: 'Tunis', color: 'bg-red-100/50 border-red-200 text-red-700' },
  { id: 'EG', name: 'Égypte', flag: '🇪🇬', code: 'EG', capital: 'Le Caire', color: 'bg-amber-100/50 border-amber-200 text-amber-700' },
  // Afrique Australe
  { id: 'MG', name: 'Madagascar', flag: '🇲🇬', code: 'MG', capital: 'Antananarivo', color: 'bg-lime-50/50 border-lime-200 text-lime-600' },
  { id: 'MU', name: 'Maurice', flag: '🇲🇺', code: 'MU', capital: 'Port-Louis', color: 'bg-fuchsia-50/50 border-fuchsia-200 text-fuchsia-600' },
  { id: 'ZA', name: 'Afrique du Sud', flag: '🇿🇦', code: 'ZA', capital: 'Johannesburg', color: 'bg-yellow-50/50 border-yellow-200 text-yellow-700' },
  { id: 'MR', name: 'Mauritanie', flag: '🇲🇷', code: 'MR', capital: 'Nouakchott', color: 'bg-green-100/30 border-green-200 text-green-800' },
  { id: 'AO', name: 'Angola', flag: '🇦🇴', code: 'AO', capital: 'Luanda', color: 'bg-red-100/30 border-red-200 text-red-800' },
  { id: 'MZ', name: 'Mozambique', flag: '🇲🇿', code: 'MZ', capital: 'Maputo', color: 'bg-yellow-100/50 border-yellow-200 text-yellow-800' },
  // Moyen-Orient
  { id: 'AE', name: 'Émirats (UAE)', flag: '🇦🇪', code: 'AE', capital: 'Dubaï', color: 'bg-slate-100/50 border-slate-300 text-slate-700' },
  { id: 'SA', name: 'Arabie Saoudite', flag: '🇸🇦', code: 'SA', capital: 'Riyad', color: 'bg-emerald-100/30 border-emerald-200 text-emerald-800' },
  { id: 'QA', name: 'Qatar', flag: '🇶🇦', code: 'QA', capital: 'Doha', color: 'bg-purple-50/50 border-purple-200 text-purple-700' },
  // Europe
  { id: 'FR', name: 'France', flag: '🇫🇷', code: 'FR', capital: 'Paris', color: 'bg-blue-50/50 border-blue-200 text-blue-600' },
  { id: 'BE', name: 'Belgique', flag: '🇧🇪', code: 'BE', capital: 'Bruxelles', color: 'bg-amber-50/50 border-amber-200 text-amber-700' },
  { id: 'CH', name: 'Suisse', flag: '🇨🇭', code: 'CH', capital: 'Genève', color: 'bg-red-50/30 border-red-100 text-red-700' },
  { id: 'GB', name: 'Royaume-Uni', flag: '🇬🇧', code: 'GB', capital: 'Londres', color: 'bg-indigo-50/50 border-indigo-200 text-indigo-600' },
  { id: 'US', name: 'États-Unis', flag: '🇺🇸', code: 'US', capital: 'New York', color: 'bg-blue-100/30 border-blue-200 text-blue-800' },
  { id: 'CA', name: 'Canada', flag: '🇨🇦', code: 'CA', capital: 'Montréal', color: 'bg-red-50/30 border-red-100 text-red-600' },
];

// Group countries by region
const regions = [
  { name: 'Afrique de l\'Ouest', ids: ['CI','SN','ML','BF','TG','BJ','NE','GN','GH','NG','SL','LR','GM','GW','CV'] },
  { name: 'Afrique Centrale', ids: ['CM','GA','CG','CD','TD','CF','GQ'] },
  { name: 'Afrique de l\'Est', ids: ['RW','BI','KE','TZ','UG','ET'] },
  { name: 'Afrique du Nord', ids: ['MA','DZ','TN','EG'] },
  { name: 'Afrique Australe', ids: ['MG','MU','ZA','MR','AO','MZ'] },
  { name: 'Moyen-Orient', ids: ['AE','SA','QA'] },
  { name: 'Europe & Amérique', ids: ['FR','BE','CH','GB','US','CA'] },
];

export default function AnalyseConcurrentPage() {
  const [loading, setLoading] = useState(true);
  const [latestProduct, setLatestProduct] = useState<any>(null);
  const [platform, setPlatform] = useState<Platform>('facebook');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchAnalysis() {
      const activeId = localStorage.getItem('activeAnalysisId');
      let query = supabase.from('analyses').select('*');
      if (activeId) {
        query = query.eq('id', activeId);
      } else {
        query = query.order('created_at', { ascending: false }).limit(1);
      }
      const { data } = await query;
      if (data && data[0]) {
        setLatestProduct(data[0]);
        setSearchTerm(data[0].product_name || '');
      }
      setLoading(false);
    }
    fetchAnalysis();
  }, []);

  const productName = searchTerm || latestProduct?.product_name || '';

  const handleCountryClick = (country: typeof countries[0]) => {
    if (!productName) return;

    if (platform === 'facebook') {
      const q = encodeURIComponent(productName);
      const url = `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=${country.code}&q=${q}&search_type=keyword_unordered&media_type=all`;
      window.open(url, '_blank');
    } else {
      // TikTok: search "product + capital"
      const q = encodeURIComponent(`${productName} ${country.capital}`);
      const url = `https://www.tiktok.com/search?q=${q}`;
      window.open(url, '_blank');
    }
  };

  const filteredRegions = regions.map(r => ({
    ...r,
    countries: r.ids.map(id => countries.find(c => c.id === id)!).filter(Boolean),
  }));

  return (
    <div className="max-w-7xl mx-auto pb-10 px-4 text-slate-800 dark:text-slate-100 animate-in fade-in duration-500">
      {loading ? (
        <div className="flex flex-col items-center justify-center py-40">
           <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
        </div>
      ) : !latestProduct ? (
        <EmptyAnalysisState 
          icon={<Trophy />} 
          title="Analyse Concurrent" 
          description="Vous devez analyser un produit stratégiquement avant de pouvoir espionner vos concurrents." 
        />
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <Trophy className="w-5 h-5 text-amber-600" />
                </div>
                <span className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em]">Veille Concurrentielle</span>
              </div>
              <h2 className="text-4xl font-black tracking-tighter">Espionner les Concurrents</h2>
            </div>
          </div>

          {/* Search bar + platform toggle */}
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-6 md:p-8 shadow-sm mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
              {/* Product search input */}
              <div className="relative flex-1 group">
                <Search className="w-4 h-4 text-slate-400 absolute left-5 top-1/2 -translate-y-1/2 group-focus-within:text-primary-500 transition-colors" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Nom du produit à espionner..."
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-black outline-none focus:ring-4 focus:ring-primary-500/10 transition-all"
                />
              </div>

              {/* Platform Toggle */}
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl shrink-0">
                <button
                  onClick={() => setPlatform('facebook')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    platform === 'facebook'
                      ? 'bg-[#1877F2] text-white shadow-lg shadow-blue-500/20'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  Facebook Ads
                </button>
                <button
                  onClick={() => setPlatform('tiktok')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    platform === 'tiktok'
                      ? 'bg-black text-white shadow-lg'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.88-2.89 2.89 2.89 0 0 1 2.88-2.89c.28 0 .55.04.81.1v-3.51a6.37 6.37 0 0 0-.81-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.72a8.19 8.19 0 0 0 4.76 1.52V6.79a4.83 4.83 0 0 1-1-.1z"/></svg>
                  TikTok
                </button>
              </div>
            </div>

            {/* Info bar */}
            <div className="mt-4 flex items-center gap-3 text-[10px] font-bold text-slate-400">
              <div className={`w-2 h-2 rounded-full ${platform === 'facebook' ? 'bg-[#1877F2]' : 'bg-black'}`} />
              {platform === 'facebook' ? (
                <span>Recherche dans la <strong className="text-slate-600 dark:text-slate-200">Bibliothèque Facebook Ads</strong> par pays</span>
              ) : (
                <span>Recherche TikTok : <strong className="text-slate-600 dark:text-slate-200">&quot;{productName} + Capitale&quot;</strong> pour chaque pays</span>
              )}
            </div>
          </div>

          {/* Countries by region */}
          <div className="space-y-10">
            {filteredRegions.map((region) => (
              <div key={region.name}>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-5 ml-2">{region.name}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {region.countries.map((country) => (
                    <button 
                      key={country.id} 
                      onClick={() => handleCountryClick(country)}
                      className={`relative rounded-[2rem] p-5 flex flex-col items-center justify-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:scale-[1.03] border-2 group ${country.color}`}
                    >
                      <div className="absolute top-2 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-3xl mb-1.5 group-hover:scale-110 transition-transform drop-shadow-sm">{country.flag}</span>
                      <h4 className="text-[9px] font-black uppercase tracking-widest text-center leading-tight">{country.name}</h4>
                      {platform === 'tiktok' && (
                        <span className="text-[8px] font-bold opacity-50 mt-1 italic">{country.capital}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
