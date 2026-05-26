const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://yjiihyhqahythbljmkfu.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqaWloeWhxYWh5dGhibGpta2Z1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODIxMDI3OCwiZXhwIjoyMDkzNzg2Mjc4fQ.Jh-krSeA42MCuJolRs4OhqPO67R-4PVB1aWZg5lbOeY';

const ADMIN_EMAIL    = 'labodjalatifou300@gmail.com';
const ADMIN_PASSWORD = 'Booster2026';
const ADMIN_NAME     = 'Administrateur';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function forceUpdateAdmin() {
  console.log('Synchronisation du compte Admin...\n');

  // Find existing user by email
  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('❌ Erreur liste utilisateurs:', listError.message);
    process.exit(1);
  }

  let user = usersData?.users?.find(u => u.email === ADMIN_EMAIL);
  let userId;

  if (!user) {
    console.log('Création du compte Auth...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { name: ADMIN_NAME }
    });
    if (authError) {
      console.error('❌ Erreur création Auth:', authError.message);
      process.exit(1);
    }
    userId = authData.user.id;
  } else {
    console.log('✅ Compte existant trouvé. Forçage du nouveau mot de passe...');
    userId = user.id;
    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      password: ADMIN_PASSWORD,
      user_metadata: { name: ADMIN_NAME }
    });
    if (updateError) {
      console.error('❌ Erreur mise à jour mot de passe:', updateError.message);
      process.exit(1);
    }
  }

  console.log('✅ Mot de passe synchronisé avec succès !');

  // Check User table
  const { data: existingProfile } = await supabase
    .from('User')
    .select('id, role')
    .eq('id', userId)
    .single();

  if (existingProfile) {
    await supabase.from('User').update({ role: 'ADMIN' }).eq('id', userId);
    console.log('✅ Rôle forcé à ADMIN dans la base de données.');
  } else {
    await supabase.from('User').insert([{
      id: userId,
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
      role: 'ADMIN',
      commissionPerConfirm: 0,
      commissionPerDeliver: 0,
      earnings: 0
    }]);
    console.log('✅ Profil Admin inséré dans la base de données.');
  }

  console.log('\n🎉 TOUT EST PRET !');
}

forceUpdateAdmin().catch(console.error);

