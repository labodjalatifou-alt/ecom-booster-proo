const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://yjiihyhqahythbljmkfu.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqaWloeWhxYWh5dGhibGpta2Z1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODIxMDI3OCwiZXhwIjoyMDkzNzg2Mjc4fQ.Jh-krSeA42MCuJolRs4OhqPO67R-4PVB1aWZg5lbOeY';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function check() {
  const { data: usersData, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error(error);
    return;
  }
  
  const user = usersData.users.find(u => u.email === 'labodjalatifou300@gmail.com');
  if (user) {
    console.log("User Auth Status:", {
      id: user.id,
      email: user.email,
      confirmed_at: user.email_confirmed_at,
      last_sign_in: user.last_sign_in_at
    });
    
    // Force confirm just in case
    if (!user.email_confirmed_at) {
      console.log("Confirming email...");
      await supabase.auth.admin.updateUserById(user.id, { email_confirm: true });
      console.log("Email confirmed!");
    }
  } else {
    console.log("User not found in Auth!");
  }
}

check();
