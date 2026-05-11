const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
  // Query a single row and look at the keys
  const { data, error } = await supabase.from('orders').select('*').limit(1);
  if (error) {
    console.error("Query error:", error.message);
    return;
  }
  if (data && data.length > 0) {
    console.log("Columns in 'orders' (from data):", Object.keys(data[0]));
  } else {
    console.log("No data in 'orders', checking via rpc if possible...");
    // Fallback to a query that definitely fails if column is missing
    const { error: colError } = await supabase.from('orders').select('updated_at').limit(1);
    if (colError) {
      console.log("Column 'updated_at' does NOT exist:", colError.message);
    } else {
      console.log("Column 'updated_at' EXISTS.");
    }
    
    const { error: colError2 } = await supabase.from('orders').select('created_at').limit(1);
    if (colError2) {
       console.log("Column 'created_at' does NOT exist:", colError2.message);
    } else {
       console.log("Column 'created_at' EXISTS.");
    }
  }
}

checkColumns();
