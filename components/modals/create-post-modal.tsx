"use client";

import { useState, useEffect } from "react";
import { Upload, Image as ImageIcon, X, Sparkles, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { LocationSearch } from "@/components/ui/location-search";
import { HashtagInput } from "@/components/ui/hashtag-input";
import { uploadImages } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const createPinSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  category: z.string().min(1, "Select a category"),
  costLevel: z.enum(["FREE", "BUDGET", "MODERATE", "LUXURY"]).optional(),
  bestTimeToVisit: z.string().optional(),
});

type CreatePinFormData = z.infer<typeof createPinSchema>;

const categories = [
  "Adventure",
  "Beach",
  "City",
  "Culture",
  "Food",
  "Luxury",
  "Nature",
  "Budget",
  "Mountain",
  "Historical",
];

const costLevels = [
  { value: "FREE", label: "Free", icon: "💚" },
  { value: "BUDGET", label: "Budget £", icon: "💵" },
  { value: "MODERATE", label: "Moderate ££", icon: "💰" },
  { value: "LUXURY", label: "Luxury £££", icon: "💎" },
] as const;

export function CreatePostModal({ open, onOpenChange }: CreatePostModalProps) {
  const router = useRouter();
  const [tags, setTags] = useState<string[]>([]);
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [latitude, setLatitude] = useState<number>();
  const [longitude, setLongitude] = useState<number>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CreatePinFormData>({
    resolver: zodResolver(createPinSchema),
  });

  const selectedCategory = watch("category");
  const selectedCostLevel = watch("costLevel");

  useEffect(() => {
    fetch("/api/tags")
      .then((res) => res.json())
      .then((data) => setTagSuggestions(data))
      .catch(console.error);
  }, []);

  const handleImageChange = (files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files).slice(0, 10 - images.length);
    const newImages = [...images, ...newFiles];
    setImages(newImages);

    // Create previews
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: CreatePinFormData) => {
    if (images.length === 0) {
      toast.error("Please add at least one image");
      return;
    }

    try {
      setIsSubmitting(true);
      // Upload images to Supabase
      const imageUrls = await uploadImages(images, "vlogger-images", "pins");

      // Create pin
      const response = await fetch("/api/pins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          latitude,
          longitude,
          tags,
          imageUrls,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to create pin");
      }

      const pin = await response.json();

      // Reset form
      reset();
      setImages([]);
      setImagePreviews([]);
      setTags([]);
      setLatitude(undefined);
      setLongitude(undefined);

      toast.success("Pin Created Successfully!", { id: "create-pin" });

      // Close modal and refresh
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("Error Creating Pin:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to Create Pin. Please Try Again.",
        { id: "create-pin" }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
        <div className="px-6 pt-6">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Create a New Pin
            </DialogTitle>
            <DialogDescription>
              Share Your Favorite Travel Destination with the Community
            </DialogDescription>
          </DialogHeader>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto px-6 pb-6 hide-scrollbar"
        >
          <div className="space-y-6 mt-4">
            {/* Image Upload */}
            <div className="space-y-4">
              <Label>Destination Photos * (Max 10)</Label>
              <div
                className={cn(
                  "border-2 border-dashed rounded-3xl p-8 text-center transition-all duration-200",
                  isDragging
                    ? "border-primary bg-primary/5 scale-[1.02]"
                    : "border-border hover:border-primary/50",
                  images.length > 0 && "p-4"
                )}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  handleImageChange(e.dataTransfer.files);
                }}
              >
                {images.length === 0 ? (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      <Upload className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        Drag and Drop Images Here
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        or Click to Browse
                      </p>
                    </div>
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleImageChange(e.target.files)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        document.getElementById("image-upload")?.click()
                      }
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Choose Files
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      {imagePreviews.map((preview, index) => (
                        <div
                          key={index}
                          className="relative aspect-square rounded-lg overflow-hidden group"
                        >
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    {images.length < 10 && (
                      <div>
                        <input
                          type="file"
                          id="add-more-images"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => handleImageChange(e.target.files)}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            document.getElementById("add-more-images")?.click()
                          }
                        >
                          <ImageIcon className="h-4 w-4 mr-2" />
                          Add More ({images.length}/10)
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="e.g., Santorini Sunset Views"
              />
              {errors.title && (
                <p className="text-sm text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label>Location *</Label>
              <LocationSearch
                value={watch("location") || ""}
                onChange={(location, lat, lon) => {
                  setValue("location", location);
                  setLatitude(lat);
                  setLongitude(lon);
                }}
              />
              {errors.location && (
                <p className="text-sm text-destructive">
                  {errors.location.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Share details about this destination, your experience, tips for travelers..."
                className="min-h-30"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Category *</Label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setValue("category", category)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium border transition-all",
                      selectedCategory === category
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    {category}
                  </button>
                ))}
              </div>
              {errors.category && (
                <p className="text-sm text-destructive">
                  {errors.category.message}
                </p>
              )}
            </div>

            {/* Cost Level */}
            <div className="space-y-2">
              <Label>Cost Level</Label>
              <div className="grid grid-cols-4 gap-2">
                {costLevels.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => setValue("costLevel", level.value as any)}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-lg border transition-all",
                      selectedCostLevel === level.value
                        ? "bg-primary/10 border-primary"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <span className="text-2xl mb-1">{level.icon}</span>
                    <span className="text-xs font-medium">{level.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Best Time to Visit */}
            <div className="space-y-2">
              <Label htmlFor="bestTimeToVisit">Best Time to Visit</Label>
              <Input
                id="bestTimeToVisit"
                {...register("bestTimeToVisit")}
                placeholder="e.g., April - October"
              />
            </div>

            {/* Hashtags */}
            <div className="space-y-2">
              <Label>Tags (Max 10)</Label>
              <HashtagInput
                value={tags}
                onChange={setTags}
                suggestions={tagSuggestions}
                maxTags={10}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Publish Pin
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
