"use client";

import Image from "next/image";
import Link from "next/link";
import { Lock, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface Board {
  id: string;
  name: string;
  description: string | null;
  category: string;
  visibility: string;
  coverImage: string | null;
  themeColor?: string;
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
  user?: {
    id: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
  };
}

interface BoardsGridProps {
  boards: Board[];
}

const categoryColors: Record<string, string> = {
  DREAM: "bg-secondary/20 text-secondary-foreground border-secondary/30",
  PLANNING: "bg-warning/20 text-warning border-warning/30",
  COMPLETED: "bg-success/20 text-success border-success/30",
};

const themeColors: Record<string, string> = {
  TRAVEL_BLUE: "bg-blue-500",
  EXPLORER_TEAL: "bg-teal-500",
  CORAL_ADVENTURE: "bg-coral-500",
  GOLD_LUXURY: "bg-yellow-500",
  MINIMAL_SLATE: "bg-slate-500",
};

export function BoardsGrid({ boards }: BoardsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {boards.map((board) => {
        const previewImages = (board.pins || [])
          .slice(0, 3)
          .map((pinRelation) => pinRelation.pin.images[0]?.url)
          .filter(Boolean);

        return (
          <Link
            key={board.id}
            href={`/boards/${board.id}`}
            className="group block"
          >
            <div className="bg-card rounded-lg border border-border/40 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
              {/* Cover/Preview Images */}
              <div className="relative h-48 bg-linear-to-br from-muted to-muted/50">
                {board.coverImage ? (
                  // Priority 1: Uploaded cover image
                  <Image
                    src={board.coverImage}
                    alt={board.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : board.themeColor ? (
                  // Priority 2: Theme color
                  <div
                    className={cn(
                      "flex items-center justify-center h-full",
                      themeColors[board.themeColor] || themeColors.TRAVEL_BLUE
                    )}
                  >
                    <MapPin className="h-12 w-12 text-white/30" />
                  </div>
                ) : previewImages.length > 0 ? (
                  // Priority 3: Collage of 3 pins
                  <div className="grid grid-cols-2 gap-1 h-full p-2">
                    <div
                      className={cn(
                        "relative rounded-sm overflow-hidden",
                        previewImages.length === 3 && "row-span-2"
                      )}
                    >
                      <Image
                        src={previewImages[0]}
                        alt="Preview 1"
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    {previewImages.length >= 2 && (
                      <div className="relative rounded-sm overflow-hidden">
                        <Image
                          src={previewImages[1]}
                          alt="Preview 2"
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    )}
                    {previewImages.length >= 3 && (
                      <div className="relative rounded-sm overflow-hidden">
                        <Image
                          src={previewImages[2]}
                          alt="Preview 3"
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  // Fallback: Placeholder icon
                  <div className="flex items-center justify-center h-full">
                    <MapPin className="h-12 w-12 text-muted-foreground/30" />
                  </div>
                )}

                {/* Private Badge */}
                {board.visibility === "PRIVATE" && (
                  <div className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm rounded-full p-2 shadow-md">
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Board Info */}
              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-base line-clamp-1 flex-1">
                    {board.name}
                  </h3>
                  <span
                    className={cn(
                      "px-2 py-0.5 text-[10px] font-medium rounded-full border",
                      categoryColors[board.category] ||
                        "bg-muted text-muted-foreground border-muted-foreground/30"
                    )}
                  >
                    {board.category}
                  </span>
                </div>

                {board.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {board.description}
                  </p>
                )}

                <div className="flex items-center text-xs text-muted-foreground pt-1">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  <span>
                    {board._count.pins}{" "}
                    {board._count.pins === 1 ? "pin" : "pins"}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
