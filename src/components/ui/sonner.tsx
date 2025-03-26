
"use client"

import * as React from "react"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  // Use a simpler approach that doesn't rely on theme context at all
  const [theme, setTheme] = React.useState<"light" | "dark" | "system">("system")
  
  // Use a safer approach to get the color scheme from the system
  React.useEffect(() => {
    try {
      // First try to get the theme from localStorage to match theme-provider behavior
      const storedTheme = localStorage.getItem("theme")
      if (storedTheme && (storedTheme === "dark" || storedTheme === "light" || storedTheme === "system")) {
        setTheme(storedTheme as "light" | "dark" | "system")
        return
      }
      
      // Fallback to checking system preference
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      const updateTheme = () => {
        setTheme(mediaQuery.matches ? "dark" : "light")
      }
      
      // Set initial theme
      updateTheme()
      
      // Add listener for theme changes
      mediaQuery.addEventListener("change", updateTheme)
      
      // Cleanup
      return () => {
        mediaQuery.removeEventListener("change", updateTheme)
      }
    } catch (error) {
      // If all fails, default to light theme
      console.error("Error determining theme:", error)
      setTheme("light")
    }
  }, [])
  
  return (
    <Sonner
      theme={theme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
