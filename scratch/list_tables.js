const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function listTables() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  
  // We try to query a few common table names to see which ones exist
  const tables = ['Store', 'stores', 'orders', 'products', 'analyses', 'User'];
  
  for (const table of tables) {
    const { data, error, count } = await supabase.from(table).select('*', { count: 'exact', head: true });
    if (error) {
      console.log(`Table "${table}": Error or Missing (${error.message})`);
    } else {
      console.log(`Table "${table}": Exists, Count: ${count}`);
    }
  }
}

listTables();
