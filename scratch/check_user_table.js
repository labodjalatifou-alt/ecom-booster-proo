const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUserTable() {
  const { data, error } = await supabase.from('User').select('id, earnings').limit(1);
  if (error) {
    console.log("Table 'User' check failed:", error.message);
    const { error: lowerError } = await supabase.from('users').select('id, earnings').limit(1);
    if (lowerError) {
      console.log("Table 'users' check failed:", lowerError.message);
    } else {
      console.log("Table 'users' exists.");
    }
  } else {
    console.log("Table 'User' exists.");
  }
}

checkUserTable();
