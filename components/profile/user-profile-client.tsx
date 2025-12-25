"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  UserPlus,
  UserMinus,
  Share2,
  MapPin,
  Calendar,
  Sparkles,
  Grid3X3,
  LayoutGrid,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MasonryGrid } from "@/components/feed/masonry-grid";
import { EditProfileModal } from "@/components/profile/edit-profile-modal";
import { BoardsGrid } from "@/components/profile/boards-grid";

interface ProfileUser {
  id: string;
  clerkId: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  imageUrl: string | null;
  bio: string | null;
  location: string | null;
  interests: string[];
  createdAt: Date;
  _count: {
    boards: number;
    pins: number;
    followers: number;
    following: number;
  };
}

interface UserProfileClientProps {
  profileUser: ProfileUser;
  pins: any[];
  boards: any[];
  isOwnProfile: boolean;
  initialIsFollowing: boolean;
}

export function UserProfileClient({
  profileUser,
  pins,
  boards,
  isOwnProfile,
  initialIsFollowing,
}: UserProfileClientProps) {
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [followersCount, setFollowersCount] = useState(
    profileUser._count.followers
  );

  const handleFollow = async () => {
    setIsFollowLoading(true);
    try {
      const response = await fetch(`/api/users/${profileUser.clerkId}/follow`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setIsFollowing(data.following);
        setFollowersCount((prev) => (data.following ? prev + 1 : prev - 1));
        toast.success(data.following ? "Following User" : "Unfollowed User");
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to Follow/Unfollow:", error);
      toast.error("Failed to Update Follow Status");
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleShare = async () => {
    const profileUrl = `${window.location.origin}/profile/${profileUser.clerkId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profileUser.firstName} ${profileUser.lastName || ""} (@${
            profileUser.username
          }) on SceneSavvy`,
          text:
            profileUser.bio ||
            `Check Out ${displayName}'s Travel Adventures on SceneSavvy!`,
          url: profileUrl,
        });
        toast.success("Profile Shared Successfully!");
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Share Failed:", error);
          copyToClipboard(profileUrl);
        }
      }
    } else {
      copyToClipboard(profileUrl);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Profile link copied to clipboard!");
  };

  const displayName = profileUser.firstName
    ? `${profileUser.firstName} ${profileUser.lastName || ""}`
    : profileUser.username;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Profile Header */}
      <div className="bg-card rounded-2xl p-6 md:p-8 shadow-lg border border-border/40 mb-8">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          {/* Avatar */}
          <div className="flex justify-center md:justify-start">
            {profileUser.imageUrl ? (
              <Image
                src={profileUser.imageUrl}
                alt={displayName}
                width={160}
                height={160}
                className="h-32 w-32 md:h-40 md:w-40 rounded-2xl object-cover shadow-md"
              />
            ) : (
              <div className="h-32 w-32 md:h-40 md:w-40 rounded-2xl bg-linear-to-br from-primary to-secondary flex items-center justify-center shadow-md">
                <span className="text-5xl font-bold text-white">
                  {profileUser.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  {displayName}
                </h1>
                <p className="text-lg text-muted-foreground">
                  @{profileUser.username}
                </p>
              </div>

              <div className="flex gap-2">
                {isOwnProfile ? (
                  <Button
                    onClick={() => setIsEditModalOpen(true)}
                    variant="outline"
                    className="gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    Edit Profile
                  </Button>
                ) : (
                  <Button
                    onClick={handleFollow}
                    disabled={isFollowLoading}
                    variant={isFollowing ? "outline" : "default"}
                    className="gap-2"
                  >
                    {isFollowing ? (
                      <>
                        <UserMinus className="h-4 w-4" />
                        Unfollow
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4" />
                        Follow
                      </>
                    )}
                  </Button>
                )}

                <Button
                  onClick={handleShare}
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6 text-sm md:text-base">
              <div className="text-center">
                <p className="text-2xl font-bold">{profileUser._count.pins}</p>
                <p className="text-muted-foreground">Pins</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {profileUser._count.boards}
                </p>
                <p className="text-muted-foreground">Boards</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{followersCount}</p>
                <p className="text-muted-foreground">Followers</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {profileUser._count.following}
                </p>
                <p className="text-muted-foreground">Following</p>
              </div>
            </div>

            {/* Bio & Info */}
            <div className="space-y-2">
              {profileUser.bio && (
                <p className="text-foreground leading-relaxed">
                  {profileUser.bio}
                </p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {profileUser.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    <span>{profileUser.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Joined{" "}
                    {new Date(profileUser.createdAt).toLocaleDateString(
                      "en-US",
                      { month: "long", year: "numeric" }
                    )}
                  </span>
                </div>
              </div>

              {profileUser.interests.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {profileUser.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="pins" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
          <TabsTrigger value="pins" className="gap-2">
            <Grid3X3 className="h-4 w-4" />
            Pins
          </TabsTrigger>
          <TabsTrigger value="boards" className="gap-2">
            <LayoutGrid className="h-4 w-4" />
            Boards
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pins" className="mt-0">
          {pins.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-lg text-muted-foreground mb-2">
                {isOwnProfile ? "You Haven't" : `${displayName} Hasn't`} Created
                Any Pins Yet
              </p>
              <p className="text-sm text-muted-foreground">
                {isOwnProfile && "Start Exploring and Create Your First Pin!"}
              </p>
            </div>
          ) : (
            <MasonryGrid pins={pins} />
          )}
        </TabsContent>

        <TabsContent value="boards" className="mt-0">
          {boards.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-lg text-muted-foreground mb-2">
                {isOwnProfile ? "You Haven't" : `${displayName} Hasn't`} Created
                Any Boards Yet
              </p>
            </div>
          ) : (
            <BoardsGrid boards={boards} />
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Profile Modal */}
      {isOwnProfile && (
        <EditProfileModal
          user={profileUser}
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
        />
      )}
    </div>
  );
}
