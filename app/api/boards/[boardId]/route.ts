import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { boardSchema } from '@/lib/validations'

// GET /api/boards/[boardId] - Get single board
export async function GET(
  req: Request,
  { params }: { params: { boardId: string } }
) {
  try {
    const board = await prisma.board.findUnique({
      where: {
        id: params.boardId,
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
        pins: {
          include: {
            images: true,
            tags: {
              include: {
                tag: true,
              },
            },
            _count: {
              select: {
                likes: true,
                comments: true,
              },
            },
          },
        },
        _count: {
          select: {
            pins: true,
            followers: true,
          },
        },
      },
    })

    if (!board) {
      return new NextResponse('Board not found', { status: 404 })
    }

    // Check if board is public or belongs to current user
    const { userId } = await auth()
    if (!board.isPublic && userId) {
      const user = await prisma.user.findUnique({
        where: { clerkId: userId },
      })

      if (user?.id !== board.userId) {
        return new NextResponse('Unauthorized', { status: 401 })
      }
    }

    return NextResponse.json(board)
  } catch (error) {
    console.error('[BOARD_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// PATCH /api/boards/[boardId] - Update board
export async function PATCH(
  req: Request,
  { params }: { params: { boardId: string } }
) {
  try {
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

    // Check ownership
    const existingBoard = await prisma.board.findUnique({
      where: { id: params.boardId },
    })

    if (!existingBoard || existingBoard.userId !== user.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const validatedData = boardSchema.parse(body)

    const board = await prisma.board.update({
      where: { id: params.boardId },
      data: validatedData,
      include: {
        _count: {
          select: {
            pins: true,
            followers: true,
          },
        },
      },
    })

    return NextResponse.json(board)
  } catch (error) {
    console.error('[BOARD_PATCH]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

// DELETE /api/boards/[boardId] - Delete board
export async function DELETE(
  req: Request,
  { params }: { params: { boardId: string } }
) {
  try {
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

    // Check ownership
    const existingBoard = await prisma.board.findUnique({
      where: { id: params.boardId },
    })

    if (!existingBoard || existingBoard.userId !== user.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    await prisma.board.delete({
      where: { id: params.boardId },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('[BOARD_DELETE]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
