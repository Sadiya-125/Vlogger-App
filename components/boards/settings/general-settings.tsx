"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, Hash, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const boardCategories = {
  DREAM: {
    label: "Dream",
    emoji: "✨",
    description: "Aspirational Destinations",
  },
  PLANNING: {
    label: "Planning",
    emoji: "📋",
    description: "Currently Planning",
  },
  COMPLETED: { label: "Completed", emoji: "✅", description: "Visited Places" },
};

const tripCategories = {
  BACKPACKING: { label: "Backpacking", emoji: "🎒" },
  LUXURY: { label: "Luxury", emoji: "💎" },
  SOLO: { label: "Solo", emoji: "🚶" },
  GROUP: { label: "Group", emoji: "👥" },
  COUPLES: { label: "Couples", emoji: "💑" },
  NATURE: { label: "Nature", emoji: "🌲" },
  CITY: { label: "City", emoji: "🏙️" },
  FOOD: { label: "Food", emoji: "🍜" },
  FESTIVALS: { label: "Festivals", emoji: "🎉" },
  HIDDEN_GEMS: { label: "Hidden Gems", emoji: "💎" },
};

const generalSchema = z.object({
  name: z.string().min(1, "Board title is required").max(100),
  subtitle: z.string().max(150).optional(),
  description: z.string().max(500).optional(),
  category: z.enum(["DREAM", "PLANNING", "COMPLETED"]),
  tripCategory: z
    .enum([
      "BACKPACKING",
      "LUXURY",
      "SOLO",
      "GROUP",
      "COUPLES",
      "NATURE",
      "CITY",
      "FOOD",
      "FESTIVALS",
      "HIDDEN_GEMS",
    ])
    .optional(),
});

type GeneralFormData = z.infer<typeof generalSchema>;

interface GeneralSettingsProps {
  board: any;
}

export function GeneralSettings({ board }: GeneralSettingsProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [hashtags, setHashtags] = useState<string[]>(board.hashtags || []);
  const [newHashtag, setNewHashtag] = useState("");

  const form = useForm<GeneralFormData>({
    resolver: zodResolver(generalSchema),
    defaultValues: {
      name: board.name,
      subtitle: board.subtitle || "",
      description: board.description || "",
      category: board.category,
      tripCategory: board.tripCategory || undefined,
    },
  });

  const onSubmit = async (data: GeneralFormData) => {
    setSaving(true);

    try {
      const response = await fetch(`/api/boards/${board.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          hashtags,
        }),
      });

      if (response.ok) {
        toast.success("General settings updated");
        router.refresh();
      } else {
        throw new Error("Failed to update");
      }
    } catch (error) {
      console.error("Failed to update general settings:", error);
      toast.error("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  const addHashtag = () => {
    const tag = newHashtag.trim().replace(/^#/, "");
    if (tag && !hashtags.includes(tag)) {
      setHashtags([...hashtags, tag]);
      setNewHashtag("");
    }
  };

  const removeHashtag = (tag: string) => {
    setHashtags(hashtags.filter((t) => t !== tag));
  };

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight mb-2">
          General Settings
        </h2>
        <p className="text-sm text-muted-foreground">
          Customize your board's basic information and categorization
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Board Title */}
        <div className="space-y-2">
          <Label htmlFor="name">Board Title</Label>
          <Input
            id="name"
            placeholder="My Dream Europe Trip"
            {...form.register("name")}
          />
          {form.formState.errors.name && (
            <p className="text-sm text-destructive">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        {/* Subtitle */}
        <div className="space-y-2">
          <Label htmlFor="subtitle">Subtitle (Mood Tagline)</Label>
          <Input
            id="subtitle"
            placeholder="A journey through history, culture, and cuisine"
            {...form.register("subtitle")}
          />
          <p className="text-xs text-muted-foreground">
            A short phrase that captures the essence of this board
          </p>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="This Board is a Collection of Must-Visit Destinations Across Europe..."
            rows={4}
            {...form.register("description")}
          />
          <p className="text-xs text-muted-foreground">
            Tell Others What this Board is About
          </p>
        </div>

        {/* Board Category */}
        <div className="space-y-2">
          <Label>Board Category</Label>
          <Select
            value={form.watch("category")}
            onValueChange={(value: any) => form.setValue("category", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(boardCategories).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <span>{config.emoji}</span>
                    <div>
                      <div className="font-medium">{config.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {config.description}
                      </div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Trip Category */}
        <div className="space-y-2">
          <Label>Trip Category (Optional)</Label>
          <Select
            value={form.watch("tripCategory") || ""}
            onValueChange={(value: any) =>
              form.setValue("tripCategory", value || undefined)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a trip type..." />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(tripCategories).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <span>{config.emoji}</span>
                    <span>{config.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Hashtags */}
        <div className="space-y-3">
          <Label>Hashtags</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Add a hashtag..."
                value={newHashtag}
                onChange={(e) => setNewHashtag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addHashtag();
                  }
                }}
                className="pl-10"
              />
            </div>
            <Button type="button" variant="outline" onClick={addHashtag}>
              Add
            </Button>
          </div>

          {hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {hashtags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="gap-1.5 pl-3 pr-2 py-1.5"
                >
                  <span>#{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeHashtag(tag)}
                    className="hover:bg-background/50 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-border/40">
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
