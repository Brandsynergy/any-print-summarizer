import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          console.log('Auth attempt:', { email: credentials?.email, hasPassword: !!credentials?.password })
          
          if (!credentials?.email || !credentials?.password) {
            console.log('Missing credentials')
            return null
          }

          // For demo purposes, allow demo123 password for any email
          if (credentials.password !== "demo123") {
            console.log('Invalid password:', credentials.password)
            return null
          }

          console.log('Attempting database connection...')
          
          // Test database connection first
          await prisma.$connect()
          console.log('Database connected successfully')
          
          // Find or create user
          let user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })
          
          console.log('User lookup result:', user ? 'Found' : 'Not found')

          if (!user) {
            console.log('Creating new user...')
            // Create new user automatically
            user = await prisma.user.create({
              data: {
                email: credentials.email,
                name: credentials.email.split('@')[0], // Use email prefix as name
                standardUsed: 0,
                academicUsed: 0,
                isPremium: false
              }
            })
            console.log('User created successfully:', user.id)
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            isPremium: user.isPremium
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        } finally {
          await prisma.$disconnect()
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.isPremium = (user as any).isPremium
      }
      return token
    },
    async session({ session, token }) {
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
})

export { handler as GET, handler as POST }