"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

// Pages accessibles sans connexion
const PUBLIC_ROUTES = ['/connexion', '/privacy', '/terms', '/support'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  const isPublic = PUBLIC_ROUTES.some(r => pathname?.startsWith(r));

  useEffect(() => {
    // Vérifier la session en cache d'abord (rapide, pas de réseau)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setAuthenticated(true);
        setChecking(false);
      } else if (!isPublic) {
        router.replace('/connexion');
      } else {
        setChecking(false);
      }
    });

    // Écouter les changements d'état d'auth (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setAuthenticated(true);
        setChecking(false);
      } else {
        setAuthenticated(false);
        if (!isPublic) {
          router.replace('/connexion');
        } else {
          setChecking(false);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [pathname, isPublic, router]);

  // Page publique : on affiche sans vérification
  if (isPublic) return <>{children}</>;

  // En cours de vérification : spinner plein écran
  if (checking) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-50 dark:bg-slate-950 z-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Chargement...</p>
        </div>
      </div>
    );
  }

  // Non authentifié : rien n'est affiché (la redirection est en cours)
  if (!authenticated) return null;

  return <>{children}</>;
}
