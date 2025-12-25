"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Users,
  Plus,
  Loader2,
  Crown,
  Shield,
  Edit,
  Eye,
  MoreVertical,
  UserMinus,
  Search,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Member {
  id: string;
  role: string;
  createdAt: Date;
  user: {
    id: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
  };
}

interface MembersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardId: string;
  boardName: string;
  isOwner: boolean;
  canManage: boolean;
}

const roleConfig = {
  OWNER: {
    icon: Crown,
    label: "Owner",
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    description: "Full control",
  },
  CO_ADMIN: {
    icon: Shield,
    label: "Co-Admin",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    description: "Manage members & settings",
  },
  CAN_ADD_PINS: {
    icon: Edit,
    label: "Editor",
    color: "text-green-500",
    bg: "bg-green-500/10",
    description: "Can add & edit pins",
  },
  VIEW_ONLY: {
    icon: Eye,
    label: "Viewer",
    color: "text-gray-500",
    bg: "bg-gray-500/10",
    description: "View only",
  },
};

export function MembersModal({
  open,
  onOpenChange,
  boardId,
  boardName,
  isOwner,
  canManage,
}: MembersModalProps) {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [usernameToInvite, setUsernameToInvite] = useState("");
  const [selectedRole, setSelectedRole] = useState("CAN_ADD_PINS");

  useEffect(() => {
    if (open) {
      fetchMembers();
    }
  }, [open]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/boards/${boardId}/members`);
      if (response.ok) {
        const data = await response.json();
        setMembers(data);
      }
    } catch (error) {
      console.error("Failed to fetch members:", error);
      toast.error("Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!usernameToInvite.trim()) {
      toast.error("Please enter a username");
      return;
    }

    setInviting(true);

    try {
      const response = await fetch(`/api/boards/${boardId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: usernameToInvite,
          role: selectedRole,
        }),
      });

      if (response.ok) {
        toast.success(`@${usernameToInvite} Invited! ✨`);
        setUsernameToInvite("");
        setShowInviteForm(false);
        fetchMembers();
        router.refresh();
      } else if (response.status === 404) {
        toast.error("User not found");
      } else if (response.status === 409) {
        toast.error("User is already a member");
      } else {
        throw new Error("Failed to invite user");
      }
    } catch (error) {
      console.error("Failed to invite user:", error);
      toast.error("Failed to invite user");
    } finally {
      setInviting(false);
    }
  };

  const handleChangeRole = async (memberId: string, newRole: string) => {
    try {
      const response = await fetch(
        `/api/boards/${boardId}/members/${memberId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: newRole }),
        }
      );

      if (response.ok) {
        toast.success("Role updated");
        fetchMembers();
        router.refresh();
      } else {
        throw new Error("Failed to update role");
      }
    } catch (error) {
      console.error("Failed to update role:", error);
      toast.error("Failed to update role");
    }
  };

  const handleRemoveMember = async (memberId: string, username: string) => {
    if (!confirm(`Remove @${username} from this board?`)) return;

    try {
      const response = await fetch(
        `/api/boards/${boardId}/members/${memberId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        toast.success("Member removed");
        fetchMembers();
        router.refresh();
      } else {
        throw new Error("Failed to remove member");
      }
    } catch (error) {
      console.error("Failed to remove member:", error);
      toast.error("Failed to remove member");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-150 max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Members
          </DialogTitle>
          <DialogDescription>
            Manage Who Has Access to "{boardName}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Invite Section */}
          {canManage && (
            <>
              {showInviteForm ? (
                <div className="space-y-3 p-4 rounded-lg border border-border/40 bg-muted/30">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Username</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Enter Username..."
                        value={usernameToInvite}
                        onChange={(e) => setUsernameToInvite(e.target.value)}
                        className="pl-10"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleInvite();
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Role</label>
                    <Select
                      value={selectedRole}
                      onValueChange={setSelectedRole}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(roleConfig)
                          .filter(([key]) => key !== "OWNER")
                          .map(([key, config]) => (
                            <SelectItem key={key} value={key}>
                              <div className="flex items-center gap-2">
                                <config.icon
                                  className={cn("h-4 w-4", config.color)}
                                />
                                <span>{config.label}</span>
                                <span className="text-sm text-muted-foreground">
                                  - {config.description}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleInvite}
                      disabled={inviting || !usernameToInvite.trim()}
                      className="flex-1"
                    >
                      {inviting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      Send Invite
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowInviteForm(false);
                        setUsernameToInvite("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={() => setShowInviteForm(true)}
                  variant="outline"
                  className="w-full border-dashed"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Invite Member
                </Button>
              )}

              <Separator />
            </>
          )}

          {/* Members List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : members.length > 0 ? (
            <ScrollArea className="h-100 pr-4">
              <div className="space-y-3">
                {members.map((member) => {
                  const roleData =
                    roleConfig[member.role as keyof typeof roleConfig];
                  const RoleIcon = roleData?.icon || Users;
                  const displayName =
                    member.user.firstName && member.user.lastName
                      ? `${member.user.firstName} ${member.user.lastName}`
                      : member.user.username;

                  return (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border/40 hover:bg-accent/50 transition-colors"
                    >
                      {/* Avatar */}
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.user.imageUrl || undefined} />
                        <AvatarFallback className="bg-linear-to-br from-primary to-secondary text-white">
                          {displayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">
                          {displayName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          @{member.user.username}
                        </p>
                      </div>

                      {/* Role Badge */}
                      <Badge
                        variant="secondary"
                        className={cn("gap-1", roleData?.bg)}
                      >
                        <RoleIcon className={cn("h-3 w-3", roleData?.color)} />
                        {roleData?.label || member.role}
                      </Badge>

                      {/* Actions */}
                      {canManage && member.role !== "OWNER" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                handleChangeRole(
                                  member.id,
                                  member.role === "CO_ADMIN"
                                    ? "CAN_ADD_PINS"
                                    : "CO_ADMIN"
                                )
                              }
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              {member.role === "CO_ADMIN"
                                ? "Demote"
                                : "Promote"}{" "}
                              to{" "}
                              {member.role === "CO_ADMIN"
                                ? "Editor"
                                : "Co-Admin"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleRemoveMember(
                                  member.id,
                                  member.user.username
                                )
                              }
                              className="text-destructive"
                            >
                              <UserMinus className="h-4 w-4 mr-2" />
                              Remove Member
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="font-semibold mb-2">No members yet</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Invite collaborators to work together on this board
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
