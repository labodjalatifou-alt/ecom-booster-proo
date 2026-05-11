const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkColumns() {
  const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'Store' });
  if (error) {
    // If RPC doesn't exist, try a simple query or select from information_schema
    const { data: cols, error: err } = await supabase.from('Store').select('*').limit(1);
    if (err) {
      console.error('Error fetching Store:', err);
    } else {
      console.log('Sample Store record keys:', Object.keys(cols[0] || {}));
    }
  } else {
    console.log('Columns:', data);
  }
}

checkColumns();
