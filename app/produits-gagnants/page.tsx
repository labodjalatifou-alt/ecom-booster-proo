"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  Search, Trophy, Globe, Play, ExternalLink, Loader2,
  AlertCircle, ChevronDown, Eye, Flame, Clock, RefreshCw,
  X, TrendingUp, Image as ImageIcon, Film, LayoutGrid,
  Sparkles, Zap,
} from "lucide-react";
import toast from "react-hot-toast";

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
interface AdItem {
  id: string;
  body: string | null;
  linkTitle: string | null;
  linkDescription: string | null;
  linkCaption: string | null;
  ctaText: string | null;
  mediaType: string;
  snapshotUrl: string | null;
  pageName: string;
  pageUrl: string | null;
  profileImage: string | null;
  siteUrl: string | null;
  targetedCountries: string[];
  startDate: string | null;
  daysRunning: number | null;
  impressions: { lower_bound: string; upper_bound: string } | null;
  originalUrl: string | null;
}

/* ─────────────────────────────────────────────
   SUGGESTIONS DE MOTS-CLÉS
───────────────────────────────────────────── */
const KEYWORD_SUGGESTIONS = [
  { label: "Livraison gratuite",        value: "livraison gratuite" },
  { label: "Paiement à la livraison",   value: "paiement à la livraison" },
  { label: "Paiement à la réception",   value: "paiement à la réception" },
  { label: "Livraison rapide",           value: "livraison rapide" },
  { label: "50% OFF",                   value: "50% off" },
  { label: "Offre limitée",             value: "offre limitée" },
  { label: "Promotions",                value: "promotions" },
  { label: "Commandez maintenant",       value: "commandez maintenant" },
  { label: "Produit tendance",           value: "produit tendance" },
  { label: "Beauté",                    value: "beauté" },
  { label: "Mode femme",                value: "mode femme" },
  { label: "Maison & Déco",             value: "maison" },
];

/* ─────────────────────────────────────────────
   FILTRE MÉDIA
───────────────────────────────────────────── */
const MEDIA_FILTERS = [
  { key: "ALL",        label: "Tous",      icon: LayoutGrid },
  { key: "IMAGE",      label: "Images",    icon: ImageIcon  },
  { key: "VIDEO",      label: "Vidéos",    icon: Film       },
  { key: "MULTI_MEDIA",label: "Carrousels",icon: LayoutGrid },
];

/* ─────────────────────────────────────────────
   PAYS DU MONDE ENTIER
───────────────────────────────────────────── */
const ALL_COUNTRIES = [
  { code: "ALL", label: "🌍 Monde entier" },
  { code: "FR",  label: "🇫🇷 France" },
  { code: "MA",  label: "🇲🇦 Maroc" },
  { code: "DZ",  label: "🇩🇿 Algérie" },
  { code: "TN",  label: "🇹🇳 Tunisie" },
  { code: "SN",  label: "🇸🇳 Sénégal" },
  { code: "CI",  label: "🇨🇮 Côte d'Ivoire" },
  { code: "CM",  label: "🇨🇲 Cameroun" },
  { code: "ML",  label: "🇲🇱 Mali" },
  { code: "BJ",  label: "🇧🇯 Bénin" },
  { code: "BF",  label: "🇧🇫 Burkina Faso" },
  { code: "TG",  label: "🇹🇬 Togo" },
  { code: "NE",  label: "🇳🇪 Niger" },
  { code: "GA",  label: "🇬🇦 Gabon" },
  { code: "CD",  label: "🇨🇩 RD Congo" },
  { code: "CG",  label: "🇨🇬 Congo" },
  { code: "RW",  label: "🇷🇼 Rwanda" },
  { code: "BE",  label: "🇧🇪 Belgique" },
  { code: "CH",  label: "🇨🇭 Suisse" },
  { code: "LU",  label: "🇱🇺 Luxembourg" },
  { code: "US",  label: "🇺🇸 États-Unis" },
  { code: "CA",  label: "🇨🇦 Canada" },
  { code: "MX",  label: "🇲🇽 Mexique" },
  { code: "BR",  label: "🇧🇷 Brésil" },
  { code: "AR",  label: "🇦🇷 Argentine" },
  { code: "CO",  label: "🇨🇴 Colombie" },
  { code: "PE",  label: "🇵🇪 Pérou" },
  { code: "CL",  label: "🇨🇱 Chili" },
  { code: "GB",  label: "🇬🇧 Royaume-Uni" },
  { code: "DE",  label: "🇩🇪 Allemagne" },
  { code: "ES",  label: "🇪🇸 Espagne" },
  { code: "IT",  label: "🇮🇹 Italie" },
  { code: "PT",  label: "🇵🇹 Portugal" },
  { code: "NL",  label: "🇳🇱 Pays-Bas" },
  { code: "PL",  label: "🇵🇱 Pologne" },
  { code: "RO",  label: "🇷🇴 Roumanie" },
  { code: "GR",  label: "🇬🇷 Grèce" },
  { code: "CZ",  label: "🇨🇿 Tchéquie" },
  { code: "HU",  label: "🇭🇺 Hongrie" },
  { code: "SE",  label: "🇸🇪 Suède" },
  { code: "NO",  label: "🇳🇴 Norvège" },
  { code: "DK",  label: "🇩🇰 Danemark" },
  { code: "FI",  label: "🇫🇮 Finlande" },
  { code: "TR",  label: "🇹🇷 Turquie" },
  { code: "UA",  label: "🇺🇦 Ukraine" },
  { code: "RU",  label: "🇷🇺 Russie" },
  { code: "SA",  label: "🇸🇦 Arabie Saoudite" },
  { code: "AE",  label: "🇦🇪 Émirats" },
  { code: "EG",  label: "🇪🇬 Égypte" },
  { code: "NG",  label: "🇳🇬 Nigeria" },
  { code: "ZA",  label: "🇿🇦 Afrique du Sud" },
  { code: "KE",  label: "🇰🇪 Kenya" },
  { code: "ET",  label: "🇪🇹 Éthiopie" },
  { code: "GH",  label: "🇬🇭 Ghana" },
  { code: "IN",  label: "🇮🇳 Inde" },
  { code: "CN",  label: "🇨🇳 Chine" },
  { code: "JP",  label: "🇯🇵 Japon" },
  { code: "KR",  label: "🇰🇷 Corée du Sud" },
  { code: "ID",  label: "🇮🇩 Indonésie" },
  { code: "PH",  label: "🇵🇭 Philippines" },
  { code: "VN",  label: "🇻🇳 Vietnam" },
  { code: "TH",  label: "🇹🇭 Thaïlande" },
  { code: "MY",  label: "🇲🇾 Malaisie" },
  { code: "SG",  label: "🇸🇬 Singapour" },
  { code: "AU",  label: "🇦🇺 Australie" },
  { code: "NZ",  label: "🇳🇿 Nouvelle-Zélande" },
  { code: "PK",  label: "🇵🇰 Pakistan" },
  { code: "BD",  label: "🇧🇩 Bangladesh" },
  { code: "LK",  label: "🇱🇰 Sri Lanka" },
  { code: "NP",  label: "🇳🇵 Népal" },
  { code: "IQ",  label: "🇮🇶 Irak" },
  { code: "IR",  label: "🇮🇷 Iran" },
  { code: "IL",  label: "🇮🇱 Israël" },
  { code: "JO",  label: "🇯🇴 Jordanie" },
  { code: "LB",  label: "🇱🇧 Liban" },
  { code: "KW",  label: "🇰🇼 Koweït" },
  { code: "QA",  label: "🇶🇦 Qatar" },
  { code: "OM",  label: "🇴🇲 Oman" },
  { code: "BH",  label: "🇧🇭 Bahreïn" },
  { code: "TZ",  label: "🇹🇿 Tanzanie" },
  { code: "UG",  label: "🇺🇬 Ouganda" },
  { code: "MZ",  label: "🇲🇿 Mozambique" },
  { code: "AO",  label: "🇦🇴 Angola" },
  { code: "MG",  label: "🇲🇬 Madagascar" },
  { code: "MU",  label: "🇲🇺 Maurice" },
  { code: "KZ",  label: "🇰🇿 Kazakhstan" },
  { code: "UZ",  label: "🇺🇿 Ouzbékistan" },
  { code: "HK",  label: "🇭🇰 Hong Kong" },
  { code: "TW",  label: "🇹🇼 Taïwan" },
];

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
function formatImpressions(
  imp: { lower_bound: string; upper_bound: string } | null
): string {
  if (!imp) return "";
  const fmt = (n: string) => {
    const num = parseInt(n);
    if (isNaN(num)) return n;
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${Math.round(num / 1_000)}K`;
    return String(num);
  };
  return `${fmt(imp.lower_bound)}–${fmt(imp.upper_bound)}`;
}

function daysLabel(days: number | null): string {
  if (days === null) return "";
  if (days < 1) return "Aujourd'hui";
  if (days === 1) return "1 jour";
  return `${days} jours`;
}

function mediaIcon(type: string) {
  if (type === "VIDEO") return <Film className="w-3 h-3" />;
  if (type === "MULTI_MEDIA") return <LayoutGrid className="w-3 h-3" />;
  return <ImageIcon className="w-3 h-3" />;
}

function mediaLabel(type: string) {
  if (type === "VIDEO") return "Vidéo";
  if (type === "MULTI_MEDIA") return "Carrousel";
  return "Image";
}

/* ─────────────────────────────────────────────
   AD CARD
───────────────────────────────────────────── */
function AdCard({ ad, onClick }: { ad: AdItem; onClick: () => void }) {
  const impressionsLabel = formatImpressions(ad.impressions);
  const isVideo = ad.mediaType === "VIDEO";

  return (
    <div
      className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[1.5rem] overflow-hidden flex flex-col hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        {/* Avatar : photo de profil ou initiale */}
        <div className="w-9 h-9 rounded-full flex-shrink-0 overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
          {ad.profileImage ? (
            <img src={ad.profileImage} alt={ad.pageName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-white text-xs font-black uppercase">{ad.pageName.charAt(0)}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-black text-xs text-slate-800 dark:text-slate-100 truncate">
            {ad.pageName}
          </div>
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            Sponsorisé
          </div>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-full border border-emerald-200 dark:border-emerald-800 flex-shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
            Actif
          </span>
        </div>
      </div>

      {/* Body text */}
      {ad.body && (
        <div className="px-4 pb-3">
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-4">
            {ad.body}
          </p>
        </div>
      )}

      {/* Snapshot */}
      <div className="relative bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center" style={{ minHeight: 200, height: 320 }}>
        {ad.snapshotUrl ? (
          isVideo ? (
            <video
              src={ad.snapshotUrl}
              className="w-full h-full object-cover"
              controls={false}
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <img
              src={ad.snapshotUrl}
              alt={`Pub ${ad.pageName}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          )
        ) : (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-slate-300 dark:text-slate-600">
            {isVideo ? <Play className="w-10 h-10" /> : <Eye className="w-10 h-10" />}
            <span className="text-[10px] font-bold uppercase tracking-widest">{mediaLabel(ad.mediaType)}</span>
          </div>
        )}

        {/* Hover overlay */}
        {ad.snapshotUrl && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/25 backdrop-blur-[1px]">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-slate-900/90 rounded-full shadow-lg text-[10px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest">
              {isVideo ? <Play className="w-3.5 h-3.5 text-amber-500" /> : <Eye className="w-3.5 h-3.5 text-amber-500" />}
              Voir la publicité
            </div>
          </div>
        )}

        {/* Media badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-black/60 text-white rounded-lg text-[9px] font-black uppercase tracking-widest backdrop-blur-sm">
          {mediaIcon(ad.mediaType)}
          {mediaLabel(ad.mediaType)}
        </div>
      </div>

      {/* Link card */}
      {(ad.linkTitle || ad.linkCaption) && (
        <div className="border-t-2 border-slate-100 dark:border-slate-800 px-4 py-3 bg-slate-50 dark:bg-slate-800/50">
          {ad.linkCaption && (
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              {ad.linkCaption}
            </div>
          )}
          {ad.linkTitle && (
            <div className="text-xs font-black text-slate-800 dark:text-slate-100 line-clamp-2 mb-0.5">
              {ad.linkTitle}
            </div>
          )}
          {ad.linkDescription && (
            <div className="text-[10px] text-slate-500 line-clamp-1">
              {ad.linkDescription}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="px-4 py-3 border-t-2 border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 mt-auto">
        <div className="flex flex-wrap items-center gap-2">
          {ad.daysRunning !== null && (
            <div className="flex items-center gap-1 text-[9px] font-bold text-amber-600 dark:text-amber-400">
              <Clock className="w-3 h-3" />
              {daysLabel(ad.daysRunning)}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {/* Lien vers la page Facebook de l'annonceur */}
          {ad.pageUrl && (
            <a
              href={ad.pageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 text-slate-600 dark:text-slate-400 text-[9px] font-black uppercase tracking-widest transition-colors"
            >
              <ExternalLink className="w-2.5 h-2.5" />
              Page
            </a>
          )}
          {/* Lien vers le site/produit de l'annonceur */}
          {ad.siteUrl && (
            <a
              href={ad.siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-500 hover:text-white text-blue-600 dark:text-blue-400 text-[9px] font-black uppercase tracking-widest transition-colors"
            >
              <ExternalLink className="w-2.5 h-2.5" />
              Site
            </a>
          )}
          {/* Lien vers la pub dans la bibliothèque Meta */}
          {ad.originalUrl && (
            <a
              href={ad.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-500 hover:text-white text-amber-600 dark:text-amber-400 text-[9px] font-black uppercase tracking-widest transition-colors"
            >
              <ExternalLink className="w-2.5 h-2.5" />
              Pub
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MODAL SNAPSHOT
───────────────────────────────────────────── */
function SnapshotModal({ ad, onClose }: { ad: AdItem; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b-2 border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              {ad.profileImage ? (
                <img src={ad.profileImage} alt={ad.pageName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-sm font-black uppercase">{ad.pageName.charAt(0)}</span>
              )}
            </div>
            <div>
              <div className="font-black text-sm text-slate-800 dark:text-slate-100">{ad.pageName}</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                Actif · {daysLabel(ad.daysRunning)} · {mediaLabel(ad.mediaType)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {ad.siteUrl && (
              <a href={ad.siteUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 transition-colors">
                <ExternalLink className="w-3 h-3" />
                Voir le site
              </a>
            )}
            {ad.originalUrl && (
              <a href={ad.originalUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-amber-600 transition-colors">
                <ExternalLink className="w-3 h-3" />
                Voir dans Meta
              </a>
            )}
            <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Snapshot */}
        <div className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-4 min-h-[580px]">
          {ad.snapshotUrl ? (
            ad.mediaType === "VIDEO" ? (
              <video
                src={ad.snapshotUrl}
                className="max-h-[580px] max-w-full rounded-xl bg-black object-contain shadow-md"
                controls
                autoPlay
                playsInline
              />
            ) : (
              <img
                src={ad.snapshotUrl}
                alt={`Pub ${ad.pageName}`}
                className="max-h-[580px] max-w-full rounded-xl object-contain shadow-md"
                loading="lazy"
              />
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
              <Eye className="w-10 h-10 opacity-30" />
              <p className="text-xs font-bold">Aperçu non disponible</p>
            </div>
          )}
        </div>

        {/* Meta footer */}
        <div className="px-6 py-4 border-t-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-wrap gap-4 flex-shrink-0">
          {ad.body && (
            <div className="flex-1 min-w-0">
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Texte</div>
              <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-3">{ad.body}</p>
            </div>
          )}
          <div className="flex gap-4 flex-shrink-0">
            {ad.daysRunning !== null && (
              <div>
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Durée</div>
                <div className="text-xs font-black text-amber-600">{daysLabel(ad.daysRunning)}</div>
              </div>
            )}
            {ad.impressions && (
              <div>
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Impressions</div>
                <div className="text-xs font-black text-blue-600">{formatImpressions(ad.impressions)}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SKELETON
───────────────────────────────────────────── */
function AdSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[1.5rem] overflow-hidden animate-pulse">
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full w-28" />
          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full w-16" />
        </div>
        <div className="w-12 h-5 bg-slate-100 dark:bg-slate-800 rounded-full" />
      </div>
      <div className="px-4 pb-3 space-y-2">
        <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full" />
        <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full w-5/6" />
        <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full w-4/6" />
      </div>
      <div className="h-52 bg-slate-100 dark:bg-slate-800" />
      <div className="px-4 py-3 border-t-2 border-slate-100 dark:border-slate-800">
        <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full w-3/4" />
        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full w-1/2 mt-1.5" />
      </div>
      <div className="px-4 py-3 border-t-2 border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <div className="flex gap-2">
          <div className="h-4 w-14 bg-slate-200 dark:bg-slate-700 rounded-full" />
          <div className="h-4 w-14 bg-slate-100 dark:bg-slate-800 rounded-full" />
        </div>
        <div className="flex gap-1.5">
          <div className="h-6 w-12 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          <div className="h-6 w-12 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PAGE PRINCIPALE
───────────────────────────────────────────── */
export default function ProduitsGagnantsPage() {
  const DEFAULT_KEYWORD = "livraison gratuite";

  const [searchTerm, setSearchTerm]           = useState(DEFAULT_KEYWORD);
  const [selectedCountry, setSelectedCountry] = useState("ALL");
  const [mediaFilter, setMediaFilter]         = useState("ALL");
  const [countrySearch, setCountrySearch]     = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [ads, setAds]                   = useState<AdItem[]>([]);
  const [loading, setLoading]           = useState(false);
  const [loadingMore, setLoadingMore]   = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [nextCursor, setNextCursor]     = useState<string | null>(null);
  const [hasMore, setHasMore]           = useState(false);
  const [totalFound, setTotalFound]     = useState(0);
  const [totalInCountry, setTotalInCountry] = useState<number | null>(null);
  const [selectedAd, setSelectedAd]     = useState<AdItem | null>(null);
  const [activeTerm, setActiveTerm]     = useState(DEFAULT_KEYWORD);

  // Fermer dropdown au clic dehors
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowCountryDropdown(false);
        setCountrySearch("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // ── Fonction de recherche ──────────────────
  const doSearch = useCallback(
    async (opts: {
      term?: string;
      country?: string;
      media?: string;
      cursor?: string | null;
      reset?: boolean;
    }) => {
      const {
        term    = searchTerm,
        country = selectedCountry,
        media   = mediaFilter,
        cursor  = null,
        reset   = true,
      } = opts;

      if (reset) {
        setAds([]);
        setNextCursor(null);
        setHasMore(false);
        setTotalFound(0);
        setTotalInCountry(null);
        setActiveTerm(term);
      }

      reset ? setLoading(true) : setLoadingMore(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set("search_terms", term.trim() || DEFAULT_KEYWORD);
        params.set("countries", country);
        if (media && media !== "ALL") params.set("media_type", media);
        if (!reset && cursor) params.set("after", cursor);

        const res  = await fetch(`/api/facebook/ad-library?${params.toString()}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        const newAds: AdItem[] = data.ads || [];
        if (reset) {
          setAds(newAds);
          setTotalFound(newAds.length);
          setTotalInCountry(data.totalInCountry ?? null);
        } else {
          setAds((prev) => {
            const merged = [...prev, ...newAds];
            setTotalFound(merged.length);
            return merged;
          });
        }
        setNextCursor(data.nextCursor || null);
        setHasMore(data.hasMore || false);
      } catch (err: any) {
        setError(err.message);
        toast.error("Erreur lors de la recherche");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [searchTerm, selectedCountry, mediaFilter]
  );

  // ── Auto-chargement au montage ─────────────
  useEffect(() => {
    doSearch({ term: DEFAULT_KEYWORD, country: "ALL", media: "ALL", reset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Handlers ──────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doSearch({ reset: true });
  };

  const handleSuggestionClick = (value: string) => {
    setSearchTerm(value);
    doSearch({ term: value, reset: true });
  };

  const handleCountryChange = (code: string) => {
    setSelectedCountry(code);
    setShowCountryDropdown(false);
    setCountrySearch("");
    doSearch({ country: code, reset: true });
  };

  const handleMediaFilter = (key: string) => {
    setMediaFilter(key);
    doSearch({ media: key, reset: true });
  };

  const handleLoadMore = () => {
    doSearch({ cursor: nextCursor, reset: false });
  };

  // ── Pays filtrés dans dropdown ─────────────
  const filteredCountries = ALL_COUNTRIES.filter((c) =>
    c.label.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.code.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const countryLabel =
    ALL_COUNTRIES.find((c) => c.code === selectedCountry)?.label || "🌍 Monde entier";

  /* ─── RENDER ─── */
  return (
    <div className="max-w-7xl mx-auto pb-20 px-2 md:px-4 animate-in fade-in duration-500">

      {/* ── Header ─────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
            <Trophy className="w-5 h-5 text-amber-600" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
            Bibliothèque Publicitaire Meta
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight">
          Produits Gagnants
        </h1>
        <p className="text-slate-400 text-xs font-bold mt-1 flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-orange-500" />
          Publicités actives depuis{" "}
          <span className="text-orange-500 font-black">au moins 2 semaines</span>
          {" "}— source officielle Meta, 100% gratuit
        </p>
      </div>

      {/* ── Barre de recherche ─────────────────── */}
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] p-4 md:p-6 mb-6 shadow-sm">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row gap-3">

            {/* Keyword */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder='Ex : "beauté", "livraison gratuite", "50% off"…'
                className="w-full pl-10 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-400 dark:focus:border-amber-500 transition-colors"
              />
            </div>

            {/* Country selector */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setShowCountryDropdown((v) => !v)}
                className="flex items-center gap-2 px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:border-amber-400 transition-colors whitespace-nowrap w-full md:w-52"
              >
                <Globe className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="flex-1 truncate text-left">{countryLabel}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${showCountryDropdown ? "rotate-180" : ""}`} />
              </button>

              {showCountryDropdown && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* Search in countries */}
                  <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                        placeholder="Rechercher un pays…"
                        autoFocus
                        className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-amber-400 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="overflow-y-auto max-h-64 py-1">
                    {filteredCountries.length === 0 ? (
                      <div className="px-4 py-3 text-xs text-slate-400 text-center">Aucun pays trouvé</div>
                    ) : (
                      filteredCountries.map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => handleCountryChange(c.code)}
                          className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors flex items-center gap-2 ${
                            selectedCountry === c.code
                              ? "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400"
                              : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                          }`}
                        >
                          <span className="flex-1">{c.label}</span>
                          {selectedCountry === c.code && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Search button */}
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-amber-500/20 disabled:shadow-none"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Rechercher
            </button>
          </div>
        </form>

        {/* ── Suggestions de mots-clés ── */}
        <div className="mt-4">
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
              Suggestions rapides
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {KEYWORD_SUGGESTIONS.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => handleSuggestionClick(s.value)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wide transition-all border ${
                  activeTerm === s.value
                    ? "bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-200"
                    : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-300"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Filtre Média type ── */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 mb-2">
            <Film className="w-3 h-3 text-slate-400" />
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
              Type de média
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {MEDIA_FILTERS.map((f) => {
              const Icon = f.icon;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => handleMediaFilter(f.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wide transition-all border-2 ${
                    mediaFilter === f.key
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-300 hover:text-indigo-600"
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Badges d'info ── */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-full border border-emerald-200 dark:border-emerald-800 text-[9px] font-black uppercase tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Actives uniquement
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-full border border-amber-200 dark:border-amber-800 text-[9px] font-black uppercase tracking-wide">
            <Clock className="w-3 h-3" />
            Min. 14 jours
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full border border-blue-200 dark:border-blue-800 text-[9px] font-black uppercase tracking-wide">
            <TrendingUp className="w-3 h-3" />
            Source Meta — 100% gratuit
          </div>
        </div>
      </div>

      {/* ── États ────────────────────────────── */}

      {/* Chargement initial */}
      {loading && (
        <div>
          <div className="flex items-center gap-2 mb-5">
            <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Recherche de publicités gagnantes…
            </span>
          </div>
          <div style={{ columns: "320px", columnGap: "1rem" }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="mb-4"><AdSkeleton /></div>
            ))}
          </div>
        </div>
      )}

      {/* Erreur */}
      {error && !loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <div>
            <p className="text-sm font-black text-slate-700 dark:text-slate-200 mb-2">
              Erreur de connexion à la bibliothèque Meta
            </p>
            <p className="text-xs font-bold text-red-500 max-w-md">{error}</p>
          </div>
          <button
            onClick={() => doSearch({ reset: true })}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Réessayer
          </button>
        </div>
      )}

      {/* Aucun résultat */}
      {!loading && !error && ads.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
            <Trophy className="w-10 h-10 text-slate-300 dark:text-slate-600" />
          </div>
          <div>
            <p className="text-sm font-black text-slate-700 dark:text-slate-200 mb-1">
              Aucune publicité trouvée
            </p>
            <p className="text-xs text-slate-400 max-w-sm">
              Essayez un mot-clé différent ou sélectionnez un autre pays.
            </p>
          </div>
        </div>
      )}

      {/* ── Résultats ────────────────────────── */}
      {!loading && !error && ads.length > 0 && (
        <div>
          {/* Header résultats */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
            <div className="flex flex-wrap items-center gap-2">
              <div className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-full flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-emerald-500" />
                <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">
                  {totalFound} chargées
                </span>
              </div>
              {totalInCountry !== null && (
                <div className="px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-full flex items-center gap-1.5">
                  <Flame className="w-3 h-3 text-amber-500" />
                  <span className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest">
                    {totalInCountry > 50000 ? "+50k au total" : `${totalInCountry} au total dans le pays`}
                  </span>
                </div>
              )}
              <span className="text-[10px] font-bold text-slate-400 hidden md:inline ml-2">
                pour{" "}
                <span className="text-slate-700 dark:text-slate-300 font-black">
                  "{activeTerm}"
                </span>{" "}
                · {countryLabel}
                {mediaFilter !== "ALL" && (
                  <> · {MEDIA_FILTERS.find((f) => f.key === mediaFilter)?.label}</>
                )}
              </span>
            </div>
            <button
              onClick={() => doSearch({ reset: true })}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500 hover:border-amber-300 hover:text-amber-600 transition-all"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
              Actualiser
            </button>
          </div>

          {/* Masonry grid */}
          <div style={{ columns: "320px", columnGap: "1rem" }}>
            {ads.map((ad) => (
              <div key={ad.id} className="mb-4" style={{ breakInside: "avoid" }}>
                <AdCard ad={ad} onClick={() => setSelectedAd(ad)} />
              </div>
            ))}
          </div>

          {/* Load more */}
          {hasMore && (
            <div className="flex justify-center mt-8">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="flex items-center gap-2 px-8 py-4 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:border-amber-400 hover:text-amber-600 transition-all shadow-sm disabled:opacity-40"
              >
                {loadingMore
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <ChevronDown className="w-4 h-4" />
                }
                {loadingMore ? "Chargement…" : "Charger 30 publicités de plus"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal snapshot */}
      {selectedAd && (
        <SnapshotModal ad={selectedAd} onClose={() => setSelectedAd(null)} />
      )}
    </div>
  );
}
