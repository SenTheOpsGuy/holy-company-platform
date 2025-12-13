import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

export async function GET(req: NextRequest) {
  try {
    console.log('Test endpoint called');
    
    const user = await currentUser();
    console.log('User check:', { 
      hasUser: !!user, 
      userId: user?.id,
      firstName: user?.firstName,
      lastName: user?.lastName,
      email: user?.emailAddresses[0]?.emailAddress
    });
    
    if (!user) {
      return NextResponse.json({ error: 'No user found' }, { status: 401 });
    }
    
    const envCheck = {
      hasAppId: !!process.env.CASHFREE_APP_ID,
      hasSecretKey: !!process.env.CASHFREE_SECRET_KEY,
      env: process.env.CASHFREE_ENV,
      appIdLength: process.env.CASHFREE_APP_ID?.length || 0,
      secretKeyLength: process.env.CASHFREE_SECRET_KEY?.length || 0
    };
    
    console.log('Environment check:', envCheck);
    
    return NextResponse.json({ 
      success: true,
      user: {
        id: user.id,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.emailAddresses[0]?.emailAddress
      },
      environment: envCheck
    });
    
  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json({ 
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('Test POST endpoint called');
    
    const body = await req.json();
    console.log('Received body:', body);
    
    return NextResponse.json({ 
      success: true,
      receivedData: body,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Test POST error:', error);
    return NextResponse.json({ 
      error: 'POST test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}