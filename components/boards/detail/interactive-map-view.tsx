"use client";

import { useState, useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  MapPin,
  Filter,
  Route,
  Layers,
  Star,
  HelpCircle,
  RotateCcw,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Pin {
  id: string;
  title: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  category: string;
  costLevel: string | null;
  images: { url: string }[];
  relevance?: string | null;
  tags?: { tag: { name: string } }[];
}

interface InteractiveMapViewProps {
  pins: Pin[];
}

const relevanceConfig = {
  MUST_VISIT: {
    icon: Star,
    label: "Must Visit",
    emoji: "⭐",
    color: "#eab308",
  },
  MAYBE: {
    icon: HelpCircle,
    label: "Maybe",
    emoji: "🤔",
    color: "#3b82f6",
  },
  BACKUP: {
    icon: RotateCcw,
    label: "Backup",
    emoji: "🔄",
    color: "#6b7280",
  },
};

const costLevelConfig = {
  FREE: { label: "Free", color: "#10b981" },
  BUDGET: { label: "Budget £", color: "#84cc16" },
  MODERATE: { label: "Moderate ££", color: "#f59e0b" },
  LUXURY: { label: "Luxury £££", color: "#ef4444" },
};

export function InteractiveMapView({ pins }: InteractiveMapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  const [satelliteView, setSatelliteView] = useState(false);
  const [showRoute, setShowRoute] = useState(false);
  const [relevanceFilter, setRelevanceFilter] = useState<string>("all");
  const [costFilter, setCostFilter] = useState<string>("all");
  const [tagFilter, setTagFilter] = useState<string>("all");

  // Extract all unique tags
  const allTags = Array.from(
    new Set(pins.flatMap((pin) => pin.tags?.map((t) => t.tag.name) || []))
  );

  // Filter pins based on selected filters
  const filteredPins = pins.filter((pin) => {
    if (!pin.latitude || !pin.longitude) return false;

    if (relevanceFilter !== "all" && pin.relevance !== relevanceFilter) {
      return false;
    }

    if (costFilter !== "all" && pin.costLevel !== costFilter) {
      return false;
    }

    if (tagFilter !== "all") {
      const hasTags = pin.tags?.some((t) => t.tag.name === tagFilter);
      if (!hasTags) return false;
    }

    return true;
  });

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clear existing map
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    if (filteredPins.length === 0) return;

    // Calculate bounds for all pins
    const bounds = new maplibregl.LngLatBounds();
    filteredPins.forEach((pin) => {
      if (pin.latitude && pin.longitude) {
        bounds.extend([pin.longitude, pin.latitude]);
      }
    });

    // Initialize map
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: satelliteView
        ? "https://api.maptiler.com/maps/hybrid/style.json?key=X8chXEtN8gGlWO2Km6HQ"
        : "https://api.maptiler.com/maps/streets-v2/style.json?key=X8chXEtN8gGlWO2Km6HQ",
      bounds: bounds,
      fitBoundsOptions: { padding: 100 },
    });

    map.on("load", () => {
      // Add markers for each pin
      filteredPins.forEach((pin, index) => {
        if (!pin.latitude || !pin.longitude) return;

        // Create custom marker element
        const el = document.createElement("div");
        el.style.cursor = "pointer";

        // Determine marker color based on relevance
        let markerColor = "#4169E1"; // Default blue
        if (pin.relevance === "MUST_VISIT") {
          markerColor = relevanceConfig.MUST_VISIT.color;
        } else if (pin.relevance === "MAYBE") {
          markerColor = relevanceConfig.MAYBE.color;
        } else if (pin.relevance === "BACKUP") {
          markerColor = relevanceConfig.BACKUP.color;
        }

        el.innerHTML = `
          <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            animation: bounce 2s ease-in-out ${index * 0.1}s 1;
          ">
            <div style="
              position: relative;
              width: 40px;
              height: 40px;
              background-color: ${markerColor};
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
              border: 3px solid white;
            ">
              <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(45deg);
                color: white;
                font-weight: bold;
                font-size: 18px;
              ">${index + 1}</div>
            </div>
          </div>
        `;

        // Create popup
        const popup = new maplibregl.Popup({ offset: 25, closeButton: false })
          .setHTML(`
          <div style="padding: 8px; max-width: 200px;">
            ${
              pin.images[0]
                ? `<img src="${pin.images[0].url}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />`
                : ""
            }
            <h3 style="font-weight: 600; margin-bottom: 4px; font-size: 14px; color: #1a1a1a;">${
              pin.title
            }</h3>
            <p style="font-size: 12px; color: #666; margin-bottom: 4px;">${
              pin.location
            }</p>
            ${
              pin.relevance
                ? `<div style="margin-top: 4px;"><span style="font-size: 12px; background: ${
                    relevanceConfig[
                      pin.relevance as keyof typeof relevanceConfig
                    ]?.color
                  }20; color: ${
                    relevanceConfig[
                      pin.relevance as keyof typeof relevanceConfig
                    ]?.color
                  }; padding: 2px 8px; border-radius: 12px; font-weight: 500;">${
                    relevanceConfig[
                      pin.relevance as keyof typeof relevanceConfig
                    ]?.emoji
                  } ${
                    relevanceConfig[
                      pin.relevance as keyof typeof relevanceConfig
                    ]?.label
                  }</span></div>`
                : ""
            }
          </div>
        `);

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([pin.longitude, pin.latitude])
          .setPopup(popup)
          .addTo(map);

        markersRef.current.push(marker);

        // Open popup on hover
        el.addEventListener("mouseenter", () => marker.togglePopup());
        el.addEventListener("mouseleave", () => marker.togglePopup());
      });

      // Draw route if enabled
      if (showRoute && filteredPins.length >= 2) {
        const coordinates = filteredPins
          .filter((p) => p.latitude && p.longitude)
          .map((p) => [p.longitude!, p.latitude!]);

        // Add route layer
        if (!map.getSource("route")) {
          map.addSource("route", {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: {
                type: "LineString",
                coordinates: coordinates,
              },
            },
          });

          map.addLayer({
            id: "route",
            type: "line",
            source: "route",
            layout: {
              "line-join": "round",
              "line-cap": "round",
            },
            paint: {
              "line-color": "#4169E1",
              "line-width": 4,
              "line-opacity": 0.6,
              "line-dasharray": [2, 2],
            },
          });
        }
      }

      // Add navigation controls
      map.addControl(new maplibregl.NavigationControl(), "top-right");
      map.addControl(new maplibregl.FullscreenControl(), "top-right");
    });

    mapRef.current = map;

    // Add CSS for bounce animation
    const style = document.createElement("style");
    style.textContent = `
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
    `;
    document.head.appendChild(style);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [filteredPins, satelliteView, showRoute]);

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="rounded-xl border border-border/40 bg-card p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Map Style Toggle */}
          <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-2">
            <Layers className="h-4 w-4 text-primary" />
            <Label
              htmlFor="satellite"
              className="text-sm font-medium cursor-pointer"
            >
              {satelliteView ? "Satellite" : "Street"}
            </Label>
            <Switch
              id="satellite"
              checked={satelliteView}
              onCheckedChange={setSatelliteView}
            />
          </div>

          {/* Route Toggle */}
          <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-2">
            <Route className="h-4 w-4 text-primary" />
            <Label
              htmlFor="route"
              className="text-sm font-medium cursor-pointer"
            >
              Show Route
            </Label>
            <Switch
              id="route"
              checked={showRoute}
              onCheckedChange={setShowRoute}
            />
          </div>

          {/* Relevance Filter */}
          <Select value={relevanceFilter} onValueChange={setRelevanceFilter}>
            <SelectTrigger className="w-45">
              <SelectValue placeholder="Filter by Relevance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Relevance</SelectItem>
              <SelectItem value="MUST_VISIT">⭐ Must Visit</SelectItem>
              <SelectItem value="MAYBE">🤔 Maybe</SelectItem>
              <SelectItem value="BACKUP">🔄 Backup</SelectItem>
            </SelectContent>
          </Select>

          {/* Cost Filter */}
          <Select value={costFilter} onValueChange={setCostFilter}>
            <SelectTrigger className="w-45">
              <SelectValue placeholder="Filter by Cost" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cost Levels</SelectItem>
              <SelectItem value="FREE">Free</SelectItem>
              <SelectItem value="BUDGET">Budget £</SelectItem>
              <SelectItem value="MODERATE">Moderate ££</SelectItem>
              <SelectItem value="LUXURY">Luxury £££</SelectItem>
            </SelectContent>
          </Select>

          {/* Tag Filter */}
          {allTags.length > 0 && (
            <Select value={tagFilter} onValueChange={setTagFilter}>
              <SelectTrigger className="w-45">
                <SelectValue placeholder="Filter by Tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {allTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    #{tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Results Count */}
          <div className="ml-auto">
            <Badge variant="secondary" className="text-sm">
              <MapPin className="h-3 w-3 mr-1" />
              {filteredPins.length} /{" "}
              {pins.filter((p) => p.latitude && p.longitude).length} Pins
            </Badge>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative rounded-xl overflow-hidden border border-border/40 h-150 bg-muted">
        {filteredPins.length > 0 ? (
          <div ref={mapContainerRef} className="w-full h-full" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-8">
            <Filter className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              No Pins Match Your Filters
            </h3>
            <p className="text-muted-foreground max-w-md">
              Try Adjusting Your Filters to See More Destinations on the Map
            </p>
          </div>
        )}
      </div>

      {/* Legend */}
      {filteredPins.length > 0 && (
        <div className="rounded-xl border border-border/40 bg-card p-4">
          <h3 className="text-sm font-semibold mb-3">Legend</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Object.entries(relevanceConfig).map(([key, config]) => (
              <div key={key} className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full border-2 border-white shadow-md"
                  style={{ backgroundColor: config.color }}
                />
                <span className="text-xs">
                  {config.emoji} {config.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
