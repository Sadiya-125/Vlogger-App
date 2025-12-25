import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/header";
import { BoardSettingsContent } from "@/components/boards/settings/board-settings-content";

export default async function BoardSettingsPage({
  params,
}: {
  params: Promise<{ boardId: string }>;
}) {
  const { boardId } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Fetch current user
  const currentUser = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!currentUser) {
    redirect("/sign-in");
  }

  // Fetch board with full details
  const board = await prisma.board.findUnique({
    where: { id: boardId },
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
      members: {
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
          createdAt: "asc",
        },
      },
      _count: {
        select: {
          pins: true,
          followers: true,
          likes: true,
          comments: true,
        },
      },
    },
  });

  if (!board) {
    notFound();
  }

  // Check permissions - only Owner and Co-Admin can access settings
  const isOwner = board.user.id === currentUser.id;
  const membership = board.members.find((m) => m.user.id === currentUser.id);
  const isCoAdmin = membership?.role === "CO_ADMIN";

  if (!isOwner && !isCoAdmin) {
    redirect(`/boards/${boardId}`);
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <BoardSettingsContent
        board={board}
        currentUser={currentUser}
        isOwner={isOwner}
      />
    </div>
  );
}
