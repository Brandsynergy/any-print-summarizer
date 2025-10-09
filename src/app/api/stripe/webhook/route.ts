import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { PrismaClient } from "@prisma/client"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover'
})

const prisma = new PrismaClient()
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const sig = request.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      // Find the user by email or userId in metadata
      const customerEmail = session.customer_email
      const userId = session.metadata?.userId

      let user = null
      if (userId && userId.includes('@')) {
        // userId is actually an email
        user = await prisma.user.findUnique({
          where: { email: userId }
        })
      } else if (userId) {
        // userId is a proper ID
        user = await prisma.user.findUnique({
          where: { id: userId }
        })
      } else if (customerEmail) {
        // Find by customer email
        user = await prisma.user.findUnique({
          where: { email: customerEmail }
        })
      }

      if (!user && customerEmail) {
        // Create new user if not exists
        user = await prisma.user.create({
          data: {
            email: customerEmail,
            name: session.customer_details?.name || null,
            isPremium: true,
            paymentDate: new Date(),
            stripeCustomerId: session.customer as string
          }
        })
      } else if (user) {
        // Upgrade existing user to premium
        await prisma.user.update({
          where: { id: user.id },
          data: {
            isPremium: true,
            paymentDate: new Date(),
            stripeCustomerId: session.customer as string
          }
        })
      }

      // Update payment record
      if (session.id) {
        await prisma.payment.updateMany({
          where: { stripeSessionId: session.id },
          data: { status: 'completed' }
        })
      }

      console.log('Payment successful for user:', customerEmail)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 })
  }
}