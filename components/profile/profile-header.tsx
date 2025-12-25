"use client";

import { useState } from "react";
import Image from "next/image";
import { Settings, MapPin, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditProfileModal } from "./edit-profile-modal";

interface User {
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  imageUrl: string | null;
  bio: string | null;
  location: string | null;
  interests: string[];
}

interface ProfileHeaderProps {
  user: User;
  isOwnProfile: boolean;
}

export function ProfileHeader({ user, isOwnProfile }: ProfileHeaderProps) {
  const [showEditModal, setShowEditModal] = useState(false);

  const displayName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.username;

  return (
    <>
      <div className="bg-card rounded-xl border border-border/40 shadow-lg overflow-hidden">
        {/* Cover Image */}
        <div className="h-32 sm:h-40 md:h-48 bg-linear-to-br from-primary via-secondary to-accent relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00ek0wIDM0YzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        </div>

        <div className="px-4 sm:px-6 md:px-8 pb-6 sm:pb-8">
          {/* Profile Picture */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-6 -mt-12 sm:-mt-16">
            <div className="relative">
              {user.imageUrl ? (
                <Image
                  src={user.imageUrl}
                  alt={displayName}
                  width={128}
                  height={128}
                  className="h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 rounded-2xl sm:rounded-xl object-cover border-4 border-card shadow-xl"
                />
              ) : (
                <div className="h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 rounded-2xl sm:rounded-xl bg-linear-to-br from-primary to-secondary border-4 border-card shadow-xl flex items-center justify-center">
                  <span className="text-3xl sm:text-4xl font-bold text-white">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pt-2 sm:pt-4 w-full">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  {displayName}
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  @{user.username}
                </p>
              </div>

              {isOwnProfile && (
                <Button
                  onClick={() => setShowEditModal(true)}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>

          {/* Bio and Details */}
          <div className="mt-6 space-y-4">
            {user.bio && (
              <p className="text-base text-foreground leading-relaxed max-w-3xl">
                {user.bio}
              </p>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {user.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{user.location}</span>
                </div>
              )}
              {user.interests && user.interests.length > 0 && (
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  <span>{user.interests.join(", ")}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <EditProfileModal
        user={user}
        open={showEditModal}
        onOpenChange={setShowEditModal}
      />
    </>
  );
}
