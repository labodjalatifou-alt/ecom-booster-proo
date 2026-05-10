import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { orderId, status, userId, cashCollected, deliveryFee, deliveryFeeIncluded } = await req.json();

    if (!orderId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Use a transaction to ensure data integrity
    const result = await prisma.$transaction(async (tx) => {
      // 1. Get the current order
      const order = await tx.order.findUnique({
        where: { id: orderId }
      });

      if (!order) throw new Error("Order not found");

      // 2. Update order status
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { 
          status,
          cash_collected: cashCollected !== undefined ? parseInt(cashCollected) : (order as any).cash_collected,
          delivery_fee: deliveryFee !== undefined ? parseInt(deliveryFee) : (order as any).delivery_fee,
          delivery_fee_included: deliveryFeeIncluded !== undefined ? deliveryFeeIncluded : (order as any).delivery_fee_included,
          closer_id: status === 'Confirmé' ? userId : (order as any).closer_id,
          livreur_id: status === 'Livré' ? userId : (order as any).livreur_id,
        } as any
      });

      // 3. Handle Commissions
      if (userId) {
        const user = await tx.user.findUnique({ where: { id: userId } });
        if (user) {
          let commission = 0;
          if (status === 'Confirmé' && (order as any).status !== 'Confirmé') {
            commission = (user as any).commissionPerConfirm || 500;
          } else if (status === 'Livré' && (order as any).status !== 'Livré') {
            commission = (user as any).commissionPerDeliver || 1000;
            
            // Bonus Livraison pour le Closer (500 de plus pour arriver à 1000 au total)
            const closerId = (order as any).closer_id;
            if (closerId) {
              await tx.user.update({
                where: { id: closerId },
                data: { earnings: { increment: 500 } }
              } as any);
            }
          }

          if (commission > 0) {
            await tx.user.update({
              where: { id: userId },
              data: { earnings: { increment: commission } }
            } as any);
          }
        }
      }

      return updatedOrder;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Update Order Status Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
