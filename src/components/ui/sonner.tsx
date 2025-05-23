
"use client"

import * as React from "react"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const [currentTheme, setCurrentTheme] = React.useState<"light" | "dark" | "system">("system")
  
  // Use a safe approach to get the theme
  React.useEffect(() => {
    try {
      // Try to get saved theme from localStorage
      const savedTheme = localStorage.getItem("theme")
      if (savedTheme === "dark" || savedTheme === "light" || savedTheme === "system") {
        setCurrentTheme(savedTheme)
        return
      }
      
      // Fallback to system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      setCurrentTheme(prefersDark ? "dark" : "light")
      
    } catch (error) {
      console.error("Error determining theme:", error)
      // Default to system if there's an error
      setCurrentTheme("system")
    }
  }, [])
  
  return (
    <Sonner
      theme={currentTheme}
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
