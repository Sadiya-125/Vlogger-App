"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Check, Loader2, MapPin, Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Board {
  id: string;
  name: string;
  description: string | null;
  category: string;
  visibility: string;
  coverImage: string | null;
  _count: {
    pins: number;
  };
  pins: {
    pin: {
      images: { url: string }[];
    };
  }[];
}

interface AddToBoardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pinId: string;
  pinTitle: string;
}

export function AddToBoardModal({
  open,
  onOpenChange,
  pinId,
  pinTitle,
}: AddToBoardModalProps) {
  const router = useRouter();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToBoard, setAddingToBoard] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (open) {
      fetchBoards();
    }
  }, [open]);

  const fetchBoards = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/boards");
      if (response.ok) {
        const data = await response.json();
        setBoards(data);
      }
    } catch (error) {
      console.error("Failed to fetch boards:", error);
      toast.error("Failed to load your boards");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToBoard = async (boardId: string) => {
    setAddingToBoard(boardId);

    try {
      const response = await fetch(`/api/boards/${boardId}/pins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinId }),
      });

      if (response.ok) {
        toast.success(`Added to board!`);
        router.refresh();
        // Update local state to show checkmark
        setTimeout(() => {
          setAddingToBoard(null);
        }, 1000);
      } else if (response.status === 409) {
        toast.info("This pin is already in that board");
      } else {
        throw new Error("Failed to add to board");
      }
    } catch (error) {
      console.error("Failed to add to board:", error);
      toast.error("Failed to add pin to board");
      setAddingToBoard(null);
    }
  };

  const filteredBoards = boards.filter((board) =>
    board.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Add to Board</DialogTitle>
          <DialogDescription>
            Choose a Board to Save "{pinTitle}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <Input
            placeholder="Search Your Boards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />

          {/* Boards List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredBoards.length > 0 ? (
            <ScrollArea className="h-100 pr-4">
              <div className="space-y-2">
                {filteredBoards.map((board) => {
                  const coverImage =
                    board.coverImage || board.pins[0]?.pin.images[0]?.url;
                  const isAdding = addingToBoard === board.id;

                  return (
                    <button
                      key={board.id}
                      onClick={() => handleAddToBoard(board.id)}
                      disabled={isAdding}
                      className="w-full flex items-center gap-4 p-3 rounded-lg border border-border/40 hover:bg-accent/50 transition-all group disabled:opacity-70"
                    >
                      {/* Board Cover */}
                      <div className="relative h-16 w-16 rounded-md overflow-hidden bg-muted shrink-0">
                        {coverImage ? (
                          <Image
                            src={coverImage}
                            alt={board.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <MapPin className="h-6 w-6 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>

                      {/* Board Info */}
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm truncate">
                            {board.name}
                          </h3>
                          {board.visibility === "PRIVATE" && (
                            <Lock className="h-3 w-3 text-muted-foreground shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {board._count.pins}{" "}
                          {board._count.pins === 1 ? "pin" : "pins"}
                        </p>
                        {board.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {board.description}
                          </p>
                        )}
                      </div>

                      {/* Add Button */}
                      <div className="shrink-0">
                        {isAdding ? (
                          <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                            <Check className="h-5 w-5 text-white" />
                          </div>
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-primary/10 group-hover:bg-primary group-hover:text-white flex items-center justify-center transition-colors">
                            <Plus className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MapPin className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="font-semibold mb-2">
                {searchQuery ? "No boards found" : "No boards yet"}
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs mb-4">
                {searchQuery
                  ? "Try a different search term"
                  : "Create your first board to start organizing your pins"}
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => {
                    onOpenChange(false);
                    router.push("/boards");
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Board
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
