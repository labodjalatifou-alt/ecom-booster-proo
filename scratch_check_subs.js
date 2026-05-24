const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkTokens() {
  const { data, error } = await supabase.from('push_subscriptions').select('*');
  if (error) {
    console.error('Error fetching subscriptions:', error);
  } else {
    console.log('Subscriptions:', data);
    const nativeTokens = data.filter(s => s.endpoint && s.endpoint.startsWith('fcm://'));
    console.log(`Found ${nativeTokens.length} native FCM tokens.`);
  }
}

checkTokens();
