import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { boardId } = await params;

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!currentUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get board with all necessary counts
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: {
        _count: {
          select: {
            pins: true,
            likes: true,
            followers: true,
            savedBy: true,
            comments: true,
          },
        },
        pins: {
          include: {
            pin: {
              include: {
                _count: {
                  select: {
                    likes: true,
                    savedBy: true,
                  },
                },
              },
            },
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
        },
        activities: {
          where: {
            activityType: "PIN_ADDED",
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
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!board) {
      return new NextResponse("Board not found", { status: 404 });
    }

    // Check permissions
    const isOwner = board.userId === currentUser.id;
    const isMember = board.members.some((m) => m.userId === currentUser.id);

    if (!isOwner && !isMember) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Calculate most popular pin
    const pinsWithEngagement = board.pins
      .map((bp) => ({
        ...bp.pin,
        engagement: (bp.pin._count?.likes || 0) + (bp.pin._count?.savedBy || 0),
      }))
      .sort((a, b) => b.engagement - a.engagement);

    const mostPopularPin = pinsWithEngagement[0] || null;

    // Calculate top contributors
    const contributorMap = new Map<
      string,
      { user: any; count: number }
    >();

    board.activities.forEach((activity) => {
      if (activity.user) {
        const existing = contributorMap.get(activity.userId);
        if (existing) {
          existing.count++;
        } else {
          contributorMap.set(activity.userId, {
            user: activity.user,
            count: 1,
          });
        }
      }
    });

    const topContributors = Array.from(contributorMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate growth data (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentActivities = await prisma.boardActivityLog.groupBy({
      by: ["activityType"],
      where: {
        boardId,
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      _count: true,
    });

    const growthData = {
      pinsAdded: recentActivities.find((a) => a.activityType === "PIN_ADDED")?._count || 0,
      membersAdded: recentActivities.find((a) => a.activityType === "MEMBER_ADDED")?._count || 0,
      commentsAdded: recentActivities.find((a) => a.activityType === "COMMENT_ADDED")?._count || 0,
    };

    return NextResponse.json({
      mostPopularPin,
      topContributors,
      growthData,
      engagement: {
        views: board.viewCount || 0,
        likes: board._count.likes || 0,
        followers: board._count.followers || 0,
        saves: board._count.savedBy || 0,
        comments: board._count.comments || 0,
        pins: board._count.pins || 0,
      },
    });
  } catch (error) {
    console.error("[BOARD_ANALYTICS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
