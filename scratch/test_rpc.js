const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRpc() {
  const { data: { user } } = await supabase.auth.getUser(); // This might fail if not logged in
  // Let's use a hardcoded user ID if possible or just try to call it
  const testUserId = '00000000-0000-0000-0000-000000000000'; // Dummy
  
  console.log("Testing RPC increment_user_earnings...");
  const { data, error } = await supabase.rpc('increment_user_earnings', { target_user_id: testUserId, amount: 1 });
  
  if (error) {
    console.error("RPC Error:", error.message);
    if (error.message.includes("does not exist")) {
        console.log("TIP: The function probably wasn't created in Supabase yet.");
    }
  } else {
    console.log("RPC Success! Response:", data);
  }
}

testRpc();
