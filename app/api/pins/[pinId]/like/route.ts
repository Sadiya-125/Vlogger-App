import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/pins/[pinId]/like - Check if user liked the pin
export async function GET(
  req: Request,
  { params }: { params: Promise<{ pinId: string }> }
) {
  try {
    const { pinId } = await params;
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ liked: false })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return NextResponse.json({ liked: false })
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_pinId: {
          userId: user.id,
          pinId,
        },
      },
    })

    return NextResponse.json({ liked: !!existingLike })
  } catch (error) {
    console.error('[PIN_LIKE_GET]', error)
    return NextResponse.json({ liked: false })
  }
}

// POST /api/pins/[pinId]/like - Toggle like
export async function POST(
  req: Request,
  { params }: { params: Promise<{ pinId: string }> }
) {
  try {
    const { pinId } = await params;
    const { userId } = await auth()

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      // Auto-create user from Clerk session
      const { clerkClient } = await import('@clerk/nextjs/server')
      const client = await clerkClient()
      const clerkUser = await client.users.getUser(userId)

      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          username: clerkUser.username || clerkUser.id,
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          imageUrl: clerkUser.imageUrl,
        },
      })
    }

    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_pinId: {
          userId: user.id,
          pinId,
        },
      },
    })

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      })

      return NextResponse.json({ liked: false })
    } else {
      // Like
      await prisma.like.create({
        data: {
          userId: user.id,
          pinId,
        },
      })

      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    console.error('[PIN_LIKE]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
