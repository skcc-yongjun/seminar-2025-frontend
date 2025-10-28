"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, Brain, Target, TrendingUp, Cpu } from "lucide-react"
import { useEffect, useState } from "react"
import { fetchQnACategories } from "@/lib/api"

export default function QnACategories() {
  const [keywords, setKeywords] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadKeywords = async () => {
      try {
        setLoading(true)
        const data = await fetchQnACategories()
        setKeywords(data)
      } catch (err) {
        console.error('키워드 로딩 실패:', err)
        setError('키워드를 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    loadKeywords()
  }, [])



  // 고정된 카테고리 설정 (API 응답과 관계없이 일관된 UI 유지)
  const fixedCategories = [
    {
      id: "group",
      title: "AI 전략 방향",
      subtitle: "AI 전략 방향",
      icon: Target,
      color: "#4a5f8f",
      glowColor: "#6b8cce",
      position: "top",
      angle: 0,
    },
    {
      id: "market", 
      title: "AI 경쟁 전략",
      subtitle: "AI 경쟁 전략",
      icon: TrendingUp,
      color: "#4a5f8f",
      glowColor: "#6b8cce",
      position: "left",
      angle: 240,
    },
    {
      id: "business",
      title: "AI Biz. 전환",
      subtitle: "AI Biz. 전환",
      icon: Cpu,
      color: "#5a4f8f",
      glowColor: "#8b7cce",
      position: "right",
      angle: 120,
    },
  ]

  // API에서 받은 키워드를 기반으로 제목만 업데이트 (색상과 모양은 고정)
  const transformedCategories = keywords.length > 0 ? fixedCategories.map((fixedCategory, index) => {
    const keyword = keywords[index]
    
    return {
      ...fixedCategory, // 고정된 스타일 유지
      title: keyword || fixedCategory.title, // API에서 키워드를 제목으로 사용
      subtitle: keyword || fixedCategory.subtitle,
    }
  }) : fixedCategories

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(to bottom, #0a1628, #0f1f3a, #0a1628)" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-blue-300 text-lg">키워드를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(to bottom, #0a1628, #0f1f3a, #0a1628)" }}>
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  const createFanPath = (angle: number, innerRadius: number, outerRadius: number, arcWidth: number) => {
    const startAngle = angle - arcWidth / 2
    const endAngle = angle + arcWidth / 2

    const toRadians = (deg: number) => (deg * Math.PI) / 180

    // Outer arc points
    const outerStart = {
      x: 400 + outerRadius * Math.sin(toRadians(startAngle)),
      y: 400 - outerRadius * Math.cos(toRadians(startAngle)),
    }
    const outerEnd = {
      x: 400 + outerRadius * Math.sin(toRadians(endAngle)),
      y: 400 - outerRadius * Math.cos(toRadians(endAngle)),
    }

    // Inner arc points
    const innerStart = {
      x: 400 + innerRadius * Math.sin(toRadians(startAngle)),
      y: 400 - innerRadius * Math.cos(toRadians(startAngle)),
    }
    const innerEnd = {
      x: 400 + innerRadius * Math.sin(toRadians(endAngle)),
      y: 400 - innerRadius * Math.cos(toRadians(endAngle)),
    }

    return `
      M ${innerStart.x} ${innerStart.y}
      L ${outerStart.x} ${outerStart.y}
      A ${outerRadius} ${outerRadius} 0 0 1 ${outerEnd.x} ${outerEnd.y}
      L ${innerEnd.x} ${innerEnd.y}
      A ${innerRadius} ${innerRadius} 0 0 0 ${innerStart.x} ${innerStart.y}
      Z
    `
  }

  return (
    <div
      className="min-h-screen p-8 md:p-12 relative overflow-hidden"
      style={{ background: "linear-gradient(to bottom, #0a1628, #0f1f3a, #0a1628)" }}
    >
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
          animate={{
            backgroundPosition: ["0px 0px", "50px 50px"],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      </div>

      <motion.div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(180deg, transparent 0%, rgba(34, 211, 238, 0.1) 50%, transparent 100%)",
          height: "200px",
        }}
        animate={{
          y: ["-200px", "100vh"],
        }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />

      {[...Array(20)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="fixed w-1 h-1 bg-cyan-400 rounded-full pointer-events-none"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Number.POSITIVE_INFINITY,
            delay: Math.random() * 5,
            ease: "easeInOut",
          }}
        />
      ))}

      <div className="fixed inset-0 pointer-events-none opacity-5">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hexagons" width="50" height="43.4" patternUnits="userSpaceOnUse">
              <polygon
                points="24.8,22 37.3,29.2 37.3,43.7 24.8,50.9 12.3,43.7 12.3,29.2"
                fill="none"
                stroke="rgba(59, 130, 246, 0.5)"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hexagons)" />
        </svg>
      </div>

      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-300/70 hover:text-blue-300 transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>메인으로 돌아가기</span>
          </Link>

          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Q&A 카테고리
            <span className="block h-1 w-32 bg-gradient-to-r from-blue-500 to-cyan-500 mt-2 shadow-lg shadow-blue-500/50" />
          </h1>
        </motion.div>

        <div className="relative flex items-center justify-center min-h-[800px] mt-16">
          <svg
            viewBox="0 0 800 800"
            className="w-full max-w-[800px] h-auto"
            style={{ filter: "drop-shadow(0 0 20px rgba(59, 130, 246, 0.3))" }}
          >
            <defs>
              {transformedCategories.map((category, index) => (
                <linearGradient
                  key={`grad-${index}`}
                  id={`gradient-${index}`}
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor={category.color} stopOpacity="0.6" />
                  <stop offset="100%" stopColor={category.color} stopOpacity="0.8" />
                </linearGradient>
              ))}

              <radialGradient id="energyPulse">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
              </radialGradient>

              <radialGradient id="brainGradient1">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.6" />
              </radialGradient>
              <radialGradient id="brainGradient2">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.4" />
              </radialGradient>
            </defs>

            {[...Array(3)].map((_, i) => (
              <motion.circle
                key={`pulse-${i}`}
                cx="400"
                cy="400"
                r="100"
                fill="none"
                stroke="url(#energyPulse)"
                strokeWidth="2"
                opacity="0"
                animate={{
                  r: [100, 300],
                  opacity: [0.6, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: i * 1,
                  ease: "easeOut",
                }}
              />
            ))}

            {transformedCategories.map((category, index) => (
              <motion.g
                key={category.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.15, type: "spring" }}
              >
                <Link href={`/qna/${category.id}`}>
                  <motion.path
                    d={createFanPath(category.angle, 140, 320, 80)}
                    fill={`url(#gradient-${index})`}
                    stroke={category.glowColor}
                    strokeWidth="2"
                    className="cursor-pointer transition-all duration-300"
                    whileHover={{
                      fill: category.glowColor,
                      fillOpacity: 0.4,
                      strokeWidth: 3,
                      filter: `drop-shadow(0 0 15px ${category.glowColor})`,
                    }}
                    style={{
                      filter: `drop-shadow(0 0 8px ${category.glowColor})`,
                    }}
                  />
                </Link>
              </motion.g>
            ))}

            <motion.g
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <motion.circle
                cx="400"
                cy="400"
                r="150"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeDasharray="10 15"
                opacity="0.6"
                animate={{ strokeDashoffset: [0, -100] }}
                transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                style={{
                  filter: "drop-shadow(0 0 6px #3b82f6)",
                }}
              />
              <motion.circle
                cx="400"
                cy="400"
                r="170"
                fill="none"
                stroke="#22d3ee"
                strokeWidth="1.5"
                strokeDasharray="8 12"
                opacity="0.5"
                animate={{ strokeDashoffset: [0, 80] }}
                transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                style={{
                  filter: "drop-shadow(0 0 5px #22d3ee)",
                }}
              />
              <motion.circle
                cx="400"
                cy="400"
                r="190"
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="1"
                strokeDasharray="6 10"
                opacity="0.5"
                animate={{ strokeDashoffset: [0, -64] }}
                transition={{ duration: 12, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                style={{
                  filter: "drop-shadow(0 0 4px #8b5cf6)",
                }}
              />

              {/* Inner orbit - 8 cyan dots at radius 140 */}
              {[...Array(8)].map((_, i) => {
                const angle = (i * 45 * Math.PI) / 180
                const radius = 140
                return (
                  <motion.circle
                    key={`orbit-inner-${i}`}
                    cx="400"
                    cy="400"
                    r="4"
                    fill="#22d3ee"
                    opacity="0.9"
                    style={{
                      filter: "drop-shadow(0 0 6px #22d3ee)",
                    }}
                    animate={{
                      cx: [400 + radius * Math.cos(angle), 400 + radius * Math.cos(angle + Math.PI * 2)],
                      cy: [400 + radius * Math.sin(angle), 400 + radius * Math.sin(angle + Math.PI * 2)],
                    }}
                    transition={{
                      duration: 12,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                      delay: i * 0.3,
                    }}
                  />
                )
              })}

              {/* Middle orbit - 8 blue dots at radius 160 */}
              {[...Array(8)].map((_, i) => {
                const angle = (i * 45 * Math.PI) / 180 + Math.PI / 8
                const radius = 160
                return (
                  <motion.circle
                    key={`orbit-middle-${i}`}
                    cx="400"
                    cy="400"
                    r="3.5"
                    fill="#3b82f6"
                    opacity="0.85"
                    style={{
                      filter: "drop-shadow(0 0 5px #3b82f6)",
                    }}
                    animate={{
                      cx: [400 + radius * Math.cos(angle), 400 + radius * Math.cos(angle - Math.PI * 2)],
                      cy: [400 + radius * Math.sin(angle), 400 + radius * Math.sin(angle - Math.PI * 2)],
                    }}
                    transition={{
                      duration: 18,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                      delay: i * 0.4,
                    }}
                  />
                )
              })}

              {/* Outer orbit - 8 purple dots at radius 180 */}
              {[...Array(8)].map((_, i) => {
                const angle = (i * 45 * Math.PI) / 180
                const radius = 180
                return (
                  <motion.circle
                    key={`orbit-outer-${i}`}
                    cx="400"
                    cy="400"
                    r="3"
                    fill="#8b5cf6"
                    opacity="0.8"
                    style={{
                      filter: "drop-shadow(0 0 4px #8b5cf6)",
                    }}
                    animate={{
                      cx: [400 + radius * Math.cos(angle), 400 + radius * Math.cos(angle + Math.PI * 2)],
                      cy: [400 + radius * Math.sin(angle), 400 + radius * Math.sin(angle + Math.PI * 2)],
                    }}
                    transition={{
                      duration: 24,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                      delay: i * 0.5,
                    }}
                  />
                )
              })}

              <circle cx="400" cy="400" r="120" fill="url(#brainGradient1)" opacity="0.15" />
              <circle cx="400" cy="400" r="110" fill="url(#brainGradient2)" opacity="0.2" />

              <circle cx="400" cy="400" r="100" fill="#0a1628" opacity="0.95" />

              <circle cx="400" cy="400" r="95" fill="url(#brainGradient1)" opacity="0.1" />
              <circle cx="400" cy="400" r="90" fill="#0f1f3a" opacity="0.8" />

              <motion.circle
                cx="400"
                cy="400"
                r="100"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                opacity="0.6"
                style={{ filter: "drop-shadow(0 0 20px #3b82f6)" }}
                animate={{
                  strokeWidth: [3, 4, 3],
                  opacity: [0.6, 0.8, 0.6],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              />

              <motion.circle
                cx="400"
                cy="400"
                r="105"
                fill="none"
                stroke="#22d3ee"
                strokeWidth="1.5"
                opacity="0.4"
                style={{ filter: "drop-shadow(0 0 15px #22d3ee)" }}
                animate={{
                  opacity: [0.4, 0.6, 0.4],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              />

              <foreignObject x="320" y="320" width="160" height="160">
                <div className="w-full h-full flex items-center justify-center">
                  <motion.div
                    className="relative"
                    animate={{
                      filter: [
                        "drop-shadow(0 0 12px rgba(59, 130, 246, 0.9)) drop-shadow(0 0 25px rgba(34, 211, 238, 0.6))",
                        "drop-shadow(0 0 20px rgba(34, 211, 238, 0.9)) drop-shadow(0 0 35px rgba(59, 130, 246, 0.6))",
                        "drop-shadow(0 0 12px rgba(59, 130, 246, 0.9)) drop-shadow(0 0 25px rgba(34, 211, 238, 0.6))",
                      ],
                      scale: [1, 1.05, 1],
                    }}
                    transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                  >
                    <Brain className="w-28 h-28 text-blue-900/40 absolute top-1 left-1" strokeWidth={1.5} />
                    <Brain
                      className="w-28 h-28 text-cyan-300 relative"
                      strokeWidth={1.5}
                      style={{
                        filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))",
                      }}
                    />
                    <Brain className="w-28 h-28 text-blue-200/30 absolute top-0 left-0" strokeWidth={1} />
                  </motion.div>
                </div>
              </foreignObject>
            </motion.g>

            {transformedCategories.map((category, index) => {
              const Icon = category.icon
              const angle = category.angle
              const radius = 230
              const radian = (angle * Math.PI) / 180
              const x = 400 + radius * Math.sin(radian)
              const y = 400 - radius * Math.cos(radian)

              return (
                <motion.g
                  key={`content-${category.id}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <foreignObject x={x - 80} y={y - 50} width="160" height="100">
                    <Link href={`/qna/${category.id}`} className="block group">
                      <div className="flex flex-col items-center justify-center text-center gap-2">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm border-2 transition-all duration-300 group-hover:scale-110"
                          style={{
                            backgroundColor: `${category.color}80`,
                            borderColor: category.glowColor,
                            boxShadow: `0 0 15px ${category.glowColor}40`,
                          }}
                        >
                          <Icon className="w-6 h-6 text-white" strokeWidth={1.5} />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-white mb-0.5 group-hover:scale-105 transition-transform">
                            {category.title}
                          </h2>
                          <p className="text-blue-300/70 text-xs">{category.subtitle}</p>
                        </div>
                      </div>
                    </Link>
                  </foreignObject>
                </motion.g>
              )
            })}
          </svg>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-8"
        >
          <p className="text-blue-300/70 text-lg">AI 기반 비즈니스 전략의 세 가지 핵심 영역을 탐색하세요</p>
        </motion.div>
      </div>
    </div>
  )
}
