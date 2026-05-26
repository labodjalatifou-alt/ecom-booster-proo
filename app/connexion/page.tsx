"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Mail, Key, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ConnexionPage() {
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Sign In
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (authError) throw authError;

      toast.success("Connexion réussie !");
      // Il est crucial de rediriger l'utilisateur vers '/' pour déclencher le LayoutWrapper
      window.location.href = '/';
    } catch (err: any) {
      console.error("Auth error:", err);
      toast.error(err.message || "Email ou mot de passe incorrect.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Logo and title */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-primary-100 dark:bg-primary-950/30 rounded-2xl mb-4 shadow-sm border border-primary-100 dark:border-primary-900/30">
            <ShieldCheck className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            ECOM BOOSTER PRO
          </h2>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-2 font-medium italic">
            Accédez à votre tableau de bord sécurisé.
          </p>
        </div>

        {/* Auth card */}
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-slate-100/50 dark:shadow-none animate-in fade-in zoom-in-95 duration-300">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-2">Adresse Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="email" 
                  required 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  placeholder="nom@exemple.com" 
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary-500/10 text-slate-800 dark:text-slate-100" 
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center pl-2 pr-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Mot de Passe</label>
              </div>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="password" 
                  required 
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  placeholder="••••••••" 
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary-500/10 text-slate-800 dark:text-slate-100" 
                  disabled={loading}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="group relative w-full flex items-center justify-center gap-3 bg-slate-900 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-500 text-white py-4 px-8 rounded-2xl font-bold transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden shadow-lg shadow-slate-900/20 dark:shadow-primary-900/20"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              <span className="relative flex items-center gap-2">
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    Se connecter à mon espace
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
