import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { mode } = await request.json()
    
    if (!mode || !['standard', 'academic'].includes(mode)) {
      return NextResponse.json({ error: 'Invalid mode' }, { status: 400 })
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      // Create new user with first usage
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name || null,
          standardUsed: mode === 'standard' ? 1 : 0,
          academicUsed: mode === 'academic' ? 1 : 0,
          isPremium: false
        }
      })
    } else {
      // Update existing user
      const updateData = mode === 'standard' 
        ? { standardUsed: user.standardUsed + 1 }
        : { academicUsed: user.academicUsed + 1 }

      user = await prisma.user.update({
        where: { id: user.id },
        data: updateData
      })
    }

    return NextResponse.json({
      success: true,
      user: {
        standardUsed: user.standardUsed,
        academicUsed: user.academicUsed,
        isPremium: user.isPremium
      }
    })
  } catch (error) {
    console.error('Update usage error:', error)
    return NextResponse.json({ error: 'Failed to update usage' }, { status: 500 })
  }
}