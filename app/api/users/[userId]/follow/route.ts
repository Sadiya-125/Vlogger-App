import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/users/[userId]/follow - Toggle follow
export async function POST(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: targetUserId } = await params;
    const { userId: currentClerkId } = await auth()

    if (!currentClerkId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    let currentUser = await prisma.user.findUnique({
      where: { clerkId: currentClerkId },
    })

    if (!currentUser) {
      // Auto-create current user
      const { clerkClient } = await import('@clerk/nextjs/server')
      const client = await clerkClient()
      const clerkUser = await client.users.getUser(currentClerkId)

      currentUser = await prisma.user.create({
        data: {
          clerkId: currentClerkId,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          username: clerkUser.username || clerkUser.id,
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          imageUrl: clerkUser.imageUrl,
        },
      })
    }

    // Find target user by clerkId or username
    const targetUser = await prisma.user.findFirst({
      where: {
        OR: [
          { clerkId: targetUserId },
          { username: targetUserId },
        ],
      },
    })

    if (!targetUser) {
      return new NextResponse('Target user not found', { status: 404 })
    }

    // Can't follow yourself
    if (currentUser.id === targetUser.id) {
      return new NextResponse('Cannot follow yourself', { status: 400 })
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: targetUser.id,
        },
      },
    })

    if (existingFollow) {
      // Unfollow
      await prisma.follow.delete({
        where: {
          id: existingFollow.id,
        },
      })

      return NextResponse.json({ following: false })
    } else {
      // Follow
      await prisma.follow.create({
        data: {
          followerId: currentUser.id,
          followingId: targetUser.id,
        },
      })

      return NextResponse.json({ following: true })
    }
  } catch (error) {
    console.error('[USER_FOLLOW]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// GET /api/users/[userId]/follow - Check if following
export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: targetUserId } = await params;
    const { userId: currentClerkId } = await auth()

    if (!currentClerkId) {
      return NextResponse.json({ following: false })
    }

    const currentUser = await prisma.user.findUnique({
      where: { clerkId: currentClerkId },
    })

    if (!currentUser) {
      return NextResponse.json({ following: false })
    }

    // Find target user by clerkId or username
    const targetUser = await prisma.user.findFirst({
      where: {
        OR: [
          { clerkId: targetUserId },
          { username: targetUserId },
        ],
      },
    })

    if (!targetUser) {
      return NextResponse.json({ following: false })
    }

    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: targetUser.id,
        },
      },
    })

    return NextResponse.json({ following: !!existingFollow })
  } catch (error) {
    console.error('[USER_FOLLOW_GET]', error)
    return NextResponse.json({ following: false })
  }
}
