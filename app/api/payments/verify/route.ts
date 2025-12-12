import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

const CASHFREE_BASE_URL = process.env.CASHFREE_ENV === 'PRODUCTION' 
  ? 'https://api.cashfree.com/pg' 
  : 'https://sandbox.cashfree.com/pg';

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // Verify payment status with Cashfree
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-api-version': '2023-08-01',
      'x-client-id': process.env.CASHFREE_APP_ID!,
      'x-client-secret': process.env.CASHFREE_SECRET_KEY!,
      'x-request-id': crypto.randomUUID()
    };

    const response = await fetch(`${CASHFREE_BASE_URL}/orders/${orderId}`, {
      method: 'GET',
      headers
    });

    const orderData = await response.json();

    if (!response.ok) {
      console.error('Cashfree verification error:', orderData);
      return NextResponse.json(
        { error: 'Payment verification failed', details: orderData },
        { status: response.status }
      );
    }

    // Check if payment is successful
    const isPaid = orderData.order_status === 'PAID';
    const amount = orderData.order_amount;
    const deityName = orderData.order_tags?.deity || 'Unknown';

    if (isPaid) {
      // Update offering in database
      try {
        const offering = await prisma.offering.create({
          data: {
            userId: user.id,
            deityName: deityName,
            amount: parseInt(amount),
            status: 'COMPLETED',
            paymentMethod: 'CASHFREE',
            paymentOrderId: orderId,
            paymentCompletedAt: new Date(),
            paymentDetails: JSON.stringify(orderData)
          }
        });

        return NextResponse.json({
          success: true,
          paid: true,
          amount: amount,
          orderId: orderId,
          deityName: deityName,
          offeringId: offering.id,
          message: 'Payment verified successfully'
        });
      } catch (dbError) {
        console.error('Database error:', dbError);
        // Payment successful but DB update failed
        return NextResponse.json({
          success: true,
          paid: true,
          amount: amount,
          orderId: orderId,
          deityName: deityName,
          warning: 'Payment successful but database update failed'
        });
      }
    } else {
      return NextResponse.json({
        success: false,
        paid: false,
        status: orderData.order_status,
        orderId: orderId,
        message: 'Payment not completed'
      });
    }

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}