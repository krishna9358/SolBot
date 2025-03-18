"use client"
import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export const TextRevealCard = ({
  text,
  revealText,
  children,
  className,
  onClick,
}: {
  text: string
  revealText: string
  children?: React.ReactNode
  className?: string
  onClick?: () => void
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className={cn(
        "relative cursor-pointer overflow-hidden rounded-lg border border-white/[0.08] bg-gradient-to-r from-slate-900 to-blue-950 p-8 shadow-lg transition-all duration-200 hover:shadow-blue-500/20",
        className,
      )}
    >
      <div className="relative z-10 flex flex-col items-start justify-between gap-4">
        <div className="text-xl font-bold text-neutral-200">{text}</div>
        <div className="text-sm text-neutral-400">{children}</div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{
          opacity: isHovered ? 1 : 0,
          y: isHovered ? 0 : 100,
        }}
        transition={{
          duration: 0.5,
          ease: "easeInOut",
        }}
        className="absolute inset-0 z-0 flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600"
      >
        <div className="bg-clip-text text-center text-xl font-bold text-transparent bg-gradient-to-r from-white to-neutral-200">
          {revealText}
        </div>
      </motion.div>
    </div>
  )
}

