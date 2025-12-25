"use client";

import { JSX, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Heart,
  Bookmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { Crown } from "lucide-react";
import { Map } from "lucide-react";

interface Board {
  id: string;
  name: string;
  subtitle: string | null;
  description: string | null;
  category: string;
  coverImage: string | null;
  user: {
    id: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
  };
  _count: {
    pins: number;
    followers: number;
    likes: number;
  };
  pins: {
    pin: {
      images: { url: string }[];
    };
  }[];
}

interface FeaturedBoardsCarouselProps {
  boards: Board[];
}

const categoryIcons: Record<string, JSX.Element> = {
  DREAM: <Sparkles className="h-4 w-4" />,
  PLANNING: <Map className="h-4 w-4" />,
  COMPLETED: <Crown className="h-4 w-4" />,
};

const categoryColors = {
  DREAM: "from-blue-500/20 to-purple-500/20 border-blue-500/30",
  PLANNING: "from-orange-500/20 to-yellow-500/20 border-orange-500/30",
  COMPLETED: "from-green-500/20 to-emerald-500/20 border-green-500/30",
};

export function FeaturedBoardsCarousel({
  boards,
}: FeaturedBoardsCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (boards.length === 0) return null;

  return (
    <section className="relative py-12 md:py-16 overflow-hidden border-b border-border/40">
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-secondary/5 to-transparent" />

      <div className="container mx-auto px-4 md:px-6 relative">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Travel Worlds Created by Explorers
          </h2>
          <p className="text-base md:text-lg text-muted-foreground">
            Explore Beautifully Curated Travel Boards - Dreams, Plans, and
            Completed Journeys from Real Adventurers.
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative group">
          {/* Navigation Buttons */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-card/95 backdrop-blur-sm shadow-xl opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex"
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-card/95 backdrop-blur-sm shadow-xl opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex"
            onClick={() => scroll("right")}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          {/* Scrollable Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
            style={{
              maskImage:
                "linear-gradient(to right, transparent, black 20px, black calc(100% - 20px), transparent)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent, black 20px, black calc(100% - 20px), transparent)",
            }}
          >
            {boards.map((board) => {
              const coverImageUrl =
                board.coverImage || board.pins[0]?.pin.images[0]?.url;
              const displayName = board.user.firstName || board.user.username;

              return (
                <Link
                  key={board.id}
                  href={`/boards/${board.id}`}
                  className="flex-none w-80 sm:w-96 snap-start group/card py-10 first:ml-12"
                >
                  <div className="relative bg-card rounded-2xl border border-border/40 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                    {/* Cover Image with Gradient Overlay */}
                    <div className="relative h-56 overflow-hidden">
                      {coverImageUrl ? (
                        <Image
                          src={coverImageUrl}
                          alt={board.name}
                          fill
                          className="object-cover group-hover/card:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full bg-linear-to-br from-primary/20 via-secondary/20 to-accent/20 flex items-center justify-center">
                          <MapPin className="h-16 w-16 text-muted-foreground/30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />

                      {/* Category Badge */}
                      <div
                        className="
                          absolute top-4 right-4 
                          px-3.5 py-1.5
                          rounded-full
                          shadow-[0_8px_30px_rgb(0,0,0,0.25)]
                          bg-white/10
                          backdrop-blur-[6px]
                          border border-white/20
                          text-black
                          flex items-center gap-2
                          transition-all
                          duration-300
                          hover:bg-white/20 hover:scale-[1.04]
                        "
                      >
                        <span className="text-sm font-semibold flex items-center gap-2">
                          {categoryIcons[board.category]}
                          {board.category.charAt(0) +
                            board.category.slice(1).toLowerCase()}
                        </span>
                      </div>

                      {/* Board Title & Subtitle */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">
                          {board.name}
                        </h3>
                        {board.subtitle && (
                          <p className="text-sm text-white/90 line-clamp-1 italic">
                            {board.subtitle}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Board Info */}
                    <div className="p-5 space-y-4">
                      {/* Description */}
                      {board.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {board.description}
                        </p>
                      )}

                      {/* Creator Info */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {board.user.imageUrl ? (
                            <Image
                              src={board.user.imageUrl}
                              alt={displayName}
                              width={32}
                              height={32}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center">
                              <span className="text-xs font-bold text-white">
                                {displayName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div className="text-sm">
                            <p className="font-medium">{displayName}</p>
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t border-border/40">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4" />
                          <span>{board._count.pins} Pins</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Bookmark className="h-4 w-4" />
                          <span>{board._count.followers} Followers</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Heart className="h-4 w-4" />
                          <span>{board._count.likes}</span>
                        </div>
                      </div>
                    </div>

                    {/* Hover Glow Effect */}
                    <div
                      className="absolute inset-0 rounded-2xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{
                        boxShadow: "inset 0 0 20px rgba(var(--primary), 0.2)",
                      }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
