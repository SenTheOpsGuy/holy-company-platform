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
    console.log('=== PAYMENT API CALLED ===');
    
    // Check environment variables first
    console.log('Environment check:', {
      hasAppId: !!process.env.CASHFREE_APP_ID,
      hasSecretKey: !!process.env.CASHFREE_SECRET_KEY,
      env: process.env.CASHFREE_ENV,
      baseUrl: CASHFREE_BASE_URL
    });

    const user = await currentUser();
    console.log('User authentication check:', {
      hasUser: !!user,
      userId: user?.id
    });
    
    if (!user) {
      console.error('Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body;
    try {
      body = await req.json();
      console.log('Payment request body:', body);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }
    
    const { amount, deityName, returnUrl } = body;

    if (!amount || !deityName) {
      console.error('Missing required fields:', { amount, deityName });
      return NextResponse.json({ error: 'Missing required fields', received: { amount, deityName } }, { status: 400 });
    }

    // Validate amount
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      console.error('Invalid amount:', { amount, numAmount });
      return NextResponse.json({ error: 'Invalid amount', received: { amount } }, { status: 400 });
    }

    // Validate environment variables
    if (!process.env.CASHFREE_APP_ID || !process.env.CASHFREE_SECRET_KEY) {
      console.error('Missing Cashfree credentials');
      return NextResponse.json({ error: 'Payment gateway configuration error' }, { status: 500 });
    }

    // Generate unique order ID and timestamp for signature
    const orderId = `puja_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const timestamp = Math.floor(Date.now() / 1000).toString();
    
    // Clean up URLs to avoid newline characters - be aggressive about cleaning
    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin)
      .replace(/[\r\n\t]/g, '')
      .trim();
    const returnUrlClean = (returnUrl || `${baseUrl}/puja/${deityName || 'unknown'}/payment-success`)
      .replace(/[\r\n\t]/g, '')
      .trim();
    const notifyUrlClean = `${baseUrl}/api/payments/webhook`
      .replace(/[\r\n\t]/g, '')
      .trim();
    
    console.log('URL validation:', {
      baseUrl,
      returnUrl: returnUrlClean,
      notifyUrl: notifyUrlClean,
      hasNewlines: {
        baseUrl: baseUrl.includes('\n'),
        returnUrl: returnUrlClean.includes('\n'),
        notifyUrl: notifyUrlClean.includes('\n')
      }
    });

    const orderData = {
      order_id: orderId,
      order_amount: numAmount,
      order_currency: 'INR',
      customer_details: {
        customer_id: user.id,
        customer_name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Devotee',
        customer_email: user.emailAddresses[0]?.emailAddress || `${user.id}@temp.com`,
        customer_phone: user.phoneNumbers[0]?.phoneNumber || '+919999999999'
      },
      order_meta: {
        return_url: returnUrlClean,
        notify_url: notifyUrlClean,
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

    console.log('Cashfree API request:', {
      url: `${CASHFREE_BASE_URL}/orders`,
      orderData,
      timestamp,
      signature: signature.substring(0, 10) + '...'
    });

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
      console.error('Cashfree API error:', {
        status: response.status,
        statusText: response.statusText,
        data: responseData,
        headers: Object.fromEntries(response.headers.entries())
      });
      return NextResponse.json(
        { error: 'Payment gateway error', details: responseData, status: response.status },
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
    console.error('Payment creation error:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      error: error
    });
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}