import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/boards/[boardId]/comments - Get all comments for a board
export async function GET(
  req: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  try {
    const { boardId } = await params;

    const comments = await prisma.boardComment.findMany({
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
        parent: {
          select: {
            id: true,
            content: true,
            user: {
              select: {
                username: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        replies: {
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
            parent: {
              select: {
                id: true,
                content: true,
                user: {
                  select: {
                    username: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
            reactions: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                  },
                },
              },
              orderBy: {
                createdAt: 'asc',
              },
            },
            _count: {
              select: {
                reactions: true,
                replies: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        _count: {
          select: {
            reactions: true,
            replies: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error('[BOARD_COMMENTS_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// POST /api/boards/[boardId]/comments - Create a new comment
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

    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      // Auto-create user from Clerk session
      const { clerkClient } = await import('@clerk/nextjs/server')
      const client = await clerkClient()
      const clerkUser = await client.users.getUser(userId)

      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          username: clerkUser.username || clerkUser.id,
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          imageUrl: clerkUser.imageUrl,
        },
      })
    }

    const body = await req.json()
    const { content, parentId, imageUrl } = body

    if (!content || !content.trim()) {
      return new NextResponse('Content is required', { status: 400 })
    }

    // Check if board exists and user has access
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

    // Check if user can view the board (and therefore comment)
    const isOwner = board.userId === user.id
    const isMember = board.members.length > 0
    const canView =
      board.visibility === 'PUBLIC' ||
      (board.visibility === 'PRIVATE' && isOwner) ||
      (board.visibility === 'SHARED' && (isOwner || isMember))

    if (!canView) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    // Create comment
    const comment = await prisma.boardComment.create({
      data: {
        boardId,
        userId: user.id,
        content,
        parentId: parentId || null,
        imageUrl: imageUrl || null,
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
        _count: {
          select: {
            reactions: true,
            replies: true,
          },
        },
      },
    })

    // Log activity if it's a top-level comment
    if (!parentId) {
      await prisma.boardActivityLog.create({
        data: {
          boardId,
          userId: user.id,
          activityType: 'COMMENT_ADDED',
          metadata: JSON.stringify({ commentId: comment.id }),
        },
      })
    }

    return NextResponse.json(comment)
  } catch (error) {
    console.error('[BOARD_COMMENT_CREATE]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
