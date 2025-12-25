"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface Board {
  id: string;
  name: string;
}

interface DeleteBoardDialogProps {
  board: Board;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBoardDeleted?: (boardId: string) => void;
}

export function DeleteBoardDialog({
  board,
  open,
  onOpenChange,
  onBoardDeleted,
}: DeleteBoardDialogProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/boards/${board.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to Delete Board");
      }

      toast.success("Board Deleted Successfully");

      if (onBoardDeleted) {
        onBoardDeleted(board.id);
      }

      router.refresh();
      onOpenChange(false);
    } catch (error) {
      console.error("Error Deleting Board:", error);
      toast.error("Failed to Delete Board. Please Try Again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-xl">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <AlertDialogTitle className="text-2xl">
              Delete Board?
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base">
            Are you sure you want to delete <strong>{board.name}</strong>? This
            action cannot be undone and will remove all pins from this board.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Board"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
