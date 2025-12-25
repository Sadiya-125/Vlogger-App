"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LocationSearch } from "@/components/ui/location-search";
import { uploadImage } from "@/lib/supabase";

const editProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  bio: z.string().max(500).optional(),
  location: z.string().optional(),
  interests: z.string().optional(),
});

type EditProfileFormData = z.infer<typeof editProfileSchema>;

interface User {
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  imageUrl: string | null;
  bio: string | null;
  location: string | null;
  interests: string[];
}

interface EditProfileModalProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProfileModal({
  user,
  open,
  onOpenChange,
}: EditProfileModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user.imageUrl
  );
  const [location, setLocation] = useState(user.location || "");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      bio: user.bio || "",
      location: user.location || "",
      interests: user.interests.join(", "),
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: EditProfileFormData) => {
    setIsSubmitting(true);

    try {
      let imageUrl = user.imageUrl;

      // Upload avatar if changed
      if (avatarFile) {
        imageUrl = await uploadImage(avatarFile, "vlogger-images", "avatars");
      }

      // Process interests
      const interests = data.interests
        ? data.interests
            .split(",")
            .map((i) => i.trim())
            .filter(Boolean)
        : [];

      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          bio: data.bio,
          location: data.location,
          interests,
          imageUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      router.refresh();
      toast.success("Profile updated successfully!");
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-150 max-h-[90vh] rounded-xl flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">Edit Profile</DialogTitle>
          <DialogDescription>
            Update Your Profile Information and Avatar
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 mt-4 flex-1 overflow-y-auto hide-scrollbar p-1"
        >
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-4 mt-2">
            <div className="relative">
              {avatarPreview ? (
                <Image
                  src={avatarPreview}
                  alt="Avatar preview"
                  width={120}
                  height={120}
                  className="h-30 w-30 rounded-lg object-cover"
                />
              ) : (
                <div className="h-30 w-30 rounded-lg bg-linear-to-br from-primary to-secondary flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              {avatarPreview && (
                <button
                  type="button"
                  onClick={() => {
                    setAvatarFile(null);
                    setAvatarPreview(null);
                  }}
                  className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-lg hover:bg-destructive/90"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <label htmlFor="avatar-upload">
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  document.getElementById("avatar-upload")?.click()
                }
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Avatar
              </Button>
            </label>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="John"
                {...register("firstName")}
              />
              {errors.firstName && (
                <p className="text-sm text-destructive">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                {...register("lastName")}
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell Us About Yourself and Your Travel Adventures..."
              rows={4}
              {...register("bio")}
            />
            {errors.bio && (
              <p className="text-sm text-destructive">{errors.bio.message}</p>
            )}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <LocationSearch
              value={location}
              onChange={(newLocation) => {
                setLocation(newLocation);
                setValue("location", newLocation);
              }}
              placeholder="Search for Your Location..."
            />
            {errors.location && (
              <p className="text-sm text-destructive">
                {errors.location.message}
              </p>
            )}
          </div>

          {/* Interests */}
          <div className="space-y-2">
            <Label htmlFor="interests">Interests (Comma Separated)</Label>
            <Input
              id="interests"
              placeholder="Adventure, Photography, Food"
              {...register("interests")}
            />
            {errors.interests && (
              <p className="text-sm text-destructive">
                {errors.interests.message}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
