import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { boardId } = await params;
    const { archive } = await req.json();

    if (typeof archive !== "boolean") {
      return NextResponse.json(
        { error: "Archive status must be a boolean" },
        { status: 400 }
      );
    }

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get board and verify ownership or admin status
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: {
        members: {
          where: { userId: currentUser.id },
        },
      },
    });

    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    // Check if user is owner or co-admin
    const isOwner = board.userId === currentUser.id;
    const isCoAdmin =
      board.members.length > 0 && board.members[0].role === "CO_ADMIN";

    if (!isOwner && !isCoAdmin) {
      return NextResponse.json(
        { error: "Only the owner or co-admin can archive this board" },
        { status: 403 }
      );
    }

    // Update board archive status
    const updatedBoard = await prisma.board.update({
      where: { id: boardId },
      data: { isArchived: archive },
    });

    // Create activity log
    await prisma.boardActivityLog.create({
      data: {
        boardId,
        userId: currentUser.id,
        activityType: archive ? "BOARD_ARCHIVED" : "BOARD_RESTORED",
        metadata: archive
          ? "Board archived and hidden from view"
          : "Board restored and made visible",
      },
    });

    return NextResponse.json({
      success: true,
      isArchived: updatedBoard.isArchived,
    });
  } catch (error) {
    console.error("[BOARD_ARCHIVE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
