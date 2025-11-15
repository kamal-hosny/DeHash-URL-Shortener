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
      className={`
        w-10 h-10 flex items-center justify-center rounded-md
        border border-border shadow-sm
        backdrop-blur-md transition-colors duration-200
        ${isDark ? "bg-neutral-800/70 hover:bg-neutral-700/70" : "bg-white/70 hover:bg-neutral-200/70"}
      `}
    >
      {isDark ? (
        <Moon className="w-5 h-5 text-neutral-200" />
      ) : (
        <Sun className="w-5 h-5 text-neutral-700" />
      )}
    </button>
  )
}
