import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize a Supabase client with the Service Role Key to bypass RLS and create Auth users
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function POST(req: Request) {
  try {
    if (!supabaseServiceKey) {
      return NextResponse.json({ error: "Configuration Serveur manquante (Service Role Key). Veuillez l'ajouter dans les variables d'environnement." }, { status: 500 });
    }

    const { email, password, name, role, commissionPerConfirm, commissionPerDeliver } = await req.json();

    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: "Tous les champs (email, password, name, role) sont requis." }, { status: 400 });
    }

    // 1. Create the user in Supabase Auth securely
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email so they can log in immediately
      user_metadata: { name }
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData.user.id;

    // 2. Insert into the public User table for permissions and stats
    const { error: dbError } = await supabaseAdmin
      .from('User')
      .insert([
        {
          id: userId,
          email,
          name,
          role,
          commissionPerConfirm: commissionPerConfirm || 0,
          commissionPerDeliver: commissionPerDeliver || 0,
          earnings: 0
        }
      ]);

    if (dbError) {
      // Rollback auth user creation if DB insert fails
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: dbError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Utilisateur créé avec succès", user: authData.user });

  } catch (err: any) {
    console.error("API create-user error:", err);
    return NextResponse.json({ error: "Une erreur interne est survenue" }, { status: 500 });
  }
}
