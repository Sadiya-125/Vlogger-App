"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Moon, Sun, Map, Home, LogIn, User } from "lucide-react";
import { useTheme } from "next-themes";
import { UserButton, useUser, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { CreatePostModal } from "@/components/modals/create-post-modal";
import { GlobalSearch } from "@/components/search/global-search";

export function Header() {
  const { theme, setTheme } = useTheme();
  const { isSignedIn, user } = useUser();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group shrink-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-linear-to-br from-primary to-secondary transition-transform group-hover:scale-105">
              <span className="text-xl font-bold text-white">S</span>
            </div>
            <span className="hidden sm:inline-block text-xl font-semibold tracking-tight">
              SceneSavvy
            </span>
          </Link>

          {/* Search Bar */}
          <GlobalSearch className="flex-1 max-w-md mx-4 md:mx-8" />

          {/* Actions */}
          <div className="flex items-center space-x-2 md:space-x-3">
            {/* Navigation Links */}
            <Link href="/">
              <Button variant="ghost" size="icon" className="hidden md:flex">
                <Home className="h-5 w-5" />
              </Button>
            </Link>

            <Link href="/explore">
              <Button variant="ghost" size="icon" className="hidden md:flex">
                <Map className="h-5 w-5" />
              </Button>
            </Link>

            {isSignedIn && (
              <Link href="/profile">
                <Button variant="ghost" size="icon" className="hidden md:flex">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            )}

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Create Button */}
            {isSignedIn && (
              <Button
                className="gap-2"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Create</span>
              </Button>
            )}

            {/* Profile / Auth */}
            {isSignedIn ? (
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-10 w-10",
                  },
                }}
                afterSignOutUrl="/"
              />
            ) : (
              <SignInButton mode="modal">
                <Button variant="outline" className="gap-2">
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </Button>
              </SignInButton>
            )}
          </div>
        </div>
      </header>

      {isSignedIn && (
        <CreatePostModal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
        />
      )}
    </>
  );
}
