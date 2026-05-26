"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';
import { Loader2 } from 'lucide-react';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        const isPublicPage = pathname === '/connexion' || pathname === '/inscription';
        
        if (!session && !isPublicPage) {
          router.replace('/connexion');
          return;
        }

        if (session) {
          const { data: profile } = await supabase
            .from('User')
            .select('role')
            .eq('id', session.user.id)
            .single();
            
          const role = profile?.role || 'CLOSER'; // Default to CLOSER for safety if undefined
          
          if (mounted) {
            setUserRole(role);
          }

          // Strict Role-Based Routing - Security Shield
          const isEmployee = role === 'CLOSER' || role === 'LIVREUR';
          
          if (isEmployee) {
            // Un employé (Closer/Livreur) n'a le droit d'accéder qu'à son interface
            const allowedPath = role === 'CLOSER' ? '/interface-closer' : '/interface-livreur';
            
            if (pathname !== allowedPath) {
              router.replace(allowedPath);
              return;
            }
          } else if (role === 'ADMIN') {
            // Un admin sur la page de connexion doit être redirigé vers l'accueil
            if (pathname === '/connexion' || pathname === '/inscription') {
              router.replace('/');
              return;
            }
          }
        } else if (isPublicPage) {
           // L'utilisateur n'est pas connecté et est sur une page publique, on le laisse tranquille.
        }
      } catch (error) {
        console.error("Erreur lors de la vérification des permissions :", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    checkAuth();

    // Re-check auth when tab regains focus or supabase auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!session && pathname !== '/connexion') {
            router.replace('/connexion');
        }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0B1120]">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600 mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">Vérification des accès...</p>
      </div>
    );
  }

  // Public pages (login) have no sidebar or header
  if (pathname === '/connexion' || pathname === '/inscription') {
    return <>{children}</>;
  }

  // Determine if the user is a restricted employee
  const isEmployee = userRole === 'CLOSER' || userRole === 'LIVREUR';

  return (
    <div className="flex min-h-screen">
      {/* Hide Sidebar for Closers and Livreurs */}
      {!isEmployee && <Sidebar />}
      
      {/* Adjust margin if sidebar is hidden */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${!isEmployee ? 'md:ml-64' : ''}`}>
        
        {/* We can hide or customize the header for employees as well */}
        {!isEmployee && <Header />}
        
        <main className={`flex-1 overflow-auto ${isEmployee ? 'p-0' : 'p-4 md:p-8'}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
