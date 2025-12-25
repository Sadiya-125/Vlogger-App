"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, User, Bookmark, Hash, Loader2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchResults {
  pins: any[];
  users: any[];
  boards: any[];
  tags: any[];
}

interface GlobalSearchProps {
  className?: string;
}

export function GlobalSearch({ className }: GlobalSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResults>({
    pins: [],
    users: [],
    boards: [],
    tags: [],
  });
  const [showResults, setShowResults] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Close search results when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults({ pins: [], users: [], boards: [], tags: [] });
      setShowResults(false);
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(query)}&type=all`
        );
        if (response.ok) {
          const data = await response.json();
          setResults(data);
          setShowResults(true);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  const clearSearch = () => {
    setQuery("");
    setResults({ pins: [], users: [], boards: [], tags: [] });
    setShowResults(false);
  };

  const handleResultClick = () => {
    setShowResults(false);
    setQuery("");
  };

  const hasResults =
    results.pins.length > 0 ||
    results.users.length > 0 ||
    results.boards.length > 0 ||
    results.tags.length > 0;

  return (
    <div ref={searchRef} className={cn("relative", className)}>
      <div
        className={cn(
          "relative transition-all duration-200",
          isSearchFocused && "scale-[1.02]"
        )}
      >
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search Destinations, Users, Boards..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-10 bg-muted/50 border-0 focus-visible:ring-primary"
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground animate-spin" />
        )}
        {query && !isLoading && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute z-50 w-full mt-2 bg-card border border-border rounded-3xl shadow-2xl overflow-hidden max-h-[80vh] overflow-y-auto">
          {hasResults ? (
            <div className="p-2">
              {/* Pins */}
              {results.pins.length > 0 && (
                <div className="mb-4">
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5" />
                    PINS
                  </div>
                  {results.pins.map((pin) => (
                    <Link
                      key={pin.id}
                      href={`/pins/${pin.id}`}
                      onClick={handleResultClick}
                      className="flex items-center gap-3 px-3 py-2 rounded-sm hover:bg-accent/10 transition-colors"
                    >
                      {pin.images[0]?.url ? (
                        <Image
                          src={pin.images[0].url}
                          alt={pin.title}
                          width={48}
                          height={48}
                          className="h-12 w-12 rounded-[8px] object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-[8px] bg-muted flex items-center justify-center">
                          <MapPin className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm line-clamp-1">
                          {pin.title}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {pin.location}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Users */}
              {results.users.length > 0 && (
                <div className="mb-4">
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground flex items-center gap-2">
                    <User className="h-3.5 w-3.5" />
                    USERS
                  </div>
                  {results.users.map((user) => {
                    const displayName =
                      user.firstName && user.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user.username;
                    return (
                      <Link
                        key={user.id}
                        href={`/users/${user.username}`}
                        onClick={handleResultClick}
                        className="flex items-center gap-3 px-3 py-2 rounded-sm hover:bg-accent/10 transition-colors"
                      >
                        {user.imageUrl ? (
                          <Image
                            src={user.imageUrl}
                            alt={displayName}
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center">
                            <span className="text-sm font-bold text-white">
                              {displayName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{displayName}</p>
                          <p className="text-xs text-muted-foreground">
                            @{user.username} · {user._count.pins} pins
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Boards */}
              {results.boards.length > 0 && (
                <div className="mb-4">
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground flex items-center gap-2">
                    <Bookmark className="h-3.5 w-3.5" />
                    BOARDS
                  </div>
                  {results.boards.map((board) => (
                    <Link
                      key={board.id}
                      href={`/boards/${board.id}`}
                      onClick={handleResultClick}
                      className="flex items-center gap-3 px-3 py-2 rounded-sm hover:bg-accent/10 transition-colors"
                    >
                      {board.pins[0]?.images[0]?.url ? (
                        <Image
                          src={board.pins[0].images[0].url}
                          alt={board.name}
                          width={48}
                          height={48}
                          className="h-12 w-12 rounded-[8px] object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-[8px] bg-muted flex items-center justify-center">
                          <Bookmark className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm line-clamp-1">
                          {board.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {board._count.pins} pins · by @{board.user.username}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Tags */}
              {results.tags.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground flex items-center gap-2">
                    <Hash className="h-3.5 w-3.5" />
                    TAGS
                  </div>
                  <div className="flex flex-wrap gap-2 px-3 py-2">
                    {results.tags.map((tag) => (
                      <Link
                        key={tag.id}
                        href={`/explore?tag=${tag.name}`}
                        onClick={handleResultClick}
                        className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
                      >
                        #{tag.name} ({tag._count.pins})
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : query.length >= 2 && !isLoading ? (
            <div className="p-8 text-center">
              <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No results found for "{query}"
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
