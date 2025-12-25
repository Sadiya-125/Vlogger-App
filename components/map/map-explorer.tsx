"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MapPin, Layers, Navigation } from "lucide-react";
import Link from "next/link";

interface Pin {
  id: string;
  title: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  category: string;
  description: string | null;
  images: { id: string; url: string }[];
  user: {
    id: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
  };
  tags: { tag: { name: string } }[];
}

interface MapExplorerProps {
  pins: Pin[];
  filterTag?: string;
}

// Category color mapping
const categoryColors: Record<string, { primary: string; gradient: string }> = {
  Adventure: { primary: "#FF6B6B", gradient: "linear-gradient(to right, #FF6B6B, #FF8E53)" },
  Beach: { primary: "#4ECDC4", gradient: "linear-gradient(to right, #4ECDC4, #44A08D)" },
  City: { primary: "#4169E1", gradient: "linear-gradient(to right, #4169E1, #4FB2A2)" },
  Culture: { primary: "#9B59B6", gradient: "linear-gradient(to right, #9B59B6, #C44569)" },
  Food: { primary: "#F39C12", gradient: "linear-gradient(to right, #F39C12, #E67E22)" },
  Luxury: { primary: "#FFD700", gradient: "linear-gradient(to right, #FFD700, #FFA500)" },
  Nature: { primary: "#2ECC71", gradient: "linear-gradient(to right, #2ECC71, #27AE60)" },
  Budget: { primary: "#3498DB", gradient: "linear-gradient(to right, #3498DB, #2980B9)" },
  Mountain: { primary: "#8B4513", gradient: "linear-gradient(to right, #8B4513, #A0522D)" },
  Historical: { primary: "#95A5A6", gradient: "linear-gradient(to right, #95A5A6, #7F8C8D)" },
};

const getColorForCategory = (category: string) => {
  return categoryColors[category] || { primary: "#4169E1", gradient: "linear-gradient(to right, #4169E1, #4FB2A2)" };
};

export function MapExplorer({ pins, filterTag }: MapExplorerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [satelliteView, setSatelliteView] = useState(false);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  const validPins = pins.filter(
    (p) => p.latitude !== null && p.longitude !== null
  );

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clear existing markers first
    markersRef.current.forEach((marker) => {
      try {
        marker.remove();
      } catch (e) {
        // Ignore
      }
    });
    markersRef.current = [];

    // Remove existing map
    if (mapRef.current) {
      try {
        mapRef.current.remove();
      } catch (e) {
        // Ignore
      }
      mapRef.current = null;
    }

    // Create new map
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: satelliteView
        ? "https://api.maptiler.com/maps/hybrid/style.json?key=X8chXEtN8gGlWO2Km6HQ"
        : "https://api.maptiler.com/maps/streets-v2/style.json?key=X8chXEtN8gGlWO2Km6HQ",
      center: [0, 20],
      zoom: 2,
    });

    map.on("load", () => {
      map.addControl(new maplibregl.NavigationControl(), "top-right");

      // Add markers
      validPins.forEach((pin) => {
        const colors = getColorForCategory(pin.category);
        const markerEl = document.createElement("div");
        markerEl.className = "custom-marker";
        markerEl.innerHTML = `
          <div class="relative group cursor-pointer">
            <div class="absolute -inset-1.5 rounded-full blur-md opacity-75 group-hover:opacity-100 transition duration-300" style="background: ${colors.gradient};"></div>
            <div class="relative rounded-full shadow-xl flex items-center justify-center transform transition-all duration-300 group-hover:scale-110" style="background-color: ${colors.primary}; height: 3rem; width: 3rem;">
              <svg class="text-white" fill="currentColor" viewBox="0 0 24 24" style="height: 1.75rem; width: 1.75rem;">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
          </div>
        `;

        const marker = new maplibregl.Marker({
          element: markerEl,
          anchor: "bottom",
        })
          .setLngLat([pin.longitude!, pin.latitude!])
          .addTo(map);

        // Create popup content
        const popupContent = document.createElement("div");
        popupContent.className = "p-0";
        const isDark = document.documentElement.classList.contains("dark");
        const bgColor = isDark ? "#161b22" : "#ffffff";
        const textColor = isDark ? "#ffffff" : "#111111";
        const mutedColor = isDark ? "#c7ccd6" : "#555a63";

        popupContent.innerHTML = `
          <div style="width: 16rem; overflow: hidden; border-radius: 0.75rem; background-color: ${bgColor}; box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1); font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
            <img
              src="${pin.images[0]?.url || "/placeholder.jpg"}"
              alt="${pin.title}"
              style="width: 100%; height: 8rem; object-fit: cover;"
            />
            <div style="padding: 1rem;">
              <div style="display: flex; align-items: start; justify-content: space-between; margin-bottom: 0.5rem;">
                <h3 style="margin-top: 4px; font-weight: 600; font-size: 1rem; color: ${textColor}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; font-family: 'Inter', sans-serif;">${
          pin.title
        }</h3>
                <span style="padding: 0.25rem 0.625rem; font-size: 0.85rem; font-weight: 500; border-radius: 9999px; background-color: ${colors.primary}20; color: ${colors.primary}; margin-left: 0.5rem; font-family: 'Inter', sans-serif;">
                  ${pin.category}
                </span>
              </div>
              <p style="font-size: 0.875rem; color: ${mutedColor}; display: flex; align-items: center; gap: 0.375rem; margin-bottom: 0.75rem; font-family: 'Inter', sans-serif;">
                ${pin.location}
              </p>
              ${
                pin.description
                  ? `<p style="font-size: 0.875rem; color: ${mutedColor}; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; margin-bottom: 0.75rem; font-family: 'Inter', sans-serif;">${pin.description}</p>`
                  : ""
              }
              <a
                href="/pins/${pin.id}"
                style="display: block; width: 100%; margin-top: 0.75rem; padding: 0.625rem 1rem; background-color: ${colors.primary}; color: white; border-radius: 0.5rem; font-size: 0.875rem; font-weight: 500; text-align: center; text-decoration: none; transition: background-color 0.2s; font-family: 'Inter', sans-serif;"
                onmouseover="this.style.opacity='0.9'"
                onmouseout="this.style.opacity='1'"
              >
                View Details
              </a>
            </div>
          </div>
        `;

        const popup = new maplibregl.Popup({
          offset: 25,
          closeButton: false,
          className: "map-popup",
        }).setDOMContent(popupContent);

        marker.setPopup(popup);
        markersRef.current.push(marker);
      });
    });

    mapRef.current = map;

    return () => {
      markersRef.current.forEach((marker) => {
        try {
          marker.remove();
        } catch (e) {
          // Ignore
        }
      });
      markersRef.current = [];

      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {
          // Ignore
        }
        mapRef.current = null;
      }
    };
  }, [satelliteView, validPins]);

  return (
    <main className="flex-1 relative">
      {/* Map Container */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

      {/* Controls Overlay */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10 space-y-3 sm:space-y-4 max-w-[calc(100vw-2rem)] sm:max-w-sm">
        {/* Title Card */}
        <div className="bg-card/95 backdrop-blur-md rounded-lg p-4 sm:p-6 shadow-xl border border-border/40">
          <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-sm bg-linear-to-br from-primary to-secondary">
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-lg sm:text-xl font-semibold tracking-tight">
                Explore Map
              </h1>
              <p className="text-sm text-muted-foreground">
                {validPins.length} Destination(s) Marked
              </p>
            </div>
          </div>
          {filterTag && (
            <div className="mb-3 pb-3 border-b border-border/40">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                Filtering by Tag:
                <span className="font-semibold">#{filterTag}</span>
              </div>
            </div>
          )}
          <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
            Discover Amazing Places Around the World. Click on Markers to Learn
            More.
          </p>
        </div>

        {/* View Toggle Card */}
        <div className="bg-card/95 backdrop-blur-md rounded-lg p-4 shadow-xl border border-border/40">
          <div className="flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-3">
              <Layers className="h-5 w-5 text-primary" />
              <Label
                htmlFor="satellite-mode"
                className="text-sm font-medium cursor-pointer"
              >
                {satelliteView ? "Satellite View" : "Street View"}
              </Label>
            </div>
            <Switch
              id="satellite-mode"
              checked={satelliteView}
              onCheckedChange={setSatelliteView}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card/95 backdrop-blur-md rounded-lg p-4 shadow-xl border border-border/40 space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => {
              if (mapRef.current) {
                mapRef.current.flyTo({
                  center: [0, 20],
                  zoom: 2,
                  duration: 1500,
                });
              }
            }}
          >
            <Navigation className="h-4 w-4 mr-2" />
            Reset View
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-10 bg-card/95 backdrop-blur-md rounded-lg p-3 sm:p-4 shadow-xl border border-border/40 max-w-70 sm:max-w-xs">
        <h3 className="text-sm sm:text-base font-semibold mb-2 sm:mb-3">
          Categories
        </h3>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 sm:gap-y-2 text-sm">
          {Object.entries(categoryColors).map(([category, colors]) => (
            <div key={category} className="flex items-center space-x-2">
              <div
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: colors.primary }}
              ></div>
              <span className="truncate">{category}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
