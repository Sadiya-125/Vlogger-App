import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Header } from "@/components/layout/header"
import { BoardsManager } from "@/components/boards/boards-manager"

export default async function BoardsPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  })

  if (!user) {
    redirect("/sign-in")
  }

  const boards = await prisma.board.findMany({
    where: { userId: user.id },
    include: {
      _count: { select: { pins: true, followers: true } },
      pins: {
        take: 4,
        include: { images: { take: 1 } },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <BoardsManager boards={boards} />
        </div>
      </main>
    </div>
  )
}
