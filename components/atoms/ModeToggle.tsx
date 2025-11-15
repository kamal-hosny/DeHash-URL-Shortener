"use client"

import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"
import { useEffect, useState } from "react"

export default function ModeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const isDark = theme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      className="
        p-2 rounded-md
        bg-transparent
        hover:bg-neutral-200/40 dark:hover:bg-neutral-700/40
        transition-colors duration-200
      "
    >
      {isDark ? (
        <Moon className="w-5 h-5 text-neutral-300" />
      ) : (
        <Sun className="w-5 h-5 text-neutral-700" />
      )}
    </button>
  )
}
