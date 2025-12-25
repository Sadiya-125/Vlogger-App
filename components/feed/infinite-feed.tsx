"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MasonryGrid } from "./masonry-grid";
import {
  FeedFilters,
  type FeedFilters as FeedFiltersType,
} from "./feed-filters";
import { PinGridSkeleton } from "./pin-skeleton";
import { Loader2 } from "lucide-react";

interface InfiniteFeedProps {
  initialPins?: any[];
}

export function InfiniteFeed({ initialPins = [] }: InfiniteFeedProps) {
  const [pins, setPins] = useState(initialPins);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState<FeedFiltersType>({ sortBy: "recent" });
  const observerTarget = useRef<HTMLDivElement>(null);

  const loadMorePins = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== undefined)
        ),
      });

      const response = await fetch(`/api/feed?${params}`);
      const data = await response.json();

      if (data.pins.length === 0) {
        setHasMore(false);
      } else {
        setPins((prev) => [...prev, ...data.pins]);
        setPage((prev) => prev + 1);
        setHasMore(data.pagination.hasMore);
      }
    } catch (error) {
      console.error("Error loading pins:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, filters, isLoading, hasMore]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMorePins();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [loadMorePins, hasMore, isLoading]);

  // Reset feed when filters change
  useEffect(() => {
    const resetFeed = async () => {
      setIsLoading(true);
      setPins([]);
      setPage(1);
      setHasMore(true);

      try {
        const params = new URLSearchParams({
          page: "1",
          limit: "20",
          ...Object.fromEntries(
            Object.entries(filters).filter(([_, v]) => v !== undefined)
          ),
        });

        const response = await fetch(`/api/feed?${params}`);
        const data = await response.json();

        setPins(data.pins);
        setPage(2);
        setHasMore(data.pagination.hasMore);
      } catch (error) {
        console.error("Error resetting feed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    resetFeed();
  }, [filters]);

  return (
    <div className="space-y-8">
      {/* Filters */}
      <FeedFilters filters={filters} onFiltersChange={setFilters} />

      {/* Feed */}
      {pins.length === 0 && !isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-4">
            <svg
              className="h-12 w-12 text-muted-foreground/50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">No Pins Found</h3>
          <p className="text-muted-foreground max-w-sm">
            Try Adjusting Your Filters or be the First to Share a Destination!
          </p>
        </div>
      ) : (
        <>
          <MasonryGrid pins={pins} />

          {/* Loading Indicator */}
          {isLoading && page === 1 && <PinGridSkeleton count={12} />}

          {/* Infinite Scroll Trigger */}
          {hasMore && (
            <div ref={observerTarget} className="flex justify-center py-8">
              {isLoading && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm">Loading More Pins...</span>
                </div>
              )}
            </div>
          )}

          {/* End of Feed */}
          {!hasMore && pins.length > 0 && (
            <div className="flex justify-center py-8 text-muted-foreground">
              <p className="text-sm">You've Reached the End! 🎉</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
