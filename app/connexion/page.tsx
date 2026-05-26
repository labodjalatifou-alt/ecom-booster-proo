"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Mail, Key, ShieldCheck, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const SUPABASE_STORAGE_KEY = 'ecomdash-auth';

export default function ConnexionPage() {
  const [loading, setLoading] = useState(false);
  const [initialCheck, setInitialCheck] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  // On mount: check if already logged in
  useEffect(() => {
    async function checkSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          window.location.replace('/');
          return;
        }
      } catch (e) {}
      setInitialCheck(false);
    }
    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Wipe ONLY the Supabase auth key to avoid stale/corrupted session on PC browsers
      [
        SUPABASE_STORAGE_KEY,
        `${SUPABASE_STORAGE_KEY}-code-verifier`,
      ].forEach(key => {
        try { localStorage.removeItem(key); } catch (_) {}
        try { sessionStorage.removeItem(key); } catch (_) {}
      });

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (authError) throw authError;
      if (!data.session) throw new Error("Aucune session retournée. Réessaie.");

      toast.success("Connexion réussie !");
      window.location.replace('/');
    } catch (err: any) {
      console.error("Auth error:", err);
      const msg = err.message?.includes('Invalid login credentials')
        ? "Email ou mot de passe incorrect."
        : (err.message || "Erreur de connexion. Réessaie.");
      toast.error(msg);
      setLoading(false);
    }
  };

  // Show spinner while checking initial session
  if (initialCheck) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12">
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-primary-100 dark:bg-primary-950/30 rounded-2xl mb-4 shadow-sm border border-primary-100 dark:border-primary-900/30">
            <ShieldCheck className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            ECOM BOOSTER PRO
          </h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-2 font-medium italic">
            Accédez à votre espace sécurisé.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 md:p-10 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">
                Adresse Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="login-email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="nom@exemple.com"
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary-500/10 text-slate-800 dark:text-slate-100"
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">
                Mot de Passe
              </label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary-500/10 text-slate-800 dark:text-slate-100"
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="group relative w-full flex items-center justify-center gap-3 bg-slate-900 hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-500 text-white py-4 px-8 rounded-2xl font-bold transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden shadow-lg"
            >
              <span className="relative flex items-center gap-2">
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    Se connecter
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
