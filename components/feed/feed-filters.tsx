"use client";

import { useState } from "react";
import { Filter, X, MapPin, DollarSign, Tag, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export interface FeedFilters {
  category?: string;
  costLevel?: string;
  location?: string;
  tag?: string;
  sortBy: string;
}

interface FeedFiltersProps {
  filters: FeedFilters;
  onFiltersChange: (filters: FeedFilters) => void;
}

const categories = [
  "Adventure",
  "Beach",
  "City",
  "Culture",
  "Food",
  "Luxury",
  "Nature",
  "Budget",
  "Historical",
  "Mountain",
];

const costLevels = [
  { value: "BUDGET", label: "Budget ($)" },
  { value: "MODERATE", label: "Moderate ($$)" },
  { value: "EXPENSIVE", label: "Expensive ($$$)" },
  { value: "LUXURY", label: "Luxury ($$$$)" },
];

const sortOptions = [
  { value: "recent", label: "Most Recent", icon: TrendingUp },
  { value: "popular", label: "Most Popular", icon: TrendingUp },
  { value: "trending", label: "Trending This Week", icon: TrendingUp },
];

export function FeedFilters({ filters, onFiltersChange }: FeedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<FeedFilters>(filters);

  const activeFilterCount = Object.keys(filters).filter(
    (key) => key !== "sortBy" && filters[key as keyof FeedFilters]
  ).length;

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    setIsOpen(false);
  };

  const handleResetFilters = () => {
    const resetFilters: FeedFilters = { sortBy: "recent" };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const handleRemoveFilter = (key: keyof FeedFilters) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  return (
    <div className="space-y-4">
      {/* Sort Options - Always Visible */}
      <div className="flex flex-wrap items-center gap-2">
        {sortOptions.map((option) => (
          <Button
            key={option.value}
            variant={filters.sortBy === option.value ? "default" : "outline"}
            size="sm"
            onClick={() =>
              onFiltersChange({ ...filters, sortBy: option.value })
            }
            className="rounded-full text-xs sm:text-sm"
          >
            <option.icon className="h-3.5 w-3.5 mr-1 sm:mr-1.5" />
            <span className="hidden sm:inline">{option.label}</span>
            <span className="sm:hidden">{option.label.split(" ")[0]}</span>
          </Button>
        ))}

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="rounded-full relative">
              <Filter className="h-3.5 w-3.5 mr-1.5" />
              More Filters
              {activeFilterCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center rounded-full text-xs"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-md overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filter Feed</SheetTitle>
              <SheetDescription>
                Customize your discovery feed with filters
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6 mt-6">
              {/* Category */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Category
                </Label>
                <Select
                  value={localFilters.category || "all"}
                  onValueChange={(value) =>
                    setLocalFilters({
                      ...localFilters,
                      category: value === "all" ? undefined : value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Cost Level */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Cost Level
                </Label>
                <Select
                  value={localFilters.costLevel || "all"}
                  onValueChange={(value) =>
                    setLocalFilters({
                      ...localFilters,
                      costLevel: value === "all" ? undefined : value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All budgets" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Budgets</SelectItem>
                    {costLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </Label>
                <Input
                  placeholder="Search by Location..."
                  value={localFilters.location || ""}
                  onChange={(e) =>
                    setLocalFilters({
                      ...localFilters,
                      location: e.target.value || undefined,
                    })
                  }
                />
              </div>

              {/* Tag */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tag
                </Label>
                <Input
                  placeholder="Search by Tag..."
                  value={localFilters.tag || ""}
                  onChange={(e) =>
                    setLocalFilters({
                      ...localFilters,
                      tag: e.target.value || undefined,
                    })
                  }
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={handleResetFilters}
                  className="flex-1"
                >
                  Reset All
                </Button>
                <Button onClick={handleApplyFilters} className="flex-1">
                  Apply Filters
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {filters.category && (
            <Badge variant="secondary" className="gap-1">
              Category: {filters.category}
              <button
                onClick={() => handleRemoveFilter("category")}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.costLevel && (
            <Badge variant="secondary" className="gap-1">
              Cost:{" "}
              {costLevels.find((l) => l.value === filters.costLevel)?.label}
              <button
                onClick={() => handleRemoveFilter("costLevel")}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.location && (
            <Badge variant="secondary" className="gap-1">
              Location: {filters.location}
              <button
                onClick={() => handleRemoveFilter("location")}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.tag && (
            <Badge variant="secondary" className="gap-1">
              Tag: #{filters.tag}
              <button
                onClick={() => handleRemoveFilter("tag")}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
