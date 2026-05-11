const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  
  console.log('Attempting to add column...');
  
  // Note: if exec_sql RPC is not available, this will fail.
  // We can also try a simple query to see if we have permissions.
  const { error } = await supabase.from('Store').select('country').limit(1);
  
  if (error && error.code === '42703') { // Column does not exist
    console.log('Column "country" missing as expected. Please add it via the Supabase Dashboard SQL Editor:');
    console.log('ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS country TEXT DEFAULT \'Côte d\'\'Ivoire\';');
    console.log('UPDATE "Store" SET country = \'Côte d\'\'Ivoire\' WHERE country IS NULL;');
  } else if (!error) {
    console.log('Column "country" already exists.');
  } else {
    console.error('Database error:', error);
  }
}

run();
