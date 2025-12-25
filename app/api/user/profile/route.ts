import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { userProfileSchema } from '@/lib/validations'

// GET /api/user/profile - Get current user profile
export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        _count: {
          select: {
            boards: true,
            pins: true,
            followers: true,
            following: true,
          },
        },
      },
    })

    if (!user) {
      return new NextResponse('User not found', { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('[USER_PROFILE_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// PATCH /api/user/profile - Update user profile
export async function PATCH(req: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const validatedData = userProfileSchema.parse(body)

    const user = await prisma.user.update({
      where: { clerkId: userId },
      data: validatedData,
      include: {
        _count: {
          select: {
            boards: true,
            pins: true,
            followers: true,
            following: true,
          },
        },
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('[USER_PROFILE_PATCH]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
