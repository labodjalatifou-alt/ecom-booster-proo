import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { orderId, status, userId, cashCollected } = await req.json();

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
          cashCollected: cashCollected !== undefined ? parseInt(cashCollected) : order.cashCollected,
          closerId: status === 'Confirmé' ? userId : order.closerId,
          livreurId: status === 'Livré' ? userId : order.livreurId,
        }
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
