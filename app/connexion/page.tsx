"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Mail, Key, User, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ConnexionPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CLOSER' // ADMIN, CLOSER, LIVREUR
  });

  // If already logged in, redirect to dashboard
  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.push('/');
      }
    }
    checkUser();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign Up
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              name: formData.name
            }
          }
        });

        if (authError) throw authError;

        if (authData?.user) {
          // Create the user profile in the public User table
          const { error: profileError } = await supabase
            .from('User')
            .insert([
              {
                id: authData.user.id,
                email: formData.email,
                name: formData.name,
                role: formData.role,
                commissionPerConfirm: formData.role === 'CLOSER' ? 500 : 0,
                commissionPerDeliver: formData.role === 'LIVREUR' ? 1000 : 0,
                earnings: 0
              }
            ]);

          if (profileError) throw profileError;

          toast.success("Compte créé avec succès ! Bienvenue.");
          window.location.href = '/';
          return;
        }
      } else {
        // Sign In
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });

        if (authError) throw authError;

        toast.success("Connexion réussie !");
        window.location.href = '/';
        return;
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      toast.error(err.message || "Une erreur est survenue lors de l'authentification.");
    } finally {
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
            {isSignUp ? "Créez vos accès collaborateurs en quelques clics." : "Accédez à votre tableau de bord sécurisé."}
          </p>
        </div>

        {/* Auth card */}
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-slate-100/50 dark:shadow-none animate-in fade-in zoom-in-95 duration-300">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {isSignUp && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-2">Nom Complet</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    required 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="Ex: Moussa Diop" 
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary-500/10 text-slate-800 dark:text-slate-100" 
                  />
                </div>
              </div>
            )}

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
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-2">Mot de Passe</label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="password" 
                  required 
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  placeholder="••••••••" 
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-primary-500/10 text-slate-800 dark:text-slate-100" 
                />
              </div>
            </div>

            {isSignUp && (
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-2">Rôle Attribué</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'ADMIN', label: 'Admin' },
                    { id: 'CLOSER', label: 'Closer' },
                    { id: 'LIVREUR', label: 'Livreur' }
                  ].map((r) => (
                    <button 
                      key={r.id} 
                      type="button" 
                      onClick={() => setFormData({...formData, role: r.id})} 
                      className={`px-4 py-3 rounded-2xl border-2 font-black text-[10px] uppercase tracking-wider transition-all ${formData.role === r.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400' : 'border-slate-100 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-5 bg-primary-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary-500/10 hover:bg-primary-700 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 mt-8"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isSignUp ? "S'inscrire" : "Se Connecter"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle link */}
          <div className="text-center mt-6">
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs font-bold text-primary-600 hover:underline"
            >
              {isSignUp ? "Déjà un compte ? Connectez-vous" : "Pas encore de compte ? Créez un accès"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
