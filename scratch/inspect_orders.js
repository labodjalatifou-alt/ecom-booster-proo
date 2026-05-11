const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function inspectOrders() {
  console.log('--- Checking Stores ---');
  const { data: stores, error: storeError } = await supabase.from('Store').select('id, name');
  if (storeError) console.error('Store error:', storeError);
  else console.log('Stores found:', stores);

  console.log('\n--- Checking Orders Table Structure ---');
  // We can't easily query information_schema via standard Supabase client unless there is an RPC.
  // But we can check keys of a sample order.
  const { data: sampleOrders, error: orderError } = await supabase.from('orders').select('*').limit(5);
  if (orderError) {
    console.error('Order error:', orderError);
  } else {
    console.log(`Orders found in table: ${sampleOrders.length}`);
    if (sampleOrders.length > 0) {
      console.log('Sample order keys:', Object.keys(sampleOrders[0]));
      console.log('Sample order store_id values:', sampleOrders.map(o => o.store_id));
    }
  }

  console.log('\n--- Checking Orders with Join ---');
  // Note: Standard Supabase client join requires specific syntax or foreign key naming.
  // Assuming 'Store' is the table name for stores.
  const { data: joined, error: joinError } = await supabase
    .from('orders')
    .select('id, store_id, Store(name)')
    .limit(5);
  
  if (joinError) console.log('Join failed (might be expected if relationship is not defined in Supabase):', joinError.message);
  else console.log('Joined data sample:', joined);
}

inspectOrders();
