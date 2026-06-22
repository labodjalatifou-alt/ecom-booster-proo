import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function createBucket() {
  const { data, error } = await supabase.storage.createBucket('store-images', {
    public: true,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml'],
    fileSizeLimit: 10485760, // 10MB
  });

  if (error) {
    if (error.message.includes('already exists')) {
      console.log("Bucket already exists. Making it public just in case...");
      await supabase.storage.updateBucket('store-images', { public: true });
    } else {
      console.error("Error creating bucket:", error);
    }
  } else {
    console.log("Bucket 'store-images' created successfully.");
  }
}

createBucket();
