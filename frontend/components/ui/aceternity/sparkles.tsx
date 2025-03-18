"use client"
import { useState, useRef, useEffect } from "react"

export const SparklesCore = ({
  id,
  background,
  minSize,
  maxSize,
  speed = 1,
  particleColor,
  className,
  particleDensity,
}: {
  id?: string
  background?: string
  minSize?: number
  maxSize?: number
  speed?: number
  particleColor?: string
  className?: string
  particleDensity?: number
}) => {
  const [mounted, setMounted] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
  const particlesRef = useRef<any[]>([])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === canvas) {
          setCanvasSize({
            width: entry.contentRect.width,
            height: entry.contentRect.height,
          })
        }
      }
    })

    resizeObserver.observe(canvas)

    return () => {
      resizeObserver.disconnect()
    }
  }, [mounted])

  useEffect(() => {
    if (!mounted) return
    if (canvasSize.width === 0 || canvasSize.height === 0) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const density = particleDensity || 100
    const particles = Array.from({ length: density }, () => ({
      x: Math.random() * canvasSize.width,
      y: Math.random() * canvasSize.height,
      size: Math.random() * (maxSize || 3 - minSize || 1) + (minSize || 1),
      speedX: (Math.random() - 0.5) * (speed || 0.6),
      speedY: (Math.random() - 0.5) * (speed || 0.6),
      opacity: Math.random() * 0.5 + 0.3,
      hue: Math.random() * 60 + 200, // Blue to purple range
    }))

    particlesRef.current = particles

    const animate = () => {
      ctx.clearRect(0, 0, canvasSize.width, canvasSize.height)
      particlesRef.current.forEach((particle) => {
        // Create a gradient for each particle
        const gradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.size)

        const color = particleColor || `hsla(${particle.hue}, 100%, 70%, ${particle.opacity})`
        gradient.addColorStop(0, color)
        gradient.addColorStop(1, "transparent")

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()

        particle.x += particle.speedX
        particle.y += particle.speedY

        // Slowly change the hue for a magical effect
        particle.hue += 0.2
        if (particle.hue > 260) particle.hue = 200

        if (particle.x < 0 || particle.x > canvasSize.width) {
          particle.speedX = -particle.speedX
        }
        if (particle.y < 0 || particle.y > canvasSize.height) {
          particle.speedY = -particle.speedY
        }
      })

      requestAnimationFrame(animate)
    }

    animate()
  }, [canvasSize, maxSize, minSize, mounted, particleColor, particleDensity, speed])

  if (!mounted) return null

  return (
    <canvas
      ref={canvasRef}
      id={id}
      className={className}
      width={canvasSize.width}
      height={canvasSize.height}
      style={{
        background: background || "transparent",
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  )
}

