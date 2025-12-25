"use client";

import { useState } from "react";
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
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { LayoutGrid, List, Map, GripVertical, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SortablePinCard } from "./sortable-pin-card";
import { BrowsePinsModal } from "./browse-pins-modal";
import { toast } from "sonner";

interface SortablePinsViewProps {
  board: any;
  isOwner: boolean;
  userRole: string | null;
  currentUserId?: string;
}

export function SortablePinsView({
  board,
  isOwner,
  userRole,
  currentUserId,
}: SortablePinsViewProps) {
  const [viewMode, setViewMode] = useState<"masonry" | "grid" | "map">(
    "masonry"
  );
  const [pins, setPins] = useState(board.pins || []);
  const [isReordering, setIsReordering] = useState(false);
  const [showBrowsePins, setShowBrowsePins] = useState(false);

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

  const canEdit =
    isOwner ||
    userRole === "OWNER" ||
    userRole === "CO_ADMIN" ||
    userRole === "CAN_ADD_PINS";

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = pins.findIndex((p: any) => p.id === active.id);
      const newIndex = pins.findIndex((p: any) => p.id === over.id);

      const newPins = arrayMove(pins, oldIndex, newIndex);
      setPins(newPins);

      // Optimistically update UI
      toast.success("Pin order updated");

      // Persist to database
      try {
        await fetch(`/api/boards/${board.id}/reorder`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pinIds: newPins.map((p: any) => p.id),
          }),
        });
      } catch (error) {
        console.error("Failed to update pin order:", error);
        toast.error("Failed to save new order");
        // Revert on error
        setPins(pins);
      }
    }
  };

  const extractedPins = pins.map((pinRelation: any) => ({
    ...pinRelation.pin,
    boardRelationId: pinRelation.id,
    relevance: pinRelation.relevance,
    boardNotes: pinRelation.boardNotes,
  }));

  return (
    <div className="space-y-6">
      {/* View Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* LEFT SECTION */}
        <p className="text-sm text-muted-foreground">
          {extractedPins.length}{" "}
          {extractedPins.length === 1 ? "Destination" : "Destinations"}
        </p>

        {/* RIGHT SECTION */}
        {canEdit && (
          <Button variant="default" onClick={() => setShowBrowsePins(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Pins
          </Button>
        )}
      </div>

      {/* Map View */}
      {viewMode === "map" && (
        <div className="rounded-xl border border-border/40 bg-card p-8 text-center">
          <Map className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Map View</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Visualize All Your Destinations on an Interactive Map with Routes
            and Clusters.
          </p>
        </div>
      )}

      {/* Sortable Pins Grid */}
      {viewMode !== "map" && extractedPins.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={extractedPins.map((p: any) => p.id)}
            strategy={rectSortingStrategy}
          >
            <div
              className={`grid gap-6 ${
                viewMode === "masonry"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              }`}
            >
              {extractedPins.map((pin: any) => (
                <SortablePinCard
                  key={pin.id}
                  pin={pin}
                  boardId={board.id}
                  isReordering={isReordering && canEdit}
                  canEdit={canEdit}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Empty State */}
      {extractedPins.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-border/40 bg-card">
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <LayoutGrid className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Pins Yet</h3>
          <p className="text-muted-foreground max-w-sm mb-6">
            Start Building Your Travel Board by Adding Amazing Destinations.
          </p>
          {canEdit && (
            <Button
              onClick={() => setShowBrowsePins(true)}
              className="rounded-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Pin
            </Button>
          )}
        </div>
      )}

      {/* Browse Pins Modal */}
      <BrowsePinsModal
        open={showBrowsePins}
        onOpenChange={setShowBrowsePins}
        boardId={board.id}
        boardName={board.name}
      />
    </div>
  );
}
