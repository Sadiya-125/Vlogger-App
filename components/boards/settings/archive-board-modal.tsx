"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Archive, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

interface ArchiveBoardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardId: string;
  boardName: string;
  isArchived?: boolean;
}

export function ArchiveBoardModal({
  open,
  onOpenChange,
  boardId,
  boardName,
  isArchived = false,
}: ArchiveBoardModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleArchiveToggle = async () => {
    setLoading(true);

    try {
      const response = await fetch(`/api/boards/${boardId}/archive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archive: !isArchived }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          isArchived
            ? `"${boardName}" has been restored!`
            : `"${boardName}" has been archived`
        );
        onOpenChange(false);
        router.push("/boards");
        router.refresh();
      } else {
        toast.error(data.error || "Failed to update board");
      }
    } catch (error) {
      console.error("Failed to archive/restore board:", error);
      toast.error("Failed to update board");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>
            {isArchived ? "Restore Board" : "Archive Board"}
          </DialogTitle>
          <DialogDescription>
            {isArchived
              ? `Restore "${boardName}" to make it visible again.`
              : `Archive "${boardName}" to hide it from public view. You can restore it later.`}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Alert variant={isArchived ? "default" : "destructive"}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {isArchived ? (
                <>
                  This will make the board visible to users based on its privacy
                  settings. All members will be able to access it again.
                </>
              ) : (
                <>
                  This will hide the board from public view. Members will not be
                  able to access it until you restore it. The board and all its
                  content will be preserved.
                </>
              )}
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleArchiveToggle}
            disabled={loading}
            variant={isArchived ? "default" : "destructive"}
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isArchived ? "Restore Board" : "Archive Board"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
