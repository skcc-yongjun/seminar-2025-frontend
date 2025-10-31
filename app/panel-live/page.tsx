"use client"

import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, Home, RefreshCw, AlertCircle } from "lucide-react"
import { useEffect, useState, useRef, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { fetchAICommentsAfterTimestamp, fetchPresentationsWithPresenters } from "@/lib/api"

function PanelLiveContent() {
  const searchParams = useSearchParams()
  const sessionParam = searchParams.get('session') || "패널토의"
  
  const [displayedText, setDisplayedText] = useState("")
  const [messages, setMessages] = useState<Array<{ id: number; text: string }>>([])
  const [messageId, setMessageId] = useState(0)
  const [isLiveActive, setIsLiveActive] = useState(false)
  const [currentPresentationId, setCurrentPresentationId] = useState<string>("")
  const [lastUpdate, setLastUpdate] = useState<string>("")
  const [lastTimestamp, setLastTimestamp] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const leftContainerRef = useRef<HTMLDivElement | null>(null)
  const rightPanelRef = useRef<HTMLDivElement | null>(null)
  const [rightPanelHeight, setRightPanelHeight] = useState<number>(0)

  // 패널 참가자 정보 (하드코딩)
  const participants = [
    {
      name: "박석중",
      title: "신한투자증권",
      image: "/panels/parkseokjung.png",
    },
    {
      name: "송승헌",
      title: "McKinsey Partner",
      image: "/panels/songseungheon.png",
    },
    {
      
      name: "박종훈",
      title: "Moderator",
      image: "/panels/parkjonghun.png",
    },
  ]

  // 클라이언트 사이드 렌더링 확인
  useEffect(() => {
    setIsClient(true)
  }, [])

  // 패널토의 프레젠테이션 ID 로드 (session_type이 "패널토의"인 presentation_id 사용)
  useEffect(() => {
    const loadPresentationId = async () => {
      try {
        const data = await fetchPresentationsWithPresenters("패널토의")
        if (data.length > 0) {
          setCurrentPresentationId(data[0].presentation_id)
          console.log("패널토의 presentation_id 로드됨:", data[0].presentation_id)
        } else {
          setError("패널토의 세션을 찾을 수 없습니다.")
        }
      } catch (err) {
        console.error("패널토의 프레젠테이션 ID 로드 실패:", err)
        setError("패널토의 정보를 불러올 수 없습니다.")
      }
    }
    loadPresentationId()
  }, [])

  // DB에서 AI Comments 폴링 (타임스탬프 기반)
  const pollData = async () => {
    if (!currentPresentationId) return
    
    try {
      setIsPolling(true)
      setError(null)
      
      // 타임스탬프 기반으로 AI Comments 조회
      const timestampToUse = lastTimestamp || 0
      
      const comments = await fetchAICommentsAfterTimestamp(
        currentPresentationId, 
        timestampToUse
      )
      
      if (comments.length > 0) {
        const latestComment = comments[comments.length - 1];
        
        // 중복 체크: 이미 표시된 메시지와 같은지 확인
        setMessages((prev) => {
          // 마지막 메시지와 같은 내용이면 추가하지 않음
          if (prev.length > 0 && prev[prev.length - 1].text === latestComment.comment_text) {
            console.log('🔄 [Polling] 중복 메시지 무시:', latestComment.comment_text.substring(0, 30) + '...');
            return prev;
          }
          
          // 새로운 메시지 추가
          console.log('✅ [Polling] 새 메시지 추가:', latestComment.comment_text.substring(0, 30) + '...');
          const newMsg = { id: messageId, text: latestComment.comment_text };
          const updated = [...prev, newMsg];
          return updated.slice(-3); // 최근 3개만 유지
        });
        
        setMessageId((prev) => prev + 1);
        setLastUpdate(new Date().toLocaleTimeString('ko-KR'));
        
        // 가장 최근 코멘트의 타임스탬프를 저장
        const timestampSeconds = Math.floor(new Date(latestComment.created_at).getTime() / 1000);
        setLastTimestamp(timestampSeconds);
      }
    } catch (err) {
      console.error("데이터 폴링 실패:", err)
      setError("데이터를 불러오는데 실패했습니다.")
    } finally {
      setIsPolling(false)
    }
  }

  // 오른쪽 라이브 패널 높이를 측정해 왼쪽 컨테이너에 반영
  useEffect(() => {
    const measure = () => {
      const h = rightPanelRef.current?.offsetHeight || 0
      setRightPanelHeight(h)
    }
    measure()
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [messages, isLiveActive, error])


  // 10초마다 DB 폴링
  useEffect(() => {
    if (!isLiveActive || !currentPresentationId) return

    // 즉시 한 번 실행
    pollData()

    // 10초마다 폴링
    const interval = setInterval(() => {
      pollData()
    }, 1000)

    return () => clearInterval(interval)
  }, [isLiveActive, currentPresentationId])


  const handleStartLive = () => {
    if (!currentPresentationId) {
      setError("패널토의 프레젠테이션을 찾을 수 없습니다.")
      return
    }
    setIsLiveActive(true)
  }

  const handleStopLive = () => {
    setIsLiveActive(false)
  }

  return (
    <div className="min-h-screen bg-[#0a1628] p-6 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      {/* Floating particles - 클라이언트에서만 렌더링 */}
      {isClient && [...Array(15)].map((_, i) => (
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

      {/* Blue glowing orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 mb-8 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>메인으로</span>
        </Link>

        <div className="flex items-center gap-3">
          {lastUpdate && (
            <Badge variant="outline" className="border-cyan-500/50 text-cyan-400">
              마지막 업데이트: {lastUpdate}
            </Badge>
          )}
          {isPolling && (
            <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
          )}
          {!isLiveActive ? (
            <Button
              onClick={handleStartLive}
              disabled={!currentPresentationId}
              className="px-6 py-3 text-lg font-semibold rounded-lg gap-2 border transition-all text-white"
              style={{
                background: "linear-gradient(135deg, #06b6d4, #0891b2)",
                borderColor: "rgba(6, 182, 212, 0.5)",
                boxShadow: "0 0 30px rgba(6, 182, 212, 0.5)",
              }}
            >
              <RefreshCw className="w-5 h-5" />
              라이브 시작
            </Button>
          ) : (
            <Button
              onClick={handleStopLive}
              variant="outline"
              className="backdrop-blur-md gap-2 border text-red-400 transition-all"
              style={{
                background: "rgba(10, 20, 40, 0.95)",
                borderColor: "rgba(239, 68, 68, 0.5)",
                boxShadow: "0 0 20px rgba(239, 68, 68, 0.3)",
              }}
            >
              <AlertCircle className="w-4 h-4" />
              라이브 종료
            </Button>
          )}
        </div>
      </div>

      <div className="relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-bold text-center text-cyan-400 mb-2"
        >
          2026 글로벌 매크로 & 산업 전망
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center text-cyan-400/70 text-2xl mb-8"
        >
          {sessionParam} - 실시간 라이브 모니터링
        </motion.p>
      </div>

      <div className="relative z-10 flex gap-8 max-w-screen-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-96 flex-shrink-0 mt-16 h-full flex flex-col justify-between"
          ref={leftContainerRef}
          style={{ height: rightPanelHeight ? `${rightPanelHeight}px` : undefined }}
        >
          {participants.map((participant, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className={`relative ${index === participants.length - 1 ? "mb-4 md:mb-6" : ""}`}
            >
              <div className="flex items-center gap-4">
                <div className="relative group flex-shrink-0">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full blur-sm opacity-20 group-hover:opacity-40 transition-opacity"
                    animate={{
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: index * 0.3,
                    }}
                  />
                  <div className="relative w-40 h-40 rounded-full border-[5px] border-cyan-500/50 overflow-hidden bg-slate-800">
                    <img
                      src={participant.image || "/placeholder.svg"}
                      alt={participant.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-5xl mb-1">{participant.name}</h3>
                  <p className="text-cyan-400/70 text-2xl">{participant.title}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="relative mt-12"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl blur-xl"
              animate={{
                opacity: [0.5, 0.8, 0.5],
                scale: [1, 1.02, 1],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute inset-0 rounded-2xl"
              style={{
                boxShadow: "0 0 60px rgba(6, 182, 212, 0.4), 0 0 100px rgba(59, 130, 246, 0.3)",
              }}
              animate={{
                boxShadow: [
                  "0 0 60px rgba(6, 182, 212, 0.4), 0 0 100px rgba(59, 130, 246, 0.3)",
                  "0 0 80px rgba(6, 182, 212, 0.6), 0 0 120px rgba(59, 130, 246, 0.4)",
                  "0 0 60px rgba(6, 182, 212, 0.4), 0 0 100px rgba(59, 130, 246, 0.3)",
                ],
              }}
              transition={{
                duration: 2.5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
            <div ref={rightPanelRef} className="relative bg-slate-900/70 backdrop-blur-xl rounded-2xl border-2 border-cyan-500/50 p-12 shadow-2xl">
              <div className="flex items-center gap-3 mb-8">
                <motion.div
                  className="relative flex items-center gap-2 bg-red-500/20 border-2 border-red-500/50 rounded-full px-6 py-2"
                  animate={{
                    boxShadow: [
                      "0 0 20px rgba(239, 68, 68, 0.5), 0 0 40px rgba(239, 68, 68, 0.3)",
                      "0 0 30px rgba(239, 68, 68, 0.8), 0 0 60px rgba(239, 68, 68, 0.5)",
                      "0 0 20px rgba(239, 68, 68, 0.5), 0 0 40px rgba(239, 68, 68, 0.3)",
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-red-500/30 via-red-400/20 to-red-500/30 rounded-full"
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  />
                  <motion.div
                    className="relative w-3 h-3 bg-red-500 rounded-full"
                    animate={{
                      opacity: [1, 0.3, 1],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Number.POSITIVE_INFINITY,
                    }}
                  />
                  <span className="relative text-red-500 font-bold text-xl">
                    LIVE
                  </span>
                </motion.div>

                <motion.div
                  className="relative flex items-center gap-1 bg-cyan-500/20 border-2 border-cyan-500/50 rounded-full px-6 py-2 overflow-hidden"
                  animate={{
                    boxShadow: [
                      "0 0 20px rgba(6, 182, 212, 0.4), 0 0 40px rgba(6, 182, 212, 0.2)",
                      "0 0 30px rgba(6, 182, 212, 0.6), 0 0 60px rgba(6, 182, 212, 0.4)",
                      "0 0 20px rgba(6, 182, 212, 0.4), 0 0 40px rgba(6, 182, 212, 0.2)",
                    ],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent"
                    animate={{
                      x: ["-100%", "200%"],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                  />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-cyan-400/30 to-cyan-500/20 rounded-full"
                    animate={{
                      opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  />
                  {isLiveActive ? (
                    <>
                      <span className="relative text-cyan-400 text-lg font-semibold">
                        AI 요약 생성중
                      </span>
                      <motion.span
                        className="relative text-cyan-400 text-lg font-semibold"
                        animate={{
                          opacity: [0, 1, 0],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Number.POSITIVE_INFINITY,
                          times: [0, 0.5, 1],
                        }}
                      >
                        ...
                      </motion.span>
                    </>
                  ) : (
                    <span className="relative text-cyan-400 text-lg font-semibold">
                      라이브 시작하기
                    </span>
                  )}
                </motion.div>
              </div>

              {/* 에러 메시지 */}
              {error && (
                <div 
                  className="mb-4 p-3 rounded-lg border"
                  style={{
                    background: "rgba(239, 68, 68, 0.1)",
                    borderColor: "rgba(239, 68, 68, 0.3)",
                    boxShadow: "0 0 15px rgba(239, 68, 68, 0.2)",
                  }}
                >
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div className="min-h-[280px] mb-12 space-y-4 flex flex-col justify-end">
                {!isLiveActive ? (
                  <p className="text-gray-500 text-2xl md:text-3xl leading-relaxed italic">
                    라이브 시작 버튼을 눌러 AI 요약을 시작하세요.
                  </p>
                ) : messages.length === 0 ? (
                  <p className="text-gray-500 text-2xl md:text-3xl leading-relaxed italic">
                    AI 코멘트가 여기에 표시됩니다...
                  </p>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {messages.map((message, index) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{
                          opacity: index === 0 ? 0.5 : index === 1 ? 0.8 : 1,
                          y: 0,
                          scale: 1,
                        }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{
                          duration: 0.5,
                          ease: "easeOut",
                        }}
                        className="relative"
                      >
                        <div
                          className={`
                          bg-gradient-to-r from-cyan-500/10 to-blue-500/10 
                          backdrop-blur-sm border-2 border-cyan-500/30 
                          rounded-2xl p-6 shadow-lg
                          ${index === messages.length - 1 ? "border-cyan-500/50 shadow-cyan-500/20" : ""}
                        `}
                        >
                          <p className="text-white text-xl md:text-2xl leading-relaxed">{message.text}</p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>

              <div className="relative h-80 -mb-48 -mx-12 px-12">
                <div className="relative z-10 flex items-center justify-center gap-1 h-16">
                  {Array.from({ length: 80 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1 bg-gradient-to-t from-cyan-500 to-blue-500 rounded-full"
                      animate={isLiveActive ? {
                        height: [
                          `${Math.random() * 30 + 10}%`,
                          `${Math.random() * 60 + 20}%`,
                          `${Math.random() * 30 + 10}%`,
                        ],
                      } : {
                        height: "10%",
                      }}
                      transition={isLiveActive ? {
                        duration: 0.5 + Math.random() * 0.5,
                        repeat: Number.POSITIVE_INFINITY,
                        delay: i * 0.02,
                      } : {}}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="relative z-10 mt-16 flex items-center justify-between max-w-screen-2xl mx-auto"
      >
        <p className="text-xs text-cyan-400/60">
          © 2025 SK Group. All rights reserved.
        </p>
        <Link href="/">
          <Button
            size="sm"
            variant="ghost"
            className="gap-2 text-cyan-400 hover:text-cyan-300"
          >
            <Home className="w-4 h-4" />
            홈으로
          </Button>
        </Link>
      </motion.div>
    </div>
  )
}

export default function PanelLive() {
  return (
    <Suspense fallback={
      <div 
        className="min-h-screen flex items-center justify-center bg-[#0a1628]"
      >
        <div className="flex items-center gap-3">
          <motion.div
            className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          />
          <span className="text-white text-lg">로딩 중...</span>
        </div>
      </div>
    }>
      <PanelLiveContent />
    </Suspense>
  )
}

