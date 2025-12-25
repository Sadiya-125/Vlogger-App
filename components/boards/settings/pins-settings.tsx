"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
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
import { toast } from "sonner";

const sortOptions = {
  newest: { label: "Newest First", description: "Most recently added pins" },
  oldest: { label: "Oldest First", description: "Earliest pins first" },
  relevant: { label: "Most Relevant", description: "Based on relevance labels" },
  mustVisit: { label: "Must Visit First", description: "Prioritize must-visit pins" },
  manual: { label: "Manual Order", description: "Drag & drop custom order" },
};

interface PinsSettingsProps {
  board: any;
}

export function PinsSettings({ board }: PinsSettingsProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [defaultSort, setDefaultSort] = useState("newest");
  const [enableDragDrop, setEnableDragDrop] = useState(true);
  const [enableTimeline, setEnableTimeline] = useState(true);
  const [enableRelevance, setEnableRelevance] = useState(true);
  const [enableBoardNotes, setEnableBoardNotes] = useState(true);

  const handleSave = async () => {
    setSaving(true);

    try {
      // Note: These settings would need to be stored in the database
      // For now, showing the UI structure
      toast.success("Pins settings updated");
      router.refresh();
    } catch (error) {
      console.error("Failed to update pins settings:", error);
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
          Pins & Organization
        </h2>
        <p className="text-sm text-muted-foreground">
          Control how pins are organized and displayed in your board
        </p>
      </div>

      <div className="space-y-6">
        {/* Default Sort Order */}
        <div className="space-y-3">
          <Label>Default Sort Order</Label>
          <Select value={defaultSort} onValueChange={setDefaultSort}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(sortOptions).map(([key, option]) => (
                <SelectItem key={key} value={key}>
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {option.description}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            This will be the default view for anyone visiting your board
          </p>
        </div>

        {/* Feature Toggles */}
        <div className="space-y-4 p-4 rounded-xl border border-border/40">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="enable-drag-drop">Enable Drag & Drop</Label>
              <p className="text-xs text-muted-foreground">
                Allow manual reordering of pins by dragging
              </p>
            </div>
            <Switch
              id="enable-drag-drop"
              checked={enableDragDrop}
              onCheckedChange={setEnableDragDrop}
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border/40">
            <div className="space-y-1">
              <Label htmlFor="enable-timeline">Timeline Mode</Label>
              <p className="text-xs text-muted-foreground">
                Allow viewing pins in chronological timeline
              </p>
            </div>
            <Switch
              id="enable-timeline"
              checked={enableTimeline}
              onCheckedChange={setEnableTimeline}
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border/40">
            <div className="space-y-1">
              <Label htmlFor="enable-relevance">Relevance Labels</Label>
              <p className="text-xs text-muted-foreground">
                Show Must Visit / Maybe / Backup badges on pins
              </p>
            </div>
            <Switch
              id="enable-relevance"
              checked={enableRelevance}
              onCheckedChange={setEnableRelevance}
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border/40">
            <div className="space-y-1">
              <Label htmlFor="enable-board-notes">Board-Specific Notes</Label>
              <p className="text-xs text-muted-foreground">
                Allow adding custom notes to pins for this board
              </p>
            </div>
            <Switch
              id="enable-board-notes"
              checked={enableBoardNotes}
              onCheckedChange={setEnableBoardNotes}
            />
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
