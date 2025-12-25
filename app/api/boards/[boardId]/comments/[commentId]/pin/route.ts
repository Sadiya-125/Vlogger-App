import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/boards/[boardId]/comments/[commentId]/pin - Toggle pin status
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ boardId: string; commentId: string }> }
) {
  try {
    const { boardId, commentId } = await params;
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Check if user is board owner or co-admin
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: {
        members: {
          where: { userId: user.id },
        },
      },
    });

    if (!board) {
      return new NextResponse("Board not found", { status: 404 });
    }

    const isOwner = board.userId === user.id;
    const isCoAdmin = board.members.some((m) => m.role === "CO_ADMIN");

    if (!isOwner && !isCoAdmin) {
      return new NextResponse("Forbidden - Only owners and co-admins can pin comments", {
        status: 403,
      });
    }

    // Get comment and toggle pin status
    const comment = await prisma.boardComment.findUnique({
      where: { id: commentId },
    });

    if (!comment || comment.boardId !== boardId) {
      return new NextResponse("Comment not found", { status: 404 });
    }

    // Toggle the pin status
    const updatedComment = await prisma.boardComment.update({
      where: { id: commentId },
      data: { isPinned: !comment.isPinned },
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
    });

    return NextResponse.json(updatedComment);
  } catch (error) {
    console.error("[COMMENT_PIN_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
