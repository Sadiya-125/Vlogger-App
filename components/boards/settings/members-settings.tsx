"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  Link as LinkIcon,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

interface MembersSettingsProps {
  board: any;
  isOwner: boolean;
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

export function MembersSettings({ board, isOwner }: MembersSettingsProps) {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [usernameToInvite, setUsernameToInvite] = useState("");
  const [selectedRole, setSelectedRole] = useState("CAN_ADD_PINS");

  const canManage = isOwner;

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/boards/${board.id}/members`);
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
      const response = await fetch(`/api/boards/${board.id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: usernameToInvite,
          role: selectedRole,
        }),
      });

      if (response.ok) {
        toast.success(`@${usernameToInvite} invited!`);
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
        `/api/boards/${board.id}/members/${memberId}`,
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
        `/api/boards/${board.id}/members/${memberId}`,
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
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight mb-2">
          Members & Collaboration
        </h2>
        <p className="text-sm text-muted-foreground">
          Manage who has access to "{board.name}"
        </p>
      </div>

      <div className="space-y-6">
        {/* Invite Section */}
        {canManage && (
          <Tabs defaultValue="username" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="username">
                <Search className="h-4 w-4 mr-2" />
                By Username
              </TabsTrigger>
              <TabsTrigger value="link">
                <LinkIcon className="h-4 w-4 mr-2" />
                Share Link
              </TabsTrigger>
            </TabsList>

            <TabsContent value="username" className="space-y-4 mt-4">
              {showInviteForm ? (
                <div className="space-y-4 p-4 rounded-xl border border-border/40 bg-muted/30">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="username"
                        placeholder="Enter username..."
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
                    <Label htmlFor="role">Role</Label>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger id="role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(roleConfig)
                          .filter(([key]) => key !== "OWNER")
                          .map(([key, config]) => (
                            <SelectItem key={key} value={key}>
                              <div className="flex items-center gap-2">
                                <config.icon className={cn("h-4 w-4", config.color)} />
                                <span>{config.label}</span>
                                <span className="text-xs text-muted-foreground">
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
            </TabsContent>

            <TabsContent value="link" className="space-y-4 mt-4">
              <div className="p-4 rounded-xl border border-border/40 bg-muted/30">
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={`${window.location.origin}/boards/${board.id}`}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${window.location.origin}/boards/${board.id}`
                      );
                      toast.success("Link copied to clipboard");
                    }}
                  >
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Anyone with this link can request access to your board
                </p>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Members List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : members.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <Label>Team Members ({members.length})</Label>
            </div>

            {members.map((member) => {
              const roleData = roleConfig[member.role as keyof typeof roleConfig];
              const RoleIcon = roleData?.icon || Users;
              const displayName =
                member.user.firstName && member.user.lastName
                  ? `${member.user.firstName} ${member.user.lastName}`
                  : member.user.username;

              return (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-4 rounded-xl border border-border/40 hover:bg-accent/50 transition-colors"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.user.imageUrl || undefined} />
                    <AvatarFallback className="bg-linear-to-br from-primary to-secondary text-white">
                      {displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{displayName}</p>
                    <p className="text-xs text-muted-foreground">
                      @{member.user.username}
                    </p>
                  </div>

                  <Badge variant="secondary" className={cn("gap-1", roleData?.bg)}>
                    <RoleIcon className={cn("h-3 w-3", roleData?.color)} />
                    {roleData?.label || member.role}
                  </Badge>

                  {canManage && member.role !== "OWNER" && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            handleChangeRole(
                              member.id,
                              member.role === "CO_ADMIN" ? "CAN_ADD_PINS" : "CO_ADMIN"
                            )
                          }
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          {member.role === "CO_ADMIN" ? "Demote" : "Promote"} to{" "}
                          {member.role === "CO_ADMIN" ? "Editor" : "Co-Admin"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleRemoveMember(member.id, member.user.username)
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
    </div>
  );
}
