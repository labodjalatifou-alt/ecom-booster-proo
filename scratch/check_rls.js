const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkRLS() {
  console.log('--- Checking RLS on orders table ---');
  // We can't directly check RLS state via the client, but we can try to select without auth
  // and see if it returns data. (The anon key is already used here).
  
  const { data, error, count } = await supabase.from('orders').select('*', { count: 'exact', head: true });
  if (error) {
    console.error('Error selecting from orders:', error);
  } else {
    console.log(`Select successful. Count: ${count}`);
    if (count === 0) {
      console.log('Count is 0. This might be because of RLS or because the table is really empty (unlikely as we saw 268 before).');
    }
  }

  // Try to insert a dummy order
  const dummy = {
    shopify_id: 'test_' + Date.now(),
    customer: 'Test User',
    product: 'Test Product',
    price: '100',
    status: 'A Confirmer'
  };
  const { error: insertError } = await supabase.from('orders').insert([dummy]);
  if (insertError) console.error('Insert error (might be RLS):', insertError);
  else console.log('Insert successful.');
}

checkRLS();
