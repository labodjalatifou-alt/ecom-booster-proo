const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
  const { data, error } = await supabase.rpc('get_table_columns', { table_name_input: 'orders' });
  
  if (error) {
    // If RPC doesn't exist, try a simple query to see if it fails on 'status'
    console.log("RPC get_table_columns failed, trying direct query...");
    const { error: queryError } = await supabase.from('orders').select('status').limit(1);
    if (queryError) {
      console.error("Column 'status' check failed:", queryError.message);
    } else {
      console.log("Column 'status' exists.");
    }
  } else {
    console.log("Columns in 'orders':", data.map(c => c.column_name));
  }
}

checkColumns();
