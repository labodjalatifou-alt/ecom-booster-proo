"use client";
import React from 'react';
import Link from 'next/link';
import { Sparkles, AlertCircle } from 'lucide-react';

interface EmptyAnalysisProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export default function EmptyAnalysisState({ icon, title, description }: EmptyAnalysisProps) {
  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center px-6 animate-in fade-in zoom-in duration-700">
      <div className="relative mb-10">
        <div className="absolute inset-0 bg-primary-500/20 blur-3xl rounded-full scale-150 animate-pulse" />
        <div className="relative p-10 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[3rem] shadow-2xl flex items-center justify-center">
          {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement, { className: 'w-16 h-16 text-primary-500' }) : icon}
        </div>
        <div className="absolute -bottom-4 -right-4 p-3 bg-amber-500 text-white rounded-2xl shadow-lg rotate-12">
          <AlertCircle className="w-5 h-5" />
        </div>
      </div>

      <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tighter mb-4">{title}</h2>
      <p className="text-slate-400 font-bold text-sm leading-relaxed mb-10 max-w-sm mx-auto uppercase tracking-widest italic opacity-70">
        {description}
      </p>

      <Link
        href="/analyses"
        className="flex items-center gap-3 px-10 py-4 bg-primary-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-primary-500/40 hover:bg-primary-700 hover:-translate-y-1 transition-all active:scale-95"
      >
        <Sparkles className="w-4 h-4" />
        Lancer une Analyse IA
      </Link>
    </div>
  );
}
