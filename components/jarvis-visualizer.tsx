"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export function JarvisVisualizer({
  size = "large",
  onKeywordBurst,
}: {
  size?: "small" | "medium" | "large"
  onKeywordBurst?: () => void
}) {
  const [audioLevel, setAudioLevel] = useState(0.5)
  const [particles, setParticles] = useState<Array<{ id: number; angle: number; distance: number }>>([])
  const [burstEffect, setBurstEffect] = useState(false)

  const sizeConfig = {
    small: { container: "w-40 h-40", core: "w-16 h-16", inner: "w-10 h-10", particleDistance: 70 },
    medium: { container: "w-52 h-52", core: "w-20 h-20", inner: "w-12 h-12", particleDistance: 90 },
    large: { container: "w-64 h-64", core: "w-24 h-24", inner: "w-16 h-16", particleDistance: 120 },
  }

  const config = sizeConfig[size]

  useEffect(() => {
    const audioInterval = setInterval(() => {
      setAudioLevel(Math.random() * 0.6 + 0.4)
    }, 100)

    const particleInterval = setInterval(() => {
      const newParticles = Array.from({ length: 12 }, (_, i) => ({
        id: Date.now() + i,
        angle: (i * 360) / 12,
        distance: 0,
      }))
      setParticles(newParticles)
    }, 2000)

    const burstInterval = setInterval(() => {
      setBurstEffect(true)
      onKeywordBurst?.()
      setTimeout(() => setBurstEffect(false), 800)
    }, 10000) // Triggers every 10 seconds

    return () => {
      clearInterval(audioInterval)
      clearInterval(particleInterval)
      clearInterval(burstInterval)
    }
  }, [onKeywordBurst])

  return (
    <div className={`relative ${config.container} flex items-center justify-center`}>
      {burstEffect && (
        <>
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={`burst-${i}`}
              className="absolute inset-0 rounded-full border-4 border-sk-red"
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 2.5, opacity: 0 }}
              transition={{
                duration: 1.2,
                delay: i * 0.15,
                ease: "easeOut",
              }}
            />
          ))}
          {Array.from({ length: 24 }, (_, i) => (
            <motion.div
              key={`radial-${i}`}
              className="absolute w-2 h-2 bg-sk-red rounded-full shadow-lg shadow-sk-red/50"
              initial={{
                x: 0,
                y: 0,
                opacity: 1,
                scale: 1,
              }}
              animate={{
                x: Math.cos((i * 15 * Math.PI) / 180) * 150,
                y: Math.sin((i * 15 * Math.PI) / 180) * 150,
                opacity: 0,
                scale: 0.3,
              }}
              transition={{
                duration: 1,
                ease: "easeOut",
              }}
            />
          ))}
        </>
      )}

      <motion.div
        className="absolute inset-0 rounded-full border-2 border-sk-red/30 shadow-md shadow-sk-red/10"
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      >
        <div className="absolute top-0 left-1/2 w-2.5 h-2.5 -ml-1.25 -mt-1.25 bg-sk-red rounded-full shadow-md shadow-sk-red/50" />
        <div className="absolute bottom-0 left-1/2 w-2.5 h-2.5 -ml-1.25 -mb-1.25 bg-sk-red rounded-full shadow-md shadow-sk-red/50" />
      </motion.div>

      <motion.div
        className="absolute inset-4 rounded-full border-2 border-sk-red/20 shadow-md shadow-sk-red/10"
        animate={{ rotate: -360 }}
        transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      >
        <div className="absolute top-1/2 right-0 w-2.5 h-2.5 -mr-1.25 -mt-1.25 bg-sk-red/80 rounded-full shadow-md shadow-sk-red/50" />
        <div className="absolute top-1/2 left-0 w-2.5 h-2.5 -ml-1.25 -mt-1.25 bg-sk-red/80 rounded-full shadow-md shadow-sk-red/50" />
      </motion.div>

      <motion.div
        className="absolute inset-8 rounded-full border-2 border-sk-red/40 shadow-md shadow-sk-red/15"
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{ duration: 2.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />

      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full border-2 border-sk-red/20"
          style={{
            background: `radial-gradient(circle, transparent 60%, rgba(234, 0, 44, ${0.06 - i * 0.01}) 100%)`,
          }}
          animate={{
            scale: [1, 1.5 + i * 0.2],
            opacity: [0.4, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Number.POSITIVE_INFINITY,
            delay: i * 0.6,
            ease: "easeOut",
          }}
        />
      ))}

      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-1 h-1 bg-sk-red rounded-full shadow-sm shadow-sk-red/30"
          initial={{
            x: 0,
            y: 0,
            opacity: 0.8,
          }}
          animate={{
            x: Math.cos((particle.angle * Math.PI) / 180) * config.particleDistance,
            y: Math.sin((particle.angle * Math.PI) / 180) * config.particleDistance,
            opacity: 0,
          }}
          transition={{
            duration: 2,
            ease: "easeOut",
          }}
        />
      ))}

      <motion.div
        className={`relative ${config.core} rounded-full corporate-card border-2 border-sk-red/30 flex items-center justify-center shadow-lg shadow-sk-red/20`}
        animate={{
          scale: [1, 1 + audioLevel * 0.15, 1],
        }}
        transition={{
          duration: 0.1,
        }}
      >
        <motion.div
          className={`${config.inner} rounded-full bg-gradient-to-br from-sk-red/80 via-sk-red/60 to-sk-red/80 shadow-xl shadow-sk-red/40`}
          style={{
            backgroundSize: "200% 200%",
          }}
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.7, 0.9, 0.7],
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{
            duration: 3.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />

        <div className="absolute inset-0 rounded-full bg-sk-red/20 blur-xl" />
        <div className="absolute inset-2 rounded-full bg-sk-red/15 blur-lg" />
      </motion.div>

      <motion.div
        className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-medium whitespace-nowrap text-foreground"
        animate={{
          opacity: [0.6, 0.9, 0.6],
        }}
        transition={{
          duration: 2.5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        AI 분석 중...
      </motion.div>
    </div>
  )
}
