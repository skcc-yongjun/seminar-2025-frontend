"use client"

import { motion } from "framer-motion"
import { useEffect, useRef, useState } from "react"

interface ScoreRadarChartProps {
  scores: Record<string, number>
}

export function ScoreRadarChart({ scores }: ScoreRadarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [animationFrame, setAnimationFrame] = useState(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) / 2 - 30

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    const categories = Object.keys(scores)
    const values = Object.values(scores)
    const angleStep = (Math.PI * 2) / categories.length

    ctx.strokeStyle = "rgba(0, 198, 255, 0.15)"
    ctx.lineWidth = 1
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath()
      ctx.arc(centerX, centerY, (radius / 5) * i, 0, Math.PI * 2)
      ctx.stroke()
    }

    // Draw axes with glow
    ctx.strokeStyle = "rgba(0, 198, 255, 0.25)"
    ctx.lineWidth = 1
    categories.forEach((_, index) => {
      const angle = angleStep * index - Math.PI / 2
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(x, y)
      ctx.stroke()
    })

    const pulseIntensity = 0.3 + Math.sin(animationFrame * 0.1) * 0.1
    ctx.fillStyle = `rgba(0, 198, 255, ${pulseIntensity})`
    ctx.strokeStyle = "rgba(0, 198, 255, 1)"
    ctx.lineWidth = 2.5
    ctx.shadowBlur = 15
    ctx.shadowColor = "rgba(0, 198, 255, 0.8)"
    ctx.beginPath()
    values.forEach((value, index) => {
      const angle = angleStep * index - Math.PI / 2
      const distance = (value / 10) * radius
      const x = centerX + Math.cos(angle) * distance
      const y = centerY + Math.sin(angle) * distance
      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    ctx.shadowBlur = 0

    values.forEach((value, index) => {
      const angle = angleStep * index - Math.PI / 2
      const distance = (value / 10) * radius
      const x = centerX + Math.cos(angle) * distance
      const y = centerY + Math.sin(angle) * distance

      // Outer glow
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 8)
      gradient.addColorStop(0, "rgba(0, 198, 255, 1)")
      gradient.addColorStop(0.5, "rgba(0, 198, 255, 0.5)")
      gradient.addColorStop(1, "rgba(0, 198, 255, 0)")
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(x, y, 8, 0, Math.PI * 2)
      ctx.fill()

      // Inner point
      ctx.fillStyle = "#00C6FF"
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fill()
    })

    ctx.fillStyle = "rgba(244, 244, 245, 0.9)"
    ctx.font = "10px sans-serif"
    ctx.textAlign = "center"
    categories.forEach((category, index) => {
      const angle = angleStep * index - Math.PI / 2
      const labelDistance = radius + 20
      const x = centerX + Math.cos(angle) * labelDistance
      const y = centerY + Math.sin(angle) * labelDistance
      ctx.fillText(category, x, y)
    })
  }, [scores, animationFrame])

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationFrame((prev) => prev + 1)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex items-center justify-center"
    >
      <canvas ref={canvasRef} width={350} height={220} className="max-w-full" />
    </motion.div>
  )
}
