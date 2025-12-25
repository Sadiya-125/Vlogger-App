import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/boards/[boardId]/reorder - Reorder pins in board
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

    // Check permissions
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: {
        members: {
          where: { userId: user.id },
        },
      },
    })

    if (!board) {
      return new NextResponse('Board not found', { status: 404 })
    }

    const isOwner = board.userId === user.id
    const member = board.members[0]
    const canEdit =
      isOwner ||
      member?.role === 'OWNER' ||
      member?.role === 'CO_ADMIN' ||
      member?.role === 'CAN_ADD_PINS'

    if (!canEdit) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const body = await req.json()
    const { pinIds } = body

    if (!Array.isArray(pinIds)) {
      return new NextResponse('Invalid pin IDs', { status: 400 })
    }

    // Update order for each pin
    await prisma.$transaction(
      pinIds.map((relationId: string, index: number) =>
        prisma.boardPinRelation.updateMany({
          where: {
            id: relationId,
            boardId,
          },
          data: {
            order: index,
          },
        })
      )
    )

    // Log activity
    await prisma.boardActivityLog.create({
      data: {
        boardId,
        userId: user.id,
        activityType: 'SETTINGS_UPDATED',
        metadata: JSON.stringify({ action: 'pins_reordered' }),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[BOARD_REORDER]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
