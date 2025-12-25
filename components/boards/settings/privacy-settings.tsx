"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, Globe, Users2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const visibilityOptions = {
  PRIVATE: {
    icon: Lock,
    label: "Private",
    emoji: "🔒",
    description: "Only you can see this board",
    detail: "Your board is completely private. No one else can find or view it.",
  },
  PUBLIC: {
    icon: Globe,
    label: "Public",
    emoji: "🌍",
    description: "Anyone can discover and view",
    detail: "Your board is visible to everyone and can be discovered in search.",
  },
  SHARED: {
    icon: Users2,
    label: "Shared",
    emoji: "🫶",
    description: "Invite-only access",
    detail: "Only people you invite can view this board. Hidden from public discovery.",
  },
};

interface PrivacySettingsProps {
  board: any;
}

export function PrivacySettings({ board }: PrivacySettingsProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [visibility, setVisibility] = useState(board.visibility);
  const [allowIndexing, setAllowIndexing] = useState(
    visibility === "PUBLIC"
  );
  const [allowSharing, setAllowSharing] = useState(true);
  const [showFollowers, setShowFollowers] = useState(true);
  const [showSaves, setShowSaves] = useState(true);

  const handleSave = async () => {
    setSaving(true);

    try {
      const response = await fetch(`/api/boards/${board.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visibility,
        }),
      });

      if (response.ok) {
        toast.success("Privacy settings updated");
        router.refresh();
      } else {
        throw new Error("Failed to update");
      }
    } catch (error) {
      console.error("Failed to update privacy settings:", error);
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
          Privacy & Visibility
        </h2>
        <p className="text-sm text-muted-foreground">
          Control who can see and interact with your board
        </p>
      </div>

      <div className="space-y-6">
        {/* Visibility Options */}
        <div className="space-y-4">
          <Label>Board Visibility</Label>
          <RadioGroup value={visibility} onValueChange={setVisibility}>
            {Object.entries(visibilityOptions).map(([key, option]) => {
              const Icon = option.icon;
              const isSelected = visibility === key;

              return (
                <label
                  key={key}
                  htmlFor={`visibility-${key}`}
                  className={cn(
                    "flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border/40 hover:border-border hover:bg-accent/50"
                  )}
                >
                  <RadioGroupItem
                    value={key}
                    id={`visibility-${key}`}
                    className="mt-1"
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span className="font-semibold">{option.label}</span>
                      <span>{option.emoji}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                    <p className="text-xs text-muted-foreground/75">
                      {option.detail}
                    </p>
                  </div>
                </label>
              );
            })}
          </RadioGroup>
        </div>

        {/* Discovery Settings */}
        {visibility === "PUBLIC" && (
          <div className="space-y-4 p-4 rounded-xl bg-muted/50 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="allow-indexing">Allow Board Indexing</Label>
                <p className="text-xs text-muted-foreground">
                  Let this board appear in SceneSavvy discovery and search results
                </p>
              </div>
              <Switch
                id="allow-indexing"
                checked={allowIndexing}
                onCheckedChange={setAllowIndexing}
              />
            </div>
          </div>
        )}

        {/* Sharing Settings */}
        <div className="space-y-4 p-4 rounded-xl border border-border/40">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="allow-sharing">Enable Sharing Link</Label>
              <p className="text-xs text-muted-foreground">
                Allow others to share this board via link
              </p>
            </div>
            <Switch
              id="allow-sharing"
              checked={allowSharing}
              onCheckedChange={setAllowSharing}
              disabled={visibility === "PRIVATE"}
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border/40">
            <div className="space-y-1">
              <Label htmlFor="show-followers">Show Followers Count</Label>
              <p className="text-xs text-muted-foreground">
                Display how many people follow this board
              </p>
            </div>
            <Switch
              id="show-followers"
              checked={showFollowers}
              onCheckedChange={setShowFollowers}
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border/40">
            <div className="space-y-1">
              <Label htmlFor="show-saves">Show Saves Publicly</Label>
              <p className="text-xs text-muted-foreground">
                Let others see how many people saved this board
              </p>
            </div>
            <Switch
              id="show-saves"
              checked={showSaves}
              onCheckedChange={setShowSaves}
            />
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <p className="text-sm text-blue-700 dark:text-blue-400">
            💡 <span className="font-medium">Privacy Tip:</span> You can always
            change these settings later. Your data remains secure regardless of
            visibility settings.
          </p>
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
