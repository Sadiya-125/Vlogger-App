import { auth } from "@clerk/nextjs/server";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { InfiniteFeed } from "@/components/feed/infinite-feed";
import { FeaturedBoardsCarousel } from "@/components/home/featured-boards-carousel";
import { YourBoardsSection } from "@/components/home/your-boards-section";
import { Compass } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const { userId } = await auth();

  // Fetch initial pins from database for SSR
  const initialPins = await prisma.pin.findMany({
    take: 20,
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
  });

  // Fetch featured boards (popular public boards)
  const featuredBoards = await prisma.board.findMany({
    where: {
      visibility: "PUBLIC",
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
      _count: {
        select: {
          pins: true,
          followers: true,
          likes: true,
        },
      },
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
    orderBy: [{ followers: { _count: "desc" } }, { likes: { _count: "desc" } }],
    take: 10,
  });

  // Fetch user's boards if signed in
  let userBoards: any[] = [];
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (user) {
      userBoards = await prisma.board.findMany({
        where: { userId: user.id },
        include: {
          _count: {
            select: {
              pins: true,
              followers: true,
              likes: true,
            },
          },
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
        take: 8,
      });
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-border/40">
          <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-secondary/5 to-accent/5 dark:from-primary/10 dark:via-secondary/10 dark:to-accent/10" />
          <div className="container mx-auto px-4 md:px-6 py-16 md:py-24 relative">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <div className="inline-flex items-center justify-center p-2 rounded-full bg-primary/10 mb-4 shrink-0">
                <Compass className="h-10 w-10 shrink-0 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight">
                Discover Your Next
                <br />
                <span className="bg-linear-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Adventure
                </span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Explore stunning destinations, create travel boards, and plan
                unforgettable journeys with our global community of explorers.
              </p>
            </div>
          </div>
        </section>

        {/* Feed Section - Pins First */}
        <section className="py-12 md:py-16 border-b border-border/40">
          <div className="container mx-auto px-4 md:px-6">
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
                Discover Destinations
              </h2>
              <p className="text-base md:text-lg text-muted-foreground">
                Explore Breathtaking Locations, Hidden Gems, and Travel Inspiration from Around the World
              </p>
            </div>

            <InfiniteFeed initialPins={initialPins} />
          </div>
        </section>

        {/* Your Boards Section - Second */}
        <YourBoardsSection boards={userBoards} isSignedIn={!!userId} />

        {/* Featured Boards Carousel - Last */}
        <FeaturedBoardsCarousel boards={featuredBoards} />
      </main>

      <Footer />
    </div>
  );
}
