import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // In production, validate body and save to Supabase "orders" table.
    // const { storeId, customerData, orderItems, totalAmount } = body;
    // const { error } = await supabase.from('orders').insert({...})
    
    return NextResponse.json({ 
      success: true, 
      message: "Commande enregistrée avec succès.",
      orderId: `ORD-${Date.now()}` 
    }, { status: 201 });

  } catch (error) {
    console.error("Erreur API Order:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Erreur lors du traitement de la commande." 
    }, { status: 500 });
  }
}
