"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MasonryGrid } from "@/components/feed/masonry-grid";
import { BoardsGrid } from "./boards-grid";

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
  user?: {
    id: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
  };
}

interface ProfileTabsProps {
  pins: Pin[];
  boards: Board[];
  savedPins?: Pin[];
  savedBoards?: Board[];
}

export function ProfileTabs({ pins, boards, savedPins = [], savedBoards = [] }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState("pins");

  return (
    <div className="mt-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 h-12 bg-card border border-border/40 rounded-md p-1">
          <TabsTrigger
            value="pins"
            className="rounded-[10px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm"
          >
            Pins ({pins.length})
          </TabsTrigger>
          <TabsTrigger
            value="boards"
            className="rounded-[10px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm"
          >
            Boards ({boards.length})
          </TabsTrigger>
          <TabsTrigger
            value="saved-pins"
            className="rounded-[10px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm"
          >
            Saved Pins ({savedPins.length})
          </TabsTrigger>
          <TabsTrigger
            value="saved-boards"
            className="rounded-[10px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm"
          >
            Saved Boards ({savedBoards.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pins" className="mt-8">
          {pins.length > 0 ? (
            <MasonryGrid pins={pins} />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-4">
                <svg
                  className="h-12 w-12 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">No Pins Yet</h3>
              <p className="text-muted-foreground max-w-sm">
                Start Exploring the World and Create Your First Travel Pin!
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="boards" className="mt-8">
          {boards.length > 0 ? (
            <BoardsGrid boards={boards} />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-4">
                <svg
                  className="h-12 w-12 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">No Boards Yet</h3>
              <p className="text-muted-foreground max-w-sm">
                Organize Your Travel Destinations by Creating Your First Board!
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="saved-pins" className="mt-8">
          {savedPins.length > 0 ? (
            <MasonryGrid pins={savedPins} />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-4">
                <svg
                  className="h-12 w-12 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">No Saved Pins Yet</h3>
              <p className="text-muted-foreground max-w-sm">
                Save pins you love to easily find them later!
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="saved-boards" className="mt-8">
          {savedBoards.length > 0 ? (
            <BoardsGrid boards={savedBoards} />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-4">
                <svg
                  className="h-12 w-12 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">No Saved Boards Yet</h3>
              <p className="text-muted-foreground max-w-sm">
                Save travel boards to get inspiration for your next adventure!
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
