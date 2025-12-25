import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/boards/[boardId]/pins - Add pin to board
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

    const body = await req.json()
    const { pinId } = body

    if (!pinId) {
      return new NextResponse('Pin ID is required', { status: 400 })
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

    // Check if pin exists
    const pin = await prisma.pin.findUnique({
      where: { id: pinId },
    })

    if (!pin) {
      return new NextResponse('Pin not found', { status: 404 })
    }

    // Check if pin is already in board
    const existing = await prisma.boardPinRelation.findFirst({
      where: {
        boardId,
        pinId,
      },
    })

    if (existing) {
      return new NextResponse('Pin already in board', { status: 409 })
    }

    // Get current max order
    const maxOrder = await prisma.boardPinRelation.findFirst({
      where: { boardId },
      orderBy: { order: 'desc' },
      select: { order: true },
    })

    const newOrder = maxOrder ? maxOrder.order + 1 : 0

    // Add pin to board
    const relation = await prisma.boardPinRelation.create({
      data: {
        boardId,
        pinId,
        order: newOrder,
      },
      include: {
        pin: {
          include: {
            images: true,
          },
        },
      },
    })

    // Log activity
    await prisma.boardActivityLog.create({
      data: {
        boardId,
        userId: user.id,
        activityType: 'PIN_ADDED',
        metadata: JSON.stringify({ pinId, pinTitle: pin.title }),
      },
    })

    return NextResponse.json(relation)
  } catch (error) {
    console.error('[BOARD_ADD_PIN]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
