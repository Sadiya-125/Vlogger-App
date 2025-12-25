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

    const resolvedParams = await params;
    const { boardId } = resolvedParams;
    const body = await req.json();
    const { username } = body;

    if (!username || !username.trim()) {
      return NextResponse.json(
        { error: "Username or full name is required" },
        { status: 400 }
      );
    }

    // Get or create current user
    let currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!currentUser) {
      const clerkUser = await auth();
      if (clerkUser.sessionClaims) {
        currentUser = await prisma.user.create({
          data: {
            clerkId: userId,
            email: (clerkUser.sessionClaims as any).email || "",
            username: (clerkUser.sessionClaims as any).username || userId,
            firstName: (clerkUser.sessionClaims as any).firstName || "",
            lastName: (clerkUser.sessionClaims as any).lastName || "",
            imageUrl: (clerkUser.sessionClaims as any).imageUrl || "",
          },
        });
      } else {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
    }

    // Get board and verify ownership
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: {
        user: true,
      },
    });

    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    // Verify current user is the owner
    if (board.userId !== currentUser.id) {
      return NextResponse.json(
        { error: "Only the board owner can transfer ownership" },
        { status: 403 }
      );
    }

    // Find new owner by username
    let newOwner = await prisma.user.findUnique({
      where: { username: username.trim() },
    });

    // If not found by username, try searching by full name
    if (!newOwner) {
      const nameParts = username.trim().split(/\s+/);
      if (nameParts.length >= 2) {
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(" ");

        newOwner = await prisma.user.findFirst({
          where: {
            AND: [
              { firstName: { equals: firstName, mode: "insensitive" } },
              { lastName: { equals: lastName, mode: "insensitive" } },
            ],
          },
        });
      }
    }

    if (!newOwner) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent transferring to self
    if (newOwner.id === currentUser.id) {
      return NextResponse.json(
        { error: "You cannot transfer ownership to yourself" },
        { status: 400 }
      );
    }

    // Perform transfer in a transaction
    await prisma.$transaction(async (tx) => {
      // Update board ownership
      await tx.board.update({
        where: { id: boardId },
        data: { userId: newOwner.id },
      });

      // Check if new owner is already a member
      const existingMembership = await tx.boardMember.findUnique({
        where: {
          userId_boardId: {
            userId: newOwner.id,
            boardId,
          },
        },
      });

      // If new owner was a member, remove their membership (they're now owner)
      if (existingMembership) {
        await tx.boardMember.delete({
          where: {
            userId_boardId: {
              userId: newOwner.id,
              boardId,
            },
          },
        });
      }

      // Add previous owner as Co-Admin
      const previousOwnerMembership = await tx.boardMember.findUnique({
        where: {
          userId_boardId: {
            userId: currentUser.id,
            boardId,
          },
        },
      });

      if (previousOwnerMembership) {
        // Update existing membership to CO_ADMIN
        await tx.boardMember.update({
          where: {
            userId_boardId: {
              userId: currentUser.id,
              boardId,
            },
          },
          data: { role: "CO_ADMIN" },
        });
      } else {
        // Create new CO_ADMIN membership
        await tx.boardMember.create({
          data: {
            boardId,
            userId: currentUser.id,
            role: "CO_ADMIN",
          },
        });
      }

      // Create activity log
      await tx.boardActivityLog.create({
        data: {
          boardId,
          userId: currentUser.id,
          activityType: "OWNERSHIP_TRANSFERRED",
          metadata: `Transferred ownership to ${newOwner.username || `${newOwner.firstName} ${newOwner.lastName}`}`,
        },
      });
    });

    return NextResponse.json({
      success: true,
      newOwner: newOwner.username || `${newOwner.firstName} ${newOwner.lastName}`,
    });
  } catch (error) {
    console.error("[BOARD_TRANSFER_OWNERSHIP]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
