import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

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
        console.log('Auth attempt:', { email: credentials?.email, hasPassword: !!credentials?.password })
        
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials')
          return null
        }

        // For demo purposes, allow demo123 password for any email
        if (credentials.password !== "demo123") {
          console.log('Invalid password provided:', credentials.password)
          return null
        }

        console.log('Password correct, creating user session')
        
        // Simple authentication without database for now
        // Generate a consistent user ID based on email
        const userId = Buffer.from(credentials.email).toString('base64').substring(0, 12)
        
        const user = {
          id: userId,
          email: credentials.email,
          name: credentials.email.split('@')[0],
          isPremium: false // Default to free user
        }
        
        console.log('User session created:', user)
        return user
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