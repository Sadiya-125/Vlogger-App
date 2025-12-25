"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Star,
  HelpCircle,
  RotateCcw,
  Edit2,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SortablePinCardProps {
  pin: any;
  boardId: string;
  isReordering: boolean;
  canEdit: boolean;
}

const relevanceConfig = {
  MUST_VISIT: {
    icon: Star,
    label: "Must Visit",
    emoji: "⭐",
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
  },
  MAYBE: {
    icon: HelpCircle,
    label: "Maybe",
    emoji: "🤔",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  BACKUP: {
    icon: RotateCcw,
    label: "Backup",
    emoji: "🔄",
    color: "text-gray-500",
    bg: "bg-gray-500/10",
  },
};

export function SortablePinCard({
  pin,
  boardId,
  isReordering,
  canEdit,
}: SortablePinCardProps) {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [boardNotes, setBoardNotes] = useState(pin.boardNotes || "");
  const [relevance, setRelevance] = useState(pin.relevance || null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: pin.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSaveNotes = async () => {
    try {
      await fetch(`/api/boards/${boardId}/pins/${pin.id}/context`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ boardNotes }),
      });

      toast.success("Notes Saved!");
      setIsEditingNotes(false);
    } catch (error) {
      toast.error("Failed to Save Notes");
    }
  };

  const handleRelevanceChange = async (newRelevance: string) => {
    setRelevance(newRelevance);

    try {
      await fetch(`/api/boards/${boardId}/pins/${pin.id}/context`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ relevance: newRelevance }),
      });

      toast.success("Relevance Updated!");
    } catch (error) {
      toast.error("Failed to Update Relevance");
      setRelevance(pin.relevance);
    }
  };

  const RelevanceIcon = relevance
    ? relevanceConfig[relevance as keyof typeof relevanceConfig]?.icon
    : null;
  const relevanceData = relevance
    ? relevanceConfig[relevance as keyof typeof relevanceConfig]
    : null;

  return (
    <div ref={setNodeRef} style={style} className="group relative">
      {/* Drag Handle */}
      {isReordering && (
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center cursor-grab active:cursor-grabbing shadow-lg"
        >
          <GripVertical className="h-4 w-4 text-white" />
        </div>
      )}

      <div
        className={cn(
          "bg-card rounded-xl border border-border/40 overflow-hidden hover:shadow-lg transition-all duration-300",
          isReordering && "cursor-move"
        )}
      >
        {/* Pin Image */}
        <Link href={`/pins/${pin.id}`} className="block relative h-56">
          {pin.images && pin.images[0] ? (
            <Image
              src={pin.images[0].url}
              alt={pin.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-muted to-muted/50" />
          )}

          {relevance && relevanceData && (
            <div
              className={cn(
                "absolute top-3 left-3 px-3 py-1.5 rounded-full border z-20",
                "backdrop-blur-md bg-black/55 shadow-lg", // readable glass
                "border-white/25",
                relevanceData.bg
              )}
            >
              <span className="text-sm font-semibold flex items-center gap-1.5 text-black">
                <span>{relevanceData.emoji}</span>
                {relevanceData.label}
              </span>
            </div>
          )}
        </Link>

        {/* Pin Info */}
        <div className="p-4 space-y-3">
          <Link href={`/pins/${pin.id}`}>
            <h3 className="font-semibold text-base line-clamp-2 hover:text-primary transition-colors">
              {pin.title}
            </h3>
          </Link>

          {pin.location && (
            <p className="text-sm text-muted-foreground line-clamp-1">
              📍 {pin.location}
            </p>
          )}

          {/* Board Context Controls */}
          {canEdit && (
            <div className="space-y-3 pt-2 border-t border-border/40">
              {/* Relevance Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Relevance
                </label>
                <Select
                  value={relevance || "none"}
                  onValueChange={handleRelevanceChange}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Set relevance..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="MUST_VISIT">⭐ Must Visit</SelectItem>
                    <SelectItem value="MAYBE">🤔 Maybe</SelectItem>
                    <SelectItem value="BACKUP">🔄 Backup</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Board Notes */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-muted-foreground">
                    Board Notes
                  </label>
                  {!isEditingNotes && boardNotes && (
                    <Button
                      variant="ghost"
                      className="h-6 px-2"
                      onClick={() => setIsEditingNotes(true)}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                {isEditingNotes ? (
                  <div className="space-y-2">
                    <Textarea
                      value={boardNotes}
                      onChange={(e) => setBoardNotes(e.target.value)}
                      placeholder="e.g., Visit at Sunrise, Book Tickets Early..."
                      rows={3}
                      className="text-sm"
                    />
                    <div className="flex gap-2">
                      <Button onClick={handleSaveNotes} className="flex-1">
                        <Save className="h-3 w-3 mr-1" />
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setBoardNotes(pin.boardNotes || "");
                          setIsEditingNotes(false);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : boardNotes ? (
                  <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">
                    {boardNotes}
                  </p>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-sm h-8"
                    onClick={() => setIsEditingNotes(true)}
                  >
                    Add Note
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
