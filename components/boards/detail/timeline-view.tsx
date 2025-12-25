"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus,
  GripVertical,
  Calendar,
  MapPin,
  Trash2,
  Star,
  HelpCircle,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { TimelinePinSelectorModal } from "./timeline-pin-selector-modal";

interface TimelineViewProps {
  board: any;
  canEdit: boolean;
}

interface DayColumn {
  id: string;
  dayNumber: number;
  title: string;
  notes: string;
  pins: any[];
}

const relevanceConfig = {
  MUST_VISIT: {
    icon: Star,
    emoji: "⭐",
    color: "text-yellow-500",
  },
  MAYBE: {
    icon: HelpCircle,
    emoji: "🤔",
    color: "text-blue-500",
  },
  BACKUP: {
    icon: RotateCcw,
    emoji: "🔄",
    color: "text-gray-500",
  },
};

function SortablePinItem({
  pin,
  onRemove,
}: {
  pin: any;
  onRemove: () => void;
}) {
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

  const relevanceData = pin.relevance
    ? relevanceConfig[pin.relevance as keyof typeof relevanceConfig]
    : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative bg-card rounded-lg border border-border/40 overflow-hidden hover:shadow-md transition-all"
    >
      <div className="flex gap-3 p-3">
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="shrink-0 cursor-grab active:cursor-grabbing pt-1"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>

        {/* Pin Image */}
        <Link href={`/pins/${pin.id}`} className="shrink-0">
          <div className="relative h-16 w-16 rounded-md overflow-hidden bg-muted">
            {pin.images?.[0] ? (
              <Image
                src={pin.images[0].url}
                alt={pin.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <MapPin className="h-6 w-6 text-muted-foreground/30" />
              </div>
            )}
          </div>
        </Link>

        {/* Pin Info */}
        <div className="flex-1 min-w-0">
          <Link href={`/pins/${pin.id}`}>
            <h4 className="font-semibold text-sm line-clamp-1 hover:text-primary transition-colors">
              {pin.title}
            </h4>
          </Link>
          {pin.location && (
            <p className="text-xs text-muted-foreground line-clamp-1 flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3" />
              {pin.location}
            </p>
          )}
          {relevanceData && (
            <div className="mt-1">
              <span className={cn("text-xs", relevanceData.color)}>
                {relevanceData.emoji}
              </span>
            </div>
          )}
        </div>

        {/* Remove Button */}
        <button
          onClick={onRemove}
          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {pin.boardNotes && (
        <div className="px-3 pb-3">
          <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-md line-clamp-2">
            {pin.boardNotes}
          </p>
        </div>
      )}
    </div>
  );
}

function DayColumn({
  day,
  canEdit,
  onAddPin,
  onRemovePin,
  onUpdateDay,
  onPinsReorder,
}: {
  day: DayColumn;
  canEdit: boolean;
  onAddPin: () => void;
  onRemovePin: (pinId: string) => void;
  onUpdateDay: (updates: Partial<DayColumn>) => void;
  onPinsReorder: (newPins: any[]) => void;
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [localTitle, setLocalTitle] = useState(day.title);
  const [localNotes, setLocalNotes] = useState(day.notes);

  const { setNodeRef } = useSortable({ id: day.id });

  const handleSaveTitle = () => {
    onUpdateDay({ title: localTitle });
    setIsEditingTitle(false);
  };

  const handleSaveNotes = () => {
    onUpdateDay({ notes: localNotes });
    setIsEditingNotes(false);
  };

  return (
    <Card className="shrink-0 w-80 bg-muted/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-2">
          {canEdit && day.pins.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {day.pins.length} {day.pins.length === 1 ? "Stop" : "Stops"}
            </span>
          )}
        </div>

        {isEditingTitle && canEdit ? (
          <div className="space-y-2">
            <Input
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveTitle();
                if (e.key === "Escape") {
                  setLocalTitle(day.title);
                  setIsEditingTitle(false);
                }
              }}
              autoFocus
              className="text-base font-semibold"
            />
          </div>
        ) : (
          <CardTitle
            onClick={() => canEdit && setIsEditingTitle(true)}
            className={cn(
              "text-base cursor-pointer hover:text-primary transition-colors flex items-center gap-2",
              !canEdit && "cursor-default hover:text-foreground"
            )}
          >
            <Calendar className="h-4 w-4 text-primary" />
            {day.title}
          </CardTitle>
        )}

        {isEditingNotes && canEdit ? (
          <div className="space-y-2 mt-2">
            <Textarea
              value={localNotes}
              onChange={(e) => setLocalNotes(e.target.value)}
              onBlur={handleSaveNotes}
              placeholder="Add Notes For This Day..."
              rows={2}
              className="text-sm"
            />
          </div>
        ) : day.notes ? (
          <CardDescription
            onClick={() => canEdit && setIsEditingNotes(true)}
            className={cn(
              "text-sm mt-1 cursor-pointer",
              canEdit && "hover:text-foreground"
            )}
          >
            {day.notes}
          </CardDescription>
        ) : (
          canEdit && (
            <button
              onClick={() => setIsEditingNotes(true)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors mt-1 flex items-center gap-2"
            >
              <Plus className="h-4 w-4 inline-block" />
              Add Notes
            </button>
          )
        )}
      </CardHeader>

      <CardContent ref={setNodeRef} className="space-y-2 min-h-50">
        <SortableContext
          items={day.pins.map((p) => p.id)}
          strategy={verticalListSortingStrategy}
        >
          {day.pins.map((pin) => (
            <SortablePinItem
              key={pin.id}
              pin={pin}
              onRemove={() => onRemovePin(pin.id)}
            />
          ))}
        </SortableContext>

        {canEdit && (
          <Button
            variant="outline"
            onClick={onAddPin}
            className="w-full border-dashed"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Pin
          </Button>
        )}

        {day.pins.length === 0 && !canEdit && (
          <div className="flex items-center justify-center py-8 text-center">
            <p className="text-xs text-muted-foreground">No pins scheduled</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function TimelineView({ board, canEdit }: TimelineViewProps) {
  const [days, setDays] = useState<DayColumn[]>([]);
  const [loading, setLoading] = useState(true);
  const [pinSelectorOpen, setPinSelectorOpen] = useState(false);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);

  // Fetch timeline data
  useEffect(() => {
    fetchTimeline();
  }, [board.id]);

  const fetchTimeline = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/boards/${board.id}/timeline`);
      if (response.ok) {
        const timelineData = await response.json();

        // Transform API data to match DayColumn format
        const transformedDays = timelineData.map((day: any) => ({
          id: day.id,
          dayNumber: day.dayNumber,
          title: day.title || `Day ${day.dayNumber}`,
          notes: day.notes || "",
          pins: day.pins.map((assignment: any) => ({
            ...assignment.pin,
            assignmentId: assignment.id,
            order: assignment.order,
          })),
        }));

        setDays(transformedDays);
      }
    } catch (error) {
      console.error("Failed to fetch timeline:", error);
      toast.error("Failed to load timeline");
    } finally {
      setLoading(false);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddDay = async () => {
    try {
      const response = await fetch(`/api/boards/${board.id}/timeline/days`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dayNumber: days.length + 1,
          title: `Day ${days.length + 1}`,
          notes: "",
        }),
      });

      if (response.ok) {
        const newDay = await response.json();
        setDays([
          ...days,
          {
            id: newDay.id,
            dayNumber: newDay.dayNumber,
            title: newDay.title || `Day ${newDay.dayNumber}`,
            notes: newDay.notes || "",
            pins: [],
          },
        ]);
        toast.success("New day added to timeline");
      } else {
        throw new Error("Failed to add day");
      }
    } catch (error) {
      console.error("Failed to add day:", error);
      toast.error("Failed to add day");
    }
  };

  const handleUpdateDay = async (
    dayId: string,
    updates: Partial<DayColumn>
  ) => {
    // Optimistically update UI
    setDays(
      days.map((day) => (day.id === dayId ? { ...day, ...updates } : day))
    );

    // Only persist title and notes changes to API
    if (updates.title !== undefined || updates.notes !== undefined) {
      try {
        const response = await fetch(
          `/api/boards/${board.id}/timeline/days/${dayId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: updates.title,
              notes: updates.notes,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update day");
        }
      } catch (error) {
        console.error("Failed to update day:", error);
        toast.error("Failed to update day");
        // Revert optimistic update on failure
        fetchTimeline();
      }
    }
  };

  const handleRemovePinFromDay = async (dayId: string, pinId: string) => {
    // Find the assignment ID for this pin
    const day = days.find((d) => d.id === dayId);
    const pin = day?.pins.find((p) => p.id === pinId);

    if (!pin || !pin.assignmentId) {
      toast.error("Failed to remove pin");
      return;
    }

    // Optimistically update UI
    setDays(
      days.map((d) =>
        d.id === dayId
          ? { ...d, pins: d.pins.filter((p) => p.id !== pinId) }
          : d
      )
    );

    try {
      const response = await fetch(
        `/api/boards/${board.id}/timeline/days/${dayId}/pins/${pin.assignmentId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        toast.success("Pin removed from day");
      } else {
        throw new Error("Failed to remove pin");
      }
    } catch (error) {
      console.error("Failed to remove pin:", error);
      toast.error("Failed to remove pin");
      // Revert optimistic update on failure
      fetchTimeline();
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    // Find which day contains the active pin
    let sourceDayIndex = -1;
    let activePinIndex = -1;

    days.forEach((day, dayIdx) => {
      const pinIdx = day.pins.findIndex((p) => p.id === active.id);
      if (pinIdx !== -1) {
        sourceDayIndex = dayIdx;
        activePinIndex = pinIdx;
      }
    });

    if (sourceDayIndex === -1) return;

    const sourceDay = days[sourceDayIndex];
    const overPinIndex = sourceDay.pins.findIndex((p) => p.id === over.id);

    if (overPinIndex !== -1 && activePinIndex !== overPinIndex) {
      // Reordering within same day
      const newPins = arrayMove(sourceDay.pins, activePinIndex, overPinIndex);

      // Optimistically update UI
      setDays(
        days.map((day) =>
          day.id === sourceDay.id ? { ...day, pins: newPins } : day
        )
      );

      // Persist to API
      try {
        const pinsWithOrder = newPins.map((pin, index) => ({
          id: pin.assignmentId,
          order: index,
        }));

        const response = await fetch(
          `/api/boards/${board.id}/timeline/days/${sourceDay.id}/pins`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pins: pinsWithOrder }),
          }
        );

        if (response.ok) {
          toast.success("Pin order updated");
        } else {
          throw new Error("Failed to reorder pins");
        }
      } catch (error) {
        console.error("Failed to reorder pins:", error);
        toast.error("Failed to update pin order");
        // Revert optimistic update on failure
        fetchTimeline();
      }
    }
  };

  const handleAddPinToDay = async (dayId: string, pinId: string) => {
    try {
      const response = await fetch(
        `/api/boards/${board.id}/timeline/days/${dayId}/pins`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pinId }),
        }
      );

      if (response.ok) {
        toast.success("Pin added to day");
        fetchTimeline(); // Refresh to show the new pin
      } else if (response.status === 409) {
        toast.info("Pin is already in this day");
      } else {
        throw new Error("Failed to add pin");
      }
    } catch (error) {
      console.error("Failed to add pin to day:", error);
      toast.error("Failed to add pin");
    }
  };

  const totalPins = days.reduce((sum, day) => sum + day.pins.length, 0);
  const totalDays = days.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4 mx-auto animate-pulse" />
          <p className="text-md text-muted-foreground">Loading Timeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Timeline Summary */}
      <div className="rounded-xl border border-border/40 bg-linear-to-r from-primary/5 to-secondary/5 p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">Trip Timeline</h3>
            <p className="text-sm text-muted-foreground">
              {totalDays} {totalDays === 1 ? "Day" : "Days"} · {totalPins}{" "}
              {totalPins === 1 ? "Destination" : "Destinations"}
            </p>
          </div>
          {canEdit && (
            <Button onClick={handleAddDay} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Day
            </Button>
          )}
        </div>
      </div>

      {/* Timeline Days */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {days.map((day) => (
            <DayColumn
              key={day.id}
              day={day}
              canEdit={canEdit}
              onAddPin={() => {
                setSelectedDayId(day.id);
                setPinSelectorOpen(true);
              }}
              onRemovePin={(pinId) => handleRemovePinFromDay(day.id, pinId)}
              onUpdateDay={(updates) => handleUpdateDay(day.id, updates)}
              onPinsReorder={(newPins) =>
                handleUpdateDay(day.id, { pins: newPins })
              }
            />
          ))}
        </div>
      </DndContext>

      {/* Empty State */}
      {days.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-border/40 bg-card">
          <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            Start Planning Your Trip
          </h3>
          <p className="text-muted-foreground max-w-md mb-6">
            Organize your Destinations Day by Day for the Perfect Itinerary.
          </p>
          {canEdit && (
            <Button onClick={handleAddDay} className="gap-2">
              <Plus className="h-4 w-4" />
              Create First Day
            </Button>
          )}
        </div>
      )}

      {/* Pin Selector Modal */}
      {selectedDayId && (
        <TimelinePinSelectorModal
          open={pinSelectorOpen}
          onOpenChange={setPinSelectorOpen}
          boardId={board.id}
          dayId={selectedDayId}
          onPinAdded={fetchTimeline}
        />
      )}
    </div>
  );
}
