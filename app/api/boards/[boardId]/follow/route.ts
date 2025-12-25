import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/boards/[boardId]/follow - Toggle follow
export async function POST(
  req: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  try {
    const { boardId } = await params;
    const { userId } = await auth()

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return new NextResponse('User not found', { status: 404 })
    }

    // Check if already following
    const existingFollow = await prisma.boardFollow.findUnique({
      where: {
        userId_boardId: {
          userId: user.id,
          boardId,
        },
      },
    })

    if (existingFollow) {
      // Unfollow
      await prisma.boardFollow.delete({
        where: {
          id: existingFollow.id,
        },
      })

      return NextResponse.json({ following: false })
    } else {
      // Follow
      await prisma.boardFollow.create({
        data: {
          userId: user.id,
          boardId,
        },
      })

      return NextResponse.json({ following: true })
    }
  } catch (error) {
    console.error('[BOARD_FOLLOW]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
