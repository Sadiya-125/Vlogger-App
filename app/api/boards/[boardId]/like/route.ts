import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/boards/[boardId]/like - Toggle like
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

    // Check if already liked
    const existingLike = await prisma.boardLike.findUnique({
      where: {
        userId_boardId: {
          userId: user.id,
          boardId,
        },
      },
    })

    if (existingLike) {
      // Unlike
      await prisma.boardLike.delete({
        where: {
          id: existingLike.id,
        },
      })

      return NextResponse.json({ liked: false })
    } else {
      // Like
      await prisma.boardLike.create({
        data: {
          userId: user.id,
          boardId,
        },
      })

      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    console.error('[BOARD_LIKE]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
