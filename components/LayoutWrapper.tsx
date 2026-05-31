"use client";

import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';
import { Loader2 } from 'lucide-react';

const PUBLIC_PATHS = ['/connexion', '/inscription'];

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicPage = PUBLIC_PATHS.includes(pathname);

  const [loading, setLoading] = useState(!isPublicPage);
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    // ── Pages publiques : pas de vérification d'auth ──────────────────
    if (isPublicPage) {
      setLoading(false);
      return;
    }

    // ── Déjà authentifié (navigation SPA interne) ─────────────────────
    // On a déjà le rôle : pas besoin de refaire toute la vérif.
    if (userRole !== null) {
      if (userRole === 'CLOSER' && pathname !== '/interface-closer') {
        router.replace('/interface-closer');
      } else if (userRole === 'LIVREUR' && pathname !== '/interface-livreur') {
        router.replace('/interface-livreur');
      }
      setLoading(false);
      return;
    }

    // ── Premier chargement ou retour sur une page protégée ────────────
    setLoading(true);

    // Filet de sécurité : jamais plus de 8 secondes de spinner
    const timeout = setTimeout(() => {
      if (mounted.current) setLoading(false);
    }, 8000);

    async function handleSession(session: any) {
      if (!mounted.current) return;

      if (!session) {
        clearTimeout(timeout);
        router.replace('/connexion');
        return;
      }

      try {
        const { data: profile } = await supabase
          .from('User')
          .select('role')
          .eq('id', session.user.id)
          .single();

        const role = profile?.role ?? 'ADMIN';

        if (!mounted.current) return;
        setUserRole(role);

        if (role === 'CLOSER' && pathname !== '/interface-closer') {
          router.replace('/interface-closer');
        } else if (role === 'LIVREUR' && pathname !== '/interface-livreur') {
          router.replace('/interface-livreur');
        }
      } catch {
        // Profil absent → traiter comme ADMIN (première configuration)
        if (mounted.current) setUserRole('ADMIN');
      }

      clearTimeout(timeout);
      if (mounted.current) setLoading(false);
    }

    // ─────────────────────────────────────────────────────────────────
    // CORRECTION PRINCIPALE :
    // On utilise onAuthStateChange + événement INITIAL_SESSION au lieu
    // de getSession() appelé directement.
    //
    // Dans Supabase v2, getSession() appelé immédiatement peut retourner
    // null parce que le client n'a pas encore fini de lire localStorage.
    // L'événement INITIAL_SESSION se déclenche APRÈS cette initialisation,
    // garantissant que la session est disponible.
    // ─────────────────────────────────────────────────────────────────
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
          handleSession(session);
        } else if (event === 'SIGNED_OUT') {
          if (mounted.current) router.replace('/connexion');
        }
      }
    );

    return () => {
      mounted.current = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [pathname]);

  // ── Pages publiques : rendu immédiat sans sidebar/header ──────────
  if (isPublicPage) {
    return <>{children}</>;
  }

  // ── Chargement ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0B1120]">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600 mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">Vérification des accès...</p>
      </div>
    );
  }

  // ── Dashboard ─────────────────────────────────────────────────────
  const isEmployee = userRole === 'CLOSER' || userRole === 'LIVREUR';

  return (
    <div className="flex min-h-screen">
      {!isEmployee && <Sidebar />}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${!isEmployee ? 'md:ml-64' : ''}`}>
        {!isEmployee && <Header />}
        <main className={`flex-1 overflow-auto ${isEmployee ? 'p-0' : 'p-4 md:p-8'}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
