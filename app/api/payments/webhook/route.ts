import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

function verifyWebhookSignature(rawBody: string, signature: string, timestamp: string): boolean {
  const signatureData = rawBody + timestamp;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.CASHFREE_SECRET_KEY!)
    .update(signatureData)
    .digest('base64');
  
  return signature === expectedSignature;
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-webhook-signature');
    const timestamp = req.headers.get('x-webhook-timestamp');

    if (!signature || !timestamp) {
      console.error('Missing webhook signature or timestamp');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify webhook signature for security
    if (!verifyWebhookSignature(rawBody, signature, timestamp)) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const webhookData = JSON.parse(rawBody);
    const { data } = webhookData;

    if (webhookData.type === 'PAYMENT_SUCCESS_WEBHOOK') {
      const {
        order_id: orderId,
        order_amount: amount,
        order_status: status,
        payment_amount: paidAmount,
        payment_method: paymentMethod,
        payment_time: paymentTime
      } = data.order;

      const { cf_payment_id: cfPaymentId } = data.payment;

      // Update offering in database
      try {
        await prisma.offering.updateMany({
          where: {
            paymentOrderId: orderId
          },
          data: {
            status: 'COMPLETED',
            paymentCompletedAt: new Date(paymentTime),
            paymentDetails: JSON.stringify(data)
          }
        });

        console.log(`Payment webhook processed successfully for order: ${orderId}`);
      } catch (dbError) {
        console.error('Database update error in webhook:', dbError);
        // Log error but still return success to avoid webhook retries
      }
    } else if (webhookData.type === 'PAYMENT_FAILED_WEBHOOK') {
      const { order_id: orderId } = data.order;

      try {
        await prisma.offering.updateMany({
          where: {
            paymentOrderId: orderId
          },
          data: {
            status: 'FAILED',
            paymentDetails: JSON.stringify(data)
          }
        });

        console.log(`Payment failed webhook processed for order: ${orderId}`);
      } catch (dbError) {
        console.error('Database update error in failed webhook:', dbError);
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}