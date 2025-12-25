"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SortablePinsView } from "./sortable-pins-view";
import { BoardMapView } from "./board-map-view";
import { BoardActivityView } from "./board-activity-view";
import { TimelineView } from "./timeline-view";
import { DiscussionView } from "./discussion-view";
import { AnalyticsView } from "./analytics-view";
import {
  MapPin,
  Map,
  Activity,
  MessageSquare,
  LayoutGrid,
  Calendar,
  BarChart3,
} from "lucide-react";

interface BoardTabsProps {
  board: any;
  isOwner: boolean;
  userRole: string | null;
  currentUserId?: string;
}

export function BoardTabs({
  board,
  isOwner,
  userRole,
  currentUserId,
}: BoardTabsProps) {
  const [activeTab, setActiveTab] = useState("pins");

  return (
    <div className="container mx-auto max-w-7xl px-4 md:px-6 py-8">
      {/* Board Description */}
      {board.description && (
        <div className="mb-8">
          <p className="text-lg text-muted-foreground max-w-3xl">
            {board.description}
          </p>
        </div>
      )}

      {/* Sticky Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="sticky top-16 z-20 bg-background/95 backdrop-blur-sm border-b border-border/40 -mx-4 px-4 md:-mx-6 md:px-6 mb-8">
          <TabsList className="h-14 bg-transparent border-0 gap-2">
            <TabsTrigger
              value="pins"
              className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-6"
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              Pins
              <span className="ml-2 text-sm opacity-70">
                ({board._count.pins})
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="timeline"
              className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-6"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Timeline
            </TabsTrigger>

            <TabsTrigger
              value="map"
              className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-6"
            >
              <Map className="h-4 w-4 mr-2" />
              Map
            </TabsTrigger>

            <TabsTrigger
              value="activity"
              className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-6"
            >
              <Activity className="h-4 w-4 mr-2" />
              Activity
            </TabsTrigger>

            <TabsTrigger
              value="discussion"
              className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-6"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Discussion
              <span className="ml-2 text-sm opacity-70">
                ({board._count.comments})
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="analytics"
              className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-6"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="pins" className="mt-0">
          <SortablePinsView
            board={board}
            isOwner={isOwner}
            userRole={userRole}
            currentUserId={currentUserId}
          />
        </TabsContent>

        <TabsContent value="timeline" className="mt-0">
          <TimelineView
            board={board}
            canEdit={
              isOwner ||
              userRole === "OWNER" ||
              userRole === "CO_ADMIN" ||
              userRole === "CAN_ADD_PINS"
            }
          />
        </TabsContent>

        <TabsContent value="map" className="mt-0">
          <BoardMapView board={board} />
        </TabsContent>

        <TabsContent value="activity" className="mt-0">
          <BoardActivityView activities={board.activities} />
        </TabsContent>

        <TabsContent value="discussion" className="mt-0">
          <DiscussionView
            boardId={board.id}
            isOwner={isOwner}
            currentUserId={currentUserId}
          />
        </TabsContent>

        <TabsContent value="analytics" className="mt-0">
          <AnalyticsView board={board} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
