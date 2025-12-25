"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search, User, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

interface TransferOwnershipModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardId: string;
  boardName: string;
}

export function TransferOwnershipModal({
  open,
  onOpenChange,
  boardId,
  boardName,
}: TransferOwnershipModalProps) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const handleTransfer = async () => {
    if (!username.trim()) {
      toast.error("Please enter a username or full name");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/boards/${boardId}/transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Board ownership transferred to ${data.newOwner}!`);
        onOpenChange(false);
        setUsername("");
        setConfirming(false);
        router.refresh();
      } else {
        toast.error(data.error || "Failed to transfer ownership");
      }
    } catch (error) {
      console.error("Failed to transfer ownership:", error);
      toast.error("Failed to transfer ownership");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onOpenChange(false);
      setUsername("");
      setConfirming(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Transfer Ownership</DialogTitle>
          <DialogDescription>
            Transfer ownership of "{boardName}" to another user. You will become
            a Co-Admin.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!confirming ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="username">Username or Full Name</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    placeholder="Enter username or full name..."
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This action cannot be undone. The new owner will have full
                  control over the board, and you will become a Co-Admin.
                </AlertDescription>
              </Alert>
            </>
          ) : (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Are you sure you want to transfer ownership of "{boardName}" to{" "}
                <strong>{username}</strong>? You will become a Co-Admin and will
                not be able to reverse this action.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          {!confirming ? (
            <Button
              onClick={() => setConfirming(true)}
              disabled={!username.trim() || loading}
            >
              Continue
            </Button>
          ) : (
            <Button
              onClick={handleTransfer}
              disabled={loading}
              variant="destructive"
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Transfer Ownership
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
