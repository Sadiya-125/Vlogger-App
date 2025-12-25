import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PATCH /api/boards/[boardId]/members/[memberId] - Update member role
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ boardId: string; memberId: string }> }
) {
  try {
    const { boardId, memberId } = await params;
    const { userId } = await auth()

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!currentUser) {
      return new NextResponse('User not found', { status: 404 })
    }

    const body = await req.json()
    const { role } = body

    if (!role) {
      return new NextResponse('Role is required', { status: 400 })
    }

    // Check permissions
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: {
        members: {
          where: { userId: currentUser.id },
        },
      },
    })

    if (!board) {
      return new NextResponse('Board not found', { status: 404 })
    }

    const isOwner = board.userId === currentUser.id
    const currentMember = board.members[0]
    const canManage = isOwner || currentMember?.role === 'OWNER' || currentMember?.role === 'CO_ADMIN'

    if (!canManage) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    // Update member role
    const updatedMember = await prisma.boardMember.update({
      where: { id: memberId },
      data: { role },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
      },
    })

    // Log activity
    await prisma.boardActivityLog.create({
      data: {
        boardId,
        userId: currentUser.id,
        activityType: 'MEMBER_ROLE_CHANGED',
        metadata: JSON.stringify({
          memberId: updatedMember.userId,
          newRole: role,
        }),
      },
    })

    return NextResponse.json(updatedMember)
  } catch (error) {
    console.error('[BOARD_MEMBER_UPDATE]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// DELETE /api/boards/[boardId]/members/[memberId] - Remove member
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ boardId: string; memberId: string }> }
) {
  try {
    const { boardId, memberId } = await params;
    const { userId } = await auth()

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!currentUser) {
      return new NextResponse('User not found', { status: 404 })
    }

    // Check permissions
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: {
        members: {
          where: { userId: currentUser.id },
        },
      },
    })

    if (!board) {
      return new NextResponse('Board not found', { status: 404 })
    }

    const isOwner = board.userId === currentUser.id
    const currentMember = board.members[0]
    const canRemove = isOwner || currentMember?.role === 'OWNER' || currentMember?.role === 'CO_ADMIN'

    if (!canRemove) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    // Get member info before deletion
    const member = await prisma.boardMember.findUnique({
      where: { id: memberId },
      include: {
        user: true,
      },
    })

    if (!member) {
      return new NextResponse('Member not found', { status: 404 })
    }

    // Delete member
    await prisma.boardMember.delete({
      where: { id: memberId },
    })

    // Log activity
    await prisma.boardActivityLog.create({
      data: {
        boardId,
        userId: currentUser.id,
        activityType: 'MEMBER_REMOVED',
        metadata: JSON.stringify({
          removedUserId: member.userId,
          removedUsername: member.user.username,
        }),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[BOARD_MEMBER_REMOVE]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
