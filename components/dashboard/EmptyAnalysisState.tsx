"use client";
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

interface EmptyAnalysisProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export default function EmptyAnalysisState({ icon, title, description }: EmptyAnalysisProps) {
  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[70vh] text-center px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-8 bg-slate-100 dark:bg-slate-800 rounded-[3rem] mb-8 opacity-40">
        {icon}
      </div>
      <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tighter mb-4">{title}</h2>
      <p className="text-slate-400 font-medium text-sm leading-relaxed mb-10 max-w-md">{description}</p>
      <Link
        href="/analyses"
        className="flex items-center gap-3 px-10 py-5 bg-primary-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-primary-500/40 hover:bg-primary-700 hover:-translate-y-1 transition-all active:scale-95"
      >
        <Sparkles className="w-5 h-5" />
        Analyser un Produit
      </Link>
      <p className="text-slate-300 text-xs mt-6 font-medium">
        Une fois le produit analysé, cette page se remplira automatiquement.
      </p>
    </div>
  );
}
