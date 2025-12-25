"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import {
  MessageSquare,
  Send,
  Loader2,
  Heart,
  ThumbsUp,
  Smile,
  Sparkles,
  Flame,
  Reply,
  MoreVertical,
  Pin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Reaction {
  id: string;
  emoji: string;
  userId: string;
  user: {
    id: string;
    username: string;
  };
}

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  imageUrl: string | null;
  isPinned: boolean;
  parentId: string | null;
  user: {
    id: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
  };
  reactions: Reaction[];
  parent?: {
    id: string;
    content: string;
    user: {
      username: string;
      firstName: string | null;
      lastName: string | null;
    };
  };
  replies?: Comment[];
  _count: {
    reactions: number;
    replies: number;
  };
}

interface DiscussionViewProps {
  boardId: string;
  isOwner: boolean;
  currentUserId?: string;
}

const reactionEmojis = [
  { emoji: "❤️", label: "Love" },
  { emoji: "🔥", label: "Fire" },
  { emoji: "⭐", label: "Star" },
  { emoji: "👏", label: "Clap" },
  { emoji: "😍", label: "Heart eyes" },
  { emoji: "🎉", label: "Party" },
];

function CommentItem({
  comment,
  boardId,
  isOwner,
  currentUserId,
  onReply,
  onPin,
  onRefresh,
  depth = 0,
}: {
  comment: Comment;
  boardId: string;
  isOwner: boolean;
  currentUserId?: string;
  onReply: (commentId: string, username: string) => void;
  onPin: (commentId: string) => void;
  onRefresh: () => void;
  depth?: number;
}) {
  const { user } = useUser();
  const [showReactions, setShowReactions] = useState(false);

  const displayName =
    comment.user.firstName && comment.user.lastName
      ? `${comment.user.firstName} ${comment.user.lastName}`
      : comment.user.username;

  const handleReaction = async (emoji: string) => {
    try {
      await fetch(`/api/boards/${boardId}/comments/${comment.id}/reaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      });
      setShowReactions(false);
      onRefresh(); // Refresh comments to show updated reactions
    } catch (error) {
      console.error("Failed to add reaction:", error);
      toast.error("Failed to add reaction");
    }
  };

  // Group reactions by emoji
  const groupedReactions = comment.reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = [];
    }
    acc[reaction.emoji].push(reaction);
    return acc;
  }, {} as Record<string, Reaction[]>);

  return (
    <div className={cn("space-y-3", depth > 0 && "ml-12 mt-4")}>
      <div className="group relative">
        <div className="flex gap-3">
          {/* Avatar */}
          <Link href={`/profile/${comment.user.username}`}>
            <Avatar className="h-10 w-10">
              <AvatarImage src={comment.user.imageUrl || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>

          {/* Comment Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Link
                  href={`/profile/${comment.user.username}`}
                  className="font-semibold text-sm hover:text-primary transition-colors"
                >
                  {displayName}
                </Link>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.createdAt), {
                    addSuffix: true,
                  })}
                </span>
                {comment.isPinned && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <Pin className="h-3 w-3" />
                    Pinned
                  </Badge>
                )}
              </div>

              {/* Quoted Parent Comment */}
              {comment.parent && (
                <div className="mb-2 p-2 bg-muted/80 rounded border-l-2 border-primary/40">
                  <div className="text-xs text-muted-foreground mb-0.5">
                    Replying to{" "}
                    <span className="font-medium">
                      @
                      {comment.parent.user.firstName &&
                      comment.parent.user.lastName
                        ? `${comment.parent.user.firstName} ${comment.parent.user.lastName}`
                        : comment.parent.user.username}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 italic">
                    {comment.parent.content}
                  </p>
                </div>
              )}

              <p className="text-sm whitespace-pre-wrap break-words">
                {comment.content}
              </p>

              {comment.imageUrl && (
                <div className="mt-2 relative rounded-lg overflow-hidden max-w-sm">
                  <Image
                    src={comment.imageUrl}
                    alt="Comment attachment"
                    width={400}
                    height={300}
                    className="w-full h-auto"
                  />
                </div>
              )}
            </div>

            {/* Comment Actions */}
            <div className="flex items-center gap-4 mt-2 ml-3 flex-wrap">
              {user && (
                <button
                  onClick={() => onReply(comment.id, comment.user.username)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  <Reply className="h-3 w-3" />
                  Reply
                </button>
              )}

              {/* Reactions */}
              <div className="relative">
                <button
                  onClick={() => user && setShowReactions(!showReactions)}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  <Smile className="h-3 w-3" />
                  React
                </button>

                {showReactions && (
                  <div className="absolute top-full left-0 mt-1 bg-card border border-border/40 rounded-lg shadow-lg p-2 flex gap-1 z-10">
                    {reactionEmojis.map((r) => (
                      <button
                        key={r.emoji}
                        onClick={() => handleReaction(r.emoji)}
                        className="hover:scale-125 transition-transform text-lg p-1"
                        title={r.label}
                      >
                        {r.emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* More Actions */}
              {isOwner && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                      <MoreVertical className="h-3 w-3" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => onPin(comment.id)}>
                      <Pin className="h-4 w-4 mr-2" />
                      {comment.isPinned ? "Unpin" : "Pin"} Comment
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Inline Reaction Display */}
            {Object.keys(groupedReactions).length > 0 && (
              <div className="flex items-center gap-2 mt-2 ml-3 flex-wrap">
                {Object.entries(groupedReactions).map(([emoji, reactions]) => {
                  const userReacted =
                    currentUserId &&
                    reactions.some((r) => r.userId === currentUserId);
                  return (
                    <button
                      key={emoji}
                      onClick={() => user && handleReaction(emoji)}
                      disabled={!user}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm border transition-all",
                        user && "hover:scale-105 cursor-pointer",
                        !user && "cursor-default",
                        userReacted
                          ? "bg-primary/10 border-primary/40 hover:bg-primary/20"
                          : "bg-muted/50 border-border/40 hover:bg-muted"
                      )}
                      title={reactions.map((r) => r.user.username).join(", ")}
                    >
                      <span className="text-base leading-none">{emoji}</span>
                      <span className="text-xs font-medium">
                        {reactions.length}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && depth < 2 && (
        <div className="space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              boardId={boardId}
              isOwner={isOwner}
              currentUserId={currentUserId}
              onReply={onReply}
              onPin={onPin}
              onRefresh={onRefresh}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function DiscussionView({
  boardId,
  isOwner,
  currentUserId,
}: DiscussionViewProps) {
  const { user } = useUser();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{
    id: string;
    username: string;
  } | null>(null);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/boards/${boardId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      toast.error("Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please sign in to comment");
      return;
    }

    if (!newComment.trim()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/boards/${boardId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newComment,
          parentId: replyingTo?.id || null,
        }),
      });

      if (response.ok) {
        const comment = await response.json();
        setNewComment("");
        setReplyingTo(null);
        toast.success("Comment Posted!");
        fetchComments(); // Refresh comments
      } else {
        throw new Error("Failed to Post Comment");
      }
    } catch (error) {
      console.error("Failed to Post Comment:", error);
      toast.error("Failed to Post Comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = (commentId: string, username: string) => {
    setReplyingTo({ id: commentId, username });
    setNewComment(`@${username} `);
  };

  const handlePin = async (commentId: string) => {
    try {
      const response = await fetch(
        `/api/boards/${boardId}/comments/${commentId}/pin`,
        {
          method: "PATCH",
        }
      );

      if (response.ok) {
        toast.success("Comment Updated!");
        fetchComments(); // Refresh to show updated pin status
      } else {
        throw new Error("Failed to Pin/Unpin Comment");
      }
    } catch (error) {
      console.error("Failed to Pin/Unpin Comment:", error);
      toast.error("Failed to Update Comment");
    }
  };

  const pinnedComments = comments.filter((c) => c.isPinned && !c.parentId);
  const regularComments = comments.filter((c) => !c.isPinned && !c.parentId);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Discussion</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
          </p>
        </div>
      </div>

      {/* Comment Form */}
      {user && (
        <form onSubmit={handleSubmit} className="space-y-3">
          {replyingTo && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Reply className="h-4 w-4" />
              Replying to @{replyingTo.username}
              <button
                type="button"
                onClick={() => {
                  setReplyingTo(null);
                  setNewComment("");
                }}
                className="ml-2 text-xs hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          )}

          <div className="flex gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.imageUrl || undefined} />
              <AvatarFallback className="bg-linear-to-br from-primary to-secondary text-white">
                {user.firstName?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share Your Thoughts..."
                rows={3}
                className="resize-none"
              />
              <div className="flex justify-end mt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting || !newComment.trim()}
                  className="gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Post Comment
                </Button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pinned Comments */}
          {pinnedComments.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Pinned Comments
              </h3>
              {pinnedComments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  boardId={boardId}
                  isOwner={isOwner}
                  currentUserId={currentUserId}
                  onReply={handleReply}
                  onPin={handlePin}
                  onRefresh={fetchComments}
                />
              ))}
            </div>
          )}

          {/* Regular Comments */}
          {regularComments.length > 0 ? (
            <div className="space-y-6">
              {regularComments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  boardId={boardId}
                  isOwner={isOwner}
                  currentUserId={currentUserId}
                  onReply={handleReply}
                  onPin={handlePin}
                  onRefresh={fetchComments}
                />
              ))}
            </div>
          ) : (
            !loading &&
            pinnedComments.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-border/40 bg-card">
                <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  Start the Conversation ✨
                </h3>
                <p className="text-muted-foreground max-w-md">
                  {user
                    ? "Be the first to share your thoughts about this board"
                    : "Sign in to join the discussion"}
                </p>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
