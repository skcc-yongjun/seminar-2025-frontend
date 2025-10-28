"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface Particle {
  x: number
  y: number
  z: number
  size: number
  delay: number
  hemisphere: "left" | "right"
}

export function Brain3D({ className = "" }: { className?: string }) {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    const newParticles: Particle[] = []
    const particleCount = 120

    for (let i = 0; i < particleCount; i++) {
      const hemisphere = i < particleCount / 2 ? "left" : "right"
      const side = hemisphere === "left" ? -1 : 1

      // Create brain lobes with different densities
      const lobe = Math.floor(Math.random() * 4) // frontal, parietal, temporal, occipital

      let baseX = 0,
        baseY = 0,
        baseZ = 0
      let radiusX = 0,
        radiusY = 0,
        radiusZ = 0

      // Define lobe positions and sizes
      if (lobe === 0) {
        // Frontal lobe (front, larger)
        baseY = -15
        baseZ = 20
        radiusX = 25
        radiusY = 30
        radiusZ = 25
      } else if (lobe === 1) {
        // Parietal lobe (top-back)
        baseY = -20
        baseZ = -5
        radiusX = 22
        radiusY = 25
        radiusZ = 20
      } else if (lobe === 2) {
        // Temporal lobe (side-bottom)
        baseY = 10
        baseZ = 5
        radiusX = 20
        radiusY = 20
        radiusZ = 18
      } else {
        // Occipital lobe (back)
        baseY = 0
        baseZ = -25
        radiusX = 18
        radiusY = 22
        radiusZ = 18
      }

      // Add randomness for organic brain texture
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI

      const x = side * (baseX + radiusX * Math.sin(phi) * Math.cos(theta) * (0.8 + Math.random() * 0.4))
      const y = baseY + radiusY * Math.sin(phi) * Math.sin(theta) * (0.8 + Math.random() * 0.4)
      const z = baseZ + radiusZ * Math.cos(phi) * (0.8 + Math.random() * 0.4)

      // Add sulci (brain folds) effect - some particles cluster together
      const foldFactor = Math.random() < 0.3 ? 0.7 : 1

      newParticles.push({
        x: x * foldFactor,
        y: y * foldFactor,
        z: z * foldFactor,
        size: 1.5 + Math.random() * 2.5,
        delay: Math.random() * 2,
        hemisphere,
      })
    }

    setParticles(newParticles)
  }, [])

  return (
    <div className={`relative ${className}`} style={{ perspective: "1000px" }}>
      <motion.div
        className="relative w-full h-full"
        animate={{
          rotateY: [0, 360],
        }}
        transition={{
          duration: 25,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        <motion.div
          className="absolute left-1/2 top-1/2 w-0.5 h-32 -translate-x-1/2 -translate-y-1/2"
          style={{
            background: "linear-gradient(to bottom, transparent, rgba(34, 211, 238, 0.3), transparent)",
            transformStyle: "preserve-3d",
          }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />

        {/* Particle cloud forming brain shape */}
        {particles.map((particle, i) => {
          const scale = (particle.z + 60) / 120
          const opacity = 0.4 + ((particle.z + 60) / 120) * 0.6
          const blur = Math.max(0, (60 - particle.z) / 25)

          // Different colors for different hemispheres
          const color = particle.hemisphere === "left" ? "rgba(34, 211, 238, " : "rgba(59, 130, 246, "

          return (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                left: "50%",
                top: "50%",
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                transform: `translate(-50%, -50%) translate3d(${particle.x}px, ${particle.y}px, ${particle.z}px) scale(${scale})`,
                background: `radial-gradient(circle, ${color}${opacity}), ${color}${opacity * 0.5}))`,
                boxShadow: `0 0 ${6 * scale}px ${color}${opacity * 0.8})`,
                filter: `blur(${blur}px)`,
              }}
              animate={{
                scale: [scale, scale * 1.15, scale],
                opacity: [opacity, opacity * 0.7, opacity],
              }}
              transition={{
                duration: 2.5 + particle.delay,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: particle.delay,
              }}
            />
          )
        })}

        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ transform: "translateZ(0)" }}>
          {particles.slice(0, 40).map((particle, i) => {
            if (i % 2 !== 0) return null

            // Connect to nearby particles in same hemisphere
            const nearbyParticles = particles.filter(
              (p) =>
                p.hemisphere === particle.hemisphere &&
                Math.abs(p.x - particle.x) < 30 &&
                Math.abs(p.y - particle.y) < 30 &&
                Math.abs(p.z - particle.z) < 30,
            )

            if (nearbyParticles.length === 0) return null

            const nextParticle = nearbyParticles[Math.floor(Math.random() * nearbyParticles.length)]
            const scale1 = (particle.z + 60) / 120
            const scale2 = (nextParticle.z + 60) / 120
            const opacity = Math.min(scale1, scale2) * 0.25

            return (
              <motion.line
                key={`line-${i}`}
                x1={`calc(50% + ${particle.x * scale1}px)`}
                y1={`calc(50% + ${particle.y * scale1}px)`}
                x2={`calc(50% + ${nextParticle.x * scale2}px)`}
                y2={`calc(50% + ${nextParticle.y * scale2}px)`}
                stroke={particle.hemisphere === "left" ? "rgba(34, 211, 238, 0.3)" : "rgba(59, 130, 246, 0.3)"}
                strokeWidth="0.5"
                opacity={opacity}
                animate={{
                  opacity: [opacity, opacity * 0.4, opacity],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                  delay: particle.delay,
                }}
              />
            )
          })}
        </svg>

        {/* Central glow */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full"
          style={{
            background: "radial-gradient(ellipse 60% 50%, rgba(34, 211, 238, 0.15), transparent 70%)",
            filter: "blur(25px)",
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />

        {[...Array(6)].map((_, i) => {
          const angle = (i / 6) * Math.PI * 2
          const radius = 45
          return (
            <motion.div
              key={`pulse-${i}`}
              className="absolute w-2 h-2 rounded-full"
              style={{
                left: "50%",
                top: "50%",
                transform: `translate(-50%, -50%) translate3d(${Math.cos(angle) * radius}px, ${Math.sin(angle) * radius - 10}px, ${20}px)`,
                background: "radial-gradient(circle, rgba(34, 211, 238, 0.8), rgba(59, 130, 246, 0.4))",
                boxShadow: "0 0 10px rgba(34, 211, 238, 0.8)",
              }}
              animate={{
                scale: [1, 2, 1],
                opacity: [0.8, 0.2, 0.8],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.3,
                ease: "easeInOut",
              }}
            />
          )
        })}
      </motion.div>

      {/* Ambient neural activity particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={`ambient-${i}`}
          className="absolute w-1 h-1 bg-cyan-400 rounded-full"
          style={{
            left: `${15 + Math.random() * 70}%`,
            top: `${15 + Math.random() * 70}%`,
            boxShadow: "0 0 4px rgba(34, 211, 238, 0.8)",
          }}
          animate={{
            y: [-25, 25, -25],
            x: [-15, 15, -15],
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 3.5 + Math.random() * 2,
            repeat: Number.POSITIVE_INFINITY,
            delay: Math.random() * 3,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}

