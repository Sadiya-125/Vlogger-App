import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PATCH /api/boards/[boardId]/pins/[pinId]/context - Update pin context
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ boardId: string; pinId: string }> }
) {
  try {
    const { boardId, pinId } = await params;
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
    const { boardNotes, relevance } = body

    // Update BoardPinRelation
    const updated = await prisma.boardPinRelation.updateMany({
      where: {
        boardId,
        pinId,
      },
      data: {
        ...(boardNotes !== undefined && { boardNotes }),
        ...(relevance !== undefined && { relevance }),
      },
    })

    if (updated.count === 0) {
      return new NextResponse('Pin not found in board', { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[PIN_CONTEXT_UPDATE]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
