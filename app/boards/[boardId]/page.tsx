import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/header";
import { BoardHero } from "@/components/boards/detail/board-hero";
import { BoardTabs } from "@/components/boards/detail/board-tabs";
import { PrivateBoardRedirect } from "@/components/boards/private-board-redirect";

export default async function BoardDetailPage({
  params,
}: {
  params: Promise<{ boardId: string }>;
}) {
  const { boardId } = await params;
  const { userId } = await auth();

  // Fetch board with all related data
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: {
      user: {
        select: {
          id: true,
          clerkId: true,
          username: true,
          firstName: true,
          lastName: true,
          imageUrl: true,
        },
      },
      pins: {
        include: {
          pin: {
            include: {
              images: true,
              user: {
                select: {
                  id: true,
                  username: true,
                  firstName: true,
                  lastName: true,
                  imageUrl: true,
                },
              },
              tags: { include: { tag: true } },
              _count: { select: { likes: true, comments: true } },
            },
          },
        },
        orderBy: { order: "asc" },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              clerkId: true,
              username: true,
              firstName: true,
              lastName: true,
              imageUrl: true,
            },
          },
        },
      },
      followers: {
        select: { userId: true },
      },
      likes: {
        select: { userId: true },
      },
      savedBy: {
        select: { userId: true },
      },
      activities: {
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
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      comments: {
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
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: {
          pins: true,
          followers: true,
          likes: true,
          comments: true,
          savedBy: true,
        },
      },
    },
  });

  if (!board) {
    notFound();
  }

  // Check permissions
  let currentUser: Awaited<ReturnType<typeof prisma.user.findUnique>> = null;
  let userRole: string | null = null;
  let canView = false;
  let isOwner = false;

  if (userId) {
    currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (currentUser) {
      isOwner = board.user.id === currentUser.id;

      // Check if user is a member
      const membership = board.members.find(
        (m) => m.user.id === currentUser!.id
      );
      userRole = membership?.role || null;

      // Determine if user can view
      if (board.visibility === "PUBLIC") {
        canView = true;
      } else if (board.visibility === "PRIVATE") {
        canView = isOwner;
      } else if (board.visibility === "SHARED") {
        canView = isOwner || !!membership;
      }
    } else {
      // Public boards can be viewed by anyone
      canView = board.visibility === "PUBLIC";
    }
  } else {
    // Not signed in - can only view public boards
    canView = board.visibility === "PUBLIC";
  }

  if (!canView) {
    return <PrivateBoardRedirect />;
  }

  // Check if current user follows/likes/saved this board
  const isFollowing = currentUser
    ? board.followers.some((f) => f.userId === currentUser.id)
    : false;
  const hasLiked = currentUser
    ? board.likes.some((l) => l.userId === currentUser.id)
    : false;
  const hasSaved = currentUser
    ? board.savedBy.some((s) => s.userId === currentUser.id)
    : false;

  // Increment view count (async, non-blocking)
  prisma.board
    .update({
      where: { id: boardId },
      data: { viewCount: { increment: 1 } },
    })
    .catch(console.error);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Board Hero */}
        <BoardHero
          board={board}
          isOwner={isOwner}
          userRole={userRole}
          isFollowing={isFollowing}
          hasLiked={hasLiked}
          hasSaved={hasSaved}
          currentUserId={currentUser?.id}
        />

        {/* Board Content */}
        <BoardTabs
          board={board}
          isOwner={isOwner}
          userRole={userRole}
          currentUserId={currentUser?.id}
        />
      </main>
    </div>
  );
}
