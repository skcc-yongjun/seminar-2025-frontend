"use client"

import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, Play, Volume2, VolumeX, Sparkles, Brain } from "lucide-react"
import { useState, useEffect, use } from "react"
import { fetchQnAQuestionsByKeyword, type QnAQuestionResponse } from "@/lib/api"

interface CategoryData {
  title: string
  subtitle: string
  question: string
  questions: string[]
  currentSubtitle: string
}

export default function QnAQuestions({ params }: { params: Promise<{ category: string }> }) {
  const { category: rawCategory } = use(params)
  const category = decodeURIComponent(rawCategory)
  
  const [data, setData] = useState<CategoryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMuted, setIsMuted] = useState(true)

  useEffect(() => {
    const loadCategoryData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // 백엔드에서 키워드별 질문 조회
        const qnaQuestions = await fetchQnAQuestionsByKeyword(category)
        
        // created_at desc로 정렬 후 최근 4개만 선택
        const sortedQuestions = qnaQuestions
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 4)
        
        if (sortedQuestions.length === 0) {
          setError('해당 키워드에 대한 질문이 없습니다.')
          setData(null)
          return
        }

        // 첫 번째 질문을 메인 질문으로 설정
        const mainQuestion = sortedQuestions[0]
        
        // CategoryData 형식으로 변환
        const categoryData: CategoryData = {
          title: category,
          subtitle: category,
          question: mainQuestion.title,
          questions: sortedQuestions.slice(1).map(q => q.title), // 나머지 질문들
          currentSubtitle: mainQuestion.timestamp_label || "AI가 생성한 질문입니다.",
        }
        
        setData(categoryData)

      } catch (err) {
        console.error('Error fetching category data:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch category data')
        setData(null)
      } finally {
        setLoading(false)
      }
    }

    loadCategoryData()
  }, [category])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a1628] relative flex items-center justify-center">
        {/* Background effects */}
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

        <div className="text-center relative z-10">
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
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
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
              >
                <Brain 
                  className="w-32 h-32 text-cyan-400" 
                  strokeWidth={1.5}
                  style={{
                    filter: "drop-shadow(0 0 20px rgba(34, 211, 238, 0.8))",
                  }}
                />
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
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center bg-[#0a1628]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            {error || "카테고리를 찾을 수 없습니다"}
          </h1>
          <Link href="/qna" className="text-cyan-400 hover:underline">
            카테고리 목록으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a1628] relative">
      {/* Background effects */}
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

      {/* Hexagonal pattern overlay */}
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

      {/* Header */}
      <div className="border-b border-cyan-500/20 bg-[#0a1628]/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/qna"
              className="inline-flex items-center gap-2 text-cyan-400/70 hover:text-cyan-400 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>카테고리 목록으로</span>
            </Link>

            <div className="flex items-center gap-3">
              <motion.div
                className="relative w-14 h-14 rounded-xl flex items-center justify-center shadow-lg group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-500 rounded-xl blur-sm opacity-75 group-hover:opacity-100 transition-opacity"
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                />
                <div className="relative w-full h-full bg-slate-900 rounded-xl flex items-center justify-center border border-cyan-500/50 group-hover:border-cyan-400 transition-colors">
                  <motion.span
                    className="text-white font-bold text-xl"
                    whileHover={{
                      textShadow: [
                        "0 0 8px rgba(6,182,212,0.8)",
                        "2px 0 8px rgba(6,182,212,0.8), -2px 0 8px rgba(168,85,247,0.8)",
                        "0 0 8px rgba(6,182,212,0.8)",
                      ],
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    SK
                  </motion.span>
                </div>
              </motion.div>
              <div>
                <h1 className="text-xl font-bold text-white">SK GROUP</h1>
                <p className="text-sm text-cyan-400">{data.title} Q&A</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Avatar Video Section */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="relative">
            <div className="relative aspect-[9/16] max-w-md mx-auto rounded-2xl overflow-hidden border border-cyan-500/30 bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-sm shadow-2xl shadow-cyan-500/10">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                    <Play className="w-10 h-10 text-cyan-400" />
                  </div>
                  <p className="text-cyan-400/70 text-sm">아바타 비디오 준비중</p>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-xs text-white/70">LIVE</span>
                  </div>
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
                  </button>
                </div>
              </div>

              {/* Corner decorations */}
              <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-cyan-500/50" />
              <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-cyan-500/50" />
              <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-cyan-500/50" />
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-cyan-500/50" />
            </div>
          </motion.div>

          {/* Questions Section */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            {/* Main Question Card */}
            <div className="relative rounded-2xl overflow-hidden border border-cyan-500/30 bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-sm p-8 shadow-2xl shadow-cyan-500/10">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5" />

              <div className="relative space-y-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-4">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                    <span className="text-xs font-medium text-cyan-400">질문</span>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-3 text-balance leading-tight">
                    {data.question}
                  </h2>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />

                <div>
                  <ul className="space-y-4">
                    {data.questions.map((q, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="flex items-start gap-3 group cursor-pointer"
                      >
                        <div className="w-7 h-7 rounded-md bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-cyan-500/20 transition-colors">
                          <span className="text-sm font-bold text-cyan-400">{index + 1}</span>
                        </div>
                        <span className="text-white/80 group-hover:text-white transition-colors leading-relaxed">
                          {q}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Corner decorations */}
              <div className="absolute top-0 left-0 w-20 h-20 border-t border-l border-cyan-500/50" />
              <div className="absolute bottom-0 right-0 w-20 h-20 border-b border-r border-cyan-500/50" />
            </div>

            {/* Subtitle Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative rounded-xl overflow-hidden border border-cyan-500/30 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm p-8 shadow-lg shadow-cyan-500/10 min-h-[300px] flex flex-col justify-center"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-cyan-400/70">자막</span>
                </div>
                <p className="text-xl text-white leading-relaxed">{data.currentSubtitle}</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
