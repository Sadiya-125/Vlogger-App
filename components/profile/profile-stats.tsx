"use client"

import { MapPin, Bookmark, Users, Heart } from "lucide-react"

interface ProfileStatsProps {
  stats: {
    pins: number
    boards: number
    followers: number
    following: number
  }
}

export function ProfileStats({ stats }: ProfileStatsProps) {
  const statItems = [
    {
      icon: MapPin,
      label: "Pins",
      value: stats.pins,
      color: "text-primary",
    },
    {
      icon: Bookmark,
      label: "Boards",
      value: stats.boards,
      color: "text-secondary",
    },
    {
      icon: Users,
      label: "Followers",
      value: stats.following,
      color: "text-accent",
    },
    {
      icon: Heart,
      label: "Following",
      value: stats.followers,
      color: "text-warning",
    },
  ]

  return (
    <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
      {statItems.map((stat) => {
        const Icon = stat.icon
        return (
          <div
            key={stat.label}
            className="bg-card rounded-[16px] border border-border/40 p-6 shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-[12px] bg-muted ${stat.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
