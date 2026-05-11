const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkEarningsColumn() {
  const { error } = await supabase.from('User').select('earnings').limit(1);
  if (error) {
    console.log("Column 'earnings' in 'User' does NOT exist:", error.message);
  } else {
    console.log("Column 'earnings' in 'User' EXISTS.");
  }
}

checkEarningsColumn();
