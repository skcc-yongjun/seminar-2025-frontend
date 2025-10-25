"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Home, CheckCircle2, Mic, MicOff, Volume2, ChevronDown } from "lucide-react"
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


export default function SinglePresenterView() {
  const [phase, setPhase] = useState<"waiting" | "monitoring" | "completion">("monitoring")
  const [isPresentationStarted, setIsPresentationStarted] = useState(false)
  const [liveScores, setLiveScores] = useState({
    content: 0,
    delivery: 0,
    engagement: 0,
    overall: 0,
  })
  const [presentationTime, setPresentationTime] = useState(0)

  // 발표자 목록
  const presenters = [
    {
      id: 1,
      name: "윤풍영",
      company: "SK AX",
      topic: "AI Biz.Model 구축 방향",
    },
    {
      id: 2,
      name: "김민수",
      company: "SK Telecom",
      topic: "5G 네트워크 혁신 전략",
    },
    {
      id: 3,
      name: "박지은",
      company: "SK Hynix",
      topic: "반도체 기술 로드맵",
    },
    {
      id: 4,
      name: "이준호",
      company: "SK Energy",
      topic: "친환경 에너지 전환",
    },
    {
      id: 5,
      name: "최서연",
      company: "SK Innovation",
      topic: "배터리 기술 혁신",
    },
  ]

  const [selectedPresenterId, setSelectedPresenterId] = useState<number>(1)
  const presenterInfo = presenters.find(p => p.id === selectedPresenterId) || presenters[0]

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

  const handleStartPresentation = () => {
    console.log("발표 시작 버튼 클릭")
    const newPresentationId = `${presenterInfo.name}_${Date.now()}`
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
    <div className="min-h-screen p-4 md:p-6 relative overflow-x-hidden flex flex-col bg-[#1a1a1a]">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#E61E2A]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#E61E2A]/3 rounded-full blur-3xl" />
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
                          <span className="text-white text-sm font-medium">
                            {presenterInfo.name} ({presenterInfo.company})
                          </span>
                          <span className="text-gray-400 text-sm">·</span>
                          <span className="text-gray-300 text-sm">{presenterInfo.topic}</span>
                        </div>
                        <ChevronDown className="w-4 h-4 text-gray-400 ml-2" />
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-96 bg-black/90 backdrop-blur-md border-white/10 max-h-[500px] overflow-y-auto">
                    <DropdownMenuLabel className="text-white font-bold text-base">발표자 선택</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/10" />
                    {presenters.map((presenter) => (
                      <DropdownMenuItem
                        key={presenter.id}
                        onClick={() => {
                          if (!isPresentationStarted) {
                            setSelectedPresenterId(presenter.id)
                          }
                        }}
                        disabled={isPresentationStarted}
                        className={`flex flex-col items-start gap-2 p-3 cursor-pointer ${
                          selectedPresenterId === presenter.id
                            ? "bg-[#E61E2A]/20 text-white border-l-2 border-[#E61E2A]"
                            : "text-gray-300 hover:bg-white/10 hover:text-white"
                        } ${isPresentationStarted ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            {selectedPresenterId === presenter.id && (
                              <CheckCircle2 className="w-4 h-4 text-[#E61E2A]" />
                            )}
                            <span className="font-semibold text-sm">{presenter.name}</span>
                            <span className="text-xs text-gray-400">({presenter.company})</span>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400 pl-6">{presenter.topic}</span>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator className="bg-white/10 my-2" />
                    <DropdownMenuLabel className="text-white text-xs text-gray-400">
                      {isPresentationStarted 
                        ? "⚠️ 발표 진행 중에는 발표자를 변경할 수 없습니다" 
                        : "💡 발표자를 선택하세요"}
                    </DropdownMenuLabel>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>

              <div className="relative flex items-center justify-center">
                {isPresentationStarted && (
                  <>
                    <motion.div
                      className="absolute w-[400px] h-[400px] rounded-full border-2 border-[#E61E2A]/30"
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
                      className="absolute w-[350px] h-[350px] rounded-full border-2 border-[#E61E2A]/40"
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
                      className="absolute w-[300px] h-[300px] rounded-full bg-[#E61E2A]/10"
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
                      ? "bg-gradient-to-br from-[#E61E2A] to-[#c01820]" 
                      : "bg-gray-600"
                  }`}
                >
                  <Mic className="w-24 h-24 text-white" strokeWidth={2} />
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
                          isPresentationStarted ? "bg-[#E61E2A]" : "bg-gray-500"
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

                {/* 실시간 STT 결과 표시 */}
                <Card className="w-full max-w-4xl bg-black/60 backdrop-blur-md border border-white/10 p-6">
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
                              <Volume2 className="w-5 h-5 text-[#E61E2A] animate-pulse" />
                              <Badge variant="outline" className="border-[#E61E2A]/50 text-[#E61E2A]">
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
                        {confidence > 0 && (
                          <Badge variant="outline" className="border-blue-500/50 text-blue-400">
                            신뢰도: {(confidence * 100).toFixed(0)}%
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* 에러 메시지 */}
                    {sttError && (
                      <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <p className="text-red-400 text-sm">{sttError}</p>
                      </div>
                    )}

                    {/* 트랜스크립트 표시 */}
                    <div className="min-h-[120px] max-h-[200px] overflow-y-auto p-4 bg-black/40 rounded-lg border border-white/5">
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
                    className="bg-[#E61E2A] hover:bg-[#c01820] text-white px-6 py-3 text-lg font-semibold rounded-lg shadow-lg gap-2"
                  >
                    <Mic className="w-5 h-5" />
                    발표 시작
                  </Button>
                ) : (
                  <Button
                    onClick={handleEndPresentation}
                    variant="outline"
                    className="border-red-500/50 hover:bg-red-500/10 text-red-400 bg-black/40 backdrop-blur-md gap-2"
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
                  <CheckCircle2 className="w-32 h-32 text-[#E61E2A] mx-auto" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-4"
                >
                  <h2 className="text-4xl font-bold text-white">발표가 종료되었습니다</h2>
                  <p className="text-xl text-gray-400">다음 발표를 준비합니다.</p>
                  <div className="flex items-center justify-center gap-2 pt-4">
                    <div
                      className="w-2 h-2 bg-[#E61E2A] rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-[#E61E2A] rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-[#E61E2A] rounded-full animate-bounce"
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
