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

const editBoardSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  category: z.enum(["DREAM", "PLANNING", "COMPLETED"]),
  isPrivate: z.boolean(),
});

type EditBoardFormData = z.infer<typeof editBoardSchema>;

interface Board {
  id: string;
  name: string;
  description: string | null;
  category: string;
  isPrivate: boolean;
}

interface EditBoardModalProps {
  board: Board;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBoardUpdated?: (board: any) => void;
}

export function EditBoardModal({
  board,
  open,
  onOpenChange,
  onBoardUpdated,
}: EditBoardModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditBoardFormData>({
    resolver: zodResolver(editBoardSchema),
    defaultValues: {
      name: board.name,
      description: board.description || "",
      category: board.category as "DREAM" | "PLANNING" | "COMPLETED",
      isPrivate: board.isPrivate,
    },
  });

  const isPrivate = watch("isPrivate");

  const onSubmit = async (data: EditBoardFormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/boards/${board.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update board");
      }

      const updatedBoard = await response.json();

      if (onBoardUpdated) {
        onBoardUpdated(updatedBoard);
      }

      router.refresh();
      toast.success("Board updated successfully!");
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating board:", error);
      toast.error("Failed to update board. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Edit Board</DialogTitle>
          <DialogDescription>
            Update Your Board Details and Settings
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
            <Label htmlFor="description">Description (Optional)</Label>
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
              defaultValue={board.category}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DREAM">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Dream</span>
                    <span className="text-xs text-muted-foreground">
                      Places You Dream of Visiting
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="PLANNING">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Planning</span>
                    <span className="text-xs text-muted-foreground">
                      Actively Planning to Visit
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="COMPLETED">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Completed</span>
                    <span className="text-xs text-muted-foreground">
                      Places You've Already Visited
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
                Only You Can See this Board
              </p>
            </div>
            <Switch
              id="private"
              checked={isPrivate}
              onCheckedChange={(checked) => setValue("isPrivate", checked)}
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
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
