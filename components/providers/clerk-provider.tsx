"use client"

import { useEffect, useState } from "react"
import { ClerkProvider as BaseClerkProvider } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import { useTheme } from "next-themes"

export function ClerkProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <BaseClerkProvider
      appearance={{
        baseTheme: mounted && theme === "dark" ? dark : undefined,
        variables: {
          colorPrimary: "#4169E1",
          colorText: theme === "dark" ? "#FFFFFF" : "#111111",
          colorBackground: theme === "dark" ? "#0E1116" : "#F7F7F8",
          borderRadius: "14px",
        },
        elements: {
          formButtonPrimary: "bg-primary hover:bg-primary/90",
          card: "bg-card shadow-xl border-border",
          headerTitle: "text-foreground font-semibold",
          headerSubtitle: "text-muted-foreground",
          socialButtonsBlockButton: "border-border hover:bg-accent/10",
          formFieldLabel: "text-foreground font-medium",
          formFieldInput: "bg-background border-border focus:ring-primary",
          footerActionLink: "text-primary hover:text-primary/80",
        },
      }}
    >
      {children}
    </BaseClerkProvider>
  )
}
