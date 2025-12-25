"use client";

import { useState } from "react";
import { Settings, Palette, Lock, Users, LayoutGrid, BarChart3, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { GeneralSettings } from "./general-settings";
import { AppearanceSettings } from "./appearance-settings";
import { PrivacySettings } from "./privacy-settings";
import { MembersSettings } from "./members-settings";
import { PinsSettings } from "./pins-settings";
import { ActivitySettings } from "./activity-settings";
import { DangerZoneSettings } from "./danger-zone-settings";

type SettingsSection =
  | "general"
  | "appearance"
  | "privacy"
  | "members"
  | "pins"
  | "activity"
  | "danger";

const sections = [
  { id: "general" as const, label: "General", icon: Settings },
  { id: "appearance" as const, label: "Appearance", icon: Palette },
  { id: "privacy" as const, label: "Privacy & Visibility", icon: Lock },
  { id: "members" as const, label: "Members & Collaboration", icon: Users },
  { id: "pins" as const, label: "Pins & Organization", icon: LayoutGrid },
  { id: "activity" as const, label: "Activity & Analytics", icon: BarChart3 },
  { id: "danger" as const, label: "Danger Zone", icon: AlertTriangle },
];

interface BoardSettingsContentProps {
  board: any;
  currentUser: any;
  isOwner: boolean;
}

export function BoardSettingsContent({
  board,
  currentUser,
  isOwner,
}: BoardSettingsContentProps) {
  const [activeSection, setActiveSection] = useState<SettingsSection>("general");

  return (
    <main className="flex-1">
      <div className="container mx-auto px-4 md:px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">
            Board Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your board preferences and configurations
          </p>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          {/* Left Sidebar Navigation */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <nav className="space-y-1 bg-card border border-border/40 rounded-xl p-2">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                const isDanger = section.id === "danger";

                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? isDanger
                          ? "bg-destructive/10 text-destructive"
                          : "bg-primary/10 text-primary shadow-sm"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-transform",
                        isActive && "scale-110"
                      )}
                    />
                    <span className="truncate">{section.label}</span>
                    {isActive && (
                      <div
                        className={cn(
                          "ml-auto h-1.5 w-1.5 rounded-full shrink-0",
                          isDanger ? "bg-destructive" : "bg-primary"
                        )}
                      />
                    )}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Right Content Area */}
          <div className="min-w-0">
            <div className="bg-card border border-border/40 rounded-xl shadow-sm">
              {activeSection === "general" && (
                <GeneralSettings board={board} />
              )}
              {activeSection === "appearance" && (
                <AppearanceSettings board={board} />
              )}
              {activeSection === "privacy" && (
                <PrivacySettings board={board} />
              )}
              {activeSection === "members" && (
                <MembersSettings board={board} isOwner={isOwner} />
              )}
              {activeSection === "pins" && (
                <PinsSettings board={board} />
              )}
              {activeSection === "activity" && (
                <ActivitySettings board={board} />
              )}
              {activeSection === "danger" && (
                <DangerZoneSettings board={board} isOwner={isOwner} />
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
