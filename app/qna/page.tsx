"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, Brain, Target, TrendingUp, Cpu } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { fetchQnACategories, fetchRandomSelectedQuestionByKeyword } from "@/lib/api"

export default function QnACategories() {
  const [keywordPairs, setKeywordPairs] = useState<{title: string, titleEn: string}[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [clickedCategory, setClickedCategory] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const loadKeywords = async () => {
      try {
        setLoading(true)
        const data = await fetchQnACategories()
        setKeywordPairs(data)
      } catch (err) {
        console.error('키워드 로딩 실패:', err)
        setError('키워드를 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    loadKeywords()
  }, [])

  const handleCategoryClick = async (keyword: string) => {
    try {
      setClickedCategory(keyword)

      // 생성 중 화면을 보여주기 위해 약간의 딜레이 후 category 페이지로 이동
      setTimeout(() => {
        router.push(`/qna/${encodeURIComponent(keyword)}`)
      }, 500)
    } catch (err) {
      console.error('카테고리 이동 실패:', err)
      setError(err instanceof Error ? err.message : '카테고리로 이동하는데 실패했습니다.')
      setClickedCategory(null)
    }
  }

  const handleBrainClick = () => {
    console.log('🧠 [LIVE QA] Brain 아이콘 클릭 - User 화면으로 이동')
    // Live Q&A User 화면으로 이동 (활성 세션을 자동으로 감지)
    router.push('/qna/live/active')
  }



  // UI 스타일만 하드코딩 (색상, 아이콘, 위치 등)
  const uiStyles = [
    {
      icon: Target,
      color: "#4a5f8f",
      glowColor: "#6b8cce",
      position: "top",
      angle: 0,
    },
    {
      icon: TrendingUp,
      color: "#4a5f8f", 
      glowColor: "#6b8cce",
      position: "left",
      angle: 240,
    },
    {
      icon: Cpu,
      color: "#5a4f8f",
      glowColor: "#8b7cce",
      position: "right",
      angle: 120,
    },
  ]

  // API에서 받은 키워드 쌍과 UI 스타일을 결합하여 카테고리 생성
  const transformedCategories = keywordPairs.length > 0 ? keywordPairs.map((keywordPair, index) => {
    const style = uiStyles[index % uiStyles.length] // 스타일 순환 사용
    
    return {
      id: keywordPair.title, // 한글 키워드를 ID로 사용
      title: keywordPair.title, // 한글 키워드를 제목으로 사용
      titleEn: keywordPair.titleEn, // 영어 키워드를 영어 제목으로 사용
      ...style, // UI 스타일 적용
    }
  }) : uiStyles.map((style, index) => ({
    id: `default-${index}`,
    title: `기본 카테고리 ${index + 1}`,
    titleEn: `Default Category ${index + 1}`,
    ...style,
  }))

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(to bottom, #0a1628, #0f1f3a, #0a1628)" }}>
        <div className="text-center">
          {/* AI 생성 중 애니메이션 (모든 로딩 상태에서 동일) */}
          <div className="relative">
            {/* 뇌 아이콘 애니메이션 */}
            <motion.div
              className="relative mx-auto mb-8"
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            >
              <Brain className="w-32 h-32 text-blue-500 mx-auto" strokeWidth={1.5} />
              <motion.div
                className="absolute inset-0"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              >
                <Brain className="w-32 h-32 text-cyan-400" strokeWidth={1} />
              </motion.div>
            </motion.div>

            {/* 점들 애니메이션 */}
            <div className="flex justify-center space-x-2 mb-6">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 bg-blue-400 rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: i * 0.2,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>

            <h2 className="text-4xl font-bold text-white mb-4">
              AI가 열심히 질문을 생성 중입니다
            </h2>
            <p className="text-blue-300 text-xl mb-2">
              {clickedCategory ? `${clickedCategory} 카테고리의 맞춤형 질문을 만들고 있어요` : '키워드를 불러오고 있어요'}
            </p>
            <p className="text-blue-400/70 text-base">
              잠시만 기다려주세요...
            </p>

            {/* 진행 바 */}
            <div className="w-64 h-2 bg-blue-900/30 rounded-full mx-auto mt-6 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(to bottom, #0a1628, #0f1f3a, #0a1628)" }}>
        <div className="text-center">
          {/* AI 생성 중 애니메이션 (에러 상태에서도) */}
          <div className="relative mb-8">
            <motion.div
              className="relative mx-auto mb-6"
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            >
              <Brain className="w-24 h-24 text-blue-500 mx-auto" strokeWidth={1.5} />
              <motion.div
                className="absolute inset-0"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              >
                <Brain className="w-24 h-24 text-cyan-400" strokeWidth={1} />
              </motion.div>
            </motion.div>

            {/* 점들 애니메이션 */}
            <div className="flex justify-center space-x-2 mb-4">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-blue-400 rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: i * 0.2,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          </div>

          <h2 className="text-4xl font-bold text-white mb-4">
            AI가 열심히 질문을 생성 중입니다
          </h2>
          <p className="text-blue-300 text-xl mb-2">
            {clickedCategory} 카테고리의 맞춤형 질문을 만들고 있어요
          </p>
          <p className="text-blue-400/70 text-base mb-6">
            잠시만 기다려주세요...
          </p>

          <button 
            onClick={() => {
              setError(null)
              setLoading(false)
              setClickedCategory(null)
            }} 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            돌아가기
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
      {/* Loading overlay when category is clicked */}
      {clickedCategory && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(10, 22, 40, 0.95)" }}
        >
          <div className="text-center">
            {/* 회전하는 외부 링 */}
            <div className="relative h-64 w-64 mx-auto mb-8">
              <motion.div
                className="absolute inset-0"
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 25,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-500 rounded-full blur-3xl opacity-30" />
              </motion.div>

              {/* 펄스 링 */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full border-2 border-cyan-500/30"
                  animate={{
                    scale: [1, 1.5, 1.5],
                    opacity: [0.6, 0, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: i * 1,
                    ease: "easeOut",
                  }}
                />
              ))}

              {/* Brain 아이콘 */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.div
                  onClick={handleBrainClick}
                  className="cursor-pointer pointer-events-auto relative z-10"
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    scale: {
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    },
                    rotate: {
                      duration: 3,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    },
                  }}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Brain
                    className="w-32 h-32 text-cyan-400"
                    strokeWidth={1.5}
                    style={{
                      filter: "drop-shadow(0 0 20px rgba(34, 211, 238, 0.8))",
                    }}
                  />
                  <div className="absolute top-full mt-2 text-center text-cyan-300 text-sm font-medium whitespace-nowrap">
                    실시간 질문하기
                  </div>
                </motion.div>
              </div>

              {/* 주변 파티클 */}
              {[...Array(8)].map((_, i) => {
                const angle = (i * 45 * Math.PI) / 180
                const radius = 100
                return (
                  <motion.div
                    key={`particle-${i}`}
                    className="absolute w-2 h-2 bg-cyan-400 rounded-full"
                    style={{
                      left: "50%",
                      top: "50%",
                      marginLeft: "-4px",
                      marginTop: "-4px",
                    }}
                    animate={{
                      x: [0, radius * Math.cos(angle), 0],
                      y: [0, radius * Math.sin(angle), 0],
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: i * 0.25,
                      ease: "easeOut",
                    }}
                  />
                )
              })}
            </div>
            
            <motion.h4 
              className="text-3xl font-bold text-white mb-4"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            >
              AI가 질문을 생성하는 중입니다
            </motion.h4>
            <motion.p
              className="text-cyan-400/70 text-lg"
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
            >
              잠시만 기다려주세요...
            </motion.p>
          </div>
        </motion.div>
      )}

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
                <motion.path
                  d={createFanPath(category.angle, 140, 320, 80)}
                  fill={`url(#gradient-${index})`}
                  stroke={category.glowColor}
                  strokeWidth="2"
                  className="cursor-pointer transition-all duration-300 hover:fill-opacity-40 hover:stroke-[3]"
                  whileHover={{
                    scale: 1.05,
                  }}
                  onClick={() => handleCategoryClick(category.title)}
                  style={{
                    filter: `drop-shadow(0 0 8px ${category.glowColor})`,
                  }}
                />
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

              <foreignObject x="300" y="300" width="200" height="220">
                <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                  <motion.div
                    onClick={handleBrainClick}
                    className="relative cursor-pointer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
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
                  <div className="text-cyan-300 text-sm font-medium whitespace-nowrap">
                    실시간 질문하기
                  </div>
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
                  <foreignObject x={x - 100} y={y - 80} width="200" height="160">
                    <div 
                      className="block group cursor-pointer"
                      onClick={() => handleCategoryClick(category.title)}
                    >
                      <div className="flex flex-col items-center justify-center text-center gap-3">
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
                          <h2 className="text-3xl font-bold text-white mb-2 group-hover:scale-105 transition-transform">
                            {category.title}
                          </h2>
                          <p className="text-blue-300/70 text-lg">{category.titleEn}</p>
                        </div>
                      </div>
                    </div>
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
