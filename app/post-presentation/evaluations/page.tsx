"use client"

import { useState, useEffect, Suspense } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Sparkles, Brain } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const presentations = [
  {
    id: "1",
    title: "Global Top-tier 대비 O/I 경쟁력 분석 및 개선방안",
    presenter: "윤풍영",
    company: "SK AX",
  },
  {
    id: "2",
    title: "AI Biz.Model 구축 방향",
    presenter: "김민수",
    company: "SK Telecom",
  },
  {
    id: "3",
    title: "5G 기반 AI 서비스 전략",
    presenter: "이지은",
    company: "SK Hynix",
  },
  {
    id: "4",
    title: "AI 기반 에너지 최적화",
    presenter: "박준호",
    company: "SK E&S",
  },
]

interface PresentationAnalysis {
  id: string
  title: string
  presenter: string
  company: string
  aiScores: {
    "[O/I 수준 진단]": number
    "[과제 목표 수준]": number
    "[성과 지속 가능성]": number
    "[Process/System]": number
    "[본원적 경쟁력 연계]": number
    "[혁신성]": number
    "[실행 가능성]": number
    "[기대 효과]": number
  }
  onSiteScores: {
    "[전략적 중요도]": number
    "[실행 가능성]": number
    "[발표 완성도]": number
  }
}

function EvaluationsContent() {
  const searchParams = useSearchParams()
  const presentationIdFromUrl = searchParams.get("presentationId") || "1"

  const [selectedPresentationId, setSelectedPresentationId] = useState(presentationIdFromUrl)
  const selectedPresentation = presentations.find((p) => p.id === selectedPresentationId) || presentations[0]

  const [presentation] = useState<PresentationAnalysis>({
    id: "1",
    title: "Global Top-tier 대비 O/I 경쟁력 분석 및 개선방안",
    presenter: "윤풍영",
    company: "SK AX",
    aiScores: {
      "[O/I 수준 진단]": 8.5,
      "[과제 목표 수준]": 5.5,
      "[성과 지속 가능성]": 7.0,
      "[Process/System]": 5.0,
      "[본원적 경쟁력 연계]": 8.2,
      "[혁신성]": 7.5,
      "[실행 가능성]": 6.8,
      "[기대 효과]": 7.8,
    },
    onSiteScores: {
      "[전략적 중요도]": 8.0,
      "[실행 가능성]": 6.5,
      "[발표 완성도]": 7.5,
    },
  })

  const [isInitialLoadingAI, setIsInitialLoadingAI] = useState(true)
  const [isInitialLoadingOnsite, setIsInitialLoadingOnsite] = useState(true)
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false)
  const [isAnalyzingOnsite, setIsAnalyzingOnsite] = useState(false)
  const [showAIScores, setShowAIScores] = useState(false)
  const [showOnsiteScores, setShowOnsiteScores] = useState(false)
  const [animatedAIScores, setAnimatedAIScores] = useState<Record<string, number>>({})
  const [animatedOnsiteScores, setAnimatedOnsiteScores] = useState<Record<string, number>>({})
  const [evaluationCount, setEvaluationCount] = useState(0)
  const [totalEvaluators] = useState(60)
  const [isEvaluationComplete, setIsEvaluationComplete] = useState(false)
  const [isAIEvaluationComplete, setIsAIEvaluationComplete] = useState(false)

  const handleAIAnalysis = () => {
    setIsAnalyzingAI(false)
    setShowAIScores(true)
  }

  const handleOnsiteAnalysis = () => {
    setIsAnalyzingOnsite(false)
    setShowOnsiteScores(true)
  }

  useEffect(() => {
    if (showAIScores) {
      const scores = Object.keys(presentation.aiScores)
      scores.forEach((key) => {
        const targetValue = presentation.aiScores[key as keyof typeof presentation.aiScores]
        let currentValue = 0
        const increment = targetValue / 30

        const interval = setInterval(() => {
          currentValue += increment
          if (currentValue >= targetValue) {
            currentValue = targetValue
            clearInterval(interval)
          }
          setAnimatedAIScores((prev) => ({ ...prev, [key]: currentValue }))
        }, 20)
      })
    } else {
      setAnimatedAIScores({})
    }
  }, [showAIScores, presentation.aiScores])

  useEffect(() => {
    if (showOnsiteScores) {
      const scores = Object.keys(presentation.onSiteScores)
      scores.forEach((key) => {
        const targetValue = presentation.onSiteScores[key as keyof typeof presentation.onSiteScores]
        let currentValue = 0
        const increment = targetValue / 30

        const interval = setInterval(() => {
          currentValue += increment
          if (currentValue >= targetValue) {
            currentValue = targetValue
            clearInterval(interval)
          }
          setAnimatedOnsiteScores((prev) => ({ ...prev, [key]: currentValue }))
        }, 20)
      })
    } else {
      setAnimatedOnsiteScores({})
    }
  }, [showOnsiteScores, presentation.onSiteScores])

  useEffect(() => {
    if (isInitialLoadingAI && !showAIScores) {
      const timer = setTimeout(() => {
        setIsAIEvaluationComplete(true)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [isInitialLoadingAI, showAIScores])

  useEffect(() => {
    if (isInitialLoadingOnsite && !showOnsiteScores) {
      const interval = setInterval(() => {
        setEvaluationCount((prev) => {
          const next = prev + Math.floor(Math.random() * 3) + 1
          if (next >= totalEvaluators) {
            clearInterval(interval)
            setIsEvaluationComplete(true)
            return totalEvaluators
          }
          return next
        })
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [isInitialLoadingOnsite, showOnsiteScores, totalEvaluators])

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
              <Select value={selectedPresentationId} onValueChange={setSelectedPresentationId}>
                <SelectTrigger className="w-auto border-0 bg-transparent hover:bg-muted/50 focus:ring-0 focus:ring-offset-0 h-auto py-0 px-2 gap-2 mb-1">
                  <SelectValue>
                    <h1 className="text-xl md:text-2xl font-semibold text-balance text-foreground">
                      {selectedPresentation.title}
                    </h1>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-card/95 backdrop-blur-md border-border">
                  {presentations.map((presentation) => (
                    <SelectItem
                      key={presentation.id}
                      value={presentation.id}
                      className="text-foreground focus:bg-muted focus:text-foreground cursor-pointer"
                    >
                      <div className="flex flex-col items-start gap-1 py-1">
                        <span className="font-semibold">{presentation.title}</span>
                        <span className="text-sm text-muted-foreground">
                          {presentation.presenter} · {presentation.company}
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
            </div>
          </div>

          <div className="w-[88px]" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="corporate-card p-8 rounded-lg border-2 border-sk-red/30 shadow-lg"
        >
          <div className="mb-6">
            <Select value={selectedPresentationId} onValueChange={setSelectedPresentationId}>
              <SelectContent className="bg-card/95 backdrop-blur-md border-border">
                {presentations.map((presentation) => (
                  <SelectItem
                    key={presentation.id}
                    value={presentation.id}
                    className="text-foreground focus:bg-muted focus:text-foreground cursor-pointer"
                  >
                    <div className="flex flex-col items-start gap-1 py-1">
                      <span className="font-semibold">{presentation.title}</span>
                      <span className="text-sm text-muted-foreground">
                        {presentation.presenter} · {presentation.company}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4 min-h-[500px]">
              <div className="flex items-center justify-between border-b-2 border-sk-red/30 pb-2">
                <h3 className="text-base font-semibold text-foreground">AI 평가</h3>
                <Button
                  onClick={() => {
                    setIsInitialLoadingAI(false)
                    handleAIAnalysis()
                  }}
                  disabled={isAnalyzingAI}
                  size="sm"
                  className="gap-2 bg-sk-red hover:bg-sk-red/90 text-white"
                >
                  {isAnalyzingAI ? (
                    <>
                      <Brain className="w-3 h-3 animate-pulse" />
                      분석 중
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3" />
                      결과 확인
                    </>
                  )}
                </Button>
              </div>
              <div className="relative min-h-[450px]">
                {isInitialLoadingAI || !showAIScores ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
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
                    <div className="text-center space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        {isAnalyzingAI
                          ? "AI가 평가를 분석하고 있습니다"
                          : isAIEvaluationComplete
                            ? "AI 평가가 완료되었습니다"
                            : "AI 평가를 집계중입니다"}
                      </p>
                      <motion.p
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                        className="text-xs text-muted-foreground"
                      >
                        {isAIEvaluationComplete ? "결과 확인 버튼을 눌러주세요" : "잠시만 기다려주세요..."}
                      </motion.p>
                    </div>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-3"
                  >
                    {Object.entries(presentation.aiScores).map(([key, value]) => (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">{key}</div>
                          <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="text-sm font-semibold text-sk-red"
                          >
                            {animatedAIScores[key]?.toFixed(1) || "0.0"}
                          </motion.div>
                        </div>
                        <div className="h-6 bg-muted/30 rounded-sm overflow-hidden relative">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(value / 10) * 100}%` }}
                            transition={{
                              duration: 0.8,
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
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>

            <div className="space-y-4 min-h-[500px]">
              <div className="flex items-center justify-between border-b-2 border-sk-red/30 pb-2">
                <h3 className="text-base font-semibold text-foreground">경영진 평가</h3>
                <Button
                  onClick={() => {
                    setIsInitialLoadingOnsite(false)
                    handleOnsiteAnalysis()
                  }}
                  disabled={isAnalyzingOnsite}
                  size="sm"
                  className="gap-2 bg-sk-red hover:bg-sk-red/90 text-white"
                >
                  {isAnalyzingOnsite ? (
                    <>
                      <Brain className="w-3 h-3 animate-pulse" />
                      분석 중
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3" />
                      결과 확인
                    </>
                  )}
                </Button>
              </div>
              <div className="relative min-h-[450px]">
                {isInitialLoadingOnsite || !showOnsiteScores ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <div className="relative">
                      <Brain className="w-12 h-12 text-sk-red animate-pulse" />
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          rotate: [0, 5, -5, 0],
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
                    <div className="text-center space-y-2">
                      <p className="text-sm font-medium text-foreground">
                        {isEvaluationComplete ? "경영진 평가가 완료되었습니다" : "경영진 평가를 집계중입니다"}
                      </p>
                      <motion.p
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                        className="text-2xl font-bold text-sk-red"
                      >
                        {evaluationCount}/{totalEvaluators}명
                      </motion.p>
                      <motion.p
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                        className="text-xs text-muted-foreground"
                      >
                        {isEvaluationComplete ? "결과 확인 버튼을 눌러주세요" : "실시간으로 집계중입니다..."}
                      </motion.p>
                    </div>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-3"
                  >
                    {Object.entries(presentation.onSiteScores).map(([key, value]) => (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">{key}</div>
                          <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="text-sm font-semibold text-sk-red"
                          >
                            {animatedOnsiteScores[key]?.toFixed(1) || "0.0"}
                          </motion.div>
                        </div>
                        <div className="h-6 bg-muted/30 rounded-sm overflow-hidden relative">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(value / 10) * 100}%` }}
                            transition={{
                              duration: 0.8,
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
