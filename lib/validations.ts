import { z } from "zod";

// User Profile Schema
export const userProfileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(30).optional(),
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  location: z.string().optional(),
  interests: z.array(z.string()).max(10, "Maximum 10 interests").optional(),
  imageUrl: z.string().optional(),
});

export type UserProfileFormData = z.infer<typeof userProfileSchema>;

// Comprehensive Board Schema
export const comprehensiveBoardSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  subtitle: z.string().max(100).optional(),
  category: z.enum(["DREAM", "PLANNING", "COMPLETED"]),
  tripCategory: z.enum([
    "BACKPACKING",
    "LUXURY",
    "SOLO",
    "GROUP",
    "COUPLES",
    "NATURE",
    "CITY",
    "FOOD",
    "FESTIVALS",
    "HIDDEN_GEMS",
  ]).optional(),
  visibility: z.enum(["PRIVATE", "PUBLIC", "SHARED"]).optional(),
  layoutMode: z.enum(["MASONRY", "GRID", "TIMELINE", "MAP"]).optional(),
  themeColor: z.enum([
    "TRAVEL_BLUE",
    "EXPLORER_TEAL",
    "CORAL_ADVENTURE",
    "GOLD_LUXURY",
    "MINIMAL_SLATE",
  ]).optional(),
  coverImage: z.string().optional(),
  autoGenCover: z.boolean().optional(),
  hashtags: z.array(z.string()).max(10).optional(),
});

export type ComprehensiveBoardFormData = z.infer<typeof comprehensiveBoardSchema>;

// Simple Board Schema (backward compatibility)
export const boardSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  category: z.enum(["DREAM", "PLANNING", "COMPLETED"]),
  visibility: z.enum(["PRIVATE", "PUBLIC", "SHARED"]).optional(),
  tripCategory: z.enum([
    "BACKPACKING",
    "LUXURY",
    "SOLO",
    "GROUP",
    "COUPLES",
    "NATURE",
    "CITY",
    "FOOD",
    "FESTIVALS",
    "HIDDEN_GEMS",
  ]).optional(),
  subtitle: z.string().max(100).optional(),
  hashtags: z.array(z.string()).max(10).optional(),
  layoutMode: z.enum(["MASONRY", "GRID", "TIMELINE", "MAP"]).optional(),
  themeColor: z.enum([
    "TRAVEL_BLUE",
    "EXPLORER_TEAL",
    "CORAL_ADVENTURE",
    "GOLD_LUXURY",
    "MINIMAL_SLATE",
  ]).optional(),
  coverImage: z.string().optional(),
  autoGenCover: z.boolean().optional(),
});

export type BoardFormData = z.infer<typeof boardSchema>;

// Pin Schema
export const pinSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  location: z.string().min(1, "Location is required"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  category: z.string().min(1, "Category is required"),
  costLevel: z.enum(["FREE", "BUDGET", "MODERATE", "LUXURY"]).optional(),
  bestTimeToVisit: z.string().optional(),
  userNotes: z.string().max(1000).optional(),
  boardId: z.string().optional(),
  tags: z.array(z.string()).max(10, "Maximum 10 tags"),
  images: z
    .array(z.instanceof(File))
    .min(1, "At least one image is required")
    .max(10, "Maximum 10 images"),
});

export type PinFormData = z.infer<typeof pinSchema>;

// Comment Schema
export const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(500),
  pinId: z.string(),
});

export type CommentFormData = z.infer<typeof commentSchema>;

// Tag Schema
export const tagSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(30)
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Tags can only contain letters, numbers, and underscores"
    ),
});

export type TagFormData = z.infer<typeof tagSchema>;
