import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // get orders with status 'Programmé'
    const { data: orders, error } = await supabase.from('orders').select('*').eq('status', 'Programmé');
    if (error || !orders) return NextResponse.json({ success: false });

    const now = new Date();
    let updatedCount = 0;

    for (const order of orders) {
      if (!order.note || !order.note.includes('PROGRAMMÉ LE:')) continue;
      
      // parse date string
      const match = order.note.match(/PROGRAMMÉ LE: ([\d-]+) ([\d:]*)/);
      if (match) {
        const dateStr = match[1]; // YYYY-MM-DD
        const timeStr = match[2] || '00:00';
        
        const scheduledDate = new Date(`${dateStr}T${timeStr}:00`);
        
        if (scheduledDate <= now) {
          // Time is up! Move to 'Confirmé' (À Livrer)
          await supabase.from('orders').update({
            status: 'Confirmé',
            note: order.note.replace('PROGRAMMÉ LE:', 'ALERTE - PROGRAMMATION ATTEINTE LE:'),
          }).eq('id', order.id);

          // Notifications
          await supabase.from('notifications').insert([
            {
              type: 'ORDER_PROGRAMMED_READY',
              title: '⏰ Commande Programmée Prête',
              message: `La commande de ${order.customer} est arrivée à échéance et est passée 'À Livrer'.`,
              target_role: 'ADMIN',
              order_id: order.id,
              store_id: order.store_id,
            },
            {
              type: 'ORDER_PROGRAMMED_READY',
              title: '⏰ Commande Programmée Prête',
              message: `La commande de ${order.customer} est arrivée à échéance et est passée 'À Livrer'.`,
              target_role: 'LIVREUR',
              order_id: order.id,
              store_id: order.store_id,
            },
            {
              type: 'ORDER_PROGRAMMED_READY',
              title: '⏰ Commande Programmée Prête',
              message: `La commande de ${order.customer} est arrivée à échéance et est passée 'À Livrer'.`,
              target_role: 'CLOSER',
              order_id: order.id,
              store_id: order.store_id,
            }
          ]);
          
          updatedCount++;
        }
      }
    }

    return NextResponse.json({ success: true, updatedCount });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
