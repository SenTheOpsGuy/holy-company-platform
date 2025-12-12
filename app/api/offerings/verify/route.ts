import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyCashfreeWebhook } from '@/lib/cashfree';
import { sendEmail } from '@/lib/brevo';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headers = request.headers;

    // Verify Cashfree webhook signature
    const signature = request.headers.get('x-cf-signature') || '';
    const timestamp = request.headers.get('x-cf-timestamp') || '';
    const isValidWebhook = verifyCashfreeWebhook(body, signature, timestamp);
    
    if (!isValidWebhook) {
      return NextResponse.json({ 
        error: 'Invalid webhook signature' 
      }, { status: 400 });
    }

    const webhookData = JSON.parse(body);
    const { order_id, payment_status, order_amount, order_currency } = webhookData.data;

    // Extract offering ID from order_id (format: offering_[id])
    const offeringId = order_id.replace('offering_', '');

    // Find the offering
    const offering = await prisma.offering.findUnique({
      where: { id: offeringId },
      include: {
        user: true,
        puja: true
      }
    });

    if (!offering) {
      console.error('Offering not found for order:', order_id);
      return NextResponse.json({ 
        error: 'Offering not found' 
      }, { status: 404 });
    }

    // Update offering status based on payment status
    let newStatus: 'COMPLETED' | 'FAILED' | 'PENDING' = 'PENDING';
    
    switch (payment_status) {
      case 'SUCCESS':
        newStatus = 'COMPLETED';
        break;
      case 'FAILED':
      case 'USER_DROPPED':
      case 'VOID':
        newStatus = 'FAILED';
        break;
      default:
        newStatus = 'PENDING';
    }

    // Update offering
    const updatedOffering = await prisma.offering.update({
      where: { id: offeringId },
      data: {
        status: newStatus,
        paymentCompletedAt: newStatus === 'COMPLETED' ? new Date() : null,
        paymentDetails: webhookData.data,
      }
    });

    // If payment successful, give bonus punya and create blessing
    if (newStatus === 'COMPLETED') {
      // Calculate bonus punya (5x the offering amount in rupees)
      const bonusPunya = Math.floor(offering.amount * 5);

      // Update user's punya balance
      await prisma.user.update({
        where: { id: offering.userId },
        data: {
          punyaBalance: {
            increment: bonusPunya
          }
        }
      });

      // Create special blessing card
      await prisma.blessingCard.create({
        data: {
          userId: offering.userId,
          pujaId: offering.pujaId,
          deityName: offering.deityName,
          message: `Your generous offering of ₹${offering.amount} to ${offering.deityName} has been blessed. You have received ${bonusPunya} bonus punya points for your devotion.`,
          imageUrl: `/blessings/offering-${offering.deityName.toLowerCase()}.jpg`,
          isSpecial: true,
        }
      });

      // Send confirmation email
      try {
        await sendEmail(
          offering.user.email,
          'Offering Confirmed',
          `Your offering of ₹${offering.amount} to ${offering.deityName} has been completed successfully.`,
          'offering-success'
        );
      } catch (emailError) {
        console.error('Failed to send offering confirmation email:', emailError);
        // Don't fail the whole process if email fails
      }
    }

    return NextResponse.json({
      success: true,
      offering: {
        id: updatedOffering.id,
        status: updatedOffering.status,
        amount: updatedOffering.amount
      }
    });

  } catch (error) {
    console.error('Error processing offering webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}