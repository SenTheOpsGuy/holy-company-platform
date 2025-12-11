import crypto from 'crypto';

interface CashfreeOrderRequest {
  orderId: string;
  orderAmount: number;
  orderCurrency: string;
  customerDetails: {
    customerId: string;
    customerEmail: string;
    customerPhone?: string;
  };
  orderMeta?: {
    returnUrl: string;
    notifyUrl?: string;
  };
}

interface CashfreeOrderResponse {
  cf_order_id: string;
  order_id: string;
  order_status: string;
  payment_session_id: string;
  order_token?: string;
}

export class CashfreeClient {
  private appId: string;
  private secretKey: string;
  private apiVersion: string;
  private baseUrl: string;

  constructor() {
    this.appId = process.env.CASHFREE_APP_ID || '';
    this.secretKey = process.env.CASHFREE_SECRET_KEY || '';
    this.apiVersion = process.env.CASHFREE_API_VERSION || '2023-08-01';
    
    // Use sandbox for testing, production for live
    this.baseUrl = this.appId.includes('TEST') 
      ? 'https://sandbox.cashfree.com/pg'
      : 'https://api.cashfree.com/pg';
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'x-api-version': this.apiVersion,
      'x-client-id': this.appId,
      'x-client-secret': this.secretKey,
    };
  }

  async createOrder(params: {
    userId: string;
    userEmail: string;
    amount: number;
    type: 'game_unlock' | 'chadava';
    gameId?: string;
    deity?: string;
  }): Promise<CashfreeOrderResponse | null> {
    try {
      const orderId = `ORDER_${Date.now()}_${params.userId.slice(0, 8)}`;
      
      const orderRequest: CashfreeOrderRequest = {
        orderId,
        orderAmount: params.amount,
        orderCurrency: 'INR',
        customerDetails: {
          customerId: params.userId,
          customerEmail: params.userEmail,
        },
        orderMeta: {
          returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/callback`,
          notifyUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/offerings/verify`,
        },
      };

      const response = await fetch(`${this.baseUrl}/orders`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(orderRequest),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Cashfree order creation failed:', error);
        return null;
      }

      const data: CashfreeOrderResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Cashfree API error:', error);
      return null;
    }
  }

  async getOrderStatus(orderId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/orders/${orderId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Cashfree get order error:', error);
      return null;
    }
  }

  verifyWebhookSignature(
    webhookBody: string,
    receivedSignature: string,
    timestamp: string
  ): boolean {
    try {
      // Cashfree webhook signature verification
      const signatureData = `${timestamp}${webhookBody}`;
      const computedSignature = crypto
        .createHmac('sha256', this.secretKey)
        .update(signatureData)
        .digest('base64');

      return computedSignature === receivedSignature;
    } catch (error) {
      console.error('Signature verification error:', error);
      return false;
    }
  }

  isConfigured(): boolean {
    return !!(this.appId && this.secretKey && this.appId !== 'placeholder');
  }
}

// Singleton instance
export const cashfreeClient = new CashfreeClient();

// Helper to open Cashfree checkout
export function openCashfreeCheckout(
  paymentSessionId: string,
  onSuccess: () => void,
  onFailure: (error: any) => void
) {
  // This will be implemented on the frontend using Cashfree SDK
  if (typeof window === 'undefined') return;

  // Load Cashfree SDK if not already loaded
  const script = document.createElement('script');
  script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
  script.async = true;
  
  script.onload = () => {
    // @ts-ignore - Cashfree SDK
    const cashfree = Cashfree({
      mode: process.env.CASHFREE_APP_ID?.includes('TEST') ? 'sandbox' : 'production',
    });

    cashfree.checkout({
      paymentSessionId,
      returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/callback`,
    }).then(() => {
      onSuccess();
    }).catch((error: any) => {
      onFailure(error);
    });
  };

  document.body.appendChild(script);
}
