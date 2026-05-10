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
          if (status === 'Confirmé' && order.status !== 'Confirmé') {
            commission = user.commissionPerConfirm || 500;
          } else if (status === 'Livré' && order.status !== 'Livré') {
            commission = user.commissionPerDeliver || 1000;
          }

          if (commission > 0) {
            await tx.user.update({
              where: { id: userId },
              data: { earnings: { increment: commission } }
            });
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
