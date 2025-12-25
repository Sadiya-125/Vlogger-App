"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload, RefreshCw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const themeColors = {
  TRAVEL_BLUE: {
    label: "Travel Blue",
    gradient: "from-blue-500 to-cyan-500",
    color: "#3b82f6",
  },
  EXPLORER_TEAL: {
    label: "Explorer Teal",
    gradient: "from-teal-500 to-emerald-500",
    color: "#14b8a6",
  },
  CORAL_ADVENTURE: {
    label: "Coral Adventure",
    gradient: "from-orange-500 to-pink-500",
    color: "#f97316",
  },
  GOLD_LUXURY: {
    label: "Gold Luxury",
    gradient: "from-amber-500 to-yellow-500",
    color: "#f59e0b",
  },
  MINIMAL_SLATE: {
    label: "Minimal Slate",
    gradient: "from-slate-500 to-zinc-500",
    color: "#64748b",
  },
};

const layoutModes = {
  MASONRY: { label: "Masonry", description: "Pinterest-style waterfall" },
  GRID: { label: "Grid", description: "Uniform grid layout" },
  TIMELINE: { label: "Timeline", description: "Chronological trip view" },
  MAP: { label: "Map", description: "Geographic visualization" },
};

interface AppearanceSettingsProps {
  board: any;
}

export function AppearanceSettings({ board }: AppearanceSettingsProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [selectedColor, setSelectedColor] = useState(board.themeColor);
  const [autoGenCover, setAutoGenCover] = useState(board.autoGenCover);
  const [layoutMode, setLayoutMode] = useState(board.layoutMode);

  const handleSave = async () => {
    setSaving(true);

    try {
      const response = await fetch(`/api/boards/${board.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          themeColor: selectedColor,
          autoGenCover,
          layoutMode,
        }),
      });

      if (response.ok) {
        toast.success("Appearance settings updated");
        router.refresh();
      } else {
        throw new Error("Failed to update");
      }
    } catch (error) {
      console.error("Failed to update appearance settings:", error);
      toast.error("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight mb-2">
          Appearance
        </h2>
        <p className="text-sm text-muted-foreground">
          Customize how your board looks and feels
        </p>
      </div>

      <div className="space-y-6">
        {/* Theme Color Selector */}
        <div className="space-y-3">
          <Label>Theme Color</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(themeColors).map(([key, theme]) => {
              const isSelected = selectedColor === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedColor(key)}
                  className={cn(
                    "relative p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105",
                    isSelected
                      ? "border-primary shadow-lg"
                      : "border-border/40 hover:border-border"
                  )}
                >
                  <div
                    className={cn(
                      "h-20 rounded-lg bg-linear-to-br mb-3",
                      theme.gradient
                    )}
                  />
                  <div className="text-sm font-medium">{theme.label}</div>
                  {isSelected && (
                    <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-3.5 w-3.5 text-primary-foreground" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Cover Image Management */}
        <div className="space-y-4 p-4 rounded-xl bg-muted/50">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Cover Image</Label>
              <p className="text-xs text-muted-foreground">
                Current: {board.coverImage ? "Custom image" : "Auto-generated"}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
              {board.coverImage && (
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border/40">
            <div className="space-y-1">
              <Label htmlFor="auto-gen-cover">Auto-Generate Cover</Label>
              <p className="text-xs text-muted-foreground">
                Create Mosaic From First 3 Pins
              </p>
            </div>
            <Switch
              id="auto-gen-cover"
              checked={autoGenCover}
              onCheckedChange={setAutoGenCover}
            />
          </div>
        </div>

        {/* Default Layout Mode */}
        <div className="space-y-3">
          <Label>Default Layout Mode</Label>
          <Select value={layoutMode} onValueChange={setLayoutMode}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(layoutModes).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  <div>
                    <div className="font-medium">{config.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {config.description}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Live Preview */}
        <div className="space-y-3 p-4 rounded-xl bg-muted/50">
          <Label>Preview</Label>
          <div className="aspect-video rounded-lg bg-background border border-border/40 overflow-hidden">
            <div
              className={cn(
                "h-24 bg-linear-to-br",
                themeColors[selectedColor as keyof typeof themeColors].gradient
              )}
            />
            <div className="p-4 space-y-2">
              <div className="h-4 bg-muted rounded w-2/3" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-border/40">
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
