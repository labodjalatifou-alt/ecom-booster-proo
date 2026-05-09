import { createClient } from '@supabase/supabase-base';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function clearTestData() {
  console.log("Clearing test data...");
  const { error } = await supabase
    .from('orders')
    .delete()
    .ilike('customer', '%latifou labodja%');
  
  if (error) console.error("Error clearing orders:", error);
  else console.log("Orders cleared.");

  const { error: error2 } = await supabase
    .from('analyses')
    .delete()
    .is('product_name', null); // Or similar logic for empty analyses

  console.log("Done.");
}

clearTestData();
