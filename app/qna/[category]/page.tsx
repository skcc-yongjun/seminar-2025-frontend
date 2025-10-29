"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, Brain } from "lucide-react"
import { useState, useEffect, use, useRef } from "react"
import { fetchRandomUnusedQuestionByKeyword, type QnAQuestionWithVideoResponse } from "@/lib/api"

// 비디오 자동 재생 설정 (쉽게 변경 가능)
const AUTO_PLAY_VIDEO = true

// 타이핑 효과 컴포넌트
function TypingText({ text, delay = 0, className = "" }: { text: string; delay?: number; className?: string }) {
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    // 초기화
    setDisplayedText("")
    setCurrentIndex(0)

    // 지연 후 타이핑 시작
    const startTimeout = setTimeout(() => {
      setCurrentIndex(0)
    }, delay)

    return () => clearTimeout(startTimeout)
  }, [text, delay])

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, 30) // 30ms 간격으로 한 글자씩

      return () => clearTimeout(timeout)
    }
  }, [currentIndex, text])

  return <span className={className}>{displayedText}</span>
}

export default function QnAQuestions({ params }: { params: Promise<{ category: string }> }) {
  const { category: rawCategory } = use(params)
  const category = decodeURIComponent(rawCategory)

  const [questionData, setQuestionData] = useState<QnAQuestionWithVideoResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // React Strict Mode에서 중복 API 호출 방지를 위한 ref
  const hasFetchedRef = useRef(false)
  const currentCategoryRef = useRef(category)

  console.log('[DEBUG] Component rendered', {
    category,
    hasFetched: hasFetchedRef.current,
    currentCategory: currentCategoryRef.current,
    questionDataId: questionData?.question_id
  })

  useEffect(() => {
    console.log('[DEBUG] useEffect triggered', {
      category,
      hasFetched: hasFetchedRef.current,
      currentCategory: currentCategoryRef.current
    })

    // 카테고리가 변경되면 ref 리셋
    if (currentCategoryRef.current !== category) {
      console.log('[DEBUG] Category changed, resetting fetch flag')
      hasFetchedRef.current = false
      currentCategoryRef.current = category
    }

    // 이미 데이터를 가져왔다면 중복 호출 방지
    if (hasFetchedRef.current) {
      console.log('[DEBUG] Already fetched, skipping API call')
      return
    }

    // API 호출 전에 즉시 플래그 설정 (중복 호출 방지)
    hasFetchedRef.current = true
    console.log('[DEBUG] Set hasFetchedRef to true BEFORE API call')
    console.log('[DEBUG] Starting API call for category:', category)

    const loadQuestionData = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log('[DEBUG] Calling fetchRandomUnusedQuestionByKeyword')
        // 백엔드에서 키워드별 미사용 랜덤 질문 조회 (비디오 포함)
        const data = await fetchRandomUnusedQuestionByKeyword(category)
        console.log('[DEBUG] API call completed, question_id:', data.question_id)
        setQuestionData(data)

      } catch (err) {
        console.error('[DEBUG] Error fetching question data:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch question data')
        setQuestionData(null)
        // 에러 발생 시 플래그 리셋 (재시도 가능하도록)
        hasFetchedRef.current = false
        console.log('[DEBUG] Error occurred, reset hasFetchedRef to false')
      } finally {
        setLoading(false)
      }
    }

    loadQuestionData()
  }, [category])

  // 로딩 상태 UI
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

  // 에러 상태 UI
  if (!questionData || error) {
    // "준비중" 또는 "생성중" 메시지인 경우 특별한 UI 표시
    const isGenerating = error && (error.includes('준비중') || error.includes('생성중'))

    if (isGenerating) {
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
              질문 생성 중
            </motion.h4>
            <motion.p
              className="text-cyan-400/70 text-lg mb-6"
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
            >
              AI가 '{category}' 카테고리의 질문을 생성하고 있습니다...
            </motion.p>
            <Link href="/qna" className="text-cyan-400/70 hover:text-cyan-400 text-sm underline">
              카테고리 목록으로 돌아가기
            </Link>
          </div>
        </div>
      )
    }

    // 일반 에러 UI
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center bg-[#0a1628]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            {error || "질문을 찾을 수 없습니다"}
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
                <p className="text-sm text-cyan-400">{category} Q&A</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 items-stretch">

          {/* 왼쪽: 질문 비디오 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative flex items-center"
          >
            <div className="relative aspect-[9/16] max-w-md mx-auto rounded-2xl overflow-hidden border border-cyan-500/30 bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-sm shadow-2xl shadow-cyan-500/10">
              {questionData.video_result ? (
                <video
                  src={questionData.video_result}
                  autoPlay={AUTO_PLAY_VIDEO}
                  className="w-full h-full object-cover"
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-cyan-400/70 text-sm">비디오를 불러올 수 없습니다</p>
                </div>
              )}

              {/* LIVE 배지 - 실시간 화상 통화 느낌 */}
              <motion.div
                className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-600/90 backdrop-blur-sm border border-red-400/50 shadow-lg"
                animate={{
                  boxShadow: [
                    "0 0 15px rgba(239, 68, 68, 0.5)",
                    "0 0 25px rgba(239, 68, 68, 0.8)",
                    "0 0 15px rgba(239, 68, 68, 0.5)",
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              >
                {/* 깜빡이는 빨간 점 */}
                <motion.div
                  className="w-1.5 h-1.5 bg-white rounded-full"
                  animate={{
                    opacity: [1, 0.3, 1],
                    scale: [1, 0.8, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                />
                <span className="text-white font-bold text-xs tracking-wider">LIVE</span>
              </motion.div>

              {/* Corner decorations */}
              <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-cyan-500/50" />
              <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-cyan-500/50" />
              <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-cyan-500/50" />
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-cyan-500/50" />
            </div>
          </motion.div>

          {/* 오른쪽: 질문 정보 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-6 h-full"
          >
            {/* 질문 제목 카드 */}
            <div className="relative rounded-2xl overflow-hidden border border-cyan-500/30 bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-sm p-8 shadow-2xl shadow-cyan-500/10">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5" />

              <div className="relative space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                  <span className="text-xs font-medium text-cyan-400">질문 제목</span>
                </div>

                {/* title 표시 - 타이핑 효과 */}
                <h2 className="text-3xl font-bold text-white leading-tight">
                  <TypingText
                    text={questionData.title || questionData.question_text}
                    delay={300}
                    className=""
                  />
                </h2>
              </div>

              <div className="absolute top-0 left-0 w-20 h-20 border-t border-l border-cyan-500/50" />
              <div className="absolute bottom-0 right-0 w-20 h-20 border-b border-r border-cyan-500/50" />
            </div>

            {/* 질문 자막 카드 */}
            <div className="relative rounded-xl overflow-hidden border border-cyan-500/30 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm p-10 shadow-lg shadow-cyan-500/10">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5" />

              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-cyan-400/70">질문 자막</span>
                </div>

                {/* question_korean_caption 표시 - 타이핑 효과 */}
                <p className="text-2xl text-white leading-relaxed">
                  <TypingText
                    text={questionData.question_korean_caption || questionData.question_text}
                    delay={300 + (questionData.title || questionData.question_text).length * 30 + 500}
                    className=""
                  />
                </p>
              </div>
            </div>

            {/* 질문 본문 카드 */}
            <div className="relative rounded-xl overflow-hidden border border-cyan-500/30 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm p-10 shadow-lg shadow-cyan-500/10 flex-1 flex flex-col justify-center">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5" />

              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-cyan-400/70">질문 내용</span>
                </div>

                {/* question_text 표시 - 타이핑 효과 */}
                <p className="text-2xl text-white/90 leading-relaxed">
                  <TypingText
                    text={questionData.question_text}
                    delay={
                      300 +
                      (questionData.title || questionData.question_text).length * 30 +
                      500 +
                      (questionData.question_korean_caption || questionData.question_text).length * 30 +
                      500
                    }
                    className=""
                  />
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
