import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

const handler = NextAuth({
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

        // For demo purposes, allow demo123 password for any email
        if (credentials.password !== "demo123") {
          return null
        }

        // Find or create user
        let user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user) {
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
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          isPremium: user.isPremium
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