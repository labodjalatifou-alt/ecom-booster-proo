import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    console.log("=== SUBSCRIBE CALLED ===");
    const body = await req.json();
    console.log("Payload received:", JSON.stringify(body, null, 2));

    // Détecter si le payload est enveloppé ou brut
    let subscription = body;
    let userId = body.userId || null;

    if (body.subscription) {
      subscription = body.subscription;
      userId = body.userId || userId;
    }

    if (!subscription?.endpoint) {
      console.error("❌ Endpoint manquant dans l'inscription push");
      return NextResponse.json({ error: 'Subscription invalide (endpoint manquant)' }, { status: 400 });
    }

    const p256dh = subscription.keys?.p256dh;
    const auth = subscription.keys?.auth;

    if (!p256dh || !auth) {
      console.error("❌ Clés d'authentification (p256dh/auth) manquantes");
      return NextResponse.json({ error: 'Subscription invalide (clés manquantes)' }, { status: 400 });
    }

    // Si aucun userId n'est fourni, on tente de le récupérer via la session Supabase (cookies)
    if (!userId || userId === 'default-user-id') {
      try {
        const cookieStore = await cookies();
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            auth: {
              persistSession: false,
            },
            global: {
              headers: {
                cookie: cookieStore.toString(),
              },
            },
          }
        );
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          userId = user.id;
        }
      } catch (authErr) {
        console.warn("Impossible de résoudre l'utilisateur via les cookies:", authErr);
      }
    }

    // Remplacer null par un ID par défaut si l'utilisateur n'est pas encore connecté
    const finalUserId = userId || 'default-user-id';
    console.log(`Tentative d'upsert de l'abonnement pour l'utilisateur: ${finalUserId}`);

    const { data, error } = await supabaseAdmin
      .from('push_subscriptions')
      .upsert(
        {
          endpoint: subscription.endpoint,
          p256dh: p256dh,
          auth: auth,
          user_id: finalUserId,
        },
        { onConflict: 'endpoint' }
      )
      .select();

    if (error) {
      console.error('❌ Erreur d\'upsert de la base de données:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("✅ Abonnement push enregistré avec succès:", data);
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('❌ Erreur générale sur la route subscribe:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
