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

  const [showAIScores, setShowAIScores] = useState(true)
  const [showOnsiteScores, setShowOnsiteScores] = useState(true)
  const [animatedAIScores, setAnimatedAIScores] = useState<Record<string, number>>({})
  const [animatedOnsiteScores, setAnimatedOnsiteScores] = useState<Record<string, number>>({})

  useEffect(() => {
    if (showAIScores) {
      const scores = Object.keys(presentation.aiScores)
      scores.forEach((key) => {
        const targetValue = presentation.aiScores[key as keyof typeof presentation.aiScores]
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
        const increment = targetValue / 50

        const interval = setInterval(() => {
          currentValue += increment
          if (currentValue >= targetValue) {
            currentValue = targetValue
            clearInterval(interval)
          }
          setAnimatedOnsiteScores((prev) => ({ ...prev, [key]: currentValue }))
        }, 50)
      })
    } else {
      setAnimatedOnsiteScores({})
    }
  }, [showOnsiteScores, presentation.onSiteScores])

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
                <h3 className="text-xl font-semibold text-foreground">AI 평가</h3>
              </div>
              <div className="relative min-h-[450px]">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-5"
                >
                  {Object.entries(presentation.aiScores).map(([key, value]) => (
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
                        {animatedAIScores[key]?.toFixed(1) || "0.0"}
                      </motion.span>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>

            <div className="space-y-4 min-h-[500px]">
              <div className="flex items-center justify-between border-b-2 border-sk-red/30 pb-2">
                <h3 className="text-xl font-semibold text-foreground">경영진 평가</h3>
              </div>
              <div className="relative min-h-[450px]">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-5"
                >
                  {Object.entries(presentation.onSiteScores).map(([key, value]) => (
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
                        {animatedOnsiteScores[key]?.toFixed(1) || "0.0"}
                      </motion.span>
                    </motion.div>
                  ))}
                </motion.div>
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
