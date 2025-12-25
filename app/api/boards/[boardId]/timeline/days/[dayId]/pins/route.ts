import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/boards/[boardId]/timeline/days/[dayId]/pins - Add pin to timeline day
export async function POST(
  req: Request,
  { params }: { params: Promise<{ boardId: string; dayId: string }> }
) {
  try {
    const { boardId, dayId } = await params
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

    // Get the highest order number for this day
    const maxOrder = await prisma.timelinePinAssignment.findFirst({
      where: { dayId },
      orderBy: { order: 'desc' },
      select: { order: true },
    })

    const newOrder = (maxOrder?.order ?? -1) + 1

    // Create pin assignment
    const assignment = await prisma.timelinePinAssignment.create({
      data: {
        dayId,
        pinId,
        order: newOrder,
      },
      include: {
        pin: {
          include: {
            images: { take: 1 },
          },
        },
      },
    })

    return NextResponse.json(assignment)
  } catch (error) {
    console.error('[TIMELINE_PIN_ADD]', error)
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return new NextResponse('Pin already in this day', { status: 409 })
    }
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// PATCH /api/boards/[boardId]/timeline/days/[dayId]/pins - Reorder pins in timeline day
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ boardId: string; dayId: string }> }
) {
  try {
    const { boardId, dayId } = await params
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
    const { pins } = body // Array of { id: string, order: number }

    if (!Array.isArray(pins)) {
      return new NextResponse('Pins array is required', { status: 400 })
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

    // Update all pin orders in a transaction
    await prisma.$transaction(
      pins.map((pin) =>
        prisma.timelinePinAssignment.update({
          where: { id: pin.id },
          data: { order: pin.order },
        })
      )
    )

    // Fetch updated timeline day
    const updatedDay = await prisma.timelineDay.findUnique({
      where: { id: dayId },
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

    return NextResponse.json(updatedDay)
  } catch (error) {
    console.error('[TIMELINE_PINS_REORDER]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
