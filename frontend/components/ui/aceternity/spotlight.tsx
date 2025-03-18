"use client"
import type React from "react"
import { useRef, useState, useEffect } from "react"

interface SpotlightProps {
  children: React.ReactNode
  className?: string
  color?: string
}

export const Spotlight = ({ children, className = "", color = "blue" }: SpotlightProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseX = useRef(0)
  const mouseY = useRef(0)

  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    const container = containerRef.current
    if (!container) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      mouseX.current = x
      mouseY.current = y

      if (container) {
        const spotlightElement = container.querySelector(".spotlight") as HTMLElement
        if (spotlightElement) {
          spotlightElement.style.background = `radial-gradient(600px circle at ${x}px ${y}px, ${getColorWithOpacity(color, 0.15)}, transparent 40%)`
        }
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [isMounted, color])

  const getColorWithOpacity = (colorName: string, opacity: number) => {
    switch (colorName) {
      case "blue":
        return `rgba(59, 130, 246, ${opacity})`
      case "red":
        return `rgba(239, 68, 68, ${opacity})`
      case "green":
        return `rgba(16, 185, 129, ${opacity})`
      case "purple":
        return `rgba(139, 92, 246, ${opacity})`
      case "orange":
        return `rgba(249, 115, 22, ${opacity})`
      case "pink":
        return `rgba(236, 72, 153, ${opacity})`
      case "cyan":
        return `rgba(6, 182, 212, ${opacity})`
      default:
        return `rgba(59, 130, 246, ${opacity})`
    }
  }

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      <div
        className="spotlight absolute inset-0 pointer-events-none z-0 transition-all duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mouseX.current}px ${mouseY.current}px, ${getColorWithOpacity(color, 0.15)}, transparent 40%)`,
        }}
      />
      {children}
    </div>
  )
}

