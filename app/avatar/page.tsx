"use client";
import EmptyAnalysisState from '@/components/dashboard/EmptyAnalysisState';
import { User } from 'lucide-react';
export default function AvatarPage() {
  return <EmptyAnalysisState icon={<User className="w-16 h-16 text-slate-400" />} title="Avatar Client" description="Analysez un produit pour que Claude IA génère le profil de votre client idéal en Afrique : âge, revenus, motivations d'achat et objections courantes." />;
}
