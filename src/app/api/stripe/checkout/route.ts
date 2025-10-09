import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getServerSession } from "next-auth/next"
import { PrismaClient } from "@prisma/client"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover'
})

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user already has premium access
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (user?.isPremium) {
      return NextResponse.json({ error: 'User already has premium access' }, { status: 400 })
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Any Print Summarizer - Lifetime Access',
              description: 'One-time payment for unlimited access to all features including Academic Analysis mode',
              images: ['https://your-domain.com/logo.png'], // Add your logo URL
            },
            unit_amount: 6700, // $67.00 in cents
          },
          quantity: 1,
        },
      ],
      customer_email: session.user.email,
      success_url: `${process.env.NEXTAUTH_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/pricing?canceled=true`,
      metadata: {
        userId: user?.id || session.user.email,
        originalPrice: '19700', // $197.00 in cents
        discountAmount: '13000' // $130.00 discount
      }
    })

    // Store the payment record
    if (user) {
      await prisma.payment.create({
        data: {
          userId: user.id,
          stripeSessionId: checkoutSession.id,
          amount: 6700,
          currency: 'usd',
          status: 'pending'
        }
      })
    }

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}