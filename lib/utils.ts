/**
 * Formate un prix avec la devise dynamique de la boutique.
 * AUCUNE devise hardcodée — toujours basé sur shop.currency.
 */
export function formatPrice(amount: number | string, currency: string): string {
  const num = typeof amount === 'string' 
    ? parseFloat(amount.replace(/\s/g, '').replace(/[^\d.,]/g, '').replace(',', '.'))
    : amount;
  
  if (isNaN(num)) return `0 ${currency}`;
  
  return `${new Intl.NumberFormat('fr-FR').format(Math.round(num))} ${currency}`;
}

/**
 * Parse un prix string en nombre.
 */
export function parsePrice(val: any): number {
  if (!val) return 0;
  const str = String(val).replace(/\s/g, '').replace(/[^\d.,]/g, '').replace(',', '.');
  return parseFloat(str) || 0;
}

/**
 * Mode sans profil : retourne un profil admin par défaut si l'utilisateur n'est pas connecté.
 * Le système fonctionne même si user.profile == null.
 */
export function getDefaultAdminProfile() {
  return {
    id: 'default-admin',
    name: 'Administrateur',
    email: 'admin@ecombooster.pro',
    role: 'ADMIN' as const,
    earnings: 0,
    commissionPerConfirm: 500,
    commissionPerDeliver: 1000,
  };
}

/**
 * Résout le profil utilisateur avec fallback admin.
 */
export async function resolveUserProfile(supabase: any): Promise<any> {
  try {
    const { data: authData } = await supabase.auth.getUser();
    
    if (authData?.user) {
      const { data: profile } = await supabase
        .from('User')
        .select('*')
        .eq('email', authData.user.email)
        .single();
      
      if (profile) return profile;
    }
    
    // Fallback : profil admin par défaut
    return getDefaultAdminProfile();
  } catch {
    return getDefaultAdminProfile();
  }
}
