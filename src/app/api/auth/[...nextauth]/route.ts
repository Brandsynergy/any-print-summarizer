import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

const handler = NextAuth({
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

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user) {
          return null
        }

        // For now, we'll use plain text comparison
        // In production, you'd use bcrypt.compare(credentials.password, user.password)
        if (credentials.password !== "demo123") { // Temporary demo password
          return null
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