"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Home, Sparkles } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Brain3D } from "@/components/brain-3d"
import { 
  fetchEvaluatorCount, 
  fetchPresentation, 
  fetchPresentationsWithPresenters, 
  fetchPresentationAnalysisComments,
  PresentationWithPresenter,
  PresentationAnalysisCommentResponse
} from "@/lib/api"

function TypewriterText({ text, delay = 50, onComplete }: { text: string; delay?: number; onComplete?: () => void }) {
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const hasCompletedRef = useRef(false)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex])
        setCurrentIndex((prev) => prev + 1)
      }, delay)

      return () => clearTimeout(timeout)
    } else if (currentIndex === text.length && onComplete && !hasCompletedRef.current) {
      hasCompletedRef.current = true
      onComplete()
    }
  }, [currentIndex, text, delay, onComplete])

  return <span>{displayedText}</span>
}

interface StrengthItem {
  text: string
  voiceAnalysis: string | null
  presentationMaterial: string | null
}

interface ImprovementItem {
  text: string
  voiceAnalysis: string | null
  presentationMaterial: string | null
}

export default function PostPresentationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const presentationIdFromQuery = searchParams.get("presentationId")

  const [presentations, setPresentations] = useState<PresentationWithPresenter[]>([])
  const [selectedPresentationId, setSelectedPresentationId] = useState<string>("")
  const selectedPresentation = presentations.find((p) => p.presentation_id === selectedPresentationId)

  // 실제 API에서 가져온 데이터
  const [strengths, setStrengths] = useState<StrengthItem[]>([])
  const [improvements, setImprovements] = useState<ImprovementItem[]>([])
  const [summary, setSummary] = useState<string>("")
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false)

  const [isAnalyzingImplication, setIsAnalyzingImplication] = useState(false)

  const [showAnalysis, setShowAnalysis] = useState(false)

  const [showStrengths, setShowStrengths] = useState(false)
  const [showWeaknesses, setShowWeaknesses] = useState(false)
  const [showSummary, setShowSummary] = useState(false)

  const [visibleStrengthItems, setVisibleStrengthItems] = useState<number[]>([])
  const [visibleWeaknessItems, setVisibleWeaknessItems] = useState<number[]>([])

  const [analyzingLine, setAnalyzingLine] = useState<string>("")

  const [isImplicationAnalysisComplete, setIsImplicationAnalysisComplete] = useState(false)

  const [loadingStage, setLoadingStage] = useState<"analyzing" | "ready" | "button" | "revealed">(
    presentationIdFromQuery ? "revealed" : "analyzing",
  )

  const [showScores, setShowScores] = useState(false)

  const [completedStrengthItems, setCompletedStrengthItems] = useState<number[]>([])
  const [completedWeaknessItems, setCompletedWeaknessItems] = useState<number[]>([])
  const [completedSummary, setCompletedSummary] = useState(false)

  // 평가 완료 상태 polling을 위한 state
  const [evaluatorCount, setEvaluatorCount] = useState<number>(0)
  const [totalEvaluatorCount, setTotalEvaluatorCount] = useState<number>(0)
  const [presentationStatus, setPresentationStatus] = useState<string>("")
  const [isEvaluationComplete, setIsEvaluationComplete] = useState<boolean>(false)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // 발표 목록 로딩
  const [isLoadingPresentations, setIsLoadingPresentations] = useState(true)

  // 분석 데이터 로딩
  const loadAnalysisData = async (presentationId: string) => {
    if (!presentationId) return
    
    setIsLoadingAnalysis(true)
    try {
      const comments = await fetchPresentationAnalysisComments(presentationId)
      
      // 강점 추출
      const strengthComments = comments.filter(c => c.type === '강점')
      const strengthItems: StrengthItem[] = strengthComments.map(c => ({
        text: c.comment,
        voiceAnalysis: c.source_type === '발표' ? c.source : null,
        presentationMaterial: c.source_type === '자료' ? c.source : null,
      }))
      setStrengths(strengthItems)

      // 약점 추출
      const weaknessComments = comments.filter(c => c.type === '약점')
      const improvementItems: ImprovementItem[] = weaknessComments.map(c => ({
        text: c.comment,
        voiceAnalysis: c.source_type === '발표' ? c.source : null,
        presentationMaterial: c.source_type === '자료' ? c.source : null,
      }))
      setImprovements(improvementItems)

      // 총평 추출 (여러 개 있을 수 있으므로 하나로 합침)
      const summaryComments = comments.filter(c => c.type === '총평')
      const combinedSummary = summaryComments.map(c => c.comment).join('\n\n')
      setSummary(combinedSummary || "")

    } catch (error) {
      console.error("분석 데이터 로딩 실패:", error)
      // 에러 발생 시 빈 데이터
      setStrengths([])
      setImprovements([])
      setSummary("")
    } finally {
      setIsLoadingAnalysis(false)
    }
  }

  const handleImplicationAnalysis = () => {
    if (isImplicationAnalysisComplete) {
      router.push(`/post-presentation/evaluations?presentationId=${selectedPresentationId}`)
      return
    }

    // 초기 상태 설정 - 총평은 나중에 표시
    setShowAnalysis(true)
    setShowStrengths(true)
    setShowWeaknesses(true)
    setShowSummary(false)  // 명시적으로 false로 초기화

    // 실제 데이터 기반으로 애니메이션 - 강점과 약점을 병행으로 표시
    const animateItems = () => {
      let currentTime = 800
      const maxItems = Math.max(strengths.length, improvements.length)
      
      // 강점과 약점을 병행으로 표시
      for (let i = 0; i < maxItems; i++) {
        // 강점 표시
        if (i < strengths.length) {
          setTimeout(() => {
            setAnalyzingLine(strengths[i].text)
            setVisibleStrengthItems(prev => [...prev, i])
          }, currentTime)
        }
        
        // 약점 표시 (강점과 동시에 또는 강점이 없으면)
        if (i < improvements.length) {
          setTimeout(() => {
            setAnalyzingLine(improvements[i].text)
            setVisibleWeaknessItems(prev => [...prev, i])
          }, currentTime + (i < strengths.length ? 700 : 0)) // 강점과 0.7초 간격
        }
        
        currentTime += 1400
      }

      // 모든 강점/약점 표시 후 총평 표시 (마지막 아이템의 타이핑 시간 고려하여 추가 대기)
      // 마지막 아이템의 타이핑 애니메이션이 완료될 때까지 충분히 대기
      setTimeout(() => {
        setAnalyzingLine("총평 작성 중...")
        setShowSummary(true)  // 이제 총평 표시

        setTimeout(() => {
          setAnalyzingLine("")
          setIsAnalyzingImplication(false)
          setIsImplicationAnalysisComplete(true)
          setShowScores(true)
        }, 2000)
      }, currentTime + 2500)  // 2500ms 추가하여 마지막 아이템의 타이핑 완료 대기
    }

    animateItems()
  }

  const handleRevealResults = () => {
    setLoadingStage("revealed")
    handleImplicationAnalysis()
  }


  // 발표 목록 로딩
  useEffect(() => {
    const loadPresentations = async () => {
      try {
        // 세션1 발표만 가져오기
        const data = await fetchPresentationsWithPresenters('세션1')
        
        // presentation_order 기준 정렬 (오름차순)
        const sortedData = data.sort((a, b) => a.presentation_order - b.presentation_order)
        setPresentations(sortedData)
        
        // 첫 번째 발표를 기본 선택 (가장 낮은 order)
        if (sortedData.length > 0) {
          const initialId = presentationIdFromQuery || sortedData[0].presentation_id
          setSelectedPresentationId(initialId)
        }
      } catch (error) {
        console.error("발표 목록 로딩 실패:", error)
      } finally {
        setIsLoadingPresentations(false)
      }
    }

    loadPresentations()
  }, [presentationIdFromQuery])

  // 선택된 발표가 변경되면 분석 데이터 로딩 및 전체 초기화
  useEffect(() => {
    if (selectedPresentationId) {
      console.log('🎯 [발표 변경] 발표 ID:', selectedPresentationId, 'fromQuery:', presentationIdFromQuery)
      
      // 분석 데이터 로딩
      loadAnalysisData(selectedPresentationId)
      
      // 전체 상태 초기화
      setIsImplicationAnalysisComplete(false)
      setShowAnalysis(false)
      setShowStrengths(false)
      setShowWeaknesses(false)
      setShowSummary(false)
      setVisibleStrengthItems([])
      setVisibleWeaknessItems([])
      setCompletedStrengthItems([])
      setCompletedWeaknessItems([])
      setCompletedSummary(false)
      setIsEvaluationComplete(false)
      setAnalyzingLine("")
      
      // 항상 analyzing부터 시작 (정상적인 플로우)
      console.log('🔄 [상태] analyzing으로 초기화')
      setLoadingStage("analyzing")
    }
  }, [selectedPresentationId])

  // loadingStage에 따른 애니메이션 타이머 설정
  useEffect(() => {
    if (loadingStage === "analyzing") {
      // analyzing → ready (3초 후)
      console.log('⏱️ [타이머] analyzing 상태 시작')
      const timer = setTimeout(() => {
        console.log('⏱️ [타이머] ready 상태로 전환')
        setLoadingStage("ready")
      }, 3000)

      return () => {
        clearTimeout(timer)
      }
    } else if (loadingStage === "ready") {
      // ready → button (2.5초 후)
      console.log('⏱️ [타이머] ready 상태 시작')
      const timer = setTimeout(() => {
        console.log('⏱️ [타이머] button 상태로 전환')
        setLoadingStage("button")
      }, 2500)

      return () => {
        clearTimeout(timer)
      }
    }
  }, [loadingStage])

  // revealed 상태가 되면 애니메이션 시작
  useEffect(() => {
    if (loadingStage !== "revealed") {
      return
    }

    // 데이터가 로딩 중이면 대기
    if (isLoadingAnalysis) {
      console.log('⏳ [애니메이션] 데이터 로딩 중...')
      return
    }

    // 데이터가 없으면 경고
    if (strengths.length === 0 && improvements.length === 0 && !summary) {
      console.warn('⚠️ [애니메이션] 분석 데이터가 없습니다')
      return
    }

    // 분석 시작
    console.log('🎬 [애니메이션] 분석 시작', { 
      strengths: strengths.length, 
      improvements: improvements.length, 
      hasSummary: !!summary 
    })
    handleImplicationAnalysis()
  }, [loadingStage, isLoadingAnalysis, strengths, improvements, summary])

  // 평가 완료 상태 polling
  useEffect(() => {
    // AI 분석이 완료되고 결과가 표시된 후에만 polling 시작
    if (!isImplicationAnalysisComplete || !selectedPresentationId) {
      return
    }

    console.log('🔍 [Polling] 시작:', selectedPresentationId)

    const checkEvaluationStatus = async () => {
      try {
        console.log('🔄 [Polling] 평가 상태 확인 중...')
        
        // 평가 인원 수 조회
        const countData = await fetchEvaluatorCount(selectedPresentationId)
        setEvaluatorCount(countData.evaluator_count)
        setTotalEvaluatorCount(countData.total_evaluator_count)

        // 발표 상태 조회
        const presentation = await fetchPresentation(selectedPresentationId)
        setPresentationStatus(presentation.status)

        console.log(`📊 [Polling] 평가 인원: ${countData.evaluator_count}/${countData.total_evaluator_count}, 상태: ${presentation.status}`)

        // 평가 완료 조건: 전체 인원 완료 OR 발표 상태가 '완료'
        const isComplete = 
          countData.evaluator_count >= countData.total_evaluator_count || 
          presentation.status === '완료'

        if (isComplete) {
          console.log('✅ [Polling] 평가 완료! Polling 중지')
          console.log(`   - 평가 인원: ${countData.evaluator_count}/${countData.total_evaluator_count}`)
          console.log(`   - 발표 상태: ${presentation.status}`)
          setIsEvaluationComplete(true)
          // polling 중지
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current)
            pollingIntervalRef.current = null
          }
        } else {
          console.log(`⏳ [Polling] 평가 진행 중... (${countData.evaluator_count}/${countData.total_evaluator_count}, 상태: ${presentation.status})`)
          setIsEvaluationComplete(false)
        }
      } catch (error) {
        console.error("❌ [Polling] 평가 상태 조회 실패:", error)
      }
    }

    // 즉시 한번 실행
    checkEvaluationStatus()

    // 3초마다 polling 시작
    pollingIntervalRef.current = setInterval(checkEvaluationStatus, 3000)
    console.log('⏰ [Polling] Interval 설정됨 (3초마다)')

    // cleanup
    return () => {
      console.log('🛑 [Polling] Cleanup - Interval 정리')
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
    }
  }, [isImplicationAnalysisComplete, selectedPresentationId])

  return (
    <div
      className="min-h-screen p-4 md:p-6 relative overflow-x-hidden"
      style={{ background: "linear-gradient(to bottom, #0a1628, #0f1f3a, #0a1628)" }}
    >
      {/* Animated grid pattern */}
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

      {/* Scanning line effect */}
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

      {/* Floating particles */}
      {[...Array(15)].map((_, i) => (
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

      {/* Blue glowing orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-[1920px] mx-auto space-y-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              style={{
                color: "rgba(34, 211, 238, 0.9)",
                borderColor: "rgba(59, 130, 246, 0.3)",
                borderWidth: "1px",
              }}
            >
              <Home className="w-4 h-4" />
              홈으로
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
          transition={{ delay: 0.1 }}
          className="p-8 rounded-lg border-2 shadow-lg relative"
          style={{
            background: "rgba(10, 20, 40, 0.95)",
            backdropFilter: "blur(24px)",
            borderColor: "rgba(59, 130, 246, 0.3)",
            boxShadow: "0 0 30px rgba(59, 130, 246, 0.2), 0 8px 32px rgba(0, 0, 0, 0.6)",
          }}
        >
          {loadingStage === "revealed" && (
            <div className="mb-8">
              <h3 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">AI 종합 분석</h3>
            </div>
          )}

          <AnimatePresence>
            {loadingStage !== "revealed" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 z-20 flex items-center justify-center backdrop-blur-md bg-black/60 rounded-lg"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-center space-y-6"
                >
                  {loadingStage === "analyzing" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      <div className="relative h-48 w-48 mx-auto">
                        <Brain3D className="w-full h-full" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-2xl font-bold text-white">AI가 발표내용을 분석하는 중입니다</h4>
                        <motion.p
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                          className="text-sm text-white/70"
                        >
                          잠시만 기다려주세요...
                        </motion.p>
                      </div>
                    </motion.div>
                  )}

                  {loadingStage === "ready" && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="h-48 w-48 mx-auto"
                      >
                        <Brain3D className="w-full h-full" />
                      </motion.div>
                      <motion.h4
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-2xl font-bold text-white"
                      >
                        분석이 준비되었습니다
                      </motion.h4>
                    </motion.div>
                  )}

                  {loadingStage === "button" && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-6"
                    >
                      <div className="space-y-2">
                        <div className="h-48 w-48 mx-auto">
                          <Brain3D className="w-full h-full" />
                        </div>
                        <h4 className="text-2xl font-bold text-white">AI 분석 완료</h4>
                        <p className="text-sm text-white/70">발표에 대한 종합 분석이 준비되었습니다</p>
                      </div>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Button
                          onClick={handleRevealResults}
                          size="lg"
                          className="px-8 py-6 text-lg font-semibold rounded-lg shadow-xl hover:shadow-2xl transition-all gap-3"
                          style={{
                            background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                            color: "white",
                            boxShadow: "0 0 30px rgba(59, 130, 246, 0.5)",
                          }}
                        >
                          <Sparkles className="w-5 h-5" />
                          결과 확인하기
                        </Button>
                      </motion.div>
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative min-h-[600px]">
            {loadingStage === "revealed" && (
              <div className="space-y-8 max-w-5xl mx-auto">
                {isAnalyzingImplication && analyzingLine && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center gap-3 text-lg font-semibold text-cyan-400"
                  >
                    <div className="h-10 w-10 animate-pulse">
                      <Brain3D className="w-full h-full" />
                    </div>
                    <span className="animate-pulse">{analyzingLine}</span>
                  </motion.div>
                )}

                {/* Strengths Section */}
                <div className="w-full">
                  <div
                    className="rounded-xl p-8 min-h-[200px]"
                    style={{
                      border: "2px solid rgba(59, 130, 246, 0.5)",
                      background: "rgba(10, 20, 40, 0.95)",
                      boxShadow: "0 0 30px rgba(59, 130, 246, 0.3)",
                    }}
                  >
                    <h4 className="text-3xl font-bold text-center mb-8" style={{ color: "#ec4899" }}>
                      강점
                    </h4>
                      {isLoadingAnalysis ? (
                        <p className="text-muted-foreground">로딩 중...</p>
                      ) : strengths.length === 0 ? (
                        <p className="text-muted-foreground">분석 데이터가 없습니다.</p>
                      ) : (
                        <ul className="space-y-6">
                        {strengths.map((strength, idx) => (
                          <AnimatePresence key={idx}>
                            {visibleStrengthItems.includes(idx) && (
                              <motion.li
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className="text-lg font-medium text-white leading-relaxed"
                              >
                                <div className="flex items-start gap-3">
                                  <span className="text-white">•</span>
                                  <span className="flex-1">
                                    <TypewriterText
                                      text={strength.text}
                                      delay={50}
                                      onComplete={() => {
                                        setCompletedStrengthItems((prev) => [...prev, idx])
                                      }}
                                    />
                                    {completedStrengthItems.includes(idx) && (
                                      <motion.span
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.3 }}
                                        className="inline-flex items-center gap-2 ml-2"
                                      >
                                        {strength.voiceAnalysis && (
                                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                            음성분석 {strength.voiceAnalysis}
                                          </span>
                                        )}
                                        {strength.presentationMaterial && (
                                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                            발표자료 {strength.presentationMaterial}
                                          </span>
                                        )}
                                      </motion.span>
                                    )}
                                  </span>
                                </div>
                              </motion.li>
                            )}
                          </AnimatePresence>
                        ))}
                      </ul>
                      )}
                  </div>
                </div>

                {/* Weaknesses Section */}
                <div className="w-full">
                  <div
                    className="rounded-xl p-8 min-h-[200px]"
                    style={{
                      border: "2px solid rgba(59, 130, 246, 0.5)",
                      background: "rgba(10, 20, 40, 0.95)",
                      boxShadow: "0 0 30px rgba(59, 130, 246, 0.3)",
                    }}
                  >
                    <h4 className="text-3xl font-bold text-center mb-8" style={{ color: "#ec4899" }}>
                      약점
                    </h4>
                      {isLoadingAnalysis ? (
                        <p className="text-muted-foreground">로딩 중...</p>
                      ) : improvements.length === 0 ? (
                        <p className="text-muted-foreground">분석 데이터가 없습니다.</p>
                      ) : (
                        <ul className="space-y-6">
                        {improvements.map((improvement, idx) => (
                          <AnimatePresence key={idx}>
                            {visibleWeaknessItems.includes(idx) && (
                              <motion.li
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className="text-lg font-medium text-white leading-relaxed"
                              >
                                <div className="flex items-start gap-3">
                                  <span className="text-white">•</span>
                                  <span className="flex-1">
                                    <TypewriterText
                                      text={improvement.text}
                                      delay={50}
                                      onComplete={() => {
                                        setCompletedWeaknessItems((prev) => [...prev, idx])
                                      }}
                                    />
                                    {completedWeaknessItems.includes(idx) && (
                                      <motion.span
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.3 }}
                                        className="inline-flex items-center gap-2 ml-2"
                                      >
                                        {improvement.voiceAnalysis && (
                                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                            음성분석 {improvement.voiceAnalysis}
                                          </span>
                                        )}
                                        {improvement.presentationMaterial && (
                                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                            발표자료 {improvement.presentationMaterial}
                                          </span>
                                        )}
                                      </motion.span>
                                    )}
                                  </span>
                                </div>
                              </motion.li>
                            )}
                          </AnimatePresence>
                        ))}
                      </ul>
                      )}
                  </div>
                </div>

                {/* Summary Section */}
                <div className="w-full">
                  <div
                    className="rounded-xl p-8 min-h-[150px]"
                    style={{
                      border: "2px solid rgba(59, 130, 246, 0.5)",
                      background: "rgba(10, 20, 40, 0.95)",
                      boxShadow: "0 0 30px rgba(59, 130, 246, 0.3)",
                    }}
                  >
                    <h4 className="text-3xl font-bold text-center mb-8" style={{ color: "#ec4899" }}>
                      총평
                    </h4>
                      {isLoadingAnalysis ? (
                        <p className="text-muted-foreground">로딩 중...</p>
                      ) : !summary ? (
                        <p className="text-muted-foreground">분석 데이터가 없습니다.</p>
                      ) : (
                        <AnimatePresence>
                          {showSummary && (
                            <motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3 }}
                              className="text-lg font-medium text-white leading-relaxed text-center"
                            >
                              <TypewriterText
                                text={summary}
                                delay={50}
                                onComplete={() => setCompletedSummary(true)}
                              />
                            </motion.p>
                          )}
                        </AnimatePresence>
                      )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {isImplicationAnalysisComplete && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 flex flex-col items-center gap-4"
            >
              {!isEvaluationComplete && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-3 text-lg font-semibold text-cyan-400"
                >
                  <div className="h-10 w-10 animate-pulse">
                    <Brain3D className="w-full h-full" />
                  </div>
                  <span className="animate-pulse">
                    평가집계중... ({evaluatorCount}/{totalEvaluatorCount})
                  </span>
                </motion.div>
              )}
              
              <Button
                onClick={() => router.push(`/post-presentation/evaluations?presentationId=${selectedPresentationId}`)}
                disabled={!isEvaluationComplete}
                size="lg"
                variant="outline"
                className={`px-6 py-3 text-base font-semibold rounded-lg transition-all gap-2 ${
                  isEvaluationComplete
                    ? "bg-slate-900/60 backdrop-blur-sm border-cyan-500/50 text-cyan-400 hover:bg-slate-800/80 hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(6,182,212,0.4)]"
                    : "bg-slate-900/30 border-slate-700/50 text-slate-500 cursor-not-allowed"
                }`}
              >
                <Sparkles className="w-4 h-4" />
                결과 확인하기
              </Button>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-between pt-3"
          style={{ borderTop: "1px solid rgba(59, 130, 246, 0.2)" }}
        >
          <p className="text-xs" style={{ color: "rgba(34, 211, 238, 0.6)" }}>
            © 2025 SK Group. All rights reserved.
          </p>
          <p className="text-xs" style={{ color: "rgba(34, 211, 238, 0.6)" }}>
            AI 기반 발표 평가 시스템
          </p>
        </motion.div>
      </div>
    </div>
  )
}
