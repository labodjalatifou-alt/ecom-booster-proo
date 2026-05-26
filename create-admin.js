// Script de création du compte Administrateur
// Usage: node create-admin.js

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://yjiihyhqahythbljmkfu.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqaWloeWhxYWh5dGhibGpta2Z1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODIxMDI3OCwiZXhwIjoyMDkzNzg2Mjc4fQ.Jh-krSeA42MCuJolRs4OhqPO67R-4PVB1aWZg5lbOeY';

// ====================================================
// METS TON EMAIL ET TON MOT DE PASSE ICI
const ADMIN_EMAIL    = 'labodjalatifou300@gmail.com';   // ← Remplace ici
const ADMIN_PASSWORD = 'AdminPassword123!';         // ← Remplace ici
const ADMIN_NAME     = 'Administrateur';
// ====================================================

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function createAdmin() {
  console.log('Création du compte Admin...\n');

  // 1. Create in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: { name: ADMIN_NAME }
  });

  if (authError) {
    if (authError.message.includes('already been registered')) {
      console.log('✅ Le compte existe déjà dans Supabase Auth. Vérification de la table User...');
      // Try to get the existing user
      const { data: users } = await supabase.auth.admin.listUsers();
      const existing = users?.users?.find(u => u.email === ADMIN_EMAIL);
      if (existing) {
        await ensureUserTable(existing.id);
      }
      return;
    }
    console.error('❌ Erreur Auth:', authError.message);
    process.exit(1);
  }

  const userId = authData.user.id;
  console.log('✅ Compte Auth créé avec ID:', userId);
  await ensureUserTable(userId);
}

async function ensureUserTable(userId) {
  // Check if already exists
  const { data: existing } = await supabase
    .from('User')
    .select('id, role')
    .eq('id', userId)
    .single();

  if (existing) {
    if (existing.role !== 'ADMIN') {
      // Update role to ADMIN
      await supabase.from('User').update({ role: 'ADMIN' }).eq('id', userId);
      console.log('✅ Rôle mis à jour → ADMIN');
    } else {
      console.log('✅ Le profil existe déjà avec le rôle ADMIN.');
    }
    console.log('\n🎉 Tout est prêt ! Tu peux te connecter avec:', ADMIN_EMAIL);
    return;
  }

  // Insert new profile
  const { error: dbError } = await supabase.from('User').insert([{
    id: userId,
    email: ADMIN_EMAIL,
    name: ADMIN_NAME,
    role: 'ADMIN',
    commissionPerConfirm: 0,
    commissionPerDeliver: 0,
    earnings: 0
  }]);

  if (dbError) {
    console.error('❌ Erreur table User:', dbError.message);
    process.exit(1);
  }

  console.log('✅ Profil Admin créé dans la base de données.');
  console.log('\n🎉 Tout est prêt ! Tu peux maintenant te connecter avec:');
  console.log('   Email   :', ADMIN_EMAIL);
  console.log('   Password:', ADMIN_PASSWORD);
}

createAdmin().catch(console.error);
