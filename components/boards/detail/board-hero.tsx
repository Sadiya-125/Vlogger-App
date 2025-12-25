"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  Bookmark,
  Share2,
  UserPlus,
  Settings,
  Eye,
  MapPin,
  Users,
  Sparkles,
  Lock,
  Globe,
  Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { MembersModal } from "./members-modal";

interface BoardHeroProps {
  board: any;
  isOwner: boolean;
  userRole: string | null;
  isFollowing: boolean;
  hasLiked: boolean;
  hasSaved: boolean;
  currentUserId?: string;
}

const categoryConfig = {
  DREAM: {
    emoji: "🌠",
    label: "Dream",
    gradient: "from-blue-500/20 to-purple-500/20",
    border: "border-blue-500/30",
    text: "text-blue-600 dark:text-blue-400",
  },
  PLANNING: {
    emoji: "🗺️",
    label: "Planning",
    gradient: "from-orange-500/20 to-yellow-500/20",
    border: "border-orange-500/30",
    text: "text-orange-600 dark:text-orange-400",
  },
  COMPLETED: {
    emoji: "🎉",
    label: "Completed",
    gradient: "from-green-500/20 to-emerald-500/20",
    border: "border-green-500/30",
    text: "text-green-600 dark:text-green-400",
  },
};

const themeColors = {
  TRAVEL_BLUE: "bg-blue-500",
  EXPLORER_TEAL: "bg-teal-500",
  CORAL_ADVENTURE: "bg-coral-500",
  GOLD_LUXURY: "bg-yellow-500",
  MINIMAL_SLATE: "bg-slate-500",
};

const visibilityConfig = {
  PRIVATE: { icon: Lock, label: "Private", color: "text-muted-foreground" },
  PUBLIC: { icon: Globe, label: "Public", color: "text-primary" },
  SHARED: { icon: Link2, label: "Shared", color: "text-secondary" },
};

export function BoardHero({
  board,
  isOwner,
  userRole,
  isFollowing: initialIsFollowing,
  hasLiked: initialHasLiked,
  hasSaved: initialHasSaved,
  currentUserId,
}: BoardHeroProps) {
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [hasLiked, setHasLiked] = useState(initialHasLiked);
  const [hasSaved, setHasSaved] = useState(initialHasSaved);
  const [likesCount, setLikesCount] = useState(board._count.likes);
  const [followersCount, setFollowersCount] = useState(board._count.followers);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [savesCount, setSavesCount] = useState(board._count.savedBy);

  const category =
    categoryConfig[board.category as keyof typeof categoryConfig];
  const VisibilityIcon =
    visibilityConfig[board.visibility as keyof typeof visibilityConfig].icon;

  // Get cover images
  const getCoverImages = () => {
    if (board.coverImage) {
      return [board.coverImage];
    }
    if (board.autoGenCover && board.pins.length > 0) {
      return board.pins
        .slice(0, 3)
        .map((p: any) => p.pin.images[0]?.url)
        .filter(Boolean);
    }
    return [];
  };

  const coverImages = getCoverImages();

  const handleFollow = async () => {
    if (!currentUserId) {
      toast.error("Please sign in to follow boards");
      return;
    }

    try {
      const response = await fetch(`/api/boards/${board.id}/follow`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setIsFollowing(data.following);
        setFollowersCount((prev: number) =>
          data.following ? prev + 1 : prev - 1
        );
        toast.success(data.following ? "Following board" : "Unfollowed board");
      }
    } catch (error) {
      toast.error("Failed to update follow status");
    }
  };

  const handleLike = async () => {
    if (!currentUserId) {
      toast.error("Please sign in to like boards");
      return;
    }

    try {
      const response = await fetch(`/api/boards/${board.id}/like`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setHasLiked(data.liked);
        setLikesCount((prev: number) => (data.liked ? prev + 1 : prev - 1));
      }
    } catch (error) {
      toast.error("Failed to update like status");
    }
  };

  const handleSave = async () => {
    if (!currentUserId) {
      toast.error("Please sign in to save boards");
      return;
    }

    try {
      const response = await fetch(`/api/boards/${board.id}/save`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setHasSaved(data.saved);
        setSavesCount((prev: number) => (data.saved ? prev + 1 : prev - 1));
        toast.success(data.saved ? "Board saved!" : "Board unsaved");
      }
    } catch (error) {
      toast.error("Failed to update save status");
    }
  };

  const handleShare = async () => {
    const boardUrl = `${window.location.origin}/boards/${board.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: board.name,
          text:
            board.description || `Check out this travel board: ${board.name}`,
          url: boardUrl,
        });
        toast.success("Board shared successfully!");
      } catch (error) {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText(boardUrl);
      toast.success("Board link copied to clipboard!");
    }
  };

  const displayName = board.user.firstName || board.user.username;

  return (
    <section className="relative">
      {/* Cover Section */}
      <div className="relative h-96 md:h-125 overflow-hidden bg-linear-to-br from-primary/10 via-secondary/10 to-accent/10">
        {coverImages.length > 0 ? (
          board.autoGenCover && coverImages.length === 3 ? (
            // Triptych Mosaic
            <div className="grid grid-cols-2 gap-2 h-full p-2">
              <div className="relative row-span-2">
                <Image
                  src={coverImages[0]}
                  alt="Cover 1"
                  fill
                  className="object-cover rounded-lg"
                  priority
                />
              </div>
              <div className="relative">
                <Image
                  src={coverImages[1]}
                  alt="Cover 2"
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
              <div className="relative">
                <Image
                  src={coverImages[2]}
                  alt="Cover 3"
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            </div>
          ) : (
            // Single Cover
            <Image
              src={coverImages[0]}
              alt={board.name}
              fill
              className="object-cover"
              priority
            />
          )
        ) : (
          // Fallback gradient with icon
          <div className="w-full h-full flex items-center justify-center">
            <MapPin className="h-32 w-32 text-muted-foreground/20" />
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />

        {/* Theme Color Accent Strip */}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 h-1",
            themeColors[board.themeColor as keyof typeof themeColors] ||
              themeColors.TRAVEL_BLUE
          )}
        />

        {/* Board Identity - Overlay on Cover */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="container mx-auto max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              {/* Left: Title & Meta */}
              <div className="flex-1">
                {/* Category & Visibility Badges */}
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <Badge
                    className={cn(
                      "px-3 py-1.5 text-sm font-semibold border bg-black/60 backdrop-blur-sm border-white/30 text-white shadow-lg"
                    )}
                  >
                    <span className="mr-1.5">{category.emoji}</span>
                    {category.label}
                  </Badge>

                  {board.tripCategory && (
                    <Badge
                      className={cn(
                        "px-3 py-1.5 text-sm font-semibold border bg-black/60 backdrop-blur-sm border-white/30 text-white shadow-lg"
                      )}
                    >
                      {board.tripCategory.charAt(0) +
                        board.tripCategory.slice(1).toLowerCase()}
                    </Badge>
                  )}

                  <Badge
                    className={cn(
                      "px-3 py-1.5 text-sm font-semibold border bg-black/60 backdrop-blur-sm border-white/30 text-white shadow-lg"
                    )}
                  >
                    <VisibilityIcon className="h-3.5 w-3.5 mr-1.5 text-white/90" />
                    {
                      visibilityConfig[
                        board.visibility as keyof typeof visibilityConfig
                      ].label
                    }
                  </Badge>
                </div>

                {/* Board Title */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 leading-tight">
                  {board.name}
                </h1>

                {/* Subtitle */}
                {board.subtitle && (
                  <p className="text-xl md:text-2xl text-white/90 italic mb-4">
                    {board.subtitle}
                  </p>
                )}

                {/* Hashtags */}
                {board.hashtags && board.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {board.hashtags
                      .slice(0, 5)
                      .map((tag: string, index: number) => (
                        <span
                          key={index}
                          className="text-sm text-white/70 hover:text-white transition-colors cursor-pointer"
                        >
                          #{tag}
                        </span>
                      ))}
                  </div>
                )}

                {/* Stats Row */}
                <div className="flex items-center gap-3 text-sm text-white flex-wrap">
                  <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <MapPin className="h-4 w-4" />
                    <span className="font-medium">
                      {board._count.pins} Pins
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <Users className="h-4 w-4" />
                    <span className="font-medium">
                      {followersCount} Followers
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <Heart className="h-4 w-4" />
                    <span className="font-medium">{likesCount} Likes</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <Eye className="h-4 w-4" />
                    <span className="font-medium">{board.viewCount} Views</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <Bookmark className="h-4 w-4" />
                    <span className="font-medium">{savesCount} Saves</span>
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex flex-col sm:flex-row gap-3 text-white">
                {!isOwner && currentUserId && (
                  <Button
                    onClick={handleFollow}
                    variant={isFollowing ? "secondary" : "default"}
                    size="default"
                    className="rounded-full"
                  >
                    <UserPlus className="h-5 w-5 mr-2" />
                    {isFollowing ? "Following" : "Follow"}
                  </Button>
                )}

                <Button
                  onClick={handleLike}
                  variant={hasLiked ? "default" : "outline"}
                  size="default"
                  className="rounded-full bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20"
                >
                  <Heart
                    className={cn("h-5 w-5 mr-2", hasLiked && "fill-current")}
                  />
                  Like
                </Button>

                <Button
                  onClick={handleSave}
                  variant={hasSaved ? "default" : "outline"}
                  size="default"
                  className="rounded-full bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20"
                >
                  <Bookmark
                    className={cn("h-5 w-5 mr-2", hasSaved && "fill-current")}
                  />
                  Save
                </Button>

                <Button
                  onClick={handleShare}
                  variant="outline"
                  size="default"
                  className="rounded-full bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20"
                >
                  <Share2 className="h-5 w-5 mr-2" />
                  Share
                </Button>

                {(isOwner ||
                  userRole === "OWNER" ||
                  userRole === "CO_ADMIN") && (
                  <Button
                    variant="outline"
                    size="default"
                    className="rounded-full bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20"
                    onClick={() => setShowMembersModal(true)}
                  >
                    <Users className="h-5 w-5 mr-2" />
                    Members
                  </Button>
                )}

                {isOwner && (
                  <Button
                    variant="outline"
                    size="default"
                    className="rounded-full bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20"
                    onClick={() => router.push(`/boards/${board.id}/settings`)}
                  >
                    <Settings className="h-5 w-5 mr-2" />
                    Settings
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Author & Collaboration Row */}
      <div className="border-b border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Creator */}
              <Link
                href={`/profile/${board.user.clerkId}`}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                {board.user.imageUrl ? (
                  <Image
                    src={board.user.imageUrl}
                    alt={displayName}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium">
                    Created by {displayName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(board.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </Link>

              {/* Collaborators Stack */}
              {board.members && board.members.length > 0 && (
                <div className="flex items-center gap-2 ml-4">
                  <div className="flex -space-x-2">
                    {board.members.slice(0, 5).map((member: any) => (
                      <div
                        key={member.id}
                        className="relative h-10 w-10 rounded-full ring-2 ring-background overflow-hidden"
                        title={member.user.firstName || member.user.username}
                      >
                        {member.user.imageUrl ? (
                          <Image
                            src={member.user.imageUrl}
                            alt={member.user.username}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-linear-to-br from-primary to-secondary flex items-center justify-center">
                            <span className="text-xs font-bold text-white">
                              {member.user.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    +{board.members.length} Collaborators
                  </span>
                </div>
              )}
            </div>

            {/* Emotion Indicator (Magic Feature) */}
            {board.hashtags && board.hashtags.length > 0 && (
              <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-primary/10 to-secondary/10 border border-primary/20">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">
                  {board.category === "DREAM" && "✨ Soulful Escape"}
                  {board.category === "PLANNING" && "🔥 Adventure Driven"}
                  {board.category === "COMPLETED" && "🎭 Memories Captured"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Members Modal */}
      <MembersModal
        open={showMembersModal}
        onOpenChange={setShowMembersModal}
        boardId={board.id}
        boardName={board.name}
        isOwner={isOwner}
        canManage={isOwner || userRole === "OWNER" || userRole === "CO_ADMIN"}
      />
    </section>
  );
}
