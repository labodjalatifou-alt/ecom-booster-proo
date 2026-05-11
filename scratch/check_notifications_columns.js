const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
  const { data, error } = await supabase.from('notifications').select('*').limit(1);
  if (error) {
    console.error("Query error:", error.message);
    return;
  }
  if (data && data.length > 0) {
    console.log("Columns in 'notifications':", Object.keys(data[0]));
  } else {
     console.log("No data in 'notifications', checking via rpc...");
     const { error: err } = await supabase.from('notifications').select('updated_at').limit(1);
     console.log("updated_at exists in notifications?", !err);
  }
}

checkColumns();
