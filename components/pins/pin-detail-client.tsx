"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
  Heart,
  MessageCircle,
  MapPin,
  Calendar,
  DollarSign,
  Send,
  ChevronLeft,
  ChevronRight,
  Layers,
  Bookmark,
  Plus,
} from "lucide-react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { AddToBoardModal } from "./add-to-board-modal";

interface Pin {
  id: string;
  title: string;
  description: string | null;
  location: string;
  latitude: number | null;
  longitude: number | null;
  category: string;
  costLevel: string | null;
  bestTimeToVisit: string | null;
  createdAt: Date;
  images: { id: string; url: string }[];
  user: {
    id: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
  };
  tags: { tag: { name: string } }[];
  _count: {
    likes: number;
    comments: number;
  };
}

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  user: {
    id: string;
    username: string;
    imageUrl: string | null;
  };
}

export function PinDetailClient({ pin }: { pin: Pin }) {
  const { user: clerkUser } = useUser();
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(pin._count.likes);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [satelliteView, setSatelliteView] = useState(false);
  const [showAddToBoard, setShowAddToBoard] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  const displayName =
    pin.user.firstName && pin.user.lastName
      ? `${pin.user.firstName} ${pin.user.lastName}`
      : pin.user.username;

  const costLevelLabels: Record<string, string> = {
    FREE: "Free",
    BUDGET: "Budget £",
    MODERATE: "Moderate ££",
    LUXURY: "Luxury £££",
  };

  // Fetch comments, like status, and save status
  useEffect(() => {
    fetchComments();
    fetchLikeStatus();
    fetchSaveStatus();
  }, []);

  const fetchLikeStatus = async () => {
    if (!clerkUser) return;

    try {
      const response = await fetch(`/api/pins/${pin.id}/like`);
      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.liked);
      }
    } catch (error) {
      console.error("Failed to fetch like status:", error);
    }
  };

  const fetchSaveStatus = async () => {
    if (!clerkUser) return;

    try {
      const response = await fetch(`/api/pins/${pin.id}/save`);
      if (response.ok) {
        const data = await response.json();
        setIsSaved(data.saved);
      }
    } catch (error) {
      console.error("Failed to fetch save status:", error);
    }
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || !pin.latitude || !pin.longitude) return;

    // Clear existing map
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: satelliteView
        ? "https://api.maptiler.com/maps/hybrid/style.json?key=X8chXEtN8gGlWO2Km6HQ"
        : "https://api.maptiler.com/maps/streets-v2/style.json?key=X8chXEtN8gGlWO2Km6HQ",
      center: [pin.longitude, pin.latitude],
      zoom: 12,
    });

    map.on("load", () => {
      // Add custom marker
      const markerEl = document.createElement("div");
      markerEl.style.width = "40px";
      markerEl.style.height = "40px";
      markerEl.style.cursor = "pointer";
      markerEl.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; background-color: #4169E1; border-radius: 50%; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <svg style="width: 24px; height: 24px; color: white;" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
      `;

      new maplibregl.Marker({ element: markerEl })
        .setLngLat([pin.longitude!, pin.latitude!])
        .addTo(map);

      map.addControl(new maplibregl.NavigationControl(), "top-right");
    });

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [pin.latitude, pin.longitude, satelliteView]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/pins/${pin.id}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    }
  };

  const handleLike = async () => {
    if (!clerkUser) {
      toast.error("Please sign in to like pins");
      return;
    }

    try {
      const response = await fetch(`/api/pins/${pin.id}/like`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.liked);
        setLikesCount((prev) => (data.liked ? prev + 1 : prev - 1));
      }
    } catch (error) {
      console.error("Failed to like pin:", error);
      toast.error("Failed to update like");
    }
  };

  const handleSave = async () => {
    if (!clerkUser) {
      toast.error("Please sign in to save pins");
      return;
    }

    try {
      const response = await fetch(`/api/pins/${pin.id}/save`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setIsSaved(data.saved);
        toast.success(data.saved ? "Pin saved!" : "Pin unsaved");
      }
    } catch (error) {
      console.error("Failed to save pin:", error);
      toast.error("Failed to save pin");
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clerkUser) {
      toast.error("Please sign in to comment");
      return;
    }

    if (!newComment.trim()) return;

    setIsSubmittingComment(true);

    try {
      const response = await fetch(`/api/pins/${pin.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });

      if (response.ok) {
        const comment = await response.json();
        setComments([comment, ...comments]);
        setNewComment("");
        toast.success("Comment added!");
      }
    } catch (error) {
      console.error("Failed to post comment:", error);
      toast.error("Failed to post comment");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % pin.images.length);
  };

  const previousImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + pin.images.length) % pin.images.length
    );
  };

  return (
    <main className="flex-1 container mx-auto px-4 md:px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
        {/* Left Column - Images & Map */}
        <div className="space-y-6">
          {/* Image Gallery */}
          <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-muted">
            {pin.images.length > 0 && (
              <>
                <Image
                  src={pin.images[currentImageIndex].url}
                  alt={pin.title}
                  fill
                  className="object-cover"
                  priority
                />
                {pin.images.length > 1 && (
                  <>
                    <button
                      onClick={previousImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {pin.images.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={cn(
                            "h-2 rounded-full transition-all",
                            idx === currentImageIndex
                              ? "w-8 bg-white"
                              : "w-2 bg-white/50"
                          )}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {/* Map */}
          {pin.latitude && pin.longitude && (
            <div className="rounded-xl overflow-hidden border border-border/40 h-75 sm:h-100 relative">
              <div ref={mapContainerRef} className="w-full h-full" />
              {/* Satellite Toggle */}
              <div className="absolute top-4 left-4 z-10 bg-card/95 backdrop-blur-md rounded-lg p-3 shadow-lg border border-border/40">
                <div className="flex items-center space-x-3">
                  <Layers className="h-4 w-4 text-primary" />
                  <Label
                    htmlFor="satellite-toggle"
                    className="text-sm font-medium cursor-pointer"
                  >
                    {satelliteView ? "Satellite" : "Street"}
                  </Label>
                  <Switch
                    id="satellite-toggle"
                    checked={satelliteView}
                    onCheckedChange={setSatelliteView}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Details */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              {pin.title}
            </h1>

            {/* User Info */}
            <Link
              href={`/profile/${pin.user.username}`}
              className="flex items-center gap-3 group"
            >
              {pin.user.imageUrl ? (
                <Image
                  src={pin.user.imageUrl}
                  alt={displayName}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center">
                  <span className="text-lg font-bold text-white">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <p className="font-semibold group-hover:text-primary transition-colors">
                  {displayName}
                </p>
                <p className="text-sm text-muted-foreground">
                  @{pin.user.username}
                </p>
              </div>
            </Link>
          </div>

          {/* Stats & Actions */}
          <div className="flex flex-wrap items-center gap-3 pb-4 border-border/40">
            <Button
              variant={isLiked ? "default" : "outline"}
              onClick={handleLike}
              className={cn(
                "gap-2",
                isLiked && "bg-red-500 hover:bg-red-600 border-red-500"
              )}
            >
              <Heart
                className={cn("h-4 w-4", isLiked && "fill-current text-white")}
              />
              <span className={isLiked ? "text-white" : ""}>{likesCount}</span>
            </Button>
            <Button
              variant={isSaved ? "default" : "outline"}
              onClick={handleSave}
              className={cn(
                "gap-2",
                isSaved && "bg-primary hover:bg-primary/90"
              )}
            >
              <Bookmark className={cn("h-4 w-4", isSaved && "fill-current")} />
              <span>{isSaved ? "Saved" : "Save"}</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowAddToBoard(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add to Board</span>
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageCircle className="h-4 w-4" />
              <span>{comments.length}</span>
            </div>
          </div>

          {/* Location & Details */}
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <span className="font-medium">{pin.location}</span>
            </div>

            {pin.category && (
              <div>
                <Badge variant="secondary">{pin.category}</Badge>
              </div>
            )}

            {pin.costLevel && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">
                  {costLevelLabels[pin.costLevel] || pin.costLevel}
                </span>
              </div>
            )}

            {pin.bestTimeToVisit && (
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">
                  Best Time: {pin.bestTimeToVisit}
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          {pin.description && (
            <div className="pt-4 border-t border-border/40">
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                {pin.description}
              </p>
            </div>
          )}

          {/* Tags */}
          {pin.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {pin.tags.map((tagObj) => (
                <Link
                  key={tagObj.tag.name}
                  href={`/explore?tag=${tagObj.tag.name}`}
                  className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
                >
                  #{tagObj.tag.name}
                </Link>
              ))}
            </div>
          )}

          {/* Comments Section */}
          <div className="pt-6 border-t border-border/40">
            <h2 className="text-xl font-semibold mb-4">
              Comments ({comments.length})
            </h2>

            {/* Add Comment Form */}
            {clerkUser && (
              <form onSubmit={handleCommentSubmit} className="mb-6">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a Comment..."
                  className="mb-4"
                  rows={3}
                />
                <Button
                  type="submit"
                  disabled={isSubmittingComment || !newComment.trim()}
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                  Post Comment
                </Button>
              </form>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  {comment.user.imageUrl ? (
                    <Image
                      src={comment.user.imageUrl}
                      alt={comment.user.username}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-white">
                        {comment.user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      @{comment.user.username}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}

              {comments.length === 0 && !clerkUser && (
                <p className="text-center text-muted-foreground py-8">
                  No Comments Yet. Sign In to be the First to Comment!
                </p>
              )}

              {comments.length === 0 && clerkUser && (
                <p className="text-center text-muted-foreground py-8">
                  No Comments Yet. Be the First to Share Your Thoughts!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add to Board Modal */}
      <AddToBoardModal
        open={showAddToBoard}
        onOpenChange={setShowAddToBoard}
        pinId={pin.id}
        pinTitle={pin.title}
      />
    </main>
  );
}
