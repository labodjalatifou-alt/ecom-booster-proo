"use client";
import EmptyAnalysisState from '@/components/dashboard/EmptyAnalysisState';
import { Facebook } from 'lucide-react';
export default function PubliciteFacebookPage() {
  return <EmptyAnalysisState icon={<Facebook className="w-16 h-16 text-slate-400" />} title="Publicité Facebook" description="Analysez un produit et Claude IA créera automatiquement votre pub Facebook optimisée pour le marché africain : accroche, description et appel à l'action." />;
}
