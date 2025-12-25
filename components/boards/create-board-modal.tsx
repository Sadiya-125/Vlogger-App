"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
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

const createBoardSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  category: z.enum(["DREAM", "PLANNING", "COMPLETED"]),
  isPrivate: z.boolean().default(false),
});

type CreateBoardFormData = z.infer<typeof createBoardSchema>;

interface CreateBoardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBoardCreated?: (board: any) => void;
}

export function CreateBoardModal({
  open,
  onOpenChange,
  onBoardCreated,
}: CreateBoardModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);

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
      isPrivate: false,
    },
  });

  const onSubmit = async (data: CreateBoardFormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, isPrivate }),
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
      <DialogContent className="sm:max-w-125 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create New Board</DialogTitle>
          <DialogDescription>
            Organize your travel destinations into a collection
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-4">
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

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="What's this board about?"
              rows={3}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
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
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Dream</span>
                    <span className="text-xs text-muted-foreground">
                      Places you dream of visiting
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="PLANNING">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Planning</span>
                    <span className="text-xs text-muted-foreground">
                      Actively planning to visit
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="COMPLETED">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Completed</span>
                    <span className="text-xs text-muted-foreground">
                      Places you've already visited
                    </span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-destructive">
                {errors.category.message}
              </p>
            )}
          </div>

          {/* Privacy Toggle */}
          <div className="flex items-center justify-between rounded-sm border border-border/40 p-4">
            <div className="space-y-0.5">
              <Label htmlFor="private" className="text-base">
                Private Board
              </Label>
              <p className="text-sm text-muted-foreground">
                Only you can see this board
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
