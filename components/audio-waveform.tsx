"use client"

import { motion } from "framer-motion"
import { useState } from "react"

interface AudioWaveformProps {
  isPlaying: boolean
}

export function AudioWaveform({ isPlaying }: AudioWaveformProps) {
  const [bars] = useState(Array.from({ length: 40 }, (_, i) => i))

  return (
    <div className="w-full max-w-md space-y-8">
      {/* Circular avatar placeholder */}
      <div className="relative w-48 h-48 mx-auto">
        <motion.div
          animate={{
            scale: isPlaying ? [1, 1.05, 1] : 1,
            opacity: isPlaying ? [0.5, 1, 0.5] : 0.3,
          }}
          transition={{
            duration: 2,
            repeat: isPlaying ? Number.POSITIVE_INFINITY : 0,
            ease: "easeInOut",
          }}
          className="absolute inset-0 rounded-full bg-[#E61E2A]/20 blur-xl"
        />
        <div className="relative w-full h-full rounded-full bg-gradient-to-br from-[#E61E2A]/30 to-[#E61E2A]/10 border-2 border-[#E61E2A]/30 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-[#E61E2A] flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-3xl">SK</span>
          </div>
        </div>
      </div>

      {/* Waveform bars */}
      <div className="flex items-center justify-center gap-1 h-32">
        {bars.map((bar) => (
          <motion.div
            key={bar}
            className="w-1 bg-[#E61E2A] rounded-full"
            animate={{
              height: isPlaying ? [Math.random() * 60 + 20, Math.random() * 80 + 40, Math.random() * 60 + 20] : 20,
            }}
            transition={{
              duration: 0.5 + Math.random() * 0.5,
              repeat: isPlaying ? Number.POSITIVE_INFINITY : 0,
              ease: "easeInOut",
              delay: bar * 0.02,
            }}
          />
        ))}
      </div>

      {/* Status text */}
      <div className="text-center">
        <p className="text-white font-semibold">{isPlaying ? "재생 중..." : "재생 버튼을 눌러주세요"}</p>
        <p className="text-sm text-gray-400 mt-1">
          {isPlaying ? "AI 음성으로 답변을 들려드립니다" : "CEO 음성으로 답변이 재생됩니다"}
        </p>
      </div>
    </div>
  )
}
