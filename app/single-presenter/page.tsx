"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Home, List, CheckCircle2, Mic, Sparkles, MicOff, Volume2 } from "lucide-react"
import Link from "next/link"
import { QuestionCard } from "@/components/question-card"
import { useSTT } from "@/hooks/use-stt"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const questions = [
  {
    id: 1,
    keyword: "AI 비즈니스 핵심 요소",
    question: "SK그룹의 AI 비즈니스 모델에서 가장 중요한 핵심 요소는 무엇인가요?",
    duration: "약 2분",
    answered: false,
  },
  {
    id: 2,
    keyword: "그룹 시너지 창출",
    question: "AI 기술을 활용한 그룹 시너지 창출 방안에 대해 구체적으로 설명해주세요.",
    duration: "약 3분",
    answered: false,
  },
  {
    id: 3,
    keyword: "AI 도입 리스크 관리",
    question: "AI 도입 시 예상되는 리스크와 대응 전략은 무엇인가요?",
    duration: "약 2분 30초",
    answered: false,
  },
  {
    id: 4,
    keyword: "계열사 협업 모델",
    question: "타 계열사와의 AI 협업 모델은 어떻게 구축할 계획인가요?",
    duration: "약 2분",
    answered: false,
  },
  {
    id: 5,
    keyword: "수익성 확보 시점",
    question: "AI 비즈니스 모델의 수익성 확보 시점은 언제로 예상하시나요?",
    duration: "약 1분 30초",
    answered: false,
  },
  {
    id: 6,
    keyword: "글로벌 경쟁력 확보",
    question: "글로벌 AI 기업들과의 경쟁력 확보 방안은 무엇인가요?",
    duration: "약 3분",
    answered: false,
  },
]

export default function SinglePresenterView() {
  const [phase, setPhase] = useState<"monitoring" | "completion" | "qna">("monitoring")
  const [view, setView] = useState<"list" | "player">("list")
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null)
  const [liveScores, setLiveScores] = useState({
    content: 0,
    delivery: 0,
    engagement: 0,
    overall: 0,
  })
  const [presentationTime, setPresentationTime] = useState(0)

  const presenterInfo = {
    name: "윤풍영", // Corrected presenter name from 윤홍영 to 윤풍영
    company: "SK AX",
    topic: "AI Biz.Model 구축 방향",
  }

  // STT Hook 사용 - 발표 시작 시 한 번만 생성
  // presentationId는 PRESENTATION 테이블의 PK와 일치해야 함
  const presentationId = useMemo(() => `${presenterInfo.name}_${Date.now()}`, [presenterInfo.name])
  const {
    isRecording,
    isConnected,
    transcript,
    confidence,
    error: sttError,
    startRecording,
    stopRecording,
    clearTranscript,
  } = useSTT(presentationId)

  // monitoring 단계에서 타이머 및 녹음 시작
  useEffect(() => {
    if (phase === "monitoring") {
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

      // STT 녹음 시작
      if (!isRecording) {
        startRecording()
      }

      return () => {
        clearInterval(interval)
      }
    } else if (phase === "completion" && isRecording) {
      // 발표 완료 시 녹음 중지
      stopRecording()
    }
  }, [phase, isRecording, startRecording, stopRecording])

  // useEffect(() => {
  //   if (phase === "monitoring" && presentationTime >= 10) {
  //     setPhase("completion")
  //   }
  // }, [presentationTime, phase])

  useEffect(() => {
    if (phase === "completion") {
      const timer = setTimeout(() => {
        setPhase("qna")
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [phase])

  const handleQuestionSelect = (questionId: number) => {
    setSelectedQuestion(questionId)
    setView("player")
  }

  const handleBackToList = () => {
    setView("list")
    setSelectedQuestion(null)
  }

  const currentQuestion = selectedQuestion ? questions[selectedQuestion - 1] : null

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
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
                <div className="bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#E61E2A] rounded-full animate-pulse" />
                      <span className="text-white font-semibold text-sm">발표 진행 중</span>
                    </div>
                    <div className="w-px h-4 bg-white/20" />
                    <span className="text-gray-400 text-sm">{formatTime(presentationTime)}</span>
                    <div className="w-px h-4 bg-white/20" />
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm font-medium">
                        {presenterInfo.name} ({presenterInfo.company})
                      </span>
                      <span className="text-gray-400 text-sm">·</span>
                      <span className="text-gray-300 text-sm">{presenterInfo.topic}</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              <div className="relative flex items-center justify-center">
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

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.8 }}
                  className="relative z-10 w-[200px] h-[200px] rounded-full bg-gradient-to-br from-[#E61E2A] to-[#c01820] flex items-center justify-center shadow-2xl"
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
                        className="w-1.5 bg-[#E61E2A] rounded-full"
                        animate={{
                          height: [Math.random() * 20 + 10, Math.random() * 50 + 20, Math.random() * 30 + 10],
                        }}
                        transition={{
                          duration: 0.5 + Math.random() * 0.5,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "easeInOut",
                          delay: i * 0.02,
                        }}
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
                          {isRecording ? (
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
                      {transcript ? (
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
                <Button
                  onClick={() => {
                    if (isRecording) {
                      stopRecording()
                    }
                  }}
                  variant="outline"
                  className="border-white/20 hover:bg-white/5 text-white bg-black/40 backdrop-blur-md gap-2"
                >
                  {isRecording ? (
                    <>
                      <MicOff className="w-4 h-4" />
                      녹음 중지
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4" />
                      녹음 시작
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setPhase("completion")
                  }}
                  variant="outline"
                  className="border-white/20 hover:bg-white/5 text-white bg-black/40 backdrop-blur-md"
                >
                  발표 종료 (테스트)
                </Button>
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
                  <h2 className="text-4xl font-bold text-white">첫번째 발표가 종료되었습니다</h2>
                  <p className="text-xl text-gray-400">AI가 발표 내용을 분석하여 Q&A를 준비하고 있습니다</p>
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

          {phase === "qna" && view === "list" && (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 space-y-8"
            >
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center space-y-4 relative"
              >
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                  <Sparkles className="w-32 h-32 text-[#E61E2A]" />
                </div>
                <div className="relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="h-px bg-gradient-to-r from-transparent via-[#E61E2A]/50 to-transparent mb-6"
                  />
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 text-balance">발표 내용 기반 Q&A</h2>

                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="h-px bg-gradient-to-r from-transparent via-[#E61E2A]/50 to-transparent mt-6"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto"
              >
                {questions.map((question, index) => (
                  <QuestionCard key={question.id} question={question} index={index} onSelect={handleQuestionSelect} />
                ))}
              </motion.div>
            </motion.div>
          )}

          {phase === "qna" && view === "player" && (
            <motion.div
              key="player"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col items-center justify-center space-y-8"
            >
              <div className="w-full max-w-4xl text-center space-y-3 px-4">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#E61E2A] flex items-center justify-center text-white font-bold text-lg">
                    Q{selectedQuestion}
                  </div>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white leading-relaxed">
                  {currentQuestion?.question}
                </h2>
              </div>

              <div className="flex flex-col items-center justify-center space-y-8 py-12">
                <div className="relative flex items-center justify-center">
                  <motion.div
                    className="absolute w-[280px] h-[280px] rounded-full border-2 border-[#E61E2A]/30"
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
                    className="absolute w-[240px] h-[240px] rounded-full border-2 border-[#E61E2A]/40"
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
                    className="absolute w-[200px] h-[200px] rounded-full bg-[#E61E2A]/10"
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

                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.6 }}
                    className="relative z-10 w-[140px] h-[140px] rounded-full bg-gradient-to-br from-[#E61E2A] to-[#c01820] flex items-center justify-center shadow-2xl"
                  >
                    <Mic className="w-16 h-16 text-white" strokeWidth={2} />
                  </motion.div>
                </div>

                <div className="w-full max-w-md px-4">
                  <div className="flex items-center justify-center gap-1 h-12">
                    {Array.from({ length: 50 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 bg-[#E61E2A] rounded-full"
                        animate={{
                          height: [Math.random() * 15 + 8, Math.random() * 40 + 15, Math.random() * 25 + 8],
                        }}
                        transition={{
                          duration: 0.5 + Math.random() * 0.5,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "easeInOut",
                          delay: i * 0.02,
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="text-center space-y-2"></div>
              </div>

              <Button
                onClick={handleBackToList}
                variant="outline"
                className="gap-2 border-white/20 hover:bg-white/5 text-white bg-transparent px-8"
              >
                <List className="w-4 h-4" />
                목록으로
              </Button>
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
