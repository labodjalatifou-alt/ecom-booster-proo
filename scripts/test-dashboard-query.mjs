import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://yjiihyhqahythbljmkfu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqaWloeWhxYWh5dGhibGpta2Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMTAyNzgsImV4cCI6MjA5Mzc4NjI3OH0.5I4fEFFxDOl4cSQ6sAvz3YL_fL3lzAvgxvQjc_wsU1M';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  // Test 1: All orders count (no filter)
  const { count: allCount, error: e1 } = await supabase.from('orders').select('*', { count: 'exact', head: true });
  console.log('All orders count:', allCount, 'error:', e1?.message);

  // Test 2: Today's orders (same as StatCards default)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  const from = today.toISOString();
  const to = todayEnd.toISOString();
  console.log('Date range:', { from, to });

  const { data: todayOrders, error: e2 } = await supabase
    .from('orders')
    .select('id, customer, status, store_id')
    .gte('created_at', from)
    .lte('created_at', to)
    .limit(5);
  console.log('Today orders count:', todayOrders?.length, 'error:', e2?.message);
  if (todayOrders?.length > 0) {
    console.log('First today order:', JSON.stringify(todayOrders[0]));
  }

  // Test 3: Unique store_ids in orders
  const { data: stores, error: e3 } = await supabase
    .from('orders')
    .select('store_id');
  if (stores) {
    const uniqueStoreIds = [...new Set(stores.map(s => s.store_id))];
    console.log('Unique store_ids in orders:', uniqueStoreIds);
  }

  // Test 4: Store table
  const { data: storeTable, error: e4 } = await supabase
    .from('Store')
    .select('id, name');
  console.log('Store table:', JSON.stringify(storeTable), 'error:', e4?.message);

  // Test 5: stores table (boutiques)
  const { data: boutiquesTable, error: e5 } = await supabase
    .from('stores')
    .select('id, name');
  console.log('Stores table (boutiques):', JSON.stringify(boutiquesTable), 'error:', e5?.message);

  console.log('Done');
}
main().catch(console.error);
