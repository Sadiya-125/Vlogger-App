"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Lock, MapPin, MoreVertical, Edit, Trash2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditBoardModal } from "./edit-board-modal";
import { DeleteBoardDialog } from "./delete-board-dialog";

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
}

interface BoardCardProps {
  board: Board;
  onDelete: (boardId: string) => void;
  onUpdate: (board: Board) => void;
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

export function BoardCard({ board, onDelete, onUpdate }: BoardCardProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const previewImages = (board.pins || [])
    .slice(0, 3)
    .map((pinRelation) => pinRelation.pin.images[0]?.url)
    .filter(Boolean);

  return (
    <>
      <div className="group relative bg-card rounded-lg border border-border/40 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
        {/* Cover/Preview Images */}
        <Link href={`/boards/${board.id}`}>
          <div className="relative h-48 sm:h-56 bg-linear-to-br from-muted to-muted/50 cursor-pointer">
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
                <MapPin className="h-16 w-16 text-white/30" />
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
                <MapPin className="h-16 w-16 text-muted-foreground/30" />
              </div>
            )}

            {/* Privacy Badge */}
            {board.visibility === "PRIVATE" && (
              <div className="absolute top-3 left-3 bg-card/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-md flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">
                  Private
                </span>
              </div>
            )}
          </div>
        </Link>

        {/* Actions Menu */}
        <div className="absolute top-3 right-3 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 bg-card/90 backdrop-blur-sm hover:bg-card shadow-md"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setShowEditModal(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Board
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Board
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Board Info */}
        <div className="p-5 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <Link href={`/boards/${board.id}`} className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg line-clamp-1 hover:text-primary transition-colors">
                {board.name}
              </h3>
            </Link>
            <span
              className={cn(
                "px-2.5 py-1 text-[10px] font-medium rounded-full border shrink-0",
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

          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
            <div className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              <span>
                {board._count.pins} {board._count.pins === 1 ? "pin" : "pins"}
              </span>
            </div>
            {board._count.followers > 0 && (
              <div className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                <span>
                  {board._count.followers}{" "}
                  {board._count.followers === 1 ? "Follower" : "Followers"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <EditBoardModal
        board={board}
        open={showEditModal}
        onOpenChange={setShowEditModal}
        onBoardUpdated={onUpdate}
      />

      <DeleteBoardDialog
        board={board}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onBoardDeleted={onDelete}
      />
    </>
  );
}
