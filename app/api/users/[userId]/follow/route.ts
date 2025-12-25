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

    const currentUser = await prisma.user.findUnique({
      where: { clerkId: currentClerkId },
    })

    const targetUser = await prisma.user.findUnique({
      where: { clerkId: targetUserId },
    })

    if (!currentUser || !targetUser) {
      return new NextResponse('User not found', { status: 404 })
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

    const targetUser = await prisma.user.findUnique({
      where: { clerkId: targetUserId },
    })

    if (!currentUser || !targetUser) {
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
