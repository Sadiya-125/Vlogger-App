"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Sparkles, MapPin, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EnhancedCreateBoardModal } from "@/components/boards/enhanced-create-board-modal";
import { cn } from "@/lib/utils";

interface Board {
  id: string;
  name: string;
  description: string | null;
  category: string;
  visibility: string;
  coverImage: string | null;
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

interface YourBoardsSectionProps {
  boards: Board[];
  isSignedIn: boolean;
}

const categoryColors = {
  DREAM: "from-blue-500/10 to-purple-500/10 border-blue-500/20",
  PLANNING: "from-orange-500/10 to-yellow-500/10 border-orange-500/20",
  COMPLETED: "from-green-500/10 to-emerald-500/10 border-green-500/20",
};

export function YourBoardsSection({
  boards,
  isSignedIn,
}: YourBoardsSectionProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  if (!isSignedIn) {
    // Show teaser for signed-out users
    return (
      <section className="py-12 md:py-16 border-b border-border/40">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-linear-to-br from-primary/10 via-secondary/10 to-accent/10 p-8 md:p-12 text-center">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl" />

              <div className="relative">
                <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/20 mb-6">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>

                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                  Create Stunning Travel Boards
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                  Plan your dream trips, collect inspiration, and turn your
                  wanderlust into reality. Join our community of explorers.
                </p>

                <Link href="/sign-in">
                  <Button size="lg" className="rounded-full px-8">
                    <Sparkles className="h-5 w-5 mr-2" />
                    Sign In to Start
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Show user's boards for signed-in users
  return (
    <>
      <section className="py-12 md:py-16 border-b border-border/40">
        <div className="container mx-auto px-4 md:px-6">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
              Your Travel Boards
            </h2>
            <p className="text-base md:text-lg text-muted-foreground">
              Plan Your Dreams, Remember Your Adventures - Your Personal Journey
              Collection
            </p>
          </div>

          {boards.length > 0 ? (
            // Show user's boards
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {boards.slice(0, 4).map((board) => {
                const coverImage =
                  board.coverImage || board.pins[0]?.pin.images[0]?.url;

                return (
                  <Link
                    key={board.id}
                    href={`/boards/${board.id}`}
                    className="group block"
                  >
                    <div className="relative bg-card rounded-xl border border-border/40 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      {/* Cover Image */}
                      <div className="relative h-44 overflow-hidden">
                        {coverImage ? (
                          <Image
                            src={coverImage}
                            alt={board.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div
                            className={cn(
                              "w-full h-full bg-linear-to-br border-b",
                              categoryColors[
                                board.category as keyof typeof categoryColors
                              ] ||
                                "from-primary/10 to-secondary/10 border-primary/20"
                            )}
                          >
                            <div className="w-full h-full flex items-center justify-center">
                              <MapPin className="h-12 w-12 text-muted-foreground/30" />
                            </div>
                          </div>
                        )}

                        {/* Privacy Badge */}
                        {board.visibility === "PRIVATE" && (
                          <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm rounded-full p-2">
                            <Lock className="h-3.5 w-3.5 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Board Info */}
                      <div className="p-4">
                        <h3 className="font-semibold text-base line-clamp-1 mb-1">
                          {board.name}
                        </h3>
                        {board.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1 mb-3">
                            {board.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            <span>{board._count.pins}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                            {board.category.charAt(0) +
                              board.category.slice(1).toLowerCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}

              {/* Create New Board Card */}
              <button
                onClick={() => setShowCreateModal(true)}
                className="relative bg-card rounded-xl border-2 border-dashed border-border/60 overflow-hidden hover:border-primary/50 hover:bg-accent/5 transition-all duration-300 hover:-translate-y-1 min-h-65 flex items-center justify-center group"
              >
                <div className="text-center p-6">
                  <div className="inline-flex items-center justify-center p-4 rounded-full bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors">
                    <Plus className="h-8 w-8 text-primary" />
                  </div>
                  <p className="font-semibold text-base mb-1">
                    Create New Board
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Start Planning Your Next Adventure
                  </p>
                </div>
              </button>
            </div>
          ) : (
            // Empty state
            <div className="max-w-2xl mx-auto">
              <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-linear-to-br from-primary/5 via-secondary/5 to-transparent p-12 text-center">
                <div className="inline-flex items-center justify-center p-4 rounded-full bg-primary/10 mb-6">
                  <Sparkles className="h-10 w-10 text-primary" />
                </div>

                <h3 className="text-2xl font-bold tracking-tight mb-3">
                  Start Your First Travel Board ✨
                </h3>
                <p className="text-base text-muted-foreground max-w-md mx-auto mb-6">
                  Collect Places You Love, Plan Trips, and Turn Dreams Into
                  Journeys. Organize Your Wanderlust Beautifully.
                </p>

                <Button
                  onClick={() => setShowCreateModal(true)}
                  size="lg"
                  className="rounded-full"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your First Board
                </Button>
              </div>
            </div>
          )}

          {/* View All Link */}
          {boards.length > 4 && (
            <div className="text-center mt-8">
              <Link href="/boards">
                <Button variant="outline" size="lg" className="rounded-full">
                  View All Your Boards ({boards.length})
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Create Button */}
          <div className="sm:hidden mt-6">
            <Button
              onClick={() => setShowCreateModal(true)}
              className="w-full gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Board
            </Button>
          </div>
        </div>
      </section>

      <EnhancedCreateBoardModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      />
    </>
  );
}
