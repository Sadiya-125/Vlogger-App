import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// DELETE /api/boards/[boardId]/timeline/days/[dayId]/pins/[assignmentId] - Remove pin from timeline day
export async function DELETE(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ boardId: string; dayId: string; assignmentId: string }>
  }
) {
  try {
    const { boardId, assignmentId } = await params
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

    // Delete pin assignment
    await prisma.timelinePinAssignment.delete({
      where: { id: assignmentId },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('[TIMELINE_PIN_REMOVE]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
