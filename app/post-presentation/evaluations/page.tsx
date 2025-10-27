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
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sk-red/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sk-red/3 rounded-full blur-3xl" />
      </div>

      <div className="max-w-[1800px] mx-auto space-y-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <Link href="/post-presentation">
            <Button variant="ghost" size="sm" className="gap-2 hover:bg-sk-red/10">
              <ArrowLeft className="w-4 h-4" />
              뒤로
            </Button>
          </Link>

          <div className="flex-1 flex justify-center">
            <div className="text-center">
              {isLoadingPresentations ? (
                <h1 className="text-xl md:text-2xl font-semibold text-balance text-foreground">
                  로딩 중...
                </h1>
              ) : (
                <>
                  <Select value={selectedPresentationId} onValueChange={setSelectedPresentationId}>
                    <SelectTrigger className="w-auto border-0 bg-transparent hover:bg-muted/50 focus:ring-0 focus:ring-offset-0 h-auto py-0 px-2 gap-2 mb-1">
                      <SelectValue>
                        <h1 className="text-xl md:text-2xl font-semibold text-balance text-foreground">
                          {selectedPresentation?.topic || "발표를 선택하세요"}
                        </h1>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-card/95 backdrop-blur-md border-border">
                      {presentations.map((presentation) => (
                        <SelectItem
                          key={presentation.presentation_id}
                          value={presentation.presentation_id}
                          className="text-foreground focus:bg-muted focus:text-foreground cursor-pointer"
                        >
                          <div className="flex flex-col items-start gap-1 py-1">
                            <span className="font-semibold">{presentation.topic}</span>
                            <span className="text-sm text-muted-foreground">
                              {presentation.presenter?.name || "발표자"} · {presentation.presenter?.company || "회사"}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
                    <Sparkles className="w-3 h-3 text-sk-red" />
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
          className="corporate-card p-8 rounded-lg border-2 border-sk-red/30 shadow-lg"
        >
          {isLoadingScores && (
            <div className="flex items-center justify-center gap-3 mb-6 text-sk-red">
              <Brain className="w-5 h-5 animate-pulse" />
              <span className="text-lg font-semibold animate-pulse">점수 데이터 로딩 중...</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4 min-h-[500px]">
              <div className="flex items-center justify-between border-b-2 border-sk-red/30 pb-2">
                <h3 className="text-xl font-semibold text-foreground">AI 평가</h3>
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
                      <div className="text-base font-bold text-foreground min-w-[180px] shrink-0">{key}</div>
                      <div className="flex-1 h-10 bg-muted/30 rounded-sm overflow-hidden relative">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(value / 10) * 100}%` }}
                          transition={{
                            duration: 2.5,
                            ease: "easeOut",
                          }}
                          className="h-full bg-sk-red/70 rounded-sm relative overflow-hidden"
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
                            className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          />
                        </motion.div>
                      </div>
                      <motion.span
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="text-xl font-bold text-foreground min-w-[50px] text-right"
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
              <div className="flex items-center justify-between border-b-2 border-sk-red/30 pb-2">
                <h3 className="text-xl font-semibold text-foreground">경영진 평가</h3>
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
                      <div className="text-base font-bold text-foreground min-w-[180px] shrink-0">{key}</div>
                      <div className="flex-1 h-10 bg-muted/30 rounded-sm overflow-hidden relative">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(value / 10) * 100}%` }}
                          transition={{
                            duration: 2.5,
                            ease: "easeOut",
                          }}
                          className="h-full bg-sk-red/70 rounded-sm relative overflow-hidden"
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
                            className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          />
                        </motion.div>
                      </div>
                      <motion.span
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="text-xl font-bold text-foreground min-w-[50px] text-right"
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
            <Brain className="w-12 h-12 text-sk-red animate-pulse" />
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
              <Sparkles className="w-6 h-6 text-sk-red/60" />
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
