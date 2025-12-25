"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Award, Clock, Users, MapPin, Loader2, Heart, Bookmark } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AnalyticsViewProps {
  board: any;
}

interface AnalyticsData {
  mostPopularPin: any;
  topContributors: Array<{ user: any; count: number }>;
  growthData: {
    pinsAdded: number;
    membersAdded: number;
    commentsAdded: number;
  };
  engagement: {
    views: number;
    likes: number;
    followers: number;
    saves: number;
    comments: number;
    pins: number;
  };
}

export function AnalyticsView({ board }: AnalyticsViewProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`/api/boards/${board.id}/analytics`);
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data);
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [board.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Growth Chart */}
      <Card className="border-border/40 shadow-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Growth Overview (Last 30 Days)</CardTitle>
              <CardDescription>
                Track Your Board's Recent Activity
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-lg p-4 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
                  Pins Added
                </p>
              </div>
              <p className="text-3xl font-bold text-blue-600">
                {analytics?.growthData.pinsAdded || 0}
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-lg p-4 border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-green-600" />
                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                  Members Added
                </p>
              </div>
              <p className="text-3xl font-bold text-green-600">
                {analytics?.growthData.membersAdded || 0}
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-lg p-4 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <p className="text-sm font-medium text-purple-700 dark:text-purple-400">
                  Comments Added
                </p>
              </div>
              <p className="text-3xl font-bold text-purple-600">
                {analytics?.growthData.commentsAdded || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Most Popular Pin */}
        <Card className="border-border/40 shadow-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Award className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <CardTitle className="text-base">Most Popular Pin</CardTitle>
                <CardDescription className="text-xs">
                  Based on Likes and Saves
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {analytics?.mostPopularPin ? (
              <Link href={`/pins/${analytics.mostPopularPin.id}`}>
                <div className="space-y-3 hover:opacity-80 transition-opacity">
                  <div className="relative h-32 w-full rounded-md overflow-hidden bg-muted">
                    {analytics.mostPopularPin.images?.[0] ? (
                      <Image
                        src={analytics.mostPopularPin.images[0].url}
                        alt={analytics.mostPopularPin.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <MapPin className="h-8 w-8 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-sm line-clamp-2">
                      {analytics.mostPopularPin.title}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {analytics.mostPopularPin._count?.likes || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Bookmark className="h-3 w-3" />
                        {analytics.mostPopularPin._count?.savedBy || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-3">
                  <Award className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  No pins yet
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Peak Engagement Time */}
        <Card className="border-border/40 shadow-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <CardTitle className="text-base">Total Engagement</CardTitle>
                <CardDescription className="text-xs">
                  All Interactions Combined
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Pins</span>
                <span className="text-sm font-semibold">
                  {analytics?.engagement.pins || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Comments</span>
                <span className="text-sm font-semibold">
                  {analytics?.engagement.comments || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Likes</span>
                <span className="text-sm font-semibold">
                  {analytics?.engagement.likes || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Saves</span>
                <span className="text-sm font-semibold">
                  {analytics?.engagement.saves || 0}
                </span>
              </div>
              <div className="pt-2 mt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total</span>
                  <span className="text-lg font-bold text-primary">
                    {(analytics?.engagement.pins || 0) +
                      (analytics?.engagement.comments || 0) +
                      (analytics?.engagement.likes || 0) +
                      (analytics?.engagement.saves || 0)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Contributors */}
        <Card className="border-border/40 shadow-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Users className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <CardTitle className="text-base">Top Contributors</CardTitle>
                <CardDescription className="text-xs">
                  Members Who Added Most Pins
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {analytics?.topContributors && analytics.topContributors.length > 0 ? (
              <div className="space-y-3">
                {analytics.topContributors.map((contributor, index) => (
                  <div key={contributor.user.id} className="flex items-center gap-3">
                    <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-bold">
                      {index + 1}
                    </div>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={contributor.user.imageUrl} />
                      <AvatarFallback>
                        {contributor.user.firstName?.[0]}
                        {contributor.user.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {contributor.user.username ||
                          `${contributor.user.firstName} ${contributor.user.lastName}`}
                      </p>
                    </div>
                    <div className="text-sm font-semibold text-primary">
                      {contributor.count}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-3">
                  <Users className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  No activity yet
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Engagement Highlights */}
      <Card className="border-border/40 shadow-md">
        <CardHeader>
          <CardTitle>Engagement Highlights</CardTitle>
          <CardDescription>
            Key metrics about your board's performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Total Views</p>
              <p className="text-2xl font-bold">{analytics?.engagement.views || 0}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Total Likes</p>
              <p className="text-2xl font-bold">{analytics?.engagement.likes || 0}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Followers</p>
              <p className="text-2xl font-bold">
                {analytics?.engagement.followers || 0}
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Saves</p>
              <p className="text-2xl font-bold">{analytics?.engagement.saves || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
