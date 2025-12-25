import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/boards/[boardId]/comments/[commentId]/reaction - Toggle reaction
export async function POST(
  req: Request,
  { params }: { params: Promise<{ boardId: string; commentId: string }> }
) {
  try {
    const { commentId } = await params;
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
    const { emoji } = body

    if (!emoji) {
      return new NextResponse('Emoji is required', { status: 400 })
    }

    // Check if reaction exists
    const existing = await prisma.commentReaction.findFirst({
      where: {
        commentId,
        userId: user.id,
        emoji,
      },
    })

    if (existing) {
      // Remove reaction
      await prisma.commentReaction.delete({
        where: { id: existing.id },
      })

      return NextResponse.json({ added: false })
    } else {
      // Add reaction
      await prisma.commentReaction.create({
        data: {
          commentId,
          userId: user.id,
          emoji,
        },
      })

      return NextResponse.json({ added: true })
    }
  } catch (error) {
    console.error('[COMMENT_REACTION]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
