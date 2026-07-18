import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yjiihyhqahythbljmkfu.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqaWloeWhxYWh5dGhibGpta2Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyMTAyNzgsImV4cCI6MjA5Mzc4NjI3OH0.5I4fEFFxDOl4cSQ6sAvz3YL_fL3lzAvgxvQjc_wsU1M';

async function main() {
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Test 1: Basic query (count)
  const { data, error, count } = await supabase.from('orders').select('*', { count: 'exact', head: true });
  console.log('Basic query - count:', count, 'error:', error?.message);

  // Test 2: Select with data
  const { data: d2, error: e2 } = await supabase.from('orders').select('id, customer, status').limit(3);
  console.log('Select with data:', JSON.stringify(d2), 'error:', e2?.message);

  // Test 3: Auth status
  const { data: { session } } = await supabase.auth.getSession();
  console.log('Auth session:', session ? 'logged in as ' + session.user.email : 'NOT logged in');

  // Test 4: Realtime subscription test
  const channel = supabase.channel('test-channel');
  console.log('Channel created successfully');
  const subStatus = await new Promise((resolve) => {
    channel.subscribe((status) => {
      console.log('Realtime subscription status:', status);
      resolve(status);
    });
  });
  await supabase.removeChannel(channel);

  // Test 5: Admin client test
  const { createClient: createAdmin } = await import('@supabase/supabase-js');
  const adminSupabase = createAdmin(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY || '');
  const { data: d3, error: e3, count: c3 } = await adminSupabase.from('orders').select('*', { count: 'exact', head: true });
  console.log('Admin query - count:', c3, 'error:', e3?.message);

  console.log('Test complete');
}
main().catch(console.error);
