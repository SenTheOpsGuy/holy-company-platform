import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { createCashfreeOrder } from '@/lib/cashfree';

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { amount, deityName, pujaId } = body;

    // Validate required fields
    if (!amount || !deityName || amount < 1) {
      return NextResponse.json({ 
        error: 'Invalid amount or missing required fields' 
      }, { status: 400 });
    }

    // Find user in database
    const userData = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!userData) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 });
    }

    // Create offering record
    const offering = await prisma.offering.create({
      data: {
        userId: userData.id,
        pujaId: pujaId || null,
        amount: amount,
        deityName,
        status: 'PENDING',
        paymentMethod: 'CASHFREE',
      },
    });

    // Create Cashfree order
    try {
      const cashfreeOrder = await createCashfreeOrder({
        userId: userData.id,
        userEmail: userData.email,
        amount: amount,
        type: 'chadava',
        deity: deityName
      });

      if (!cashfreeOrder) {
        throw new Error('Failed to create payment order');
      }

      // Update offering with payment details
      await prisma.offering.update({
        where: { id: offering.id },
        data: {
          paymentOrderId: cashfreeOrder.order_id,
          paymentSessionId: cashfreeOrder.payment_session_id,
        },
      });

      return NextResponse.json({
        success: true,
        offering: {
          id: offering.id,
          amount: offering.amount,
          deityName: offering.deityName,
        },
        payment: {
          orderId: cashfreeOrder.order_id,
          sessionId: cashfreeOrder.payment_session_id,
          paymentUrl: cashfreeOrder.payment_url,
        }
      });

    } catch (paymentError) {
      console.error('Cashfree order creation failed:', paymentError);
      
      // Update offering status to failed
      await prisma.offering.update({
        where: { id: offering.id },
        data: { status: 'FAILED' },
      });

      return NextResponse.json({
        error: 'Payment processing failed',
        details: 'Unable to create payment order'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error creating offering:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}