const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUserColumns() {
  const { data, error } = await supabase.from('User').select('*').limit(1);
  if (error) {
    console.error("Query error:", error.message);
    return;
  }
  if (data && data.length > 0) {
    console.log("Columns in 'User':", Object.keys(data[0]));
  } else {
    console.log("No users found, checking via RPC...");
  }
}

checkUserColumns();
