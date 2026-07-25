import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  const telegramUserId = 899756514;
  
  console.log("Checking authorization...");
  const { data, error } = await supabase
    .from('User')
    .select('id, role')
    .eq('telegram_chat_id', telegramUserId)
    .maybeSingle();
    
  console.log("Auth result:", { data, error });
  
  if (!data) {
     console.log("Sending Access Denied to TG...");
     const body = {
       chat_id: telegramUserId,
       text: `🚫 Accès refusé. Votre Telegram ID (${telegramUserId}) n'est pas associé.`,
       parse_mode: 'Markdown'
     };
     const res = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(body),
     });
     console.log("TG Response:", await res.json());
  } else {
     console.log("User authorized, checking stats...");
     // We can just simulate /stats
  }
}

run().catch(console.error);
