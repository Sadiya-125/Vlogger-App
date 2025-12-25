"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Search,
  Plus,
  Check,
  Loader2,
  MapPin as MapPinIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Pin {
  id: string;
  title: string;
  description: string | null;
  location: string;
  category: string;
  images: { url: string }[];
}

interface TimelinePinSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardId: string;
  dayId: string;
  onPinAdded: () => void;
}

export function TimelinePinSelectorModal({
  open,
  onOpenChange,
  boardId,
  dayId,
  onPinAdded,
}: TimelinePinSelectorModalProps) {
  const [pins, setPins] = useState<Pin[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [addingPinId, setAddingPinId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchBoardPins();
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      // Debounce search
      const timer = setTimeout(() => {
        fetchBoardPins();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  const fetchBoardPins = async () => {
    setLoading(true);
    try {
      // Fetch pins that are already in this board
      const params = new URLSearchParams();
      params.append("boardId", boardId);
      if (searchQuery) {
        params.append("q", searchQuery);
      }

      const response = await fetch(
        `/api/boards/${boardId}/pins?${params.toString()}`
      );
      if (response.ok) {
        const data = await response.json();
        setPins(data);
      }
    } catch (error) {
      console.error("Failed to fetch pins:", error);
      toast.error("Failed to load pins");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPinToDay = async (pinId: string, pinTitle: string) => {
    setAddingPinId(pinId);

    try {
      const response = await fetch(
        `/api/boards/${boardId}/timeline/days/${dayId}/pins`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pinId }),
        }
      );

      if (response.ok) {
        toast.success(`"${pinTitle}" Added to Day!`);
        onPinAdded();
        onOpenChange(false);
      } else if (response.status === 409) {
        toast.info("This Pin is Already in This Day");
      } else {
        throw new Error("Failed to Add Pin");
      }
    } catch (error) {
      console.error("Failed to Add Pin to Day:", error);
      toast.error("Failed to Add Pin to Day");
    } finally {
      setAddingPinId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-175 max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Add Pin to Timeline Day</DialogTitle>
          <DialogDescription>
            Select a Pin from this Board to Add to Your Timeline
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search Pins in This Board..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Pins Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : pins.length > 0 ? (
            <ScrollArea className="max-h-[60vh] rounded-md scroll-smooth overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-1">
                {pins.map((pin) => {
                  const isAdding = addingPinId === pin.id;

                  return (
                    <div
                      key={pin.id}
                      className="group relative bg-card rounded-lg border border-border/40 overflow-hidden hover:shadow-lg transition-all"
                    >
                      {/* Pin Image */}
                      <div className="relative h-40 bg-muted">
                        {pin.images[0] ? (
                          <Image
                            src={pin.images[0].url}
                            alt={pin.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <MapPinIcon className="h-12 w-12 text-muted-foreground/30 shrink-0" />
                          </div>
                        )}

                        {/* Add Button Overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <Button
                            onClick={() => handleAddPinToDay(pin.id, pin.title)}
                            disabled={isAdding}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            {isAdding ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <Plus className="h-4 w-4 mr-2" />
                            )}
                            Add to Day
                          </Button>
                        </div>
                      </div>

                      {/* Pin Info */}
                      <div className="p-3">
                        <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                          {pin.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                          <MapPinIcon className="h-3 w-3 shrink-0" />
                          <span className="line-clamp-1">{pin.location}</span>
                        </div>
                        {pin.category && (
                          <Badge variant="secondary" className="text-xs">
                            {pin.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <MapPinIcon className="h-12 w-12 text-muted-foreground/50 mb-4 shrink-0" />
              <h3 className="font-semibold mb-2">
                {searchQuery ? "No Pins Found" : "No Pins in This Board"}
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                {searchQuery
                  ? "Try a Different Search Term"
                  : "Add Pins to This Board First to Add Them to Your Timeline"}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
