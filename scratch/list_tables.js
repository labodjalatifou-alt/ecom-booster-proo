const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
  const { data, error } = await supabase.rpc('get_tables'); // If this RPC exists
  if (error) {
    console.log("RPC get_tables failed, trying direct query...");
    // Fallback: try to query 'user' vs 'User'
    const { error: err1 } = await supabase.from('User').select('*').limit(1);
    console.log("Table 'User' query error:", err1?.message);
    
    const { error: err2 } = await supabase.from('user').select('*').limit(1);
    console.log("Table 'user' query error:", err2?.message);
  } else {
    console.log("Tables:", data);
  }
}

listTables();
