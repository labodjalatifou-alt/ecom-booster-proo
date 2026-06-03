const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://yjiihyhqahythbljmkfu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqaWloeWhxYWh5dGhibGpta2Z1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODIxMDI3OCwiZXhwIjoyMDkzNzg2Mjc4fQ.Jh-krSeA42MCuJolRs4OhqPO67R-4PVB1aWZg5lbOeY'
);

async function createBucket() {
  console.log('Création du bucket images-ia...');
  
  // Check if bucket exists
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some(b => b.name === 'images-ia');
  
  if (exists) {
    console.log('✅ Bucket "images-ia" existe déjà !');
    return;
  }

  const { data, error } = await supabase.storage.createBucket('images-ia', {
    public: true,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
    fileSizeLimit: 10485760 // 10MB
  });

  if (error) {
    console.error('❌ Erreur:', error.message);
  } else {
    console.log('✅ Bucket "images-ia" créé avec succès et configuré en public !');
  }
}

createBucket();
