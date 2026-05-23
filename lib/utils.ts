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

/**
 * Nettoie et formate le nom de la ville.
 * Retourne "Non précisé" si la valeur est absente ou invalide.
 */
export function cleanCity(city: string | null | undefined): string {
  if (!city || city === '-' || city.trim() === '' || city === 'Ville inconnue' || city === 'undefined') return "Non précisé";
  
  // Supprime les doublons (ex: "Abidjan, Abidjan") et nettoie les espaces
  return city
    .split(',')
    .map(s => s.trim())
    .filter((v, i, a) => v && a.indexOf(v) === i)
    .join(', ');
}

/**
 * Nettoie et formate le pays.
 */
export function cleanCountry(country: string | null | undefined): string {
  if (!country || country === '-' || country.trim() === '' || country === 'undefined') return "Non précisé";
  return country;
}

/**
 * Formate l'adresse complète proprement (Adresse + Ville + Pays)
 * Retire les "Non précisé" inutiles et évite les virgules en double
 */
export function formatFullAddress(address?: string | null, city?: string | null, country?: string | null): string {
  const parts = [];
  
  if (address && address.trim() !== '' && address !== 'Adresse non précisée') {
    parts.push(address.trim());
  }
  
  const cCity = cleanCity(city);
  if (cCity !== 'Non précisé') {
    parts.push(cCity);
  }
  
  const cCountry = cleanCountry(country);
  if (cCountry !== 'Non précisé') {
    parts.push(cCountry);
  }
  
  if (parts.length === 0) return 'Non précisé';
  
  const uniqueParts = parts.filter((v, i, a) => a.indexOf(v) === i);
  return uniqueParts.join(', ');
}

/**
 * Nettoie les messages d'erreur pour l'utilisateur final.
 * Masque les détails techniques comme "localhost", "fetch", etc.
 */
export function sanitizeError(err: any): string {
  if (!err) return "Une erreur inattendue est survenue";
  
  const message = typeof err === 'string' ? err : err.message || "Erreur système";
  
  // Liste des motifs techniques à masquer
  const techKeywords = ['localhost', 'fetch', 'network', 'database', 'supabase', 'prisma', 'auth'];
  
  const isTechnical = techKeywords.some(key => message.toLowerCase().includes(key));
  
  if (isTechnical) {
    return "Action impossible pour le moment. Veuillez réessayer.";
  }
  
  return message;
}
