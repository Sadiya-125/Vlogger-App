"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  MapPin,
  Bookmark,
  MoreHorizontal,
  Share2,
  Download,
  Flag,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface Pin {
  id: string;
  title: string;
  location: string;
  images: { id: string; url: string }[];
  user: {
    id: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
  };
  tags: { tag: { name: string } }[];
  _count: {
    likes: number;
    comments: number;
  };
}

interface MasonryGridProps {
  pins: Pin[];
}

function PinCard({ pin }: { pin: Pin }) {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likes, setLikes] = useState(pin._count.likes);

  const mainImage = pin.images[0]?.url || "/placeholder.jpg";
  const displayName =
    pin.user.firstName && pin.user.lastName
      ? `${pin.user.firstName} ${pin.user.lastName}`
      : pin.user.username;

  const getTagColor = (tag: string) => {
    const colors: Record<string, string> = {
      adventure:
        "bg-secondary/20 text-secondary-foreground border-secondary/30",
      food: "bg-accent/20 text-accent-foreground border-accent/30",
      luxury: "bg-warning/20 text-warning border-warning/30",
      budget: "bg-success/20 text-success border-success/30",
      nature: "bg-success/20 text-success border-success/30",
      city: "bg-primary/20 text-primary border-primary/30",
      culture: "bg-muted text-muted-foreground border-muted-foreground/30",
      beach: "bg-secondary/20 text-secondary-foreground border-secondary/30",
      trek: "bg-secondary/20 text-secondary-foreground border-secondary/30",
      mountain: "bg-secondary/20 text-secondary-foreground border-secondary/30",
      historical: "bg-primary/20 text-primary border-primary/30",
    };
    return (
      colors[tag.toLowerCase()] ||
      "bg-muted text-muted-foreground border-muted-foreground/30"
    );
  };

  useEffect(() => {
    fetchLikeStatus();
    fetchSaveStatus();
  }, []);

  const fetchLikeStatus = async () => {
    try {
      const response = await fetch(`/api/pins/${pin.id}/like`);
      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.liked);
      }
    } catch (error) {
      console.error("Failed to Fetch Like Status:", error);
    }
  };

  const fetchSaveStatus = async () => {
    try {
      const response = await fetch(`/api/pins/${pin.id}/save`);
      if (response.ok) {
        const data = await response.json();
        setIsSaved(data.saved);
      }
    } catch (error) {
      console.error("Failed to Fetch Save Status:", error);
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const response = await fetch(`/api/pins/${pin.id}/like`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.liked);
        setLikes((prev) => (data.liked ? prev + 1 : prev - 1));
      }
    } catch (error) {
      console.error("Failed to Like Pin:", error);
    }
  };

  return (
    <Link
      href={`/pins/${pin.id}`}
      className="group relative break-inside-avoid mb-4 block"
      style={{ height: "500px" }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-lg bg-card shadow-md transition-shadow duration-300 hover:shadow-xl">
        <Image
          src={mainImage}
          alt={pin.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />

        {/* Gradient Overlay - Always visible at bottom */}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />

        {/* Hover Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Actions - Top Right */}
        <div className="absolute top-3 right-3 flex space-x-2 transition-all duration-300">
          <button
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              try {
                const response = await fetch(`/api/pins/${pin.id}/save`, {
                  method: "POST",
                });

                if (response.ok) {
                  const data = await response.json();
                  setIsSaved(data.saved);
                  toast.success(data.saved ? "Pin Saved!" : "Pin Unsaved");
                } else if (response.status === 401) {
                  toast.error("Please Sign In to Save Pins");
                }
              } catch (error) {
                console.error("Failed to Save Pin:", error);
                toast.error("Failed to Save Pin");
              }
            }}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-colors duration-200",
              isSaved
                ? "bg-primary text-primary-foreground"
                : "bg-white/90 text-gray-900 hover:bg-white"
            )}
          >
            <Bookmark className={cn("h-4 w-4", isSaved && "fill-current")} />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-900 backdrop-blur-md hover:bg-white transition-all duration-200"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigator.clipboard.writeText(
                    `${window.location.origin}/pins/${pin.id}`
                  );
                  toast.success("Link copied to clipboard!");
                }}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share Pin
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.open(`/pins/${pin.id}`, "_blank");
                }}
              >
                <Eye className="h-4 w-4 mr-2" />
                Open in New Tab
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  try {
                    const imageUrl = pin.images[0]?.url;
                    if (!imageUrl) {
                      toast.error("No image available");
                      return;
                    }

                    const response = await fetch(imageUrl);
                    const blob = await response.blob();
                    const blobUrl = URL.createObjectURL(blob);

                    const link = document.createElement("a");
                    link.href = blobUrl;
                    link.download = `${pin.title.replace(
                      /[^a-z0-9]/gi,
                      "-"
                    )}.jpg`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(blobUrl);

                    toast.success("Download Started!");
                  } catch (error) {
                    console.error("Download Failed:", error);
                    toast.error("Failed to Download Image");
                  }
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Image
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  try {
                    const response = await fetch(`/api/pins/${pin.id}/report`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ reason: "Inappropriate content" }),
                    });

                    if (response.ok) {
                      const data = await response.json();
                      toast.success(
                        data.message || "Pin Reported Successfully"
                      );
                    } else if (response.status === 401) {
                      toast.error("Please Sign In to Report Pins");
                    } else {
                      toast.error("Failed to Report Pin");
                    }
                  } catch (error) {
                    console.error("Failed to Report Pin:", error);
                    toast.error("Failed to Report Pin");
                  }
                }}
                className="text-destructive focus:text-destructive"
              >
                <Flag className="h-4 w-4 mr-2" />
                Report Pin
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 transition-all duration-300">
          <div className="space-y-2">
            <h3
              className="text-lg font-semibold text-white line-clamp-2 drop-shadow-lg"
              style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}
            >
              {pin.title}
            </h3>
            <div
              className="flex items-center space-x-1.5 text-white/90 drop-shadow-md"
              style={{ textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}
            >
              <MapPin className="h-4 w-4 drop-shadow-lg shrink-0" />
              <span className="text-sm font-medium">{pin.location}</span>
            </div>
            {pin.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {pin.tags.slice(0, 3).map((tagObj) => (
                  <span
                    key={tagObj.tag.name}
                    className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-medium border backdrop-blur-md",
                      getTagColor(tagObj.tag.name)
                    )}
                  >
                    #{tagObj.tag.name}
                  </span>
                ))}
                {pin.tags.length > 3 && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-medium border backdrop-blur-md bg-muted text-muted-foreground border-muted-foreground/30">
                    +{pin.tags.length - 3}
                  </span>
                )}
              </div>
            )}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-2">
                {pin.user.imageUrl ? (
                  <Image
                    src={pin.user.imageUrl}
                    alt={displayName}
                    width={28}
                    height={28}
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-7 w-7 rounded-full bg-linear-to-br from-primary to-secondary" />
                )}
                <span className="text-sm font-medium text-white">
                  {displayName}
                </span>
              </div>
              <button
                onClick={handleLike}
                className="flex items-center space-x-1.5 group/like"
              >
                <Heart
                  className={cn(
                    "h-4 w-4 transition-all duration-200",
                    isLiked
                      ? "fill-red-500 text-red-500 scale-110"
                      : "text-white group-hover/like:scale-110"
                  )}
                />
                <span className="text-sm font-medium text-white">{likes}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function MasonryGrid({ pins }: MasonryGridProps) {
  if (pins.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">
          No Pins Yet. Be the First to Share Your Adventure!
        </p>
      </div>
    );
  }

  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
      {pins.map((pin) => (
        <PinCard key={pin.id} pin={pin} />
      ))}
    </div>
  );
}
