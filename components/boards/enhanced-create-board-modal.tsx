"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { Loader2, Upload, X, Palette } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { uploadImage } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const createBoardSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  subtitle: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  category: z.enum(["DREAM", "PLANNING", "COMPLETED"]),
  themeColor: z
    .enum([
      "TRAVEL_BLUE",
      "EXPLORER_TEAL",
      "CORAL_ADVENTURE",
      "GOLD_LUXURY",
      "MINIMAL_SLATE",
    ])
    .optional(),
});

type CreateBoardFormData = z.infer<typeof createBoardSchema>;

interface EnhancedCreateBoardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBoardCreated?: (board: any) => void;
}

const themeColors = [
  { value: "TRAVEL_BLUE", color: "bg-blue-500", label: "Travel Blue" },
  { value: "EXPLORER_TEAL", color: "bg-teal-500", label: "Explorer Teal" },
  {
    value: "CORAL_ADVENTURE",
    color: "bg-orange-500",
    label: "Coral Adventure",
  },
  { value: "GOLD_LUXURY", color: "bg-yellow-500", label: "Gold Luxury" },
  { value: "MINIMAL_SLATE", color: "bg-slate-500", label: "Minimal Slate" },
];

export function EnhancedCreateBoardModal({
  open,
  onOpenChange,
  onBoardCreated,
}: EnhancedCreateBoardModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [coverType, setCoverType] = useState<"theme" | "image" | "auto">(
    "theme"
  );
  const [selectedTheme, setSelectedTheme] = useState("TRAVEL_BLUE");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateBoardFormData>({
    resolver: zodResolver(createBoardSchema),
    defaultValues: {
      category: "DREAM",
      themeColor: "TRAVEL_BLUE",
    },
  });

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: CreateBoardFormData) => {
    setIsSubmitting(true);

    try {
      let coverImageUrl = null;

      // Upload cover image if selected
      if (coverType === "image" && coverFile) {
        coverImageUrl = await uploadImage(
          coverFile,
          "vlogger-images",
          "board-covers"
        );
      }

      const response = await fetch("/api/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          visibility: isPrivate ? "PRIVATE" : "PUBLIC",
          themeColor: coverType === "theme" ? selectedTheme : data.themeColor,
          coverImage: coverImageUrl,
          autoGenCover: coverType === "auto",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create board");
      }

      const board = await response.json();

      if (onBoardCreated) {
        onBoardCreated(board);
      }

      router.refresh();
      toast.success("Board created successfully! 🎉");
      reset();
      setIsPrivate(false);
      setCoverType("theme");
      setCoverFile(null);
      setCoverPreview(null);
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating board:", error);
      toast.error("Failed to create board. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-150 max-h-[90vh] overflow-y-auto rounded-xl hide-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create New Board</DialogTitle>
          <DialogDescription>
            Design your travel board with custom themes and covers
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Board Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., European Summer Adventures"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Subtitle */}
          <div className="space-y-2">
            <Label htmlFor="subtitle">Mood Tagline</Label>
            <Input
              id="subtitle"
              placeholder="e.g., Sun, sea, and cobblestone streets"
              {...register("subtitle")}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What's this board about?"
              rows={3}
              {...register("description")}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">
              Category <span className="text-destructive">*</span>
            </Label>
            <Select
              onValueChange={(value) =>
                setValue(
                  "category",
                  value as "DREAM" | "PLANNING" | "COMPLETED"
                )
              }
              defaultValue="DREAM"
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DREAM">
                  <div className="flex items-center gap-2">
                    <span>🌠</span>
                    <span>Dream - Places to visit someday</span>
                  </div>
                </SelectItem>
                <SelectItem value="PLANNING">
                  <div className="flex items-center gap-2">
                    <span>🗺️</span>
                    <span>Planning - Actively planning</span>
                  </div>
                </SelectItem>
                <SelectItem value="COMPLETED">
                  <div className="flex items-center gap-2">
                    <span>🎉</span>
                    <span>Completed - Already visited</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Cover Type Selection */}
          <div className="space-y-3">
            <Label>Board Cover</Label>
            <RadioGroup
              value={coverType}
              onValueChange={(v) => setCoverType(v as any)}
            >
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border/40 cursor-pointer hover:bg-accent/5">
                <RadioGroupItem value="theme" id="theme" />
                <Label htmlFor="theme" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    <span>Theme Color</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Use a beautiful color theme
                  </p>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border/40 cursor-pointer hover:bg-accent/5">
                <RadioGroupItem value="image" id="image" />
                <Label htmlFor="image" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    <span>Upload Image</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Custom Cover Photo
                  </p>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border/40 cursor-pointer hover:bg-accent/5">
                <RadioGroupItem value="auto" id="auto" />
                <Label htmlFor="auto" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">✨</span>
                    <span>Auto-Generate</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Create Mosaic From Your First 3 Pins
                  </p>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Theme Color Picker */}
          {coverType === "theme" && (
            <div className="space-y-3">
              <Label>Choose Theme Color</Label>
              <div className="grid grid-cols-5 gap-3">
                {themeColors.map((theme) => (
                  <button
                    key={theme.value}
                    type="button"
                    onClick={() => setSelectedTheme(theme.value)}
                    className={cn(
                      "relative h-16 rounded-lg border-2 transition-all hover:scale-105",
                      selectedTheme === theme.value
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border/40"
                    )}
                  >
                    <div
                      className={cn("w-full h-full rounded-md", theme.color)}
                    />
                    {selectedTheme === theme.value && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-6 w-6 rounded-full bg-white/90 flex items-center justify-center">
                          <span className="text-sm">✓</span>
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Image Upload */}
          {coverType === "image" && (
            <div className="space-y-3">
              {coverPreview ? (
                <div className="relative">
                  <Image
                    src={coverPreview}
                    alt="Cover preview"
                    width={560}
                    height={200}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setCoverFile(null);
                      setCoverPreview(null);
                    }}
                    className="absolute top-2 right-2 h-8 w-8 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-lg hover:bg-destructive/90"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label htmlFor="cover-upload" className="block">
                  <input
                    id="cover-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleCoverChange}
                    className="hidden"
                  />
                  <div className="border-2 border-dashed border-border/40 rounded-lg p-8 text-center cursor-pointer hover:bg-accent/5 transition-colors">
                    <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm font-medium">
                      Click to Upload Cover Image
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG up to 10MB
                    </p>
                  </div>
                </label>
              )}
            </div>
          )}

          {/* Privacy Toggle */}
          <div className="flex items-center justify-between rounded-lg border border-border/40 p-3">
            <div className="space-y-0.5">
              <Label htmlFor="private" className="text-sm">
                Private Board
              </Label>
              <p className="text-sm text-muted-foreground">
                Only You Can See This Board
              </p>
            </div>
            <Switch
              id="private"
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Board"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
