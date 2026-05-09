"use client";
import EmptyAnalysisState from '@/components/dashboard/EmptyAnalysisState';
import { Star } from 'lucide-react';
export default function ScorePage() {
  return <EmptyAnalysisState icon={<Star className="w-16 h-16 text-slate-400" />} title="Score & Prix" description="Analysez d'abord un produit pour obtenir son score de marché, le prix optimal et les recommandations de vente pour l'Afrique." />;
}
