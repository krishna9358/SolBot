"use client"
import type React from "react"
import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"

export const AnimatedTooltip = ({
  items,
  className,
}: {
  items: {
    id: number
    name: string
    icon: React.ReactNode
    action?: () => void
  }[]
  className?: string
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <div className={cn("flex flex-row items-center justify-center gap-2 md:gap-4", className)}>
      {items.map((item, idx) => (
        <div
          key={item.id}
          className="relative group"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
          onClick={item.action}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.6 }}
                animate={{
                  opacity: 1,
                  y: -20,
                  scale: 1,
                  transition: {
                    type: "spring",
                    stiffness: 260,
                    damping: 10,
                  },
                }}
                exit={{ opacity: 0, y: 20, scale: 0.6 }}
                className="absolute -top-16 left-1/2 -translate-x-1/2 flex items-center justify-center z-50"
              >
                <div className="bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-md text-xs font-medium shadow-glow-sm border border-white/10">
                  {item.name}
                </div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-solid border-l-transparent border-r-transparent border-t-black/80 border-l-[5px] border-r-[5px] border-t-[5px]" />
              </motion.div>
            )}
          </AnimatePresence>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-full transition-all duration-300 hover:bg-white/10 cursor-pointer"
          >
            {item.icon}
          </motion.button>
        </div>
      ))}
    </div>
  )
}

