"use client"
import type React from "react"
import { cn } from "@/lib/utils"

export const MovingBorder = ({
  children,
  duration = 2000,
  className,
  containerClassName,
  borderRadius = "1.75rem",
  colors = ["#2563eb", "#4f46e5", "#0ea5e9"],
  as: Component = "div",
}: {
  children: React.ReactNode
  duration?: number
  className?: string
  containerClassName?: string
  borderRadius?: string
  colors?: string[]
  as?: any
}) => {
  const gradientColors = colors.join(", ")

  return (
    <Component
      className={cn("relative p-[4px] group", containerClassName)}
      style={{
        borderRadius: borderRadius,
      }}
    >
      <div
        className="absolute inset-0 rounded-[inherit]"
        style={{
          background: `linear-gradient(to right, ${gradientColors})`,
          backgroundSize: "200% 200%",
          animation: `gradient-animation ${duration}ms linear infinite`,
          borderRadius: borderRadius,
        }}
      />
      <div
        className={cn("relative bg-slate-950 h-full w-full flex items-center justify-center", className)}
        style={{
          borderRadius: `calc(${borderRadius} - 4px)`,
        }}
      >
        {children}
      </div>
    </Component>
  )
}

