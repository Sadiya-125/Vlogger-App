import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/boards/[boardId]/timeline/days - Create a new timeline day
export async function POST(
  req: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  try {
    const { boardId } = await params
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
    const { dayNumber, title, notes } = body

    if (!dayNumber || typeof dayNumber !== 'number') {
      return new NextResponse('Day number is required', { status: 400 })
    }

    // Check if user has access to board
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
    const canEdit = board.members.some(
      (m) => m.role === 'CO_ADMIN' || m.role === 'CAN_ADD_PINS'
    )

    if (!isOwner && !canEdit) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    // Create timeline day
    const timelineDay = await prisma.timelineDay.create({
      data: {
        boardId,
        dayNumber,
        title: title || null,
        notes: notes || null,
      },
      include: {
        pins: {
          include: {
            pin: {
              include: {
                images: { take: 1 },
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    })

    return NextResponse.json(timelineDay)
  } catch (error) {
    console.error('[TIMELINE_DAY_CREATE]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
