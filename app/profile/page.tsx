import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Header } from "@/components/layout/header"
import { ProfileHeader } from "@/components/profile/profile-header"
import { ProfileStats } from "@/components/profile/profile-stats"
import { ProfileTabs } from "@/components/profile/profile-tabs"

export default async function ProfilePage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
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
  })

  if (!user) {
    redirect("/sign-in")
  }

  // Fetch user's pins
  const pins = await prisma.pin.findMany({
    where: { userId: user.id },
    include: {
      images: true,
      tags: { include: { tag: true } },
      _count: { select: { likes: true, comments: true } },
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
  })

  // Fetch user's boards
  const boards = await prisma.board.findMany({
    where: { userId: user.id },
    include: {
      _count: { select: { pins: true, followers: true, likes: true } },
      pins: {
        take: 3,
        include: {
          pin: {
            include: {
              images: { take: 1 },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ProfileHeader user={user} isOwnProfile={true} />
          <ProfileStats stats={user._count} />
          <ProfileTabs pins={pins} boards={boards} />
        </div>
      </main>
    </div>
  )
}
