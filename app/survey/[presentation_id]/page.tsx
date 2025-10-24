"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Star, ChevronLeft, Tablet } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

// iPad detection hook
const useIpadDetection = () => {
  const [isIpad, setIsIpad] = useState(false)
  const [deviceInfo, setDeviceInfo] = useState<{
    userAgent: string
    platform: string
    maxTouchPoints: number
    screenSize: string
  } | null>(null)

  useEffect(() => {
    const detectIpad = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const platform = navigator.platform.toLowerCase()
      const maxTouchPoints = navigator.maxTouchPoints || 0
      const screenWidth = window.screen.width
      const screenHeight = window.screen.height
      
      // Multiple detection methods for better accuracy
      const isIpadUserAgent = /ipad/.test(userAgent)
      const isIpadPlatform = /ipad/.test(platform)
      const isMacIntelWithTouch = platform.includes('mac') && maxTouchPoints > 1
      const hasIpadScreenSize = (
        (screenWidth === 768 && screenHeight === 1024) ||  // iPad
        (screenWidth === 1024 && screenHeight === 768) ||  // iPad landscape
        (screenWidth === 834 && screenHeight === 1194) ||  // iPad Air
        (screenWidth === 1194 && screenHeight === 834) ||  // iPad Air landscape
        (screenWidth === 1024 && screenHeight === 1366) || // iPad Pro 12.9"
        (screenWidth === 1366 && screenHeight === 1024) || // iPad Pro 12.9" landscape
        (screenWidth === 820 && screenHeight === 1180) ||  // iPad Air (4th gen)
        (screenWidth === 1180 && screenHeight === 820)     // iPad Air (4th gen) landscape
      )

      // iPad detection logic
      const detected = isIpadUserAgent || isIpadPlatform || isMacIntelWithTouch || hasIpadScreenSize

      setIsIpad(detected)
      setDeviceInfo({
        userAgent,
        platform,
        maxTouchPoints,
        screenSize: `${screenWidth}x${screenHeight}`
      })

      // Log detection results for debugging
      console.log('[iPad Detection]', {
        detected,
        isIpadUserAgent,
        isIpadPlatform,
        isMacIntelWithTouch,
        hasIpadScreenSize,
        userAgent,
        platform,
        maxTouchPoints,
        screenSize: `${screenWidth}x${screenHeight}`
      })
    }

    detectIpad()
    
    // Re-detect on resize (orientation change)
    window.addEventListener('resize', detectIpad)
    return () => window.removeEventListener('resize', detectIpad)
  }, [])

  return { isIpad, deviceInfo }
}

type EvaluationQuestion = {
  id: number
  category: string
  question: string
}

export default function SurveyPage({ params }: { params: { presentation_id: string } }) {
  const router = useRouter()
  const [ratings, setRatings] = useState<{ [key: number]: number }>({})
  const [hoveredRating, setHoveredRating] = useState<{ questionId: number; value: number } | null>(null)
  const [showDebugInfo, setShowDebugInfo] = useState(false)
  
  // iPad detection
  const { isIpad, deviceInfo } = useIpadDetection()

  const presenter = {
    name: "김철수 CEO",
    topic: "Global Top-tier 대비 O/I 경쟁력 분석 및 개선방안",
    company: "SK이노베이션",
  }

  useEffect(() => {
    const submissionKey = `survey_submitted_${params.presentation_id}`
    const isSubmitted = localStorage.getItem(submissionKey)

    if (isSubmitted) {
      console.log("[v0] Survey already submitted, redirecting to complete page")
      router.push(`/survey/${params.presentation_id}/complete`)
    }
  }, [params.presentation_id, router])

  const evaluationQuestions: EvaluationQuestion[] = [
    {
      id: 1,
      category: "본원적 경쟁력",
      question: "도출된 중점 추진 과제가 본원적 경쟁력과 과제 간 유기적으로 연결되어 있는가?",
    },
    {
      id: 2,
      category: "성과 지속 가능성",
      question: "해당 과제가 일시적이 아닌 지속적인 성과를 창출할 수 있는 과제로 구성되었는가?",
    },
    {
      id: 3,
      category: "공유/확산 가치",
      question: "타 계열사 및 조직에 공유하고 확산할 수 있는 가치가 있는가?",
    },
  ]

  const handleRatingClick = (questionId: number, value: number) => {
    setRatings((prev) => ({ ...prev, [questionId]: value }))
  }

  const handleSubmit = () => {
    const allAnswered = evaluationQuestions.every((q) => ratings[q.id] !== undefined)

    if (allAnswered) {
      const submissionKey = `survey_submitted_${params.presentation_id}`
      const submissionData = {
        ratings,
        presenterName: presenter.name,
        presenterTopic: presenter.topic,
        submittedAt: new Date().toISOString(),
      }

      localStorage.setItem(submissionKey, JSON.stringify(submissionData))
      console.log("[v0] Survey submitted for presentation:", params.presentation_id, "with ratings:", ratings)

      router.push(`/survey/${params.presentation_id}/complete`)
    } else {
      alert("모든 항목을 평가해주세요.")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-6 flex-1">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground">{presenter.name}</h1>
                  {/* iPad indicator */}
                  {isIpad && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded-full">
                      <Tablet className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400">iPad</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{presenter.company}</p>
              </div>
              <div className="flex-1 border-l border-border pl-6">
                <p className="text-2xl font-bold text-foreground leading-tight">{presenter.topic}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Survey Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">발표 평가</h2>
            <p className="text-muted-foreground">각 항목에 대해 1점부터 10점까지 평가해주세요</p>
          </div>

          {evaluationQuestions.map((question, index) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card border border-border rounded-xl p-6 shadow-sm"
            >
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-sk-red text-white text-sm font-bold">
                    {question.id}
                  </span>
                  <h3 className="text-lg font-bold text-foreground">[{question.category}]</h3>
                </div>
                <p className="text-foreground/80 ml-8">{question.question}</p>
              </div>

              {/* Star Rating */}
              <div className={`flex justify-center gap-2 mb-4 ${isIpad ? 'gap-3' : 'gap-2'}`}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                  <button
                    key={value}
                    onClick={() => handleRatingClick(question.id, value)}
                    onMouseEnter={() => !isIpad && setHoveredRating({ questionId: question.id, value })}
                    onMouseLeave={() => !isIpad && setHoveredRating(null)}
                    // iPad-specific touch optimizations
                    onTouchStart={() => isIpad && setHoveredRating({ questionId: question.id, value })}
                    onTouchEnd={() => isIpad && setHoveredRating(null)}
                    className={`group relative transition-transform hover:scale-110 active:scale-95 ${
                      isIpad ? 'p-1' : ''
                    }`}
                  >
                    <Star
                      className={`${isIpad ? 'h-8 w-8' : 'h-7 w-7'} transition-all duration-200 ${
                        (
                          hoveredRating?.questionId === question.id
                            ? value <= hoveredRating.value
                            : value <= (ratings[question.id] || 0)
                        )
                          ? "fill-sk-red text-sk-red"
                          : "text-muted-foreground/30"
                      }`}
                    />
                    <span className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ${
                      isIpad ? 'group-active:opacity-100' : ''
                    }`}>
                      {value}
                    </span>
                  </button>
                ))}
              </div>

              {/* Selected Rating Display */}
              {ratings[question.id] !== undefined && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <p className="text-2xl font-bold text-sk-red">{ratings[question.id]}점</p>
                </motion.div>
              )}
            </motion.div>
          ))}

          {/* Submit Button */}
          <div className="flex justify-center mt-8 pb-8">
            <Button
              onClick={handleSubmit}
              disabled={evaluationQuestions.some((q) => ratings[q.id] === undefined)}
              size="lg"
              className={`bg-sk-red hover:bg-sk-red/90 text-white px-12 ${
                isIpad ? 'h-12 text-lg' : ''
              }`}
            >
              평가 제출
            </Button>
          </div>

          {/* Debug Info Panel (Development only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="fixed bottom-4 right-4 z-50">
              <Button
                onClick={() => setShowDebugInfo(!showDebugInfo)}
                variant="outline"
                size="sm"
                className="mb-2"
              >
                {showDebugInfo ? 'Hide' : 'Show'} Device Info
              </Button>
              
              {showDebugInfo && deviceInfo && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-card border border-border rounded-lg p-4 shadow-lg max-w-sm"
                >
                  <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
                    <Tablet className="h-4 w-4" />
                    Device Detection
                  </h3>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>iPad Detected:</span>
                      <span className={isIpad ? 'text-green-600 font-bold' : 'text-red-600'}>
                        {isIpad ? 'YES' : 'NO'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Platform:</span>
                      <span className="font-mono">{deviceInfo.platform}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Touch Points:</span>
                      <span className="font-mono">{deviceInfo.maxTouchPoints}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Screen Size:</span>
                      <span className="font-mono">{deviceInfo.screenSize}</span>
                    </div>
                    <div className="border-t border-border pt-1 mt-2">
                      <span>User Agent:</span>
                      <p className="font-mono text-[10px] break-all mt-1 text-muted-foreground">
                        {deviceInfo.userAgent}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
