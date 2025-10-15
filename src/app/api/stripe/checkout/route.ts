import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getServerSession } from "next-auth/next"
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-09-30.clover'
}) : null

// NextAuth configuration for session validation
const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }
        if (credentials.password !== "demo123") {
          return null
        }
        const userId = Buffer.from(credentials.email).toString('base64').substring(0, 12)
        return {
          id: userId,
          email: credentials.email,
          name: credentials.email.split('@')[0],
          isPremium: false
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.isPremium = user.isPremium
      }
      return token
    },
    async session({ session, token }: any) {
      if (token && session.user) {
        (session.user as any).id = token.sub!
        ;(session.user as any).isPremium = token.isPremium as boolean
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin'
  }
}

export async function POST(request: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: 'Payment system not configured' }, { status: 503 })
  }
  
  try {
    const session = await getServerSession(authOptions)
    console.log('Checkout session check:', { hasSession: !!session, userEmail: session?.user?.email })
    
    if (!session?.user?.email) {
      console.log('No session found, redirecting to login')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Creating Stripe checkout session for:', session.user.email)

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
            },
            unit_amount: 6700, // $67.00 in cents
          },
          quantity: 1,
        },
      ],
      customer_email: session.user.email,
      success_url: `${process.env.NEXTAUTH_URL || 'https://any-print-summarizer.onrender.com'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL || 'https://any-print-summarizer.onrender.com'}/pricing?canceled=true`,
      metadata: {
        userEmail: session.user.email,
        originalPrice: '19700', // $197.00 in cents
        discountAmount: '13000' // $130.00 discount
      }
    })

    console.log('Stripe checkout session created:', checkoutSession.id)
    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
