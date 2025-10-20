"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface ScoreBarChartProps {
  scores: Record<string, number>
}

export function ScoreBarChart({ scores }: ScoreBarChartProps) {
  const [animatedScores, setAnimatedScores] = useState(scores)
  const [pulseKey, setPulseKey] = useState(0)

  useEffect(() => {
    setAnimatedScores(scores)
    setPulseKey((prev) => prev + 1)
  }, [scores])

  const categories = Object.keys(scores)
  const maxScore = 10

  return (
    <div className="space-y-3">
      {categories.map((category, index) => {
        const score = animatedScores[category]
        const percentage = (score / maxScore) * 100
        const getColor = (score: number) => {
          if (score >= 8) return "from-emerald-400 to-emerald-600"
          if (score >= 6) return "from-cyan-400 to-cyan-600"
          if (score >= 4) return "from-amber-400 to-amber-600"
          return "from-red-400 to-red-600"
        }

        return (
          <motion.div
            key={category}
            className="space-y-1.5"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground font-medium text-xs">{category}</span>
              <motion.span
                key={`${category}-${pulseKey}`}
                initial={{ scale: 1.3, color: "#00C6FF" }}
                animate={{ scale: 1, color: "#F4F4F5" }}
                transition={{ duration: 0.4 }}
                className="text-primary font-bold text-sm"
              >
                {score.toFixed(1)}
              </motion.span>
            </div>
            <div className="relative h-2.5 bg-secondary/30 rounded-full overflow-hidden backdrop-blur-sm">
              <motion.div
                key={`bar-${category}-${pulseKey}`}
                initial={{ width: 0, opacity: 0.5 }}
                animate={{ width: `${percentage}%`, opacity: 1 }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.08,
                  ease: [0.4, 0, 0.2, 1],
                }}
                className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getColor(score)} rounded-full shadow-lg`}
                style={{
                  boxShadow: `0 0 20px ${score >= 8 ? "rgba(52, 211, 153, 0.5)" : "rgba(0, 198, 255, 0.5)"}`,
                }}
              />
              <motion.div
                animate={{
                  x: ["-100%", "200%"],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                  delay: index * 0.2,
                }}
                className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
