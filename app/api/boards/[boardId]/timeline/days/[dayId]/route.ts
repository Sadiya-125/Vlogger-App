import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PATCH /api/boards/[boardId]/timeline/days/[dayId] - Update timeline day
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
    const { title, notes } = body

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

    // Update timeline day
    const updatedDay = await prisma.timelineDay.update({
      where: { id: dayId },
      data: {
        title: title !== undefined ? title : undefined,
        notes: notes !== undefined ? notes : undefined,
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

    return NextResponse.json(updatedDay)
  } catch (error) {
    console.error('[TIMELINE_DAY_UPDATE]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// DELETE /api/boards/[boardId]/timeline/days/[dayId] - Delete timeline day
export async function DELETE(
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

    // Delete timeline day (cascade will delete pin assignments)
    await prisma.timelineDay.delete({
      where: { id: dayId },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('[TIMELINE_DAY_DELETE]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
