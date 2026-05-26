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

  // Don't block public pages at all
  const [loading, setLoading] = useState(!isPublicPage);
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    // Public pages: no check needed, render immediately
    if (isPublicPage) {
      setLoading(false);
      return;
    }

    // Safety timeout: never block the user for more than 5 seconds
    const timeout = setTimeout(() => {
      if (mounted.current) {
        setLoading(false);
      }
    }, 5000);

    async function checkAuth() {
      let isRedirecting = false;
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          // Not logged in on a protected page → send to login
          isRedirecting = true;
          router.replace('/connexion');
          return;
        }

        // Try to fetch role. If it fails, default to ADMIN (owner case).
        const { data: profile, error: profileError } = await supabase
          .from('User')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          // Profile not found in DB (e.g. initial admin setup). Treat as ADMIN.
          console.warn('User profile not in DB, treating as ADMIN.');
          if (mounted.current) setUserRole('ADMIN');
          return;
        }

        const role = profile?.role || 'ADMIN';

        if (mounted.current) {
          setUserRole(role);
        }

        // Strict Role-Based Routing
        if (role === 'CLOSER') {
          if (pathname !== '/interface-closer') {
            isRedirecting = true;
            router.replace('/interface-closer');
          }
        } else if (role === 'LIVREUR') {
          if (pathname !== '/interface-livreur') {
            isRedirecting = true;
            router.replace('/interface-livreur');
          }
        }
        // ADMIN can go anywhere

      } catch (error) {
        console.error("Erreur vérification permissions:", error);
        // On error, don't block. Let user through.
      } finally {
        clearTimeout(timeout);
        if (mounted.current && !isRedirecting) {
          setLoading(false);
        }
      }
    }

    checkAuth();

    // Watch for sign-out
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        router.replace('/connexion');
      }
    });

    return () => {
      mounted.current = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [pathname]);

  // Public pages: render immediately without sidebar/header
  if (isPublicPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0B1120]">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600 mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">Vérification des accès...</p>
      </div>
    );
  }

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
