"use client"

import { useState, useEffect, Suspense } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Sparkles, Brain } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  fetchPresentationsWithPresenters,
  fetchAIEvaluationScores,
  fetchHumanEvaluationAverageScores,
  PresentationWithPresenter,
  AIEvaluationScoreResponse,
  HumanEvaluationScoreStats
} from "@/lib/api"

function EvaluationsContent() {
  const searchParams = useSearchParams()
  const presentationIdFromUrl = searchParams.get("presentationId") || ""

  const [presentations, setPresentations] = useState<PresentationWithPresenter[]>([])
  const [selectedPresentationId, setSelectedPresentationId] = useState(presentationIdFromUrl)
  const selectedPresentation = presentations.find((p) => p.presentation_id === selectedPresentationId)

  const [isLoadingPresentations, setIsLoadingPresentations] = useState(true)
  const [isLoadingScores, setIsLoadingScores] = useState(false)
  
  const [aiScores, setAIScores] = useState<Record<string, number>>({})
  const [humanScores, setHumanScores] = useState<Record<string, number>>({})

  const [showAIScores, setShowAIScores] = useState(true)
  const [showOnsiteScores, setShowOnsiteScores] = useState(true)
  const [animatedAIScores, setAnimatedAIScores] = useState<Record<string, number>>({})
  const [animatedOnsiteScores, setAnimatedOnsiteScores] = useState<Record<string, number>>({})

  // 발표 목록 로딩
  useEffect(() => {
    const loadPresentations = async () => {
      try {
        // 세션1 발표만 가져오기
        const data = await fetchPresentationsWithPresenters('세션1')
        
        // presentation_order 기준 정렬 (오름차순)
        const sortedData = data.sort((a, b) => a.presentation_order - b.presentation_order)
        setPresentations(sortedData)
        
        // 첫 번째 발표를 기본 선택 (URL에서 온 ID가 없으면)
        if (!presentationIdFromUrl && sortedData.length > 0) {
          setSelectedPresentationId(sortedData[0].presentation_id)
        }
      } catch (error) {
        console.error("발표 목록 로딩 실패:", error)
      } finally {
        setIsLoadingPresentations(false)
      }
    }

    loadPresentations()
  }, [presentationIdFromUrl])

  // 선택된 발표의 점수 로딩
  useEffect(() => {
    const loadScores = async () => {
      if (!selectedPresentationId) return

      setIsLoadingScores(true)
      try {
        // AI 평가 점수 조회
        const aiScoreData = await fetchAIEvaluationScores(selectedPresentationId)
        const aiScoreMap: Record<string, number> = {}
        aiScoreData.forEach(score => {
          // Decimal이 문자열로 반환될 수 있으므로 숫자로 변환
          const numericScore = typeof score.score === 'string' ? parseFloat(score.score) : score.score
          aiScoreMap[score.category] = numericScore
        })
        setAIScores(aiScoreMap)

        // 사람 평가 평균 점수 조회
        try {
          const humanScoreData = await fetchHumanEvaluationAverageScores(selectedPresentationId)
          const humanScoreMap: Record<string, number> = {}
          humanScoreData.forEach(score => {
            // Decimal이 문자열로 반환될 수 있으므로 숫자로 변환
            const numericScore = typeof score.avg_score === 'string' ? parseFloat(score.avg_score) : score.avg_score
            humanScoreMap[score.category] = numericScore
          })
          setHumanScores(humanScoreMap)
        } catch (humanError) {
          console.warn("사람 평가 점수가 없습니다:", humanError)
          setHumanScores({})  // 데이터가 없으면 빈 객체
        }

      } catch (error) {
        console.error("점수 로딩 실패:", error)
        setAIScores({})
        setHumanScores({})
      } finally {
        setIsLoadingScores(false)
      }
    }

    loadScores()
  }, [selectedPresentationId])

  useEffect(() => {
    if (showAIScores && Object.keys(aiScores).length > 0) {
      const intervals: NodeJS.Timeout[] = []
      const scores = Object.keys(aiScores)
      
      scores.forEach((key) => {
        const targetValue = aiScores[key]
        let currentValue = 0
        const increment = targetValue / 50

        const interval = setInterval(() => {
          currentValue += increment
          if (currentValue >= targetValue) {
            currentValue = targetValue
            clearInterval(interval)
          }
          setAnimatedAIScores((prev) => ({ ...prev, [key]: currentValue }))
        }, 50)
        
        intervals.push(interval)
      })
      
      // cleanup function
      return () => {
        intervals.forEach(interval => clearInterval(interval))
      }
    } else {
      setAnimatedAIScores({})
    }
  }, [showAIScores, aiScores])

  useEffect(() => {
    if (showOnsiteScores && Object.keys(humanScores).length > 0) {
      const intervals: NodeJS.Timeout[] = []
      const scores = Object.keys(humanScores)
      
      scores.forEach((key) => {
        const targetValue = humanScores[key]
        let currentValue = 0
        const increment = targetValue / 50

        const interval = setInterval(() => {
          currentValue += increment
          if (currentValue >= targetValue) {
            currentValue = targetValue
            clearInterval(interval)
          }
          setAnimatedOnsiteScores((prev) => ({ ...prev, [key]: currentValue }))
        }, 50)
        
        intervals.push(interval)
      })
      
      // cleanup function
      return () => {
        intervals.forEach(interval => clearInterval(interval))
      }
    } else {
      setAnimatedOnsiteScores({})
    }
  }, [showOnsiteScores, humanScores])

  return (
    <div className="min-h-screen p-4 md:p-6 relative overflow-x-hidden">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, #0a1628, #0f1f3a, #0a1628)",
        }}
      >
        {/* Animated grid pattern */}
        <motion.div
          animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
          transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

        {/* Scanning lines */}
        <motion.div
          animate={{ y: ["-100%", "200%"] }}
          transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="absolute inset-0 w-full h-32 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent"
        />

        {/* Floating particles */}
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -1000],
              x: [0, Math.random() * 100 - 50],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 5,
              ease: "linear",
            }}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: "100%",
              boxShadow: "0 0 10px rgba(34, 211, 238, 0.8)",
            }}
          />
        ))}

        {/* Hexagonal pattern overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill='none' stroke='%2322d3ee' strokeWidth='1'/%3E%3C/svg%3E")`,
            backgroundSize: "60px 60px",
          }}
        />

        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-[1920px] mx-auto space-y-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <Link href="/post-presentation">
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2 hover:bg-blue-500/10 border border-blue-500/30"
              style={{ color: "rgba(34, 211, 238, 0.9)" }}
            >
              <ArrowLeft className="w-4 h-4" />
              뒤로
            </Button>
          </Link>

          <div className="flex-1 flex justify-center">
            <div className="text-center">
              {isLoadingPresentations ? (
                <h1 className="text-xl md:text-2xl font-semibold text-balance text-white">
                  로딩 중...
                </h1>
              ) : (
                <>
                  <Select value={selectedPresentationId} onValueChange={setSelectedPresentationId}>
                    <SelectTrigger className="w-auto border-0 bg-transparent hover:bg-cyan-500/10 focus:ring-0 focus:ring-offset-0 h-auto py-0 px-2 gap-2 mb-1 transition-colors">
                      <SelectValue>
                        <h1 className="text-xl md:text-2xl font-semibold text-balance text-white">
                          {selectedPresentation?.topic || "발표를 선택하세요"}
                        </h1>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900/95 backdrop-blur-xl border-cyan-500/30">
                      {presentations.map((presentation) => (
                        <SelectItem
                          key={presentation.presentation_id}
                          value={presentation.presentation_id}
                          className="text-white focus:bg-cyan-500/20 focus:text-cyan-300 cursor-pointer"
                        >
                          <div className="flex flex-col items-start gap-1 py-1">
                            <span className="font-semibold">{presentation.topic}</span>
                            <span className="text-sm text-cyan-400/70">
                              {presentation.presenter?.name || "발표자"} · {presentation.presenter?.company || "회사"}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-cyan-400/70 flex items-center justify-center gap-2">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    AI 기반 종합 분석 시스템
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="w-[88px]" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 rounded-lg border-2 shadow-lg relative"
          style={{
            background: "rgba(10, 20, 40, 0.95)",
            backdropFilter: "blur(24px)",
            borderColor: "rgba(59, 130, 246, 0.3)",
            boxShadow: "0 0 30px rgba(59, 130, 246, 0.2), 0 8px 32px rgba(0, 0, 0, 0.6)",
          }}
        >
          {isLoadingScores && (
            <div className="flex items-center justify-center gap-3 mb-6 text-cyan-400">
              <Brain className="w-5 h-5 animate-pulse" />
              <span className="text-lg font-semibold animate-pulse">점수 데이터 로딩 중...</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4 min-h-[500px]">
              <div className="flex items-center justify-between border-b-2 border-blue-500/30 pb-2">
                <h3 className="text-xl font-semibold text-white">AI 평가</h3>
              </div>
              <div className="relative min-h-[450px]">
                {Object.keys(aiScores).length === 0 ? (
                  <p className="text-muted-foreground">AI 평가 점수가 없습니다.</p>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-5"
                  >
                    {Object.entries(aiScores).map(([key, value]) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5 }}
                      className="flex items-center gap-4"
                    >
                      <div className="text-base font-bold text-white min-w-[180px] shrink-0">{key}</div>
                      <div className="flex-1 h-10 bg-slate-800/50 rounded-sm overflow-hidden relative border border-blue-500/20">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(value / 10) * 100}%` }}
                          transition={{
                            duration: 2.5,
                            ease: "easeOut",
                          }}
                          className="h-full rounded-sm relative overflow-hidden"
                          style={{
                            background: "linear-gradient(90deg, #3b82f6, #22d3ee)",
                          }}
                        >
                          <motion.div
                            animate={{
                              x: ["-100%", "100%"],
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: 2,
                              ease: "linear",
                            }}
                            className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
                          />
                        </motion.div>
                      </div>
                      <motion.span
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="text-xl font-bold text-cyan-400 min-w-[50px] text-right"
                      >
                        {typeof animatedAIScores[key] === 'number' ? animatedAIScores[key].toFixed(1) : "0.0"}
                      </motion.span>
                    </motion.div>
                  ))}
                </motion.div>
                )}
              </div>
            </div>

            <div className="space-y-4 min-h-[500px]">
              <div className="flex items-center justify-between border-b-2 border-blue-500/30 pb-2">
                <h3 className="text-xl font-semibold text-white">경영진 평가</h3>
              </div>
              <div className="relative min-h-[450px]">
                {Object.keys(humanScores).length === 0 ? (
                  <p className="text-muted-foreground">경영진 평가 점수가 없습니다.</p>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-5"
                  >
                    {Object.entries(humanScores).map(([key, value]) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5 }}
                      className="flex items-center gap-4"
                    >
                      <div className="text-base font-bold text-white min-w-[180px] shrink-0">{key}</div>
                      <div className="flex-1 h-10 bg-slate-800/50 rounded-sm overflow-hidden relative border border-blue-500/20">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(value / 10) * 100}%` }}
                          transition={{
                            duration: 2.5,
                            ease: "easeOut",
                          }}
                          className="h-full rounded-sm relative overflow-hidden"
                          style={{
                            background: "linear-gradient(90deg, #3b82f6, #22d3ee)",
                          }}
                        >
                          <motion.div
                            animate={{
                              x: ["-100%", "100%"],
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: 2,
                              ease: "linear",
                            }}
                            className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
                          />
                        </motion.div>
                      </div>
                      <motion.span
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="text-xl font-bold text-cyan-400 min-w-[50px] text-right"
                      >
                        {typeof animatedOnsiteScores[key] === 'number' ? animatedOnsiteScores[key].toFixed(1) : "0.0"}
                      </motion.span>
                    </motion.div>
                  ))}
                </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-between pt-3 border-t border-border/30"
        >
          <p className="text-xs text-muted-foreground">© 2025 SK Group. All rights reserved.</p>
          <p className="text-xs text-muted-foreground">AI 기반 발표 평가 시스템</p>
        </motion.div>
      </div>
    </div>
  )
}

export default function EvaluationsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <div className="relative">
            <Brain className="w-12 h-12 text-cyan-400 animate-pulse" />
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Sparkles className="w-6 h-6 text-cyan-400/60" />
            </motion.div>
          </div>
          <p className="text-sm text-muted-foreground">로딩중...</p>
        </div>
      }
    >
      <EvaluationsContent />
    </Suspense>
  )
}
