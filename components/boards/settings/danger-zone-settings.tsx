"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  UserX,
  Archive,
  Trash2,
  ArrowRightLeft,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { TransferOwnershipModal } from "./transfer-ownership-modal";
import { ArchiveBoardModal } from "./archive-board-modal";

interface DangerZoneSettingsProps {
  board: any;
  isOwner: boolean;
}

export function DangerZoneSettings({ board, isOwner }: DangerZoneSettingsProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);

  const handleDeleteBoard = async () => {
    if (confirmText !== board.name) {
      toast.error("Board name doesn't match");
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(`/api/boards/${board.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Board deleted");
        router.push("/boards");
        router.refresh();
      } else {
        throw new Error("Failed to delete");
      }
    } catch (error) {
      console.error("Failed to delete board:", error);
      toast.error("Failed to delete board");
      setDeleting(false);
    }
  };

  const handleRemoveAllMembers = async () => {
    toast.info("Feature coming soon");
  };

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight mb-2 text-destructive">
          Danger Zone
        </h2>
        <p className="text-sm text-muted-foreground">
          Irreversible and destructive actions
        </p>
      </div>

      <div className="space-y-4">
        {/* Transfer Ownership */}
        {isOwner && (
          <div className="p-4 rounded-xl border-2 border-orange-500/30 bg-orange-500/5">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <ArrowRightLeft className="h-5 w-5 text-orange-500" />
              </div>
              <div className="flex-1 space-y-2">
                <div>
                  <Label className="text-orange-700 dark:text-orange-400">
                    Transfer Ownership
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Transfer this board to another user. You'll become a Co-Admin.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-orange-500/30"
                  onClick={() => setTransferModalOpen(true)}
                >
                  Transfer Board
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Remove All Members */}
        {isOwner && (
          <div className="p-4 rounded-xl border-2 border-orange-500/30 bg-orange-500/5">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <UserX className="h-5 w-5 text-orange-500" />
              </div>
              <div className="flex-1 space-y-2">
                <div>
                  <Label className="text-orange-700 dark:text-orange-400">
                    Remove All Members
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Remove all collaborators from this board. You'll be the only owner.
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="border-orange-500/30">
                      Remove All Members
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove all members?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will remove all collaborators from the board. They will
                        lose access immediately. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleRemoveAllMembers}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Remove All
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        )}

        {/* Archive Board */}
        {isOwner && (
          <div className="p-4 rounded-xl border-2 border-orange-500/30 bg-orange-500/5">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Archive className="h-5 w-5 text-orange-500" />
              </div>
              <div className="flex-1 space-y-2">
                <div>
                  <Label className="text-orange-700 dark:text-orange-400">
                    Archive Board
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Hide this board from public view. You can restore it later.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-orange-500/30"
                  onClick={() => setArchiveModalOpen(true)}
                >
                  {board.isArchived ? "Restore Board" : "Archive Board"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Board */}
        {isOwner && (
          <div className="p-4 rounded-xl border-2 border-destructive/30 bg-destructive/5">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-destructive/10">
                <Trash2 className="h-5 w-5 text-destructive" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <Label className="text-destructive">Delete Board</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Permanently delete this board and all its content. This action
                    cannot be undone.
                  </p>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      Delete Board
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        <AlertDialogTitle>Delete board permanently?</AlertDialogTitle>
                      </div>
                      <AlertDialogDescription className="space-y-3">
                        <p>
                          This will permanently delete <strong>"{board.name}"</strong>{" "}
                          and all its content. This action cannot be undone.
                        </p>
                        <div className="space-y-2">
                          <Label htmlFor="confirm-delete">
                            Type the board name to confirm:
                          </Label>
                          <Input
                            id="confirm-delete"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            placeholder={board.name}
                          />
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setConfirmText("")}>
                        Cancel
                      </AlertDialogCancel>
                      <Button
                        onClick={handleDeleteBoard}
                        disabled={confirmText !== board.name || deleting}
                        variant="destructive"
                      >
                        {deleting && (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        )}
                        Delete Forever
                      </Button>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        )}

        {/* Warning Notice */}
        <div className="p-4 rounded-xl bg-muted border border-border/40">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Be Careful</p>
              <p className="text-xs text-muted-foreground">
                Actions in the Danger Zone are serious and often irreversible. Make
                sure you understand the consequences before proceeding.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <TransferOwnershipModal
        open={transferModalOpen}
        onOpenChange={setTransferModalOpen}
        boardId={board.id}
        boardName={board.name}
      />
      <ArchiveBoardModal
        open={archiveModalOpen}
        onOpenChange={setArchiveModalOpen}
        boardId={board.id}
        boardName={board.name}
        isArchived={board.isArchived}
      />
    </div>
  );
}
