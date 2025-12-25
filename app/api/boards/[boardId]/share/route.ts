import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: Request,
  { params }: { params: { boardId: string } }
) {
  try {
    const board = await prisma.board.findUnique({
      where: {
        id: params.boardId,
        isPrivate: false, // Only allow sharing public boards
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
            tags: { include: { tag: true } },
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
      return new NextResponse("Board not found or is private", { status: 404 })
    }

    return NextResponse.json(board)
  } catch (error) {
    console.error("[BOARD_SHARE_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
