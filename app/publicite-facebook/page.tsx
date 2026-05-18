"use client";

import React, { useEffect, useState, useCallback } from 'react';
import {
  Megaphone, Layout, Send, Copy, Check, Loader2, Zap, Target, Heart,
  TrendingUp, TrendingDown, DollarSign, Eye, MousePointer, ShoppingCart,
  RefreshCw, Play, Pause, BarChart2, Users, Activity, AlertCircle,
  ChevronDown, X, ArrowRight, Image as ImageIcon, Rocket, Globe
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import Link from 'next/link';
import DateRangePicker, { DateRange } from '@/components/DateRangePicker';
import { subDays, startOfDay, endOfDay } from 'date-fns';

const AD_ANGLES = [
  { icon: Zap, label: "Angle Problème", color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/10", border: "border-red-100 dark:border-red-800" },
  { icon: Target, label: "Angle Bénéfice", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/10", border: "border-blue-100 dark:border-blue-800" },
  { icon: Heart, label: "Angle Émotion", color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/10", border: "border-purple-100 dark:border-purple-800" },
];

type Tab = 'ads' | 'stats' | 'launch';

interface FbData {
  account: { id: string; name: string; currency: string };
  period: { since: string; until: string };
  overview: {
    spend: string; impressions: number; clicks: number; reach: number;
    ctr: string; cpc: string; cpm: string; purchases: number;
    cpa: string | null; revenue: string; roas: string | null; frequency: string;
  };
  campaigns: Array<{
    id: string; name: string; status: string; objective: string;
    daily_budget: number | null; spend: number; impressions: number;
    clicks: number; ctr: string; cpc: string; reach: number; purchases: number;
  }>;
}

export default function PubliciteFacebookPage() {
  const [tab, setTab] = useState<Tab>('stats');
  const [latestProduct, setLatestProduct] = useState<any>(null);
  const [loadingAds, setLoadingAds] = useState(true);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  // Facebook stats
  const [fbData, setFbData] = useState<FbData | null>(null);
  const [loadingFb, setLoadingFb] = useState(false);
  const [fbError, setFbError] = useState<string | null>(null);
  const [togglingCampaign, setTogglingCampaign] = useState<string | null>(null);
  // Campaign detail panel
  const [selectedCampaign, setSelectedCampaign] = useState<any | null>(null);
  const [campaignAds, setCampaignAds] = useState<any[]>([]);
  const [loadingCampaignAds, setLoadingCampaignAds] = useState(false);
  const [campaignAdsError, setCampaignAdsError] = useState<string | null>(null);

  // Ad Preview Modal
  const [previewAdHtml, setPreviewAdHtml] = useState<string | null>(null);
  const [previewAdName, setPreviewAdName] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Campaign Launcher States
  const [fbPages, setFbPages] = useState<any[]>([]);
  const [fbPixels, setFbPixels] = useState<any[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [assetsError, setAssetsError] = useState<string | null>(null);

  const [launchLoading, setLaunchLoading] = useState(false);
  const [launchResult, setLaunchResult] = useState<any | null>(null);

  // Form Fields
  const [campaignName, setCampaignName] = useState('');
  const [budgetType, setBudgetType] = useState<'CBO' | 'ABO'>('CBO');
  const [campaignBudget, setCampaignBudget] = useState('20'); // Default $20/day or local equivalent
  const [pixelId, setPixelId] = useState('');
  const [pageId, setPageId] = useState('');
  const [targetingCountries, setTargetingCountries] = useState<string[]>(['TG']); // Default Togo
  const [adSetName, setAdSetName] = useState('');
  const [adSetsCount, setAdSetsCount] = useState(1);
  const [adName, setAdName] = useState('');
  const [adHeadline, setAdHeadline] = useState('');
  const [adText, setAdText] = useState('');
  const [adCta, setAdCta] = useState('SHOP_NOW');
  const [productUrl, setProductUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfDay(subDays(new Date(), 6)).toISOString(),
    to: endOfDay(new Date()).toISOString(),
    label: '7 derniers jours',
  });

  useEffect(() => {
    async function fetchAnalysis() {
      const activeId = localStorage.getItem('activeAnalysisId');
      let query = supabase.from('analyses').select('*');
      if (activeId) query = query.eq('id', activeId);
      else query = query.order('created_at', { ascending: false }).limit(1);
      const { data } = await query;
      if (data && data[0]) setLatestProduct(data[0]);
      setLoadingAds(false);
    }
    fetchAnalysis();
  }, []);

  // Load pages and pixels when launch tab is active
  useEffect(() => {
    if (tab !== 'launch') return;
    
    async function loadAssets() {
      setLoadingAssets(true);
      setAssetsError(null);
      try {
        const res = await fetch('/api/facebook/launch-flow?action=assets');
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        
        setFbPages(data.pages || []);
        setFbPixels(data.pixels || []);
        
        if (data.pages?.length > 0 && !pageId) setPageId(data.pages[0].id);
        if (data.pixels?.length > 0 && !pixelId) setPixelId(data.pixels[0].id);
      } catch (err: any) {
        setAssetsError(err.message);
      } finally {
        setLoadingAssets(false);
      }
    }
    
    loadAssets();
  }, [tab]);

  // Auto pre-fill based on latest product analysis
  useEffect(() => {
    if (latestProduct) {
      const name = latestProduct.product_name || 'Produit';
      setCampaignName(`Campagne - Conversion - ${name}`);
      setAdSetName(`AdSet - Purchases - ${name}`);
      setAdName(`Ad - Creative - ${name}`);
      
      const adsList = getAds();
      if (adsList.length > 0) {
        setAdHeadline(adsList[0].hook || '');
        setAdText(adsList[0].explanation || '');
      }
      
      if (latestProduct.shopify_image_url) {
        setImageUrl(latestProduct.shopify_image_url);
      }
    }
  }, [latestProduct]);

  const fetchFbMetrics = useCallback(async () => {
    setLoadingFb(true);
    setFbError(null);
    try {
      const since = dateRange.from ? dateRange.from.split('T')[0] : '';
      const until = dateRange.to ? dateRange.to.split('T')[0] : '';
      const params = new URLSearchParams();
      if (since) params.set('since', since);
      if (until) params.set('until', until);
      const res = await fetch(`/api/facebook/metrics?${params.toString()}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setFbData(data);
    } catch (err: any) {
      setFbError(err.message);
    } finally {
      setLoadingFb(false);
    }
  }, [dateRange]);

  useEffect(() => {
    if (tab === 'stats') fetchFbMetrics();
  }, [tab, fetchFbMetrics]);

  const openCampaignDetail = useCallback(async (campaign: any) => {
    setSelectedCampaign(campaign);
    setLoadingCampaignAds(true);
    setCampaignAdsError(null);
    setCampaignAds([]);
    try {
      const since = dateRange.from ? dateRange.from.split('T')[0] : '';
      const until = dateRange.to ? dateRange.to.split('T')[0] : '';
      const params = new URLSearchParams({ campaignId: campaign.id });
      if (since) params.set('since', since);
      if (until) params.set('until', until);
      const res = await fetch(`/api/facebook/campaign-ads?${params.toString()}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setCampaignAds(data.ads || []);
    } catch (err: any) {
      setCampaignAdsError(err.message);
    } finally {
      setLoadingCampaignAds(false);
    }
  }, [dateRange]);

  const openPreview = async (adId: string, adName: string) => {
    setLoadingPreview(true);
    setPreviewAdName(adName);
    try {
      const res = await fetch(`/api/facebook/ad-preview?adId=${adId}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPreviewAdHtml(data.html || '<p class="text-center p-10 text-slate-400">Aucun aperçu disponible pour ce format.</p>');
    } catch (err: any) {
      toast.error('Erreur lors du chargement de l\'aperçu');
      setPreviewAdHtml(null);
    } finally {
      setLoadingPreview(false);
    }
  };

  const toggleCampaign = async (id: string, currentStatus: string) => {
    setTogglingCampaign(id);
    const newStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      const res = await fetch('/api/facebook/metrics', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId: id, status: newStatus }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      toast.success(`Campagne ${newStatus === 'ACTIVE' ? 'activée' : 'mise en pause'} !`);
      fetchFbMetrics();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setTogglingCampaign(null);
    }
  };

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLaunchLoading(true);
    setLaunchResult(null);
    try {
      const payload = {
        campaignName,
        budgetType,
        campaignBudget,
        pixelId,
        pageId,
        targetingCountries,
        adSetName,
        adSetsCount,
        adName,
        adHeadline,
        adText,
        adCta,
        productUrl: productUrl || `${window.location.origin}/stock`,
        imageUrl,
        videoUrl
      };
      
      const res = await fetch('/api/facebook/launch-flow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setLaunchResult(data);
      toast.success('Campagne propagée avec succès sur Facebook ! 🚀');
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors du lancement de la campagne');
    } finally {
      setLaunchLoading(false);
    }
  };

  const getAds = (): any[] => {
    if (!latestProduct?.facebook_ad_content) return [];
    const content = latestProduct.facebook_ad_content;
    if (Array.isArray(content)) return content;
    return [{
      angle: "Publicité Principale",
      hook: content.headline || content.hook || '',
      explanation: content.primary_text || content.explanation || '',
      benefits: content.benefits || [],
      cta: content.cta || 'Commandez maintenant'
    }];
  };

  const ads = getAds();

  const handleCopy = (idx: number) => {
    const ad = ads[idx];
    const benefitsText = (ad.benefits || []).map((b: string) => `✔ ${b}`).join('\n');
    const text = `🔥 ${ad.hook}\n\n${ad.explanation}\n\n${benefitsText}\n\n${ad.cta}`;
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    toast.success('Publicité copiée !');
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const fmt = (n: number | string, currency?: string) => {
    const num = typeof n === 'string' ? parseFloat(n) : n;
    if (isNaN(num)) return '—';
    return currency
      ? `${new Intl.NumberFormat('fr-FR').format(Math.round(num))} ${currency}`
      : new Intl.NumberFormat('fr-FR').format(num);
  };

  const StatCard = ({ label, value, sub, icon: Icon, trend, color = 'slate' }: any) => (
    <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-5 flex flex-col gap-3 hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
        <div className={`p-2 rounded-xl bg-${color}-50 dark:bg-${color}-900/20`}>
          <Icon className={`w-4 h-4 text-${color}-600`} />
        </div>
      </div>
      <div>
        <div className="text-2xl font-black text-slate-800 dark:text-slate-100">{value}</div>
        {sub && <div className="text-[10px] font-bold text-slate-400 mt-0.5">{sub}</div>}
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-[10px] font-black ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
          {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto pb-20 px-2 md:px-4 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
              <Megaphone className="w-5 h-5 text-indigo-600" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Publicité Facebook</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">Facebook Ads</h1>
          <p className="text-slate-400 text-xs font-bold mt-1">Gérez vos campagnes et créatifs publicitaires</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-1 shadow-sm w-fit">
          <button
            onClick={() => setTab('stats')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'stats' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <BarChart2 className="w-3.5 h-3.5" /> Statistiques
          </button>
          <button
            onClick={() => setTab('ads')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'ads' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Layout className="w-3.5 h-3.5" /> Créatifs
          </button>
          <button
            onClick={() => setTab('launch')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === 'launch' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Rocket className="w-3.5 h-3.5" /> Lancer Pub
          </button>
        </div>
      </div>

      {/* ──────────── ONGLET STATISTIQUES ──────────── */}
      {tab === 'stats' && (
        <div>
          {/* Filtre date + refresh */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <DateRangePicker value={dateRange} onChange={setDateRange} />
            <button
              onClick={fetchFbMetrics}
              disabled={loadingFb}
              className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition-all disabled:opacity-40"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingFb ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>

          {loadingFb && (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Chargement des données Meta...</p>
            </div>
          )}

          {fbError && !loadingFb && (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-700 dark:text-slate-200 mb-2">Erreur de connexion Facebook</p>
                <p className="text-xs font-bold text-red-500 max-w-md">{fbError}</p>
              </div>
              <button onClick={fetchFbMetrics} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all">
                Réessayer
              </button>
            </div>
          )}

          {fbData && !loadingFb && (
            <div className="space-y-8">
              {/* Account badge */}
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-100 dark:border-indigo-800 rounded-full flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                  <span className="text-[10px] font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-widest">{fbData.account.name}</span>
                </div>
                <span className="text-[10px] font-bold text-slate-400">
                  {fbData.period.since} → {fbData.period.until}
                </span>
              </div>

              {/* KPI Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <StatCard label="Dépenses" value={fmt(fbData.overview.spend, fbData.account.currency)} icon={DollarSign} color="red" />
                <StatCard label="Impressions" value={fmt(fbData.overview.impressions)} sub="Affichages totaux" icon={Eye} color="blue" />
                <StatCard label="Clics" value={fmt(fbData.overview.clicks)} sub={`CTR ${fbData.overview.ctr}%`} icon={MousePointer} color="emerald" />
                <StatCard label="Portée" value={fmt(fbData.overview.reach)} sub={`Fréq. ${fbData.overview.frequency}x`} icon={Users} color="purple" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <StatCard
                  label="ROAS"
                  value={fbData.overview.roas ? `${fbData.overview.roas}x` : '—'}
                  sub="Retour sur dépense pub"
                  icon={TrendingUp}
                  color={fbData.overview.roas && parseFloat(fbData.overview.roas) >= 2 ? 'emerald' : 'amber'}
                />
                <StatCard label="CPC" value={`${fbData.overview.cpc} ${fbData.account.currency}`} sub="Coût par clic" icon={Activity} color="indigo" />
                <StatCard label="CPM" value={`${fbData.overview.cpm} ${fbData.account.currency}`} sub="Coût pour 1000 vues" icon={BarChart2} color="slate" />
                <StatCard
                  label="Achats"
                  value={fbData.overview.purchases}
                  sub={fbData.overview.cpa ? `CPA ${fmt(fbData.overview.cpa, fbData.account.currency)}` : 'Suivi non configuré'}
                  icon={ShoppingCart}
                  color="emerald"
                />
              </div>

              {/* Campagnes */}
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 mb-4">Vos Campagnes</h2>
                {fbData.campaigns.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-400">
                    <Megaphone className="w-8 h-8 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-black">Aucune campagne trouvée</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {fbData.campaigns.map(c => (
                      <div key={c.id} className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4 hover:shadow-md transition-all">
                        <div className="flex-1 min-w-0" onClick={() => openCampaignDetail(c)} style={{cursor: 'pointer'}}>
                          <div className="flex items-center gap-3">
                            <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${c.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                            <div className="min-w-0">
                              <div className="font-black text-sm text-slate-800 dark:text-slate-100 truncate hover:text-indigo-600 transition-colors">{c.name}</div>
                              <div className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">{c.objective} · {c.status === 'ACTIVE' ? 'Active' : 'En pause'}</div>
                            </div>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-4 gap-3 text-center" onClick={() => openCampaignDetail(c)} style={{cursor: 'pointer'}}>
                          <div>
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Dépenses</div>
                            <div className="text-xs font-black text-slate-700 dark:text-slate-200">{fmt(c.spend, fbData.account.currency)}</div>
                          </div>
                          <div>
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Clics</div>
                            <div className="text-xs font-black text-slate-700 dark:text-slate-200">{fmt(c.clicks)}</div>
                          </div>
                          <div>
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">CTR</div>
                            <div className="text-xs font-black text-slate-700 dark:text-slate-200">{c.ctr}%</div>
                          </div>
                          <div>
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Achats</div>
                            <div className="text-xs font-black text-emerald-600">{c.purchases}</div>
                          </div>
                        </div>

                        {/* Toggle */}
                        <button
                          onClick={() => toggleCampaign(c.id, c.status)}
                          disabled={togglingCampaign === c.id}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex-shrink-0 ${
                            c.status === 'ACTIVE'
                              ? 'bg-amber-50 text-amber-700 hover:bg-amber-500 hover:text-white border-2 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-500 hover:text-white border-2 border-emerald-200'
                          } disabled:opacity-40`}
                        >
                          {togglingCampaign === c.id
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : c.status === 'ACTIVE' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />
                          }
                          {c.status === 'ACTIVE' ? 'Pause' : 'Activer'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Campaign Detail Modal */}
          {selectedCampaign && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedCampaign(null)} />
              <div className="relative bg-white dark:bg-slate-900 w-full max-w-6xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b-2 border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2 h-2 rounded-full ${selectedCampaign.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Détails de la Campagne</span>
                    </div>
                    <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">{selectedCampaign.name}</h3>
                  </div>
                  <button onClick={() => setSelectedCampaign(null)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors">
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  {loadingCampaignAds ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                      <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Chargement des publicités...</p>
                    </div>
                  ) : campaignAdsError ? (
                    <div className="text-center py-20 text-red-500">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                      <p className="font-bold">{campaignAdsError}</p>
                    </div>
                  ) : campaignAds.length === 0 ? (
                    <div className="text-center py-20 text-slate-400">
                      <Layout className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="font-bold">Aucune publicité trouvée</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        <StatCard label="Dépenses (Ads)" value={fmt(campaignAds.reduce((acc, ad) => acc + ad.spend, 0), fbData?.account.currency)} icon={DollarSign} color="red" />
                        <StatCard label="Impressions" value={fmt(campaignAds.reduce((acc, ad) => acc + ad.impressions, 0))} icon={Eye} color="blue" />
                        <StatCard label="Clics sur lien" value={fmt(campaignAds.reduce((acc, ad) => acc + ad.link_clicks, 0))} icon={MousePointer} color="emerald" />
                        <StatCard label="Ajouts Panier" value={fmt(campaignAds.reduce((acc, ad) => acc + ad.add_to_cart, 0))} icon={ShoppingCart} color="amber" />
                        <StatCard label="Achats" value={fmt(campaignAds.reduce((acc, ad) => acc + ad.purchases, 0))} icon={Target} color="emerald" />
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[1200px]">
                          <thead>
                            <tr className="border-b-2 border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400">
                              <th className="py-3 px-4 w-[20%]">Publicité</th>
                              <th className="py-3 px-4 w-[10%]">Action</th>
                              <th className="py-3 px-4 text-right">Dépenses</th>
                              <th className="py-3 px-4 text-right">Couverture / Rép.</th>
                              <th className="py-3 px-4 text-right">CPC / CPM</th>
                              <th className="py-3 px-4 text-right">Clics / CTR</th>
                              <th className="py-3 px-4 text-right">Vidéo (25% / 100%)</th>
                              <th className="py-3 px-4 text-right">Achats / ROAS</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y-2 divide-slate-50 dark:divide-slate-800/50">
                            {campaignAds.map(ad => (
                              <tr key={ad.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                <td className="py-4 px-4">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className={`w-1.5 h-1.5 rounded-full ${ad.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                    <span className="text-[9px] font-bold text-slate-400 truncate max-w-[150px]">{ad.adset_name}</span>
                                  </div>
                                  <div className="font-bold text-xs text-slate-800 dark:text-slate-200 line-clamp-2">{ad.name}</div>
                                </td>
                                <td className="py-4 px-4">
                                  <button onClick={() => openPreview(ad.id, ad.name)} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors">
                                    <Eye className="w-3 h-3" /> Aperçu
                                  </button>
                                </td>
                                <td className="py-4 px-4 text-right">
                                  <div className="font-black text-sm">{fmt(ad.spend, fbData?.account.currency)}</div>
                                </td>
                                <td className="py-4 px-4 text-right">
                                  <div className="text-xs font-bold">{fmt(ad.reach)}</div>
                                  <div className="text-[9px] text-slate-400 mt-0.5">{ad.frequency}x</div>
                                </td>
                                <td className="py-4 px-4 text-right">
                                  <div className="text-xs font-bold">{ad.cpc} {fbData?.account.currency}</div>
                                  <div className="text-[9px] text-slate-400 mt-0.5">{ad.cpm} {fbData?.account.currency} CPM</div>
                                </td>
                                <td className="py-4 px-4 text-right">
                                  <div className="text-xs font-bold">{ad.link_clicks} clics</div>
                                  <div className="text-[9px] text-slate-400 mt-0.5">{ad.inline_ctr}% CTR</div>
                                </td>
                                <td className="py-4 px-4 text-right">
                                  <div className="text-xs font-bold">{ad.video_p25} vues</div>
                                  <div className="text-[9px] text-slate-400 mt-0.5">{ad.video_p100} complètes</div>
                                </td>
                                <td className="py-4 px-4 text-right">
                                  <div className="text-sm font-black text-emerald-600">{ad.purchases}</div>
                                  <div className="text-[9px] text-slate-400 mt-0.5">{ad.roas ? `${ad.roas}x ROAS` : '—'}</div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading Preview Overlay */}
      {loadingPreview && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-sm">
          <Loader2 className="w-10 h-10 animate-spin text-white mb-4" />
          <p className="text-white font-black uppercase tracking-widest text-[10px]">Chargement de l'aperçu...</p>
        </div>
      )}

      {/* Ad Preview Modal */}
      {previewAdHtml && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10">
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setPreviewAdHtml(null)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b-2 border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                  <Layout className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 truncate max-w-[300px]">{previewAdName}</h3>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Aperçu Facebook</p>
                </div>
              </div>
              <button onClick={() => setPreviewAdHtml(null)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-4">
              <div
                className="w-full flex justify-center preview-container"
                dangerouslySetInnerHTML={{ __html: previewAdHtml }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ──────────── ONGLET LANCER PUB ──────────── */}
      {tab === 'launch' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-100 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
              <Rocket className="w-4 h-4" /> Propagateur Publicitaire Automatique
            </div>
            <h2 className="text-3xl font-black tracking-tighter mb-2">Lancer une Campagne en 1 Clic</h2>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Générez la structure complète (Campagne, Adsets, Publicités) directement sur Meta</p>
          </div>

          {loadingAssets ? (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Chargement de vos ressources Meta...</p>
            </div>
          ) : assetsError ? (
            <div className="bg-red-50 border-2 border-red-200 rounded-[2rem] p-8 text-center max-w-2xl mx-auto">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-black text-slate-800 mb-2">Erreur de Connexion Meta</h3>
              <p className="text-sm font-bold text-red-700 mb-6">{assetsError}</p>
              <button onClick={() => setTab('stats')} className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
                Retour aux statistiques
              </button>
            </div>
          ) : (
            <form onSubmit={handleLaunch} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Form Config */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* 1. CAMPAGNE */}
                <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-6 md:p-8 space-y-5">
                  <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <span className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-xs font-black text-indigo-600">1</span>
                    <h3 className="font-black text-sm uppercase tracking-wider text-slate-800 dark:text-slate-100">Structure de la Campagne</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-2">Nom de la Campagne</label>
                      <input
                        type="text"
                        value={campaignName}
                        onChange={e => setCampaignName(e.target.value)}
                        required
                        placeholder="ex: Campagne Conversion - Produit X"
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-xl text-xs font-bold focus:border-indigo-500 focus:outline-none transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-2">Optimisation du budget</label>
                        <div className="flex bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 p-1 rounded-xl">
                          <button
                            type="button"
                            onClick={() => setBudgetType('CBO')}
                            className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${budgetType === 'CBO' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400'}`}
                          >
                            CBO (Campagne)
                          </button>
                          <button
                            type="button"
                            onClick={() => setBudgetType('ABO')}
                            className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${budgetType === 'ABO' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400'}`}
                          >
                            ABO (AdSet)
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-2">Budget Quotidien ($ / €)</label>
                        <input
                          type="number"
                          value={campaignBudget}
                          onChange={e => setCampaignBudget(e.target.value)}
                          required
                          min="1"
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-xl text-xs font-bold focus:border-indigo-500 focus:outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. ENSEMBLE DE PUB */}
                <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-6 md:p-8 space-y-5">
                  <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <span className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-xs font-black text-indigo-600">2</span>
                    <h3 className="font-black text-sm uppercase tracking-wider text-slate-800 dark:text-slate-100">Ensemble de Publicités (Adset)</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-2">Pixel de Suivi</label>
                        <select
                          value={pixelId}
                          onChange={e => setPixelId(e.target.value)}
                          required
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-xl text-xs font-bold focus:border-indigo-500 focus:outline-none transition-all"
                        >
                          <option value="">Sélectionner un Pixel</option>
                          {fbPixels.map(p => (
                            <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-2">Page Facebook</label>
                        <select
                          value={pageId}
                          onChange={e => setPageId(e.target.value)}
                          required
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-xl text-xs font-bold focus:border-indigo-500 focus:outline-none transition-all"
                        >
                          <option value="">Sélectionner une Page</option>
                          {fbPages.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-2">Nom de l&apos;AdSet</label>
                        <input
                          type="text"
                          value={adSetName}
                          onChange={e => setAdSetName(e.target.value)}
                          required
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-xl text-xs font-bold focus:border-indigo-500 focus:outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-2">Dupliquer l&apos;AdSet (Ciblage ABO)</label>
                        <input
                          type="number"
                          value={adSetsCount}
                          onChange={e => setAdSetsCount(Math.min(5, Math.max(1, parseInt(e.target.value) || 1)))}
                          required
                          min="1"
                          max="5"
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-xl text-xs font-bold focus:border-indigo-500 focus:outline-none transition-all"
                        />
                        <span className="text-[8px] font-bold text-slate-400 mt-1 block">Crée jusqu&apos;à 5 adsets identiques pour tester différents angles ou audiences.</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-2">Ciblage Pays (Codes Meta)</label>
                      <div className="flex gap-2 flex-wrap">
                        {['TG', 'CI', 'SN', 'BJ', 'ML', 'BF'].map(c => {
                          const active = targetingCountries.includes(c);
                          return (
                            <button
                              key={c}
                              type="button"
                              onClick={() => {
                                setTargetingCountries(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
                              }}
                              className={`px-4 py-2 border-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                                active ? 'bg-indigo-50 border-indigo-500 text-indigo-600' : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800 text-slate-400'
                              }`}
                            >
                              <span className="mr-1.5"><Globe className="w-3.5 h-3.5 inline" /></span> {c}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. CRÉATION PUBLICITÉ */}
                <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-6 md:p-8 space-y-5">
                  <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <span className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-xs font-black text-indigo-600">3</span>
                    <h3 className="font-black text-sm uppercase tracking-wider text-slate-800 dark:text-slate-100">Contenu de la Publicité (Ad)</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-2">Nom de la Publicité</label>
                        <input
                          type="text"
                          value={adName}
                          onChange={e => setAdName(e.target.value)}
                          required
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-xl text-xs font-bold focus:border-indigo-500 focus:outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-2">Bouton Call-To-Action (CTA)</label>
                        <select
                          value={adCta}
                          onChange={e => setAdCta(e.target.value)}
                          required
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-xl text-xs font-bold focus:border-indigo-500 focus:outline-none transition-all"
                        >
                          <option value="SHOP_NOW">Acheter maintenant</option>
                          <option value="ORDER_NOW">Commander maintenant</option>
                          <option value="LEARN_MORE">En savoir plus</option>
                          <option value="BOOK_TRAVEL">Réserver</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-2">Titre d&apos;Accroche (Headline)</label>
                      <input
                        type="text"
                        value={adHeadline}
                        onChange={e => setAdHeadline(e.target.value)}
                        required
                        placeholder="ex: 🔥 Offre de folie ! 50% de réduction immédiate"
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-xl text-xs font-bold focus:border-indigo-500 focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-2">Texte Principal (Ad Copy)</label>
                      <textarea
                        rows={5}
                        value={adText}
                        onChange={e => setAdText(e.target.value)}
                        required
                        placeholder="Décrivez l'offre, les points forts du produit, et l'appel à l'action..."
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-xl text-xs font-bold focus:border-indigo-500 focus:outline-none transition-all resize-none"
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-2">Lien URL de destination (Boutique Shopify / Page de vente)</label>
                      <input
                        type="url"
                        value={productUrl}
                        onChange={e => setProductUrl(e.target.value)}
                        placeholder="https://votre-boutique.com/products/mon-produit"
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-xl text-xs font-bold focus:border-indigo-500 focus:outline-none transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-2">URL Image Créative (Lien public)</label>
                        <input
                          type="url"
                          value={imageUrl}
                          onChange={e => setImageUrl(e.target.value)}
                          placeholder="https://..."
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-xl text-xs font-bold focus:border-indigo-500 focus:outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-2">URL Vidéo Créative (Optionnel)</label>
                        <input
                          type="url"
                          value={videoUrl}
                          onChange={e => setVideoUrl(e.target.value)}
                          placeholder="https://..."
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-xl text-xs font-bold focus:border-indigo-500 focus:outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feed Preview Panel */}
              <div className="lg:col-span-5 space-y-6 sticky top-6">
                <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-6 space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Aperçu du Flux Facebook</span>
                    <span className="text-[8px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-wider">Simulé</span>
                  </div>

                  {/* Simulated Facebook Post Card */}
                  <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden text-slate-800 font-sans max-w-[450px] mx-auto text-left">
                    {/* Page Header */}
                    <div className="p-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                        {pageId ? (
                          <div className="text-xs font-black text-indigo-600">FB</div>
                        ) : (
                          <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 text-lg font-bold">P</div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900 leading-tight">
                          {fbPages.find(p => p.id === pageId)?.name || 'Votre Page Facebook'}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1 font-semibold">
                          Sponsorisé · <span className="text-[8px]">🌍</span>
                        </div>
                      </div>
                    </div>

                    {/* Post Text */}
                    <div className="px-3 pb-3 text-xs leading-relaxed text-slate-900 whitespace-pre-line font-medium min-h-[50px]">
                      {adText || 'Votre texte publicitaire principal s\'affichera ici...'}
                    </div>

                    {/* Post Image/Video Placeholder */}
                    <div className="relative aspect-video bg-slate-100 border-y border-slate-200 flex items-center justify-center overflow-hidden">
                      {imageUrl ? (
                        <img src={imageUrl} alt="creative-preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center p-6 text-slate-400">
                          <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-30" />
                          <p className="text-[10px] font-bold">Aucune image/vidéo sélectionnée</p>
                        </div>
                      )}
                    </div>

                    {/* Post Action Footer */}
                    <div className="p-3 bg-slate-50 flex items-center justify-between border-t border-slate-200">
                      <div className="min-w-0 pr-4">
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider truncate">
                          {productUrl ? new URL(productUrl).hostname : 'votre-boutique.com'}
                        </div>
                        <div className="text-xs font-bold text-slate-900 truncate mt-0.5">
                          {adHeadline || 'Accroche publicitaire principale'}
                        </div>
                      </div>
                      <button type="button" className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold flex-shrink-0 transition-colors uppercase tracking-wider">
                        {adCta === 'SHOP_NOW' ? 'Acheter' : adCta === 'ORDER_NOW' ? 'Commander' : 'En savoir plus'}
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <button
                    type="submit"
                    disabled={launchLoading}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                  >
                    {launchLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Progagateur en action...
                      </>
                    ) : (
                      <>
                        <Rocket className="w-4 h-4" />
                        PROPAGER LA CAMPAGNE 🚀
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Success Overlay Modal */}
          {launchResult && (
            <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
              <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setLaunchResult(null)} />
              <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 text-center animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/50 rounded-2xl flex items-center justify-center text-emerald-500 mx-auto mb-6">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-2">Campagne Propagée avec Succès !</h3>
                <p className="text-slate-400 font-bold text-xs mb-6 uppercase tracking-wider">La structure publicitaire complète a été injectée sur Meta.</p>

                <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 text-left space-y-2 mb-6 font-mono text-[10px] text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
                    <span className="font-bold">ID Campagne :</span>
                    <span>{launchResult.campaignId}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
                    <span className="font-bold">Ensembles créés :</span>
                    <span>{launchResult.adSetIds?.length || 0} adset(s)</span>
                  </div>
                  <div className="flex justify-between pb-1">
                    <span className="font-bold">Publicités créées :</span>
                    <span>{launchResult.adIds?.length || 0} ad(s)</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setLaunchResult(null)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                    Fermer
                  </button>
                  <a
                    href="https://adsmanager.facebook.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest text-center transition-all"
                  >
                    Ouvrir Meta Ads ↗
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
