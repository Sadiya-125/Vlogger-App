import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { InfiniteFeed } from "@/components/feed/infinite-feed";
import { Compass } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function Home() {
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

        {/* Feed Section */}
        <section className="container mx-auto px-4 md:px-6 py-8 md:py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                Discover Destinations
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Personalized feed with infinite scroll and smart filters
              </p>
            </div>
          </div>

          <InfiniteFeed initialPins={initialPins} />
        </section>
      </main>

      <Footer />
    </div>
  );
}
