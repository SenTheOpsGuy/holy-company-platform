import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import crypto from 'crypto';

const CASHFREE_BASE_URL = process.env.CASHFREE_ENV === 'PRODUCTION' 
  ? 'https://api.cashfree.com/pg' 
  : 'https://sandbox.cashfree.com/pg';

function generateSignature(postData: string, timestamp: string): string {
  const signatureData = postData + timestamp;
  return crypto
    .createHmac('sha256', process.env.CASHFREE_SECRET_KEY!)
    .update(signatureData)
    .digest('base64');
}

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, deityName, returnUrl } = await req.json();

    if (!amount || !deityName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate unique order ID and timestamp for signature
    const orderId = `puja_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const timestamp = Math.floor(Date.now() / 1000).toString();

    const orderData = {
      order_id: orderId,
      order_amount: amount,
      order_currency: 'INR',
      customer_details: {
        customer_id: user.id,
        customer_name: `${user.firstName} ${user.lastName}`.trim() || 'Devotee',
        customer_email: user.emailAddresses[0]?.emailAddress || `${user.id}@temp.com`,
        customer_phone: user.phoneNumbers[0]?.phoneNumber || '9999999999'
      },
      order_meta: {
        return_url: returnUrl || `${process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin}/puja/${deityName.toLowerCase()}/payment-success`,
        notify_url: `${process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin}/api/payments/webhook`,
        payment_methods: 'cc,dc,nb,upi,paylater,emi,app'
      },
      order_note: `Chadava offering for ${deityName} puja`,
      order_tags: {
        deity: deityName,
        type: 'chadava_offering',
        user_id: user.id
      }
    };

    const postData = JSON.stringify(orderData);
    const signature = generateSignature(postData, timestamp);

    // Debug logging removed for production

    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-api-version': '2023-08-01',
      'x-client-id': process.env.CASHFREE_APP_ID!,
      'x-client-secret': process.env.CASHFREE_SECRET_KEY!,
      'x-request-id': crypto.randomUUID(),
      'x-idempotency-key': orderId,
      'x-cf-signature': signature,
      'x-timestamp': timestamp
    };

    const response = await fetch(`${CASHFREE_BASE_URL}/orders`, {
      method: 'POST',
      headers,
      body: postData
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('Cashfree API error:', responseData);
      return NextResponse.json(
        { error: 'Payment gateway error', details: responseData },
        { status: response.status }
      );
    }

    // Store order in database for tracking
    // Note: This would normally go in the database, but for now we'll return the order info
    return NextResponse.json({
      success: true,
      orderId: responseData.order_id,
      paymentSessionId: responseData.payment_session_id,
      paymentUrl: responseData.payments_url || responseData.payment_link,
      orderStatus: responseData.order_status,
      amount: orderData.order_amount,
      currency: orderData.order_currency
    });

  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}