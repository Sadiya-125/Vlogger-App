"use client";

import {
  Eye,
  Heart,
  Bookmark,
  Users,
  TrendingUp,
  MessageCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";

interface ActivitySettingsProps {
  board: any;
}

const stats = [
  {
    icon: Eye,
    label: "Views",
    value: "viewCount",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: Users,
    label: "Followers",
    value: "_count.followers",
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    icon: Heart,
    label: "Likes",
    value: "_count.likes",
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
  {
    icon: MessageCircle,
    label: "Comments",
    value: "_count.comments",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
];

export function ActivitySettings({ board }: ActivitySettingsProps) {
  const getNestedValue = (obj: any, path: string) => {
    return path.split(".").reduce((acc, part) => acc?.[part], obj);
  };

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight mb-2">
          Activity & Analytics
        </h2>
        <p className="text-sm text-muted-foreground">
          Track Your Board's Performance and Engagement
        </p>
      </div>

      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const value = getNestedValue(board, stat.value) || 0;

            return (
              <Card
                key={stat.label}
                className="p-4 border-border/40 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg ${stat.bg}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{value}</p>
                    <p className="text-xs text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Growth Timeline */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Growth Timeline</h3>
          <div className="p-8 rounded-xl border border-border/40 bg-muted/30">
            <div className="flex items-center justify-center h-48">
              <div className="text-center space-y-2">
                <TrendingUp className="h-12 w-12 text-muted-foreground/50 mx-auto" />
                <p className="text-sm text-muted-foreground">
                  Growth Chart Coming Soon
                </p>
                <p className="text-xs text-muted-foreground/75">
                  Track Your Board's Performance Over Time
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Engagement Highlights */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Engagement Highlights</h3>
          <div className="grid gap-3">
            <div className="p-4 rounded-xl border border-border/40 bg-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Most Popular Pin</p>
                  <p className="text-xs text-muted-foreground">
                    Based on Likes and Saves
                  </p>
                </div>
                <Badge className="bg-primary/10 text-primary">
                  Coming Soon
                </Badge>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border/40 bg-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Peak Engagement Time</p>
                  <p className="text-xs text-muted-foreground">
                    When People Interact Most
                  </p>
                </div>
                <Badge className="bg-primary/10 text-primary">
                  Coming Soon
                </Badge>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border/40 bg-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Top Contributors</p>
                  <p className="text-xs text-muted-foreground">
                    Members Who Added Most Pins
                  </p>
                </div>
                <Badge className="bg-primary/10 text-primary">
                  Coming Soon
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Pride Moment */}
        <div className="p-6 rounded-xl bg-linear-to-br from-primary/10 via-secondary/10 to-accent/10 border border-primary/20">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-background/50 mb-2">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">
              You're Building Something Meaningful
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {board._count?.followers > 0
                ? `${board._count.followers} ${
                    board._count.followers === 1 ? "Person is" : "People are"
                  } Following Your Journey`
                : "Share Your Board to Start Building a Community"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}
