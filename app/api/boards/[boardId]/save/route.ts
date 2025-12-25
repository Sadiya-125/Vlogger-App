import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/boards/[boardId]/save - Check if user saved the board
export async function GET(
  req: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  try {
    const { boardId } = await params;
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ saved: false })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return NextResponse.json({ saved: false })
    }

    const savedBoard = await prisma.savedBoard.findUnique({
      where: {
        userId_boardId: {
          userId: user.id,
          boardId,
        },
      },
    })

    return NextResponse.json({ saved: !!savedBoard })
  } catch (error) {
    console.error('[BOARD_SAVE_GET]', error)
    return NextResponse.json({ saved: false })
  }
}

// POST /api/boards/[boardId]/save - Toggle save
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

    // Check if already saved
    const existingSave = await prisma.savedBoard.findUnique({
      where: {
        userId_boardId: {
          userId: user.id,
          boardId,
        },
      },
    })

    if (existingSave) {
      // Unsave
      await prisma.savedBoard.delete({
        where: {
          id: existingSave.id,
        },
      })

      return NextResponse.json({ saved: false })
    } else {
      // Save
      await prisma.savedBoard.create({
        data: {
          userId: user.id,
          boardId,
        },
      })

      return NextResponse.json({ saved: true })
    }
  } catch (error) {
    console.error('[BOARD_SAVE]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
