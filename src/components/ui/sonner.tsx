
"use client"

import * as React from "react"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  // Use a simpler approach that doesn't rely on theme context immediately
  const [theme, setTheme] = React.useState<string>("system")
  
  // Use a safer approach to get the color scheme from the system
  React.useEffect(() => {
    // First try to get the theme from localStorage to match theme-provider behavior
    const storedTheme = localStorage.getItem("theme")
    if (storedTheme) {
      setTheme(storedTheme)
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
  }, [])
  
  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
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
