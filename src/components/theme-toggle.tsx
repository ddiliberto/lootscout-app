"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // useEffect only runs on the client, so now we can safely show the UI
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-white hover:text-gray-300 transition-colors"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Moon className="h-4 w-4 transition-transform duration-200 ease-in-out" />
      ) : (
        <Sun className="h-4 w-4 transition-transform duration-200 ease-in-out" />
      )}
    </Button>
  )
} 