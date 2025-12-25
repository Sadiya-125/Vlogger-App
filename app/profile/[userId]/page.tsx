import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { prisma } from "@/lib/prisma";
import { UserProfileClient } from "@/components/profile/user-profile-client";

interface UserProfilePageProps {
  params: Promise<{ userId: string }>;
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const { userId: profileUserId } = await params;
  const { userId: currentUserId } = await auth();

  // Fetch the profile user
  const profileUser = await prisma.user.findUnique({
    where: { clerkId: profileUserId },
    include: {
      _count: {
        select: {
          boards: true,
          pins: true,
          followers: true,
          following: true,
        },
      },
    },
  });

  if (!profileUser) {
    notFound();
  }

  // Fetch user's pins
  const userPins = await prisma.pin.findMany({
    where: { userId: profileUser.id },
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
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
  });

  // Fetch user's boards
  const userBoards = await prisma.board.findMany({
    where: {
      userId: profileUser.id,
      OR: currentUserId
        ? [
            { visibility: "PUBLIC" },
            { userId: profileUser.id },
            {
              members: {
                some: {
                  user: {
                    clerkId: currentUserId,
                  },
                },
              },
            },
          ]
        : [{ visibility: "PUBLIC" }],
    },
    include: {
      pins: {
        include: {
          pin: {
            include: {
              images: {
                take: 1,
              },
            },
          },
        },
        take: 3,
      },
      _count: {
        select: {
          pins: true,
          followers: true,
          likes: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 20,
  });

  // Check if current user follows this profile
  let isFollowing = false;
  let currentUser = null;

  if (currentUserId) {
    currentUser = await prisma.user.findUnique({
      where: { clerkId: currentUserId },
    });

    if (currentUser && currentUser.id !== profileUser.id) {
      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUser.id,
            followingId: profileUser.id,
          },
        },
      });
      isFollowing = !!follow;
    }
  }

  const isOwnProfile = currentUser?.id === profileUser.id;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 md:px-6 py-8">
        <UserProfileClient
          profileUser={profileUser}
          pins={userPins}
          boards={userBoards}
          isOwnProfile={isOwnProfile}
          initialIsFollowing={isFollowing}
        />
      </main>
    </div>
  );
}
