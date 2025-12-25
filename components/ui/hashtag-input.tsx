"use client";

import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface HashtagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
  placeholder?: string;
  suggestions?: string[];
}

export function HashtagInput({
  value = [],
  onChange,
  maxTags = 10,
  placeholder = "Add Tags with # or Press Enter",
  suggestions = [],
}: HashtagInputProps) {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (input.startsWith("#")) {
      const query = input.slice(1).toLowerCase();
      const filtered = suggestions.filter(
        (tag) => tag.toLowerCase().includes(query) && !value.includes(tag)
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [input, suggestions, value]);

  const addTag = (tag: string) => {
    const cleanTag = tag.replace(/^#/, "").trim();
    if (cleanTag && !value.includes(cleanTag) && value.length < maxTags) {
      onChange([...value, cleanTag]);
      setInput("");
      setShowSuggestions(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input) {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && !input && value.length > 0) {
      removeTag(value[value.length - 1]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const getTagColor = (tag: string) => {
    const colors: Record<string, string> = {
      adventure: "bg-secondary/20 text-secondary border-secondary/30",
      food: "bg-accent/20 text-accent border-accent/30",
      luxury: "bg-warning/20 text-warning border-warning/30",
      budget: "bg-success/20 text-success border-success/30",
      nature: "bg-success/20 text-success border-success/30",
      city: "bg-primary/20 text-primary border-primary/30",
      culture: "bg-muted text-muted-foreground border-muted-foreground/30",
      beach: "bg-secondary/20 text-secondary border-secondary/30",
      trek: "bg-secondary/20 text-secondary border-secondary/30",
    };
    return (
      colors[tag.toLowerCase()] ||
      "bg-primary/20 text-primary border-primary/30"
    );
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2 p-3 border border-input rounded-sm bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        {value.map((tag) => (
          <span
            key={tag}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
              getTagColor(tag)
            )}
          >
            #{tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : ""}
          disabled={value.length >= maxTags}
          className="flex-1 min-w-30 outline-none bg-transparent text-sm placeholder:text-muted-foreground disabled:opacity-50"
        />
      </div>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-2 bg-card border border-border rounded-sm shadow-lg overflow-hidden">
          {filteredSuggestions.slice(0, 5).map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => addTag(tag)}
              className="w-full px-4 py-2.5 text-left text-sm hover:bg-accent/10 transition-colors flex items-center gap-2"
            >
              <span className="text-muted-foreground">#</span>
              <span>{tag}</span>
            </button>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-2">
        {value.length}/{maxTags} tags • Type # to See Suggestions
      </p>
    </div>
  );
}
