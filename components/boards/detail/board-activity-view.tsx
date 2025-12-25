"use client";

import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { Activity } from "lucide-react";

interface BoardActivityViewProps {
  activities: any[];
}

const activityIcons: Record<string, string> = {
  CREATED: "🎨",
  PIN_ADDED: "📍",
  PIN_REMOVED: "🗑️",
  MEMBER_ADDED: "👥",
  MEMBER_REMOVED: "👋",
  COMMENT_ADDED: "💬",
  SETTINGS_UPDATED: "⚙️",
  COVER_CHANGED: "🖼️",
};

const activityLabels: Record<string, string> = {
  CREATED: "created this board",
  PIN_ADDED: "added a pin",
  PIN_REMOVED: "removed a pin",
  MEMBER_ADDED: "added a member",
  MEMBER_REMOVED: "removed a member",
  COMMENT_ADDED: "added a comment",
  SETTINGS_UPDATED: "updated board settings",
  COVER_CHANGED: "changed the cover image",
};

export function BoardActivityView({ activities }: BoardActivityViewProps) {
  if (activities.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-border/40 bg-card">
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <Activity className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No activity yet</h3>
          <p className="text-muted-foreground">
            Activity will appear here as you build your board.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-4">
        {activities.map((activity: any) => {
          const displayName = activity.user.firstName || activity.user.username;
          const icon = activityIcons[activity.activityType] || "📝";
          const label =
            activityLabels[activity.activityType] || activity.activityType;

          return (
            <div
              key={activity.id}
              className="flex items-start gap-4 p-4 rounded-lg border border-border/40 bg-card hover:bg-accent/5 transition-colors"
            >
              {/* User Avatar */}
              <div className="relative shrink-0">
                {activity.user.imageUrl ? (
                  <Image
                    src={activity.user.imageUrl}
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
                <span className="absolute -bottom-1 -right-1 text-lg">
                  {icon}
                </span>
              </div>

              {/* Activity Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-medium">{displayName}</span>{" "}
                  <span className="text-muted-foreground">{label}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(activity.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
