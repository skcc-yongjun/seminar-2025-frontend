"use client"

import { useState, useEffect, use } from "react"
import { motion } from "framer-motion"
import { Star, ChevronLeft, Tablet, AlertCircle, XCircle, Clock, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { fetchPresentationsWithPresenters, fetchPresentations, submitHumanEvaluationScores } from "@/lib/api"
import type { PresentationWithPresenter, HumanEvaluationScoreItem } from "@/lib/api"

// Device ID 생성 또는 가져오기 (localStorage 사용 - 전역으로 하나만)
function getOrCreateDeviceId(): string {
  const DEVICE_ID_KEY = "survey_device_id"
  
  // localStorage에서 기존 device_id 확인
  let deviceId = localStorage.getItem(DEVICE_ID_KEY)
  
  if (!deviceId) {
    // UUID 생성 (간단한 버전)
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    localStorage.setItem(DEVICE_ID_KEY, deviceId)
    console.log("📱 새 Device ID 생성:", deviceId)
  } else {
    console.log("📱 기존 Device ID 사용:", deviceId)
  }
  
  return deviceId
}

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

export default function SurveyPage({ params }: { params: Promise<{ presentation_id: string }> }) {
  const { presentation_id } = use(params)
  const router = useRouter()
  const [ratings, setRatings] = useState<{ [key: number]: number }>({})
  const [hoveredRating, setHoveredRating] = useState<{ questionId: number; value: number } | null>(null)
  const [showDebugInfo, setShowDebugInfo] = useState(false)
  const [presentation, setPresentation] = useState<PresentationWithPresenter | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [navigating, setNavigating] = useState(false)
  const [errorScreen, setErrorScreen] = useState<{
    type: 'validation' | 'already_submitted' | 'waiting' | 'closed' | null
    message: string
    unansweredQuestions?: number[]
  }>({ type: null, message: '' })
  
  // iPad detection
  const { isIpad, deviceInfo } = useIpadDetection()

  // 발표 정보 로드
  useEffect(() => {
    async function loadPresentation() {
      try {
        setLoading(true)
        // 세션1의 모든 발표 가져오기 (발표자 정보 포함)
        const presentations = await fetchPresentationsWithPresenters("세션1")
        
        // 현재 presentation_id와 일치하는 발표 찾기
        const currentPresentation = presentations.find(
          p => p.presentation_id === presentation_id
        )
        
        if (currentPresentation) {
          setPresentation(currentPresentation)
          console.log("📊 서베이 페이지 - 발표 정보 로드:", {
            id: currentPresentation.presentation_id,
            topic: currentPresentation.topic,
            presenter: currentPresentation.presenter?.name,
            company: currentPresentation.presenter?.company
          })
        } else {
          console.error("발표를 찾을 수 없습니다:", presentation_id)
        }
      } catch (error) {
        console.error("발표 정보 로드 실패:", error)
      } finally {
        setLoading(false)
      }
    }

    loadPresentation()
  }, [presentation_id])

  // 제출 여부 확인 - 이미 제출한 발표는 다음 미제출 발표로 자동 리다이렉트
  useEffect(() => {
    async function checkSubmissionAndRedirect() {
      const submissionKey = `survey_submitted_${presentation_id}`
      const isSubmitted = localStorage.getItem(submissionKey)

      if (isSubmitted) {
        console.log(`✅ [발표 ${presentation_id}] 이미 제출됨 - 다음 미제출 발표 찾는 중...`)
        
        try {
          // 세션1의 모든 발표 가져오기
          const presentations = await fetchPresentations("세션1")
          
          // presentation_order 기준으로 정렬
          const sortedPresentations = [...presentations].sort(
            (a, b) => a.presentation_order - b.presentation_order
          )
          
          // 아직 제출하지 않은 첫 번째 발표 찾기
          const unsubmittedPresentation = sortedPresentations.find(p => {
            const key = `survey_submitted_${p.presentation_id}`
            return !localStorage.getItem(key)
          })
          
          if (unsubmittedPresentation) {
            // 미제출 발표가 있으면 해당 발표로 바로 이동
            console.log(`🔀 [Redirect] 미제출 발표로 이동: ${unsubmittedPresentation.presentation_id}`)
            router.push(`/survey/${unsubmittedPresentation.presentation_id}`)
          } else {
            // 모든 발표를 제출했으면 마지막 발표의 complete 페이지로
            console.log(`✅ [Complete] 모든 발표 제출 완료 - Complete 페이지로 이동`)
            const lastPresentation = sortedPresentations[sortedPresentations.length - 1]
            router.push(`/survey/${lastPresentation.presentation_id}/complete`)
          }
        } catch (error) {
          console.error("발표 목록 조회 실패:", error)
          // 에러 시 현재 발표의 complete 페이지로
          router.push(`/survey/${presentation_id}/complete`)
        }
      } else {
        console.log(`📝 [발표 ${presentation_id}] 미제출 - 평가 가능`)
      }
    }

    checkSubmissionAndRedirect()
  }, [presentation_id, router])

  const evaluationQuestions: EvaluationQuestion[] = [
    {
      id: 1,
      category: "본원적 경쟁력",
      question: "도출된 중점 추진 과제가 본원적 경쟁력과 과제 간 유기적으로 연결되어 있는가?",
    },
    {
      id: 2,
      category: "지속가능성",
      question: "해당 과제가 일시적이 아닌 지속적인 성과를 창출할 수 있는 과제로 구성되었는가?",
    },
    {
      id: 3,
      category: "혁신성",
      question: "타 계열사 및 조직에 공유하고 확산할 수 있는 혁신적 가치가 있는가?",
    },
  ]

  const handleRatingClick = (questionId: number, value: number) => {
    setRatings((prev) => ({ ...prev, [questionId]: value }))
  }

  const handleSubmit = async () => {
    const allAnswered = evaluationQuestions.every((q) => ratings[q.id] !== undefined)

    if (!allAnswered) {
      // 미평가 항목 찾기
      const unanswered = evaluationQuestions
        .filter(q => ratings[q.id] === undefined)
        .map(q => q.id)
      
      setErrorScreen({
        type: 'validation',
        message: '모든 항목을 평가해주세요',
        unansweredQuestions: unanswered
      })
      return
    }

    try {
      setSubmitting(true)
      
      // Device ID 가져오기 (전역으로 하나)
      const deviceId = getOrCreateDeviceId()
      
      // API 요청 데이터 구성
      // questionId를 category로 매핑
      const scores: HumanEvaluationScoreItem[] = evaluationQuestions.map((q) => ({
        category: q.category,
        score: ratings[q.id]
      }))
      
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
      console.log("📤 [평가 제출] 시작")
      console.log("  • Presentation ID:", presentation_id)
      console.log("  • Device ID:", deviceId)
      console.log("  • 평가 항목 수:", scores.length)
      console.log("  • 평가 데이터:", scores)
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

      // API 호출
      const response = await submitHumanEvaluationScores(presentation_id, {
        device_id: deviceId,
        scores
      })

      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
      console.log("✅ [평가 제출] 성공")
      console.log("  • Saved Count:", response.saved_count)
      console.log("  • Response:", response)
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

      // localStorage에 제출 정보 저장 (발표별로 저장 - complete 페이지에서 사용)
      const submissionKey = `survey_submitted_${presentation_id}`
      const submissionData = {
        ratings,
        presenterName: presentation?.presenter?.name || "Unknown",
        presenterTopic: presentation?.topic || "Unknown",
        submittedAt: new Date().toISOString(),
        deviceId, // 디버깅용
      }
      localStorage.setItem(submissionKey, JSON.stringify(submissionData))
      
      console.log("💾 [localStorage] 제출 정보 저장")
      console.log("  • Key:", submissionKey)
      console.log("  • Data:", submissionData)

      // Complete 페이지로 이동
      console.log("🔀 [Navigate] Complete 페이지로 이동:", `/survey/${presentation_id}/complete`)
      router.push(`/survey/${presentation_id}/complete`)
    } catch (error) {
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
      console.error("❌ [평가 제출] 실패")
      console.error("  • Error:", error)
      if (error instanceof Error) {
        console.error("  • Error Message:", error.message)
        console.error("  • Error Stack:", error.stack)
      }
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
      
      // 에러 메시지 파싱
      let errorMessage = "평가 제출 중 오류가 발생했습니다."
      let isDuplicateSubmission = false
      
      if (error instanceof Error) {
        // 백엔드 에러 메시지 추출
        const match = error.message.match(/(\d+) - (.+)/)
        if (match) {
          const [, statusCode, message] = match
          console.log("🔍 [Error Parsing]")
          console.log("  • Status Code:", statusCode)
          console.log("  • Message:", message)
          
          if (statusCode === "400" && message.includes("이미 평가를 제출")) {
            isDuplicateSubmission = true
            errorMessage = "이미 평가를 완료한 발표입니다"
          } else if (statusCode === "400" && message.includes("평가 대기중")) {
            errorMessage = "현재 평가 대기중입니다"
          } else if (statusCode === "400" && message.includes("평가가 종료")) {
            errorMessage = "평가가 종료되었습니다"
          } else {
            errorMessage = message
          }
        } else {
          // match가 없는 경우 원본 메시지 사용
          errorMessage = error.message
        }
      }
      
      // 중복 제출인 경우 Complete 페이지로 자동 이동
      if (isDuplicateSubmission) {
        console.log("🔀 [Duplicate] 중복 제출 감지 - Complete 페이지로 이동")
        
        // localStorage에도 제출 정보 저장 (일관성 유지)
        const submissionKey = `survey_submitted_${presentation_id}`
        if (!localStorage.getItem(submissionKey)) {
          localStorage.setItem(submissionKey, JSON.stringify({
            submittedAt: new Date().toISOString(),
            error: "duplicate_submission"
          }))
        }
        
        // Complete 페이지로 이동 (Complete 페이지에서 다음 미제출 발표를 자동으로 찾음)
        router.push(`/survey/${presentation_id}/complete`)
      } else {
        // 중복 제출이 아닌 다른 에러는 에러 화면 표시
        if (errorMessage.includes("평가 대기중")) {
          setErrorScreen({ type: 'waiting', message: errorMessage })
        } else if (errorMessage.includes("평가가 종료")) {
          setErrorScreen({ type: 'closed', message: errorMessage })
        } else {
          setErrorScreen({ type: 'already_submitted', message: errorMessage })
        }
      }
    } finally {
      setSubmitting(false)
    }
  }

  // 다음 평가 가능한 발표로 이동하는 핸들러
  const handleGoToNextAvailablePresentation = async () => {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log("🔀 [Navigate] 다음 평가 가능한 발표 찾는 중...")
    console.log("  • 현재 발표 ID:", presentation_id)
    
    setNavigating(true)
    
    try {
      // 세션1의 모든 발표 가져오기
      const presentations = await fetchPresentationsWithPresenters("세션1")
      console.log("  • 조회된 발표 수:", presentations.length)
      
      // presentation_order 기준으로 정렬
      const sortedPresentations = [...presentations].sort(
        (a, b) => a.presentation_order - b.presentation_order
      )
      
      console.log("  • 발표 목록:")
      sortedPresentations.forEach(p => {
        const key = `survey_submitted_${p.presentation_id}`
        const isSubmitted = !!localStorage.getItem(key)
        console.log(`    - [${p.presentation_order}] ${p.presentation_id} (${p.status}): ${isSubmitted ? '✅ 제출됨' : '❌ 미제출'}`)
      })
      
      // 1순위: 미제출 발표 중에서 '진행중' 또는 '평가' 상태인 발표 찾기
      let targetPresentation = sortedPresentations.find(p => {
        const key = `survey_submitted_${p.presentation_id}`
        const isNotSubmitted = !localStorage.getItem(key)
        const isAvailableStatus = p.status === '진행중' || p.status === '평가'
        return isNotSubmitted && isAvailableStatus
      })
      
      // 2순위: 없으면 미제출 발표 중에서 '대기중' 상태인 발표 찾기 (order 순)
      if (!targetPresentation) {
        targetPresentation = sortedPresentations.find(p => {
          const key = `survey_submitted_${p.presentation_id}`
          const isNotSubmitted = !localStorage.getItem(key)
          const isWaitingStatus = p.status === '대기'
          return isNotSubmitted && isWaitingStatus
        })
      }
      
      if (targetPresentation) {
        // 평가 가능한 발표가 있으면 해당 발표로 바로 이동
        console.log(`✅ [Found] 이동할 발표 발견: ${targetPresentation.presentation_id} (${targetPresentation.status})`)
        console.log(`🔀 [Redirect] 이동 중...`)
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        router.push(`/survey/${targetPresentation.presentation_id}`)
      } else {
        // 미제출 발표가 없으면 - 모두 완료
        console.log(`✅ [Complete] 모든 평가 완료`)
        const lastPresentation = sortedPresentations[sortedPresentations.length - 1]
        console.log(`🔀 [Redirect] Complete 페이지로 이동: ${lastPresentation.presentation_id}`)
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        router.push(`/survey/${lastPresentation.presentation_id}/complete`)
      }
    } catch (error) {
      console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
      console.error("❌ [Error] 발표 목록 조회 실패:", error)
      console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
      alert("평가 가능한 발표를 찾을 수 없습니다. 홈으로 이동합니다.")
      router.push("/")
    } finally {
      setNavigating(false)
    }
  }

  // 에러 화면 (Complete 페이지 스타일)
  if (errorScreen.type) {
    const getErrorIcon = () => {
      if (errorScreen.type === 'validation') {
        return <AlertCircle className="h-16 w-16 text-orange-500" />
      }
      if (errorScreen.type === 'waiting') {
        return <Clock className="h-16 w-16 text-blue-500" />
      }
      if (errorScreen.type === 'closed') {
        return <ArrowRight className="h-16 w-16 text-blue-500" />
      }
      return <XCircle className="h-16 w-16 text-red-500" />
    }

    const getErrorColor = () => {
      if (errorScreen.type === 'validation') {
        return 'orange'
      }
      if (errorScreen.type === 'waiting') {
        return 'blue'
      }
      if (errorScreen.type === 'closed') {
        return 'blue'
      }
      return 'red'
    }

    const color = getErrorColor()

    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          <div className="bg-card border border-border rounded-2xl p-8 shadow-lg text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex justify-center mb-6"
            >
              <div className={`bg-${color}-500/10 rounded-full p-4`}>
                {getErrorIcon()}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <h1 className="text-3xl font-bold text-foreground mb-3">
                {errorScreen.message}
              </h1>
              
              {errorScreen.type === 'validation' && errorScreen.unansweredQuestions && (
                <>
                  <p className="text-muted-foreground mb-6">
                    모든 항목을 평가해주셔야 제출할 수 있습니다.
                  </p>
                  <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <p className="text-sm text-muted-foreground mb-2">미평가 항목</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {errorScreen.unansweredQuestions.map(qId => {
                        const question = evaluationQuestions.find(q => q.id === qId)
                        return (
                          <div
                            key={qId}
                            className="px-3 py-1 bg-orange-500 text-white rounded-full text-sm font-semibold"
                          >
                            #{qId} {question?.category}
                          </div>
                        )
                      })}
                    </div>
                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-3">
                      {errorScreen.unansweredQuestions.length}개 항목이 평가되지 않았습니다
                    </p>
                  </div>
                </>
              )}

              {errorScreen.type === 'waiting' && (
                <p className="text-muted-foreground mb-6">
                  발표 준비 중입니다.<br />
                  잠시 후 다시 시도해주세요.
                </p>
              )}

              {errorScreen.type === 'closed' && (
                <p className="text-muted-foreground mb-6">
                  이 발표의 평가가 종료되었습니다.<br />
                  다른 평가 가능한 발표로 이동합니다.
                </p>
              )}

              {errorScreen.type === 'already_submitted' && (
                <p className="text-muted-foreground mb-6">
                  다른 발표자 평가를 진행해주세요.
                </p>
              )}

              <div className="mt-8 space-y-3">
                {errorScreen.type === 'validation' ? (
                  <Button
                    onClick={() => setErrorScreen({ type: null, message: '' })}
                    size="lg"
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    평가하러 가기
                  </Button>
                ) : errorScreen.type === 'waiting' ? (
                  <Button
                    onClick={() => window.location.reload()}
                    size="lg"
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    평가화면으로 돌아가기
                  </Button>
                ) : errorScreen.type === 'closed' ? (
                  <Button
                    onClick={handleGoToNextAvailablePresentation}
                    disabled={navigating}
                    size="lg"
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {navigating ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        이동 중...
                      </span>
                    ) : (
                      "현재 진행가능한 평가로 가기"
                    )}
                  </Button>
                ) : (
                  <Link href="/" className="block">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full h-14 text-lg font-semibold"
                    >
                      홈으로 돌아가기
                    </Button>
                  </Link>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    )
  }

  // 로딩 중이거나 데이터가 없을 때
  if (loading || !presentation) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">설문조사 정보를 불러오는 중...</p>
        </div>
      </div>
    )
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
                  <h1 className="text-xl font-bold text-foreground">{presentation.presenter?.name || "발표자"}</h1>
                  {/* iPad indicator */}
                  {isIpad && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded-full">
                      <Tablet className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400">iPad</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{presentation.presenter?.company || "회사"}</p>
              </div>
              <div className="flex-1 border-l border-border pl-6">
                <p className="text-2xl font-bold text-foreground leading-tight">{presentation.topic}</p>
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
              disabled={submitting}
              size="lg"
              className={`bg-sk-red hover:bg-sk-red/90 text-white px-12 ${
                isIpad ? 'h-12 text-lg' : ''
              }`}
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  제출 중...
                </span>
              ) : (
                "평가 제출"
              )}
            </Button>
          </div>

          {/* Debug Info Panel (Development only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="fixed bottom-4 right-4 z-50 space-y-2">
              {/* 현재 발표 제출 상태 표시 */}
              <div className="bg-card border border-border rounded-lg p-3 shadow-lg max-w-xs">
                <div className="text-xs space-y-1">
                  <div className="font-bold text-sm mb-2">🔧 Debug Info</div>
                  <div className="flex justify-between items-center">
                    <span>발표 ID:</span>
                    <span className="font-mono text-[10px]">{presentation_id.substring(0, 15)}...</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Device ID:</span>
                    <span className="font-mono text-[10px]">
                      {typeof window !== 'undefined' ? (localStorage.getItem('survey_device_id')?.substring(0, 15) || 'N/A') : 'N/A'}...
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>제출 여부:</span>
                    <span className={`font-bold ${
                      typeof window !== 'undefined' && localStorage.getItem(`survey_submitted_${presentation_id}`)
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {typeof window !== 'undefined' && localStorage.getItem(`survey_submitted_${presentation_id}`)
                        ? '✅ 제출됨'
                        : '❌ 미제출'
                      }
                    </span>
                  </div>
                  <div className="border-t border-border pt-2 mt-2">
                    <div className="text-[10px] text-muted-foreground">
                      전체 Survey 데이터: {typeof window !== 'undefined' ? Object.keys(localStorage).filter(k => k.startsWith('survey_')).length : 0}개
                    </div>
                  </div>
                </div>
              </div>

              {/* 현재 발표 제출 정보만 초기화 */}
              <Button
                onClick={() => {
                  const submissionKey = `survey_submitted_${presentation_id}`
                  const wasSubmitted = localStorage.getItem(submissionKey)
                  localStorage.removeItem(submissionKey)
                  console.log("🔄 [Reset] 현재 발표 제출 정보 초기화")
                  console.log("  • Key:", submissionKey)
                  console.log("  • Was Submitted:", !!wasSubmitted)
                  alert(`✅ 현재 발표의 제출 정보가 초기화되었습니다.\n\n발표 ID: ${presentation_id}\n\n다시 투표할 수 있습니다.`)
                  window.location.reload()
                }}
                variant="destructive"
                size="sm"
                className="w-full"
              >
                🔄 Reset This Survey
              </Button>
              
              {/* 전체 Survey 데이터 초기화 */}
              <Button
                onClick={() => {
                  const keys = Object.keys(localStorage).filter(key => key.startsWith('survey_'))
                  console.log("🗑️ [Clear All] 전체 Survey 데이터 초기화")
                  console.log("  • Keys:", keys)
                  keys.forEach(key => {
                    console.log(`  • Removing: ${key}`)
                    localStorage.removeItem(key)
                  })
                  alert(`✅ 모든 Survey 데이터 (${keys.length}개)가 초기화되었습니다.\n\n- Device ID\n- 모든 발표 제출 정보`)
                  window.location.reload()
                }}
                variant="outline"
                size="sm"
                className="w-full"
              >
                🗑️ Clear All Survey Data ({typeof window !== 'undefined' ? Object.keys(localStorage).filter(k => k.startsWith('survey_')).length : 0})
              </Button>
              
              <Button
                onClick={() => setShowDebugInfo(!showDebugInfo)}
                variant="outline"
                size="sm"
                className="w-full"
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
                    <div className="flex justify-between gap-2">
                      <span>Device ID:</span>
                      <span className="font-mono text-[10px] break-all">
                        {typeof window !== 'undefined' ? localStorage.getItem('survey_device_id') || 'Not set' : 'N/A'}
                      </span>
                    </div>
                    <div className="border-t border-border pt-1 mt-2">
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
