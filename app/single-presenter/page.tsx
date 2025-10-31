"use client"

import { useState, useEffect, useMemo, Suspense } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Home, CheckCircle2, Mic, MicOff, Volume2, ChevronDown, Loader2 } from "lucide-react"
import Link from "next/link"
import { useSTT } from "@/hooks/use-stt"
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

function SinglePresenterViewContent() {
  const searchParams = useSearchParams()
  const sessionParam = searchParams.get('session') || "세션1"
  const [phase, setPhase] = useState<"waiting" | "monitoring" | "completion">("monitoring")
  const [isPresentationStarted, setIsPresentationStarted] = useState(false)
  const [liveScores, setLiveScores] = useState({
    content: 0,
    delivery: 0,
    engagement: 0,
    overall: 0,
  })
  const [presentationTime, setPresentationTime] = useState(0)

  // 세션 타입 선택 (URL 파라미터에서 초기값 설정)
  const [selectedSessionType, setSelectedSessionType] = useState<string>(sessionParam)

  // API에서 발표자 목록 가져오기
  const [presenters, setPresenters] = useState<PresentationWithPresenter[]>([])
  const [isLoadingPresenters, setIsLoadingPresenters] = useState(true)
  const [presentersError, setPresentersError] = useState<string | null>(null)

  const [selectedPresenterId, setSelectedPresenterId] = useState<string>("")
  const presenterInfo = presenters.find(p => p.presentation_id === selectedPresenterId) || presenters[0]

  // 발표자 목록 로드 (세션 타입이 변경될 때마다 재로드)
  useEffect(() => {
    const loadPresenters = async () => {
      try {
        setIsLoadingPresenters(true)
        setPresentersError(null)
        const data = await fetchPresentationsWithPresenters(selectedSessionType)
        console.log(`Loaded presentations for ${selectedSessionType}:`, data)
        setPresenters(data)
        
        // 첫 번째 발표자를 기본으로 선택
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
  }, [selectedSessionType])

  // STT Hook 사용 - 발표 시작 시에만 생성
  // presentationId는 PRESENTATION 테이블의 PK와 일치해야 함
  const [currentPresentationId, setCurrentPresentationId] = useState<string>("")
  
  const {
    isRecording,
    isConnected,
    transcript,
    confidence,
    error: sttError,
    startRecording,
    stopRecording,
    clearTranscript,
  } = useSTT(currentPresentationId)

  // 발표가 시작된 후에만 타이머 시작
  useEffect(() => {
    if (phase === "monitoring" && isPresentationStarted) {
      // 타이머 시작
      const interval = setInterval(() => {
        setPresentationTime((prev) => prev + 1)
        setLiveScores({
          content: Math.min(95, Math.random() * 30 + 65),
          delivery: Math.min(95, Math.random() * 30 + 65),
          engagement: Math.min(95, Math.random() * 30 + 65),
          overall: Math.min(95, Math.random() * 30 + 65),
        })
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

  // useEffect(() => {
  //   if (phase === "monitoring" && presentationTime >= 10) {
  //     setPhase("completion")
  //   }
  // }, [presentationTime, phase])

  useEffect(() => {
    if (phase === "completion") {
      const timer = setTimeout(() => {
        // 트랜스크립트 초기화
        clearTranscript()
        // 상태 초기화
        setPresentationTime(0)
        setLiveScores({
          content: 0,
          delivery: 0,
          engagement: 0,
          overall: 0,
        })
        // presentationId 초기화
        setCurrentPresentationId("")
        // 발표 시작 상태 초기화
        setIsPresentationStarted(false)
        // monitoring 단계로 복귀 (발표 시작 전 상태)
        setPhase("monitoring")
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [phase])


  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleStartPresentation = async () => {
    console.log("발표 시작 버튼 클릭")
    
    // 발표 상태 확인 - "평가" 또는 "QnA" 상태인 경우 확인 메시지
    const alreadyProcessedStatuses = ["평가", "QnA", "완료"]
    if (alreadyProcessedStatuses.includes(presenterInfo?.status || "")) {
      const confirmed = window.confirm(
        `이미 처리된 발표입니다 (상태: ${presenterInfo?.status}).\n이어서 들으시겠습니까?`
      )
      if (!confirmed) {
        return
      }
    }
    
    const newPresentationId = presenterInfo?.presentation_id || `${presenterInfo?.presenter?.name}_${Date.now()}`
    console.log("새로운 presentationId:", newPresentationId)
    setCurrentPresentationId(newPresentationId)
    setIsPresentationStarted(true)
  }

  const handleEndPresentation = () => {
    // STT 녹음 중지
    if (isRecording) {
      stopRecording()
    }
    setIsPresentationStarted(false)
    setPhase("completion")
  }

  return (
    <div 
      className="min-h-screen p-4 md:p-6 relative overflow-x-hidden flex flex-col"
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

      <div className="max-w-[1400px] mx-auto w-full space-y-6 relative z-10 flex-1 flex flex-col">
        {phase !== "monitoring" && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start justify-between border-b border-white/10 pb-4"
          >
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#E61E2A] rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">SK</span>
                </div>
                <div className="border-l border-white/20 pl-3">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">SK Group</p>
                  <p className="text-sm font-semibold text-white">CEO 세미나</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <h1 className="text-xl md:text-2xl font-semibold text-balance mb-1 text-white">{presenterInfo.topic}</h1>
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
              className="fixed inset-0 z-50 flex flex-col items-center justify-center"
              style={{ background: "linear-gradient(to bottom, #0a1628, #0f1f3a, #0a1628)" }}
            >
              {/* Animated grid pattern */}
              <div className="absolute inset-0 pointer-events-none opacity-20">
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
                className="absolute inset-0 pointer-events-none"
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
                  key={`monitoring-particle-${i}`}
                  className="absolute w-1 h-1 bg-cyan-400 rounded-full pointer-events-none"
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
              <div className="absolute inset-0 pointer-events-none opacity-5">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="hexagons-monitoring" width="50" height="43.4" patternUnits="userSpaceOnUse">
                      <polygon
                        points="24.8,22 37.3,29.2 37.3,43.7 24.8,50.9 12.3,43.7 12.3,29.2"
                        fill="none"
                        stroke="rgba(59, 130, 246, 0.5)"
                        strokeWidth="0.5"
                      />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#hexagons-monitoring)" />
                </svg>
              </div>

              {/* Blue glowing orbs */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px]" />
              </div>

              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-8 left-0 right-0 flex justify-center px-4 z-10"
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button 
                      className="backdrop-blur-md px-6 py-3 rounded-full border transition-all duration-200"
                      style={{
                        background: "rgba(10, 20, 40, 0.95)",
                        borderColor: "rgba(59, 130, 246, 0.4)",
                        boxShadow: "0 0 20px rgba(59, 130, 246, 0.2)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "rgba(34, 211, 238, 0.6)"
                        e.currentTarget.style.boxShadow = "0 0 30px rgba(34, 211, 238, 0.3)"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.4)"
                        e.currentTarget.style.boxShadow = "0 0 20px rgba(59, 130, 246, 0.2)"
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {isPresentationStarted ? (
                            <>
                              <div className="w-2 h-2 bg-[#E61E2A] rounded-full animate-pulse" />
                              <span className="text-white font-semibold text-sm">발표 진행 중</span>
                            </>
                          ) : (
                            <>
                              <div className="w-2 h-2 bg-gray-400 rounded-full" />
                              <span className="text-gray-400 font-semibold text-sm">발표 대기 중</span>
                            </>
                          )}
                        </div>
                        <div className="w-px h-4 bg-white/20" />
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            selectedSessionType === "세션1" 
                              ? "bg-[#E61E2A]/30 text-[#E61E2A]" 
                              : "bg-cyan-500/30 text-cyan-400"
                          }`}>
                            {selectedSessionType}
                          </span>
                          <span className="text-gray-400 text-sm">·</span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              presenterInfo?.status === "대기" 
                                ? "border-green-500/50 text-green-400 bg-green-500/10" 
                                : presenterInfo?.status === "진행중"
                                ? "border-yellow-500/50 text-yellow-400 bg-yellow-500/10"
                                : presenterInfo?.status === "평가"
                                ? "border-blue-500/50 text-blue-400 bg-blue-500/10"
                                : presenterInfo?.status === "QnA"
                                ? "border-purple-500/50 text-purple-400 bg-purple-500/10"
                                : "border-gray-500/50 text-gray-400 bg-gray-500/10"
                            }`}
                          >
                            {presenterInfo?.status || "상태 불명"}
                          </Badge>
                          <span className="text-gray-400 text-sm">·</span>
                          <span className="text-white text-sm font-medium">
                            {presenterInfo?.presenter?.name || "발표자 없음"} ({presenterInfo?.presenter?.company || ""})
                          </span>
                          <span className="text-gray-400 text-sm">·</span>
                          <span className="text-gray-300 text-sm">{presenterInfo?.topic || "제목 없음"}</span>
                        </div>
                        <ChevronDown className="w-4 h-4 text-gray-400 ml-2" />
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    className="w-96 backdrop-blur-md border max-h-[500px] overflow-y-auto"
                    style={{
                      background: "rgba(10, 20, 40, 0.98)",
                      borderColor: "rgba(59, 130, 246, 0.3)",
                      boxShadow: "0 0 40px rgba(59, 130, 246, 0.3)",
                    }}
                  >
                    <DropdownMenuLabel 
                      className="font-bold text-base"
                      style={{ color: "rgba(34, 211, 238, 0.9)" }}
                    >
                      세션 선택
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator style={{ background: "rgba(59, 130, 246, 0.3)" }} />
                    
                    {/* 세션 선택 버튼 */}
                    <div className="flex gap-2 p-2">
                      <button
                        onClick={() => {
                          if (!isPresentationStarted) {
                            setSelectedSessionType("세션1")
                          }
                        }}
                        disabled={isPresentationStarted}
                        className={`flex-1 px-4 py-2 rounded-lg font-semibold text-sm transition-all border ${
                          selectedSessionType === "세션1"
                            ? "bg-[#E61E2A]/20 text-[#E61E2A] border-[#E61E2A]/50"
                            : "bg-slate-800/50 text-gray-300 border-slate-700/50 hover:bg-slate-700/50 hover:border-cyan-500/30"
                        } ${isPresentationStarted ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                        style={selectedSessionType === "세션1" ? { boxShadow: "0 0 20px rgba(230, 30, 42, 0.3)" } : {}}
                      >
                        세션1
                      </button>
                      <button
                        onClick={() => {
                          if (!isPresentationStarted) {
                            setSelectedSessionType("세션2")
                          }
                        }}
                        disabled={isPresentationStarted}
                        className={`flex-1 px-4 py-2 rounded-lg font-semibold text-sm transition-all border ${
                          selectedSessionType === "세션2"
                            ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/50"
                            : "bg-slate-800/50 text-gray-300 border-slate-700/50 hover:bg-slate-700/50 hover:border-cyan-500/30"
                        } ${isPresentationStarted ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                        style={selectedSessionType === "세션2" ? { boxShadow: "0 0 20px rgba(34, 211, 238, 0.3)" } : {}}
                      >
                        세션2
                      </button>
                    </div>
                    
                    <DropdownMenuSeparator style={{ background: "rgba(59, 130, 246, 0.3)" }} />
                    <DropdownMenuLabel 
                      className="font-bold text-base"
                      style={{ color: "rgba(34, 211, 238, 0.9)" }}
                    >
                      발표자 선택
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator style={{ background: "rgba(59, 130, 246, 0.3)" }} />
                    
                    {isLoadingPresenters ? (
                      <div className="flex items-center justify-center py-8 gap-2">
                        <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                        <span className="text-gray-400 text-sm">발표자 목록 로딩 중...</span>
                      </div>
                    ) : presentersError ? (
                      <div className="p-4 text-center">
                        <p className="text-red-400 text-sm mb-2">⚠️ {presentersError}</p>
                        <Button
                          size="sm"
                          onClick={() => window.location.reload()}
                          className="text-white border"
                          style={{
                            background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                            borderColor: "rgba(59, 130, 246, 0.5)",
                            boxShadow: "0 0 20px rgba(59, 130, 246, 0.4)",
                          }}
                        >
                          다시 시도
                        </Button>
                      </div>
                    ) : presenters.length === 0 ? (
                      <div className="p-4 text-center text-gray-400 text-sm">
                        발표자가 없습니다.
                      </div>
                    ) : (
                      presenters.map((presentation) => {
                        const canSelect = !isPresentationStarted
                        const isProcessed = ["평가", "QnA", "완료"].includes(presentation.status || "")
                        
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
                                ? "bg-cyan-500/20 text-white border-l-2 border-cyan-400"
                                : "text-gray-300 hover:bg-cyan-500/10 hover:text-white"
                            }`}
                            style={selectedPresenterId === presentation.presentation_id ? {
                              boxShadow: "0 0 15px rgba(34, 211, 238, 0.2)"
                            } : {}}
                          >
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-2">
                                {selectedPresenterId === presentation.presentation_id && (
                                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                                )}
                                <span className="font-semibold text-sm">{presentation.presenter?.name || "발표자 미정"}</span>
                                <span className="text-xs text-gray-400">({presentation.presenter?.company || "소속 미정"})</span>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${
                                    presentation.status === "대기" 
                                      ? "border-green-500/50 text-green-400 bg-green-500/10" 
                                      : presentation.status === "진행중"
                                      ? "border-yellow-500/50 text-yellow-400 bg-yellow-500/10"
                                      : presentation.status === "평가"
                                      ? "border-blue-500/50 text-blue-400 bg-blue-500/10"
                                      : presentation.status === "QnA"
                                      ? "border-purple-500/50 text-purple-400 bg-purple-500/10"
                                      : "border-gray-500/50 text-gray-400 bg-gray-500/10"
                                  }`}
                                >
                                  {presentation.status}
                                </Badge>
                              </div>
                            </div>
                            <span className="text-xs text-gray-400 pl-6">{presentation.topic}</span>
                            {isProcessed && (
                              <span className="text-xs text-cyan-400 pl-6">💡 이미 처리된 발표 (재시작 가능)</span>
                            )}
                          </DropdownMenuItem>
                        )
                      })
                    )}
                    
                    <DropdownMenuSeparator style={{ background: "rgba(59, 130, 246, 0.3)", marginTop: "0.5rem", marginBottom: "0.5rem" }} />
                    <DropdownMenuLabel className="text-xs" style={{ color: "rgba(34, 211, 238, 0.7)" }}>
                      {isPresentationStarted 
                        ? "⚠️ 발표 진행 중에는 발표자를 변경할 수 없습니다" 
                        : "💡 모든 상태의 발표를 선택할 수 있습니다. 이미 처리된 발표는 이어서 녹음됩니다."}
                    </DropdownMenuLabel>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>

              <div className="relative flex items-center justify-center">
                {isPresentationStarted && (
                  <>
                    <motion.div
                      className="absolute w-[400px] h-[400px] rounded-full border-2"
                      style={{ borderColor: "rgba(34, 211, 238, 0.3)" }}
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
                      className="absolute w-[350px] h-[350px] rounded-full border-2"
                      style={{ borderColor: "rgba(59, 130, 246, 0.4)" }}
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
                      className="absolute w-[300px] h-[300px] rounded-full"
                      style={{ background: "rgba(34, 211, 238, 0.15)" }}
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
                  className="relative z-10 w-[200px] h-[200px] rounded-full flex items-center justify-center"
                  style={isPresentationStarted ? {
                    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                    boxShadow: "0 0 60px rgba(59, 130, 246, 0.6), 0 0 100px rgba(34, 211, 238, 0.4)",
                  } : {
                    background: "linear-gradient(135deg, #1e3a5f, #0f2744)",
                    border: "2px solid rgba(59, 130, 246, 0.4)",
                    boxShadow: "0 0 40px rgba(59, 130, 246, 0.3), inset 0 0 30px rgba(34, 211, 238, 0.1)",
                  }}
                >
                  <Mic 
                    className={`w-24 h-24 ${isPresentationStarted ? 'text-white' : 'text-cyan-300'}`} 
                    strokeWidth={2} 
                  />
                  {!isPresentationStarted && (
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{
                        border: "2px solid rgba(34, 211, 238, 0.3)",
                      }}
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.5, 0.2, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                      }}
                    />
                  )}
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
                        className="w-1.5 rounded-full"
                        style={isPresentationStarted ? {
                          background: i % 2 === 0 
                            ? "linear-gradient(to top, #3b82f6, #22d3ee)" 
                            : "linear-gradient(to top, #2563eb, #06b6d4)",
                          boxShadow: "0 0 10px rgba(34, 211, 238, 0.5)",
                        } : {
                          background: "linear-gradient(to top, #334155, #475569)",
                          boxShadow: "0 0 5px rgba(59, 130, 246, 0.2)",
                        }}
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

                {/* 실시간 STT 결과 표시 */}
                <Card 
                  className="w-full max-w-4xl backdrop-blur-md border p-6"
                  style={{
                    background: "rgba(10, 20, 40, 0.95)",
                    borderColor: "rgba(59, 130, 246, 0.3)",
                    boxShadow: "0 0 30px rgba(59, 130, 246, 0.2)",
                  }}
                >
                  <div className="space-y-3">
                    {/* 상태 표시 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {!isPresentationStarted ? (
                            <>
                              <MicOff className="w-5 h-5 text-gray-400" />
                              <Badge variant="outline" className="border-gray-500 text-gray-400">
                                발표 시작 대기
                              </Badge>
                            </>
                          ) : isRecording ? (
                            <>
                              <Volume2 className="w-5 h-5 text-cyan-400 animate-pulse" />
                              <Badge variant="outline" className="border-cyan-500/50 text-cyan-400">
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
                          <Badge variant="outline" className="border-cyan-500/50 text-cyan-400">
                            STT 연결됨
                          </Badge>
                        )}
                        {confidence > 0 && (
                          <Badge variant="outline" className="border-blue-500/50 text-blue-400">
                            신뢰도: {(confidence * 100).toFixed(0)}%
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* 에러 메시지 */}
                    {sttError && (
                      <div 
                        className="p-3 rounded-lg border"
                        style={{
                          background: "rgba(239, 68, 68, 0.1)",
                          borderColor: "rgba(239, 68, 68, 0.3)",
                          boxShadow: "0 0 15px rgba(239, 68, 68, 0.2)",
                        }}
                      >
                        <p className="text-red-400 text-sm">{sttError}</p>
                      </div>
                    )}

                    {/* 트랜스크립트 표시 */}
                    <div 
                      className="min-h-[120px] max-h-[200px] overflow-y-auto p-4 rounded-lg border"
                      style={{
                        background: "rgba(10, 20, 40, 0.6)",
                        borderColor: "rgba(59, 130, 246, 0.2)",
                      }}
                    >
                      {!isPresentationStarted ? (
                        <p className="text-gray-500 text-sm italic">발표를 시작하면 음성 인식 결과가 여기에 표시됩니다...</p>
                      ) : transcript ? (
                        <p className="text-white text-base leading-relaxed whitespace-pre-wrap">{transcript}</p>
                      ) : (
                        <p className="text-gray-500 text-sm italic">음성 인식 결과가 여기에 표시됩니다...</p>
                      )}
                    </div>
                  </div>
                </Card>
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
                    className="px-6 py-3 text-lg font-semibold rounded-lg gap-2 border transition-all text-white"
                    style={{
                      background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                      borderColor: "rgba(59, 130, 246, 0.5)",
                      boxShadow: "0 0 30px rgba(59, 130, 246, 0.5)",
                    }}
                  >
                    <Mic className="w-5 h-5" />
                    {["평가", "QnA", "완료"].includes(presenterInfo?.status || "")
                      ? "발표 이어서 듣기"
                      : presenterInfo?.status === "진행중"
                      ? "발표 재개"
                      : "발표 시작"
                    }
                  </Button>
                ) : (
                  <Button
                    onClick={handleEndPresentation}
                    variant="outline"
                    className="backdrop-blur-md gap-2 border text-red-400 transition-all"
                    style={{
                      background: "rgba(10, 20, 40, 0.95)",
                      borderColor: "rgba(239, 68, 68, 0.5)",
                      boxShadow: "0 0 20px rgba(239, 68, 68, 0.3)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"
                      e.currentTarget.style.boxShadow = "0 0 30px rgba(239, 68, 68, 0.4)"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(10, 20, 40, 0.95)"
                      e.currentTarget.style.boxShadow = "0 0 20px rgba(239, 68, 68, 0.3)"
                    }}
                  >
                    <MicOff className="w-4 h-4" />
                    발표 종료
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
                  <CheckCircle2 className="w-32 h-32 text-cyan-400 mx-auto" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-4"
                >
                  <h2 className="text-4xl font-bold" style={{ color: "rgba(34, 211, 238, 0.95)" }}>
                    발표가 종료되었습니다
                  </h2>
                  <p className="text-xl" style={{ color: "rgba(148, 163, 184, 0.8)" }}>
                    다음 발표를 준비합니다.
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-4">
                    <div
                      className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
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
            className="flex items-center justify-between pt-3"
            style={{ borderTop: "1px solid rgba(59, 130, 246, 0.2)" }}
          >
            <p className="text-xs" style={{ color: "rgba(34, 211, 238, 0.6)" }}>
              © 2025 SK Group. All rights reserved.
            </p>
            <Link href="/">
              <Button
                size="sm"
                variant="ghost"
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
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default function SinglePresenterView() {
  return (
    <Suspense fallback={
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(to bottom, #0a1628, #0f1f3a, #0a1628)" }}
      >
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
          <span className="text-white text-lg">로딩 중...</span>
        </div>
      </div>
    }>
      <SinglePresenterViewContent />
    </Suspense>
  )
}
