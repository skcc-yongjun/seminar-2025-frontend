"use client"

/**
 * Live Q&A Operation 페이지
 *
 * 실시간 플로어 Q&A를 운영하는 관리자 페이지입니다.
 * 패널토의 페이지와 유사한 구조를 가집니다.
 *
 * 기능:
 * - 현재 세션 상태 실시간 모니터링 (1초 폴링)
 * - 우측 하단 "질의 시작"/"STT 종료" 버튼
 * - 좌측 하단 실시간 STT 트랜스크립트 표시
 * - STT 종료 시 전체 텍스트 DB 저장
 */

import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Home, Brain, Mic, MicOff, Volume2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { useState, useEffect } from "react"
import {
  getLiveQAStatus,
  stopRecording,
  startLiveQASession,
  type LiveQASessionState,
  type LiveQAStatus,
} from "@/lib/api"
import { useSTT } from "@/hooks/use-stt"
import { useToast } from "@/hooks/use-toast"

export default function LiveQAOperationPage() {
  const [sessionState, setSessionState] = useState<LiveQASessionState | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSTTStarted, setIsSTTStarted] = useState(false)
  const { toast } = useToast()

  // STT Hook 사용 (sessionId를 presentationId처럼 사용)
  const {
    isRecording,
    isConnected,
    transcript,
    confidence,
    startRecording: startSTTRecording,
    stopRecording: stopSTTRecording,
    clearTranscript,
  } = useSTT(sessionState?.session_id || "")

  // 1초마다 세션 상태 폴링
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await getLiveQAStatus()
        setSessionState(data)
        setError(null)

        // recording 상태가 아니면 STT 중지
        if (data.status !== 'recording' && isSTTStarted) {
          setIsSTTStarted(false)
          if (isRecording) {
            stopSTTRecording()
          }
        }
      } catch (err) {
        // 활성 세션이 없는 것은 정상 상태
        if (err instanceof Error && err.message.includes('활성 세션이 없습니다')) {
          setSessionState(null)
          setError(null)
          setIsSTTStarted(false)
        } else {
          console.error('❌ [OPERATION] 상태 조회 실패:', err)
          setError(err instanceof Error ? err.message : '상태 조회 실패')
        }
      }
    }

    fetchStatus()
    const interval = setInterval(fetchStatus, 1000)

    return () => clearInterval(interval)
  }, [isSTTStarted, isRecording, stopSTTRecording])

  // "새 세션 시작" 버튼 클릭
  const handleStartNewSession = async () => {
    try {
      console.log('🎬 [OPERATION] 새 세션 시작')
      const session = await startLiveQASession()
      console.log('✅ [OPERATION] 세션 생성 완료:', session.session_id)

      toast({
        title: "세션 시작",
        description: `세션이 생성되었습니다. (${session.session_id.substring(0, 16)}...)`,
      })
    } catch (err) {
      console.error('❌ [OPERATION] 세션 시작 실패:', err)
      toast({
        title: "오류",
        description: err instanceof Error ? err.message : '세션 시작 실패',
        variant: "destructive",
      })
    }
  }

  // "질의 시작" 버튼 클릭
  const handleStartSTT = async () => {
    if (!sessionState) {
      toast({
        title: "오류",
        description: "활성 세션이 없습니다. 사용자가 Brain 아이콘을 클릭하여 세션을 시작해주세요.",
        variant: "destructive",
      })
      return
    }

    if (sessionState.status !== 'intro') {
      toast({
        title: "오류",
        description: `intro 상태에서만 시작할 수 있습니다. 현재 상태: ${sessionState.status}`,
        variant: "destructive",
      })
      return
    }

    try {
      console.log('🎙️ [OPERATION] 질의 시작:', sessionState.session_id)

      // STT WebSocket 시작
      await startSTTRecording()
      setIsSTTStarted(true)

      toast({
        title: "질의 시작",
        description: "STT 녹음이 시작되었습니다.",
      })
    } catch (err) {
      console.error('❌ [OPERATION] 질의 시작 실패:', err)
      toast({
        title: "오류",
        description: err instanceof Error ? err.message : '질의 시작 실패',
        variant: "destructive",
      })
    }
  }

  // "STT 종료" 버튼 클릭
  const handleStopSTT = async () => {
    if (!sessionState) return

    if (!transcript || !transcript.trim()) {
      toast({
        title: "경고",
        description: "질문 텍스트가 비어있습니다.",
        variant: "destructive",
      })
      return
    }

    try {
      console.log('⏹️ [OPERATION] STT 종료:', sessionState.session_id)
      console.log('📝 [OPERATION] 질문 텍스트:', transcript)

      // STT WebSocket 중지
      stopSTTRecording()

      // DB에 저장 (stopRecording API 호출)
      await stopRecording(sessionState.session_id, transcript)

      toast({
        title: "STT 종료",
        description: "질문이 저장되고 답변 생성이 시작되었습니다.",
      })

      setIsSTTStarted(false)
      clearTranscript()
    } catch (err) {
      console.error('❌ [OPERATION] STT 종료 실패:', err)
      toast({
        title: "오류",
        description: err instanceof Error ? err.message : 'STT 종료 실패',
        variant: "destructive",
      })
    }
  }

  // 상태 표시용 배지 색상
  const getStatusBadge = (status: LiveQAStatus) => {
    const statusConfig = {
      intro: { label: "도입 영상", color: "border-blue-500/50 text-blue-400 bg-blue-500/10" },
      recording: { label: "녹음 중", color: "border-red-500/50 text-red-400 bg-red-500/10" },
      generating: { label: "답변 생성 중", color: "border-yellow-500/50 text-yellow-400 bg-yellow-500/10" },
      playing: { label: "영상 재생 중", color: "border-green-500/50 text-green-400 bg-green-500/10" },
      completed: { label: "완료", color: "border-gray-500/50 text-gray-400 bg-gray-500/10" },
      error: { label: "오류", color: "border-red-600/50 text-red-400 bg-red-600/10" },
    }

    const config = statusConfig[status]
    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-6 relative overflow-x-hidden flex flex-col bg-[#1a1a1a]">
      {/* 배경 효과 */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/3 rounded-full blur-3xl" />
      </div>

      {/* 상단 헤더 */}
      <div className="relative z-10 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Live Q&A Operation</h1>
            <p className="text-gray-400 text-sm">실시간 플로어 질문 운영 관리</p>
          </div>
          <Link href="/">
            <Button variant="outline" className="gap-2 border-white/10 hover:bg-white/5">
              <Home className="w-4 h-4" />
              메인으로
            </Button>
          </Link>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <AnimatePresence mode="wait">
        {!sessionState ? (
          // 활성 세션 없음
          <motion.div
            key="no-session"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex items-center justify-center"
          >
            <Card className="bg-black/60 backdrop-blur-md border border-white/10 p-12 text-center max-w-md">
              <Brain className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-4">활성 세션 없음</h2>
              <p className="text-gray-400 mb-8">
                새로운 Live Q&A 세션을 시작하려면<br />
                아래 버튼을 클릭하세요.
              </p>
              <Button
                onClick={handleStartNewSession}
                className="px-8 py-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold text-lg rounded-xl shadow-lg"
              >
                <Brain className="w-6 h-6 mr-2" />
                새 세션 시작
              </Button>
            </Card>
          </motion.div>
        ) : (
          // 활성 세션 있음
          <motion.div
            key="active-session"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 relative"
          >
            {/* 상단 상태바 */}
            <div className="relative z-10 mb-6">
              <Card className="bg-black/60 backdrop-blur-md border border-white/10 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {sessionState.status === 'recording' ? (
                        <>
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                          <span className="text-white font-semibold text-sm">녹음 진행 중</span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-gray-400 rounded-full" />
                          <span className="text-gray-400 font-semibold text-sm">대기 중</span>
                        </>
                      )}
                    </div>
                    <div className="w-px h-4 bg-white/20" />
                    {getStatusBadge(sessionState.status)}
                    <div className="w-px h-4 bg-white/20" />
                    <span className="text-gray-300 text-sm font-mono">
                      {sessionState.session_id.substring(0, 16)}...
                    </span>
                  </div>
                  {sessionState.status === 'generating' && (
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${sessionState.generation_progress}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                      <span className="text-cyan-400 text-sm font-semibold">
                        {sessionState.generation_progress}%
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* 메인 컨텐츠 영역 */}
            <div className="relative z-10 flex items-center justify-center min-h-[500px]">
              <div className="w-full max-w-4xl">
                {/* STT 트랜스크립트 카드 (좌측 하단) */}
                <Card className="bg-black/60 backdrop-blur-md border border-white/10 p-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {!isSTTStarted ? (
                            <>
                              <MicOff className="w-5 h-5 text-gray-400" />
                              <Badge variant="outline" className="border-gray-500 text-gray-400">
                                질의 시작 대기
                              </Badge>
                            </>
                          ) : isRecording ? (
                            <>
                              <Volume2 className="w-5 h-5 text-cyan-500 animate-pulse" />
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
                      </div>
                      {isRecording && (
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <motion.div
                                key={i}
                                className="w-1 h-6 bg-cyan-500 rounded-full"
                                animate={{
                                  scaleY: [0.3, 1, 0.3],
                                }}
                                transition={{
                                  duration: 0.8,
                                  repeat: Infinity,
                                  delay: i * 0.1,
                                }}
                              />
                            ))}
                          </div>
                          <span className="text-cyan-400 text-sm font-medium">
                            {confidence > 0 ? `신뢰도: ${Math.round(confidence * 100)}%` : ''}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* 실시간 트랜스크립트 */}
                    <div className="min-h-[300px] max-h-[400px] overflow-y-auto bg-black/40 rounded-lg p-4 border border-white/5">
                      {!isSTTStarted ? (
                        <p className="text-gray-500 text-center py-8">
                          우측 하단의 "질의 시작" 버튼을 클릭하여 녹음을 시작하세요.
                        </p>
                      ) : !transcript ? (
                        <p className="text-gray-500 text-center py-8">
                          음성이 감지되기를 기다리는 중...
                        </p>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-white leading-relaxed whitespace-pre-wrap">
                            {transcript}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* 안내 메시지 */}
                    <div className="flex items-start gap-2 text-xs text-gray-400 bg-cyan-500/5 border border-cyan-500/10 rounded-lg p-3">
                      <span className="text-cyan-400 font-bold">💡</span>
                      <p>
                        실시간으로 Clova STT가 음성을 텍스트로 변환합니다.
                        사용자가 질문을 마치면 우측 하단의 "STT 종료" 버튼을 클릭하여 DB에 저장하세요.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* 우측 하단 버튼 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="absolute bottom-8 right-8 flex gap-3 z-20"
            >
              {!isSTTStarted ? (
                <Button
                  onClick={handleStartSTT}
                  disabled={sessionState.status !== 'intro'}
                  className={`px-6 py-3 text-lg font-semibold rounded-lg shadow-lg gap-2 ${
                    sessionState.status === 'intro'
                      ? "bg-cyan-600 hover:bg-cyan-700 text-white"
                      : "bg-gray-600 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <Mic className="w-5 h-5" />
                  질의 시작
                </Button>
              ) : (
                <Button
                  onClick={handleStopSTT}
                  variant="outline"
                  className="border-red-500/50 hover:bg-red-500/10 text-red-400 bg-black/40 backdrop-blur-md gap-2 px-6 py-3 text-lg font-semibold"
                >
                  <MicOff className="w-5 h-5" />
                  STT 종료
                </Button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 에러 표시 */}
      {error && (
        <div className="fixed bottom-8 left-8 max-w-md z-50">
          <Card className="bg-red-500/10 border border-red-500/20 p-4">
            <p className="text-red-400 text-sm">⚠️ {error}</p>
          </Card>
        </div>
      )}
    </div>
  )
}
