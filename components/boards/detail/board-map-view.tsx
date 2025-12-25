"use client";

import { InteractiveMapView } from "./interactive-map-view";
import { MapPin } from "lucide-react";

interface BoardMapViewProps {
  board: any;
}

export function BoardMapView({ board }: BoardMapViewProps) {
  // Extract pins with location data
  const extractedPins =
    board.pins
      ?.map((pinRelation: any) => ({
        ...pinRelation.pin,
        relevance: pinRelation.relevance,
        boardNotes: pinRelation.boardNotes,
      }))
      .filter((pin: any) => pin.latitude && pin.longitude) || [];

  if (extractedPins.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-border/40 bg-card">
        <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
          <MapPin className="h-10 w-10 text-muted-foreground/50" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No Locations to Display</h3>
        <p className="text-muted-foreground max-w-md">
          Add pins with location data to see them on the map
        </p>
      </div>
    );
  }

  return <InteractiveMapView pins={extractedPins} />;
}
