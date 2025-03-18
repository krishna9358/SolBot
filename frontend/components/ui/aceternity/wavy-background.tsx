"use client"
import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"

export const WavyBackground = ({
  children,
  className,
  containerClassName,
  colors,
  waveWidth,
  backgroundFill,
  blur = 10,
  speed = "slow",
  waveOpacity = 0.5,
  ...props
}: {
  children?: any
  className?: string
  containerClassName?: string
  colors?: string[]
  waveWidth?: number
  backgroundFill?: string
  blur?: number
  speed?: "slow" | "fast"
  waveOpacity?: number
  [key: string]: any
}) => {
  const noise = `
    <svg viewBox="0 0 960 540" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1">
      <filter id="noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noise)" />
    </svg>
  `

  const [svgHeight, setSvgHeight] = useState(0)
  const [mounted, setMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && containerRef.current) {
      const { height } = containerRef.current.getBoundingClientRect()
      setSvgHeight(height)
    }
  }, [mounted])

  const defaultColors = ["rgba(76, 29, 149, 0.7)", "rgba(59, 130, 246, 0.7)", "rgba(16, 185, 129, 0.7)"]

  const waveColors = colors ?? defaultColors
  const animationSpeed = speed === "fast" ? "20s" : "40s"
  const waveWidthValue = waveWidth ?? 50

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col items-center justify-center overflow-hidden ${containerClassName}`}
    >
      <svg
        className={`absolute inset-0 ${className}`}
        style={{
          filter: `blur(${blur}px)`,
        }}
        width="100%"
        height={svgHeight}
        {...props}
      >
        <rect width="100%" height="100%" fill={backgroundFill || "none"}></rect>
        {mounted &&
          waveColors.map((color, i) => (
            <motion.path
              key={i}
              d={`M 0 ${svgHeight * 0.5} Q ${waveWidthValue * 0.5} ${
                svgHeight * 0.4
              } ${waveWidthValue} ${svgHeight * 0.5} T ${waveWidthValue * 2} ${
                svgHeight * 0.5
              } T ${waveWidthValue * 3} ${svgHeight * 0.5} T ${
                waveWidthValue * 4
              } ${svgHeight * 0.5} T ${waveWidthValue * 5} ${
                svgHeight * 0.5
              } T ${waveWidthValue * 6} ${svgHeight * 0.5} T ${
                waveWidthValue * 7
              } ${svgHeight * 0.5} T ${waveWidthValue * 8} ${
                svgHeight * 0.5
              } T ${waveWidthValue * 9} ${svgHeight * 0.5} T ${
                waveWidthValue * 10
              } ${svgHeight * 0.5} T ${waveWidthValue * 11} ${
                svgHeight * 0.5
              } T ${waveWidthValue * 12} ${svgHeight * 0.5} T ${
                waveWidthValue * 13
              } ${svgHeight * 0.5} T ${waveWidthValue * 14} ${
                svgHeight * 0.5
              } T ${waveWidthValue * 15} ${svgHeight * 0.5} T ${
                waveWidthValue * 16
              } ${svgHeight * 0.5} T ${waveWidthValue * 17} ${
                svgHeight * 0.5
              } T ${waveWidthValue * 18} ${svgHeight * 0.5} T ${
                waveWidthValue * 19
              } ${svgHeight * 0.5} T ${waveWidthValue * 20} ${
                svgHeight * 0.5
              } T ${waveWidthValue * 21} ${svgHeight * 0.5} V ${svgHeight + 10} H 0 Z`}
              fill={color}
              opacity={waveOpacity}
              animate={{
                x: [0, -1 * waveWidthValue * 2],
              }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: Number(animationSpeed.replace("s", "")),
                ease: "linear",
              }}
            />
          ))}
      </svg>
      <div className="relative z-10">{children}</div>
    </div>
  )
}

