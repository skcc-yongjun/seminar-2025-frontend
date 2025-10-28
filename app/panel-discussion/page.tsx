"use client"

import { useState, useEffect, Suspense } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Home, CheckCircle2, Mic, MicOff, Volume2, ChevronDown, Loader2, Users, Lightbulb } from "lucide-react"
import Link from "next/link"
import { useSTT, PanelInsight } from "@/hooks/use-stt"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { fetchPresentationsWithPresenters, type PresentationWithPresenter } from "@/lib/api"
import { useSearchParams } from "next/navigation"
import { InsightCard } from "@/components/insight-card"

function PanelDiscussionContent() {
  const searchParams = useSearchParams()
  const [phase, setPhase] = useState<"waiting" | "monitoring" | "completion">("monitoring")
  const [isPresentationStarted, setIsPresentationStarted] = useState(false)
  const [presentationTime, setPresentationTime] = useState(0)

  // 패널토의 세션 타입
  const [selectedSessionType] = useState<string>("패널토의")

  // API에서 발표자 목록 가져오기 (패널토의 세션)
  const [presenters, setPresenters] = useState<PresentationWithPresenter[]>([])
  const [isLoadingPresenters, setIsLoadingPresenters] = useState(true)
  const [presentersError, setPresentersError] = useState<string | null>(null)

  const [selectedPresenterId, setSelectedPresenterId] = useState<string>("")
  const presenterInfo = presenters.find(p => p.presentation_id === selectedPresenterId) || presenters[0]

  // 발표자 목록 로드
  useEffect(() => {
    const loadPresenters = async () => {
      try {
        setIsLoadingPresenters(true)
        setPresentersError(null)
        const data = await fetchPresentationsWithPresenters("패널토의")
        console.log(`Loaded presentations for 패널토의:`, data)
        setPresenters(data)
        
        if (data.length > 0) {
          setSelectedPresenterId(data[0].presentation_id)
        } else {
          setSelectedPresenterId("")
        }
      } catch (error) {
        console.error("Failed to load presentations:", error)
        setPresentersError("발표자 목록을 불러오는데 실패했습니다.")
      } finally {
        setIsLoadingPresenters(false)
      }
    }

    loadPresenters()
  }, [])

  // STT Hook 사용
  const [currentPresentationId, setCurrentPresentationId] = useState<string>("")
  
  const {
    isRecording,
    isConnected,
    transcript,
    confidence,
    insights,
    error: sttError,
    startRecording,
    stopRecording,
    clearTranscript,
    clearInsights,
  } = useSTT(currentPresentationId)

  // 발표가 시작된 후에만 타이머 시작
  useEffect(() => {
    if (phase === "monitoring" && isPresentationStarted) {
      const interval = setInterval(() => {
        setPresentationTime((prev) => prev + 1)
      }, 1000)

      return () => {
        clearInterval(interval)
      }
    }
  }, [phase, isPresentationStarted])

  // presentationId가 설정되고 발표가 시작되면 STT 녹음 시작
  useEffect(() => {
    if (currentPresentationId && phase === "monitoring" && isPresentationStarted) {
      console.log("presentationId가 설정됨:", currentPresentationId)
      console.log("startRecording 호출")
      startRecording()
    }
  }, [currentPresentationId, phase, isPresentationStarted, startRecording])

  useEffect(() => {
    if (phase === "completion") {
      const timer = setTimeout(() => {
        clearTranscript()
        clearInsights()
        setPresentationTime(0)
        setCurrentPresentationId("")
        setIsPresentationStarted(false)
        setPhase("monitoring")
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [phase, clearTranscript, clearInsights])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleStartPresentation = () => {
    console.log("패널토의 시작 버튼 클릭")
    
    const allowedStatuses = ["대기", "진행중"]
    if (!allowedStatuses.includes(presenterInfo?.status || "")) {
      alert(`발표 상태가 "${presenterInfo?.status}"입니다. "대기" 또는 "진행중" 상태일 때만 시작할 수 있습니다.`)
      return
    }
    
    const newPresentationId = presenterInfo?.presentation_id || `패널토의_${Date.now()}`
    console.log("새로운 presentationId:", newPresentationId)
    setCurrentPresentationId(newPresentationId)
    setIsPresentationStarted(true)
  }

  const handleEndPresentation = () => {
    if (isRecording) {
      stopRecording()
    }
    setIsPresentationStarted(false)
    setPhase("completion")
  }

  return (
    <div className="min-h-screen p-4 md:p-6 relative overflow-x-hidden flex flex-col bg-[#1a1a1a]">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/3 rounded-full blur-3xl" />
      </div>

      <div className="max-w-[1400px] mx-auto w-full space-y-6 relative z-10 flex-1 flex flex-col">
        {phase !== "monitoring" && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start justify-between border-b border-white/10 pb-4"
          >
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div className="border-l border-white/20 pl-3">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Panel Discussion</p>
                  <p className="text-sm font-semibold text-white">패널토의</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <h1 className="text-xl md:text-2xl font-semibold text-balance mb-1 text-white">{presenterInfo?.topic || "패널토의"}</h1>
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {phase === "monitoring" && (
            <motion.div
              key="monitoring"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-[#1a1a1a] flex flex-col items-center justify-center"
            >
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-8 left-0 right-0 flex justify-center px-4"
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 hover:bg-black/60 hover:border-white/20 transition-all duration-200">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {isPresentationStarted ? (
                            <>
                              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                              <span className="text-white font-semibold text-sm">토의 진행 중</span>
                            </>
                          ) : (
                            <>
                              <div className="w-2 h-2 bg-gray-400 rounded-full" />
                              <span className="text-gray-400 font-semibold text-sm">토의 대기 중</span>
                            </>
                          )}
                        </div>
                        <div className="w-px h-4 bg-white/20" />
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-2 py-1 rounded bg-purple-500/30 text-purple-400">
                            패널토의
                          </span>
                          <span className="text-gray-400 text-sm">·</span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              presenterInfo?.status === "대기" 
                                ? "border-green-500/50 text-green-400 bg-green-500/10" 
                                : presenterInfo?.status === "진행중"
                                ? "border-yellow-500/50 text-yellow-400 bg-yellow-500/10"
                                : "border-gray-500/50 text-gray-400 bg-gray-500/10"
                            }`}
                          >
                            {presenterInfo?.status || "상태 불명"}
                          </Badge>
                          <span className="text-gray-400 text-sm">·</span>
                          <span className="text-white text-sm font-medium">
                            {presenterInfo?.presenter?.name || "발표자 없음"}
                          </span>
                          <span className="text-gray-400 text-sm">·</span>
                          <span className="text-gray-300 text-sm">{presenterInfo?.topic || "주제 없음"}</span>
                          <span className="text-gray-400 text-sm">·</span>
                          <span className="text-purple-400 text-sm font-medium">
                            💡 {insights.length}개 인사이트
                          </span>
                        </div>
                        <ChevronDown className="w-4 h-4 text-gray-400 ml-2" />
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-96 bg-black/90 backdrop-blur-md border-white/10 max-h-[500px] overflow-y-auto">
                    <DropdownMenuLabel className="text-white font-bold text-base">발표 선택</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/10" />
                    
                    {isLoadingPresenters ? (
                      <div className="flex items-center justify-center py-8 gap-2">
                        <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
                        <span className="text-gray-400 text-sm">발표 목록 로딩 중...</span>
                      </div>
                    ) : presentersError ? (
                      <div className="p-4 text-center">
                        <p className="text-red-400 text-sm mb-2">⚠️ {presentersError}</p>
                        <Button
                          size="sm"
                          onClick={() => window.location.reload()}
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          다시 시도
                        </Button>
                      </div>
                    ) : presenters.length === 0 ? (
                      <div className="p-4 text-center text-gray-400 text-sm">
                        패널토의가 없습니다.
                      </div>
                    ) : (
                      presenters.map((presentation) => {
                        const allowedStatuses = ["대기", "진행중"]
                        const isAllowed = allowedStatuses.includes(presentation.status || "")
                        const canSelect = !isPresentationStarted && isAllowed
                        
                        return (
                          <DropdownMenuItem
                            key={presentation.presentation_id}
                            onClick={() => {
                              if (canSelect) {
                                setSelectedPresenterId(presentation.presentation_id)
                              }
                            }}
                            disabled={!canSelect}
                            className={`flex flex-col items-start gap-2 p-3 ${
                              canSelect ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                            } ${
                              selectedPresenterId === presentation.presentation_id
                                ? "bg-purple-500/20 text-white border-l-2 border-purple-500"
                                : "text-gray-300 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-2">
                                {selectedPresenterId === presentation.presentation_id && (
                                  <CheckCircle2 className="w-4 h-4 text-purple-500" />
                                )}
                                <span className="font-semibold text-sm">{presentation.presenter?.name || "발표자 미정"}</span>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${
                                    presentation.status === "대기" 
                                      ? "border-green-500/50 text-green-400 bg-green-500/10" 
                                      : presentation.status === "진행중"
                                      ? "border-yellow-500/50 text-yellow-400 bg-yellow-500/10"
                                      : "border-gray-500/50 text-gray-400 bg-gray-500/10"
                                  }`}
                                >
                                  {presentation.status}
                                </Badge>
                              </div>
                            </div>
                            <span className="text-xs text-gray-400 pl-6">{presentation.topic}</span>
                          </DropdownMenuItem>
                        )
                      })
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>

              <div className="relative flex items-center justify-center">
                {isPresentationStarted && (
                  <>
                    <motion.div
                      className="absolute w-[400px] h-[400px] rounded-full border-2 border-purple-500/30"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0.2, 0.5],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                      }}
                    />
                    <motion.div
                      className="absolute w-[350px] h-[350px] rounded-full border-2 border-purple-500/40"
                      animate={{
                        scale: [1, 1.15, 1],
                        opacity: [0.6, 0.3, 0.6],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                        delay: 0.5,
                      }}
                    />
                    <motion.div
                      className="absolute w-[300px] h-[300px] rounded-full bg-purple-500/10"
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.7, 0.4, 0.7],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                        delay: 1,
                      }}
                    />
                  </>
                )}

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.8 }}
                  className={`relative z-10 w-[200px] h-[200px] rounded-full flex items-center justify-center shadow-2xl ${
                    isPresentationStarted 
                      ? "bg-gradient-to-br from-purple-600 to-purple-800" 
                      : "bg-gray-600"
                  }`}
                >
                  <Users className="w-24 h-24 text-white" strokeWidth={2} />
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute bottom-20 left-0 right-0 flex flex-col items-center px-8 gap-6"
              >
                {/* 오디오 파형 시각화 */}
                <div className="w-full max-w-2xl">
                  <div className="flex items-center justify-center gap-1 h-16">
                    {Array.from({ length: 60 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className={`w-1.5 rounded-full ${
                          isPresentationStarted ? "bg-purple-500" : "bg-gray-500"
                        }`}
                        animate={isPresentationStarted ? {
                          height: [Math.random() * 20 + 10, Math.random() * 50 + 20, Math.random() * 30 + 10],
                        } : {
                          height: 10,
                        }}
                        transition={isPresentationStarted ? {
                          duration: 0.5 + Math.random() * 0.5,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "easeInOut",
                          delay: i * 0.02,
                        } : {}}
                      />
                    ))}
                  </div>
                </div>

                {/* 2칼럼 레이아웃: STT + 인사이트 */}
                <div className="w-full max-w-6xl grid grid-cols-2 gap-4">
                  {/* 왼쪽: 실시간 STT */}
                  <Card className="bg-black/60 backdrop-blur-md border border-white/10 p-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {!isPresentationStarted ? (
                              <>
                                <MicOff className="w-5 h-5 text-gray-400" />
                                <Badge variant="outline" className="border-gray-500 text-gray-400">
                                  토의 시작 대기
                                </Badge>
                              </>
                            ) : isRecording ? (
                              <>
                                <Volume2 className="w-5 h-5 text-purple-500 animate-pulse" />
                                <Badge variant="outline" className="border-purple-500/50 text-purple-400">
                                  녹음 중
                                </Badge>
                              </>
                            ) : (
                              <>
                                <MicOff className="w-5 h-5 text-gray-400" />
                                <Badge variant="outline" className="border-gray-500 text-gray-400">
                                  대기 중
                                </Badge>
                              </>
                            )}
                          </div>
                          {isConnected && (
                            <Badge variant="outline" className="border-green-500/50 text-green-400">
                              STT 연결됨
                            </Badge>
                          )}
                        </div>
                      </div>

                      {sttError && (
                        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                          <p className="text-red-400 text-sm">{sttError}</p>
                        </div>
                      )}

                      <div className="min-h-[150px] max-h-[200px] overflow-y-auto p-4 bg-black/40 rounded-lg border border-white/5">
                        {!isPresentationStarted ? (
                          <p className="text-gray-500 text-sm italic">토의를 시작하면 음성 인식 결과가 여기에 표시됩니다...</p>
                        ) : transcript ? (
                          <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{transcript}</p>
                        ) : (
                          <p className="text-gray-500 text-sm italic">음성 인식 결과가 여기에 표시됩니다...</p>
                        )}
                      </div>
                    </div>
                  </Card>

                  {/* 오른쪽: 실시간 인사이트 */}
                  <Card className="bg-black/60 backdrop-blur-md border border-white/10 p-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Lightbulb className="w-5 h-5 text-purple-400" />
                          <span className="text-white font-semibold text-sm">핵심 인사이트</span>
                          <Badge variant="outline" className="border-purple-500/50 text-purple-400">
                            {insights.length}개
                          </Badge>
                        </div>
                      </div>

                      <div className="min-h-[150px] max-h-[200px] overflow-y-auto space-y-2">
                        {insights.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-full text-center py-8">
                            <Lightbulb className="w-8 h-8 text-gray-600 mb-2" />
                            <p className="text-gray-500 text-sm">아직 인사이트가 없습니다</p>
                            <p className="text-gray-600 text-xs mt-1">5문장마다 자동으로 분석됩니다</p>
                          </div>
                        ) : (
                          insights.map((insight, idx) => (
                            <div key={insight.comment_id} className="p-2 bg-purple-500/10 rounded border border-purple-500/30">
                              <div className="flex items-start gap-2">
                                <Lightbulb className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs text-purple-400 font-mono">{insight.timestamp}</span>
                                    <span className="text-xs text-gray-500">#{idx + 1}</span>
                                  </div>
                                  <p className="text-sm text-white leading-tight">{insight.insight_text}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </Card>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="absolute bottom-8 right-8 flex gap-3"
              >
                {!isPresentationStarted ? (
                  <Button
                    onClick={handleStartPresentation}
                    disabled={!["대기", "진행중"].includes(presenterInfo?.status || "")}
                    className={`px-6 py-3 text-lg font-semibold rounded-lg shadow-lg gap-2 ${
                      ["대기", "진행중"].includes(presenterInfo?.status || "")
                        ? "bg-purple-600 hover:bg-purple-700 text-white"
                        : "bg-gray-600 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <Users className="w-5 h-5" />
                    토의 시작
                  </Button>
                ) : (
                  <Button
                    onClick={handleEndPresentation}
                    variant="outline"
                    className="border-red-500/50 hover:bg-red-500/10 text-red-400 bg-black/40 backdrop-blur-md gap-2"
                  >
                    <MicOff className="w-4 h-4" />
                    토의 종료
                  </Button>
                )}
              </motion.div>
            </motion.div>
          )}

          {phase === "completion" && (
            <motion.div
              key="completion"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="flex-1 flex items-center justify-center"
            >
              <div className="text-center space-y-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.6 }}
                >
                  <CheckCircle2 className="w-32 h-32 text-purple-600 mx-auto" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-4"
                >
                  <h2 className="text-4xl font-bold text-white">패널토의가 종료되었습니다</h2>
                  <p className="text-xl text-gray-400">{insights.length}개의 인사이트가 추출되었습니다.</p>
                  <div className="flex items-center justify-center gap-2 pt-4">
                    <div
                      className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {phase !== "monitoring" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-between pt-3 border-t border-white/10"
          >
            <p className="text-xs text-gray-500">© 2025 SK Group. All rights reserved.</p>
            <Link href="/">
              <Button
                size="sm"
                variant="outline"
                className="gap-2 border-white/20 hover:bg-white/5 text-white bg-transparent"
              >
                <Home className="w-4 h-4" />
                홈으로
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default function PanelDiscussionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a]">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
          <span className="text-white text-lg">로딩 중...</span>
        </div>
      </div>
    }>
      <PanelDiscussionContent />
    </Suspense>
  )
}

