import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

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
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session ID' }, { status: 400 })
    }

    // In a database-free system, we'll store premium status in a simple way
    // For now, we'll return success and handle premium upgrade client-side
    console.log('Upgrading user to premium:', session.user.email, 'Session:', sessionId)

    return NextResponse.json({ 
      success: true, 
      message: 'User upgraded to premium',
      email: session.user.email 
    })
  } catch (error) {
    console.error('Premium upgrade error:', error)
    return NextResponse.json({ error: 'Premium upgrade failed' }, { status: 500 })
  }
}