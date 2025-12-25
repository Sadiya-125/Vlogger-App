import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/boards/[boardId]/members - Get all members
export async function GET(
  req: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  try {
    const { boardId } = await params;

    const members = await prisma.boardMember.findMany({
      where: { boardId },
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
      orderBy: {
        createdAt: 'asc',
      },
    })

    return NextResponse.json(members)
  } catch (error) {
    console.error('[BOARD_MEMBERS_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// POST /api/boards/[boardId]/members - Invite member
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

    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!currentUser) {
      return new NextResponse('User not found', { status: 404 })
    }

    const body = await req.json()
    const { username, role } = body

    if (!username || !role) {
      return new NextResponse('Username and role are required', { status: 400 })
    }

    // Check permissions - only owner or co-admin can invite
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
    const canInvite = isOwner || currentMember?.role === 'OWNER' || currentMember?.role === 'CO_ADMIN'

    if (!canInvite) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    // Find user to invite by username or full name
    let userToInvite = await prisma.user.findUnique({
      where: { username },
    })

    // If not found by username, try searching by full name
    if (!userToInvite) {
      const nameParts = username.trim().split(/\s+/);
      if (nameParts.length >= 2) {
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ');

        userToInvite = await prisma.user.findFirst({
          where: {
            AND: [
              { firstName: { equals: firstName, mode: 'insensitive' } },
              { lastName: { equals: lastName, mode: 'insensitive' } },
            ],
          },
        });
      }
    }

    if (!userToInvite) {
      return new NextResponse('User not found', { status: 404 })
    }

    // Check if already a member
    const existingMember = await prisma.boardMember.findFirst({
      where: {
        boardId,
        userId: userToInvite.id,
      },
    })

    if (existingMember) {
      return new NextResponse('User is already a member', { status: 409 })
    }

    // Add member
    const member = await prisma.boardMember.create({
      data: {
        boardId,
        userId: userToInvite.id,
        role,
      },
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
        activityType: 'MEMBER_ADDED',
        metadata: JSON.stringify({
          addedUserId: userToInvite.id,
          addedUsername: userToInvite.username,
          role,
        }),
      },
    })

    return NextResponse.json(member)
  } catch (error) {
    console.error('[BOARD_MEMBER_INVITE]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
