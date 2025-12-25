import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { prisma } from "@/lib/prisma";
import { MasonryGrid } from "@/components/feed/masonry-grid";

export default async function SavedPinsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    redirect("/sign-in");
  }

  // Fetch saved pins
  const savedPins = await prisma.savedPin.findMany({
    where: { userId: user.id },
    include: {
      pin: {
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
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const pins = savedPins.map((sp) => sp.pin);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 md:px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
              Saved Pins
            </h1>
            <p className="text-muted-foreground">
              {pins.length} {pins.length === 1 ? "pin" : "pins"} saved
            </p>
          </div>

          {pins.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-lg text-muted-foreground mb-2">
                No saved pins yet
              </p>
              <p className="text-sm text-muted-foreground">
                Start exploring and save pins you love!
              </p>
            </div>
          ) : (
            <MasonryGrid pins={pins} />
          )}
        </div>
      </main>
    </div>
  );
}
