
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
  console.log('Checking columns for table "analyses"...');
  
  // Try to insert a dummy record (or just a select) to see if it fails
  const { data, error } = await supabase
    .from('analyses')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error fetching analyses:', error);
  } else {
    console.log('Columns found in first row:', data[0] ? Object.keys(data[0]) : 'No data found');
  }
  
  // Specifically try to select the new columns
  const { error: colError } = await supabase
    .from('analyses')
    .select('launch_strategy, score_details')
    .limit(1);
    
  if (colError) {
    console.error('❌ Missing columns error:', colError.message);
  } else {
    console.log('✅ Columns "launch_strategy" and "score_details" are visible to the client.');
  }
}

checkColumns();
