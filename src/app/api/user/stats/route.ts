import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || null,
          standardUsed: 0,
          academicUsed: 0,
          isPremium: false
        }
      })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        standardUsed: user.standardUsed,
        academicUsed: user.academicUsed,
        isPremium: user.isPremium,
        paymentDate: user.paymentDate
      }
    })
  } catch (error) {
    console.error('User stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch user stats' }, { status: 500 })
  }
}