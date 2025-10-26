"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Home, List, Play, Pause } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { API_ENDPOINTS, fetchWithErrorHandling, type QuestionResponse } from "@/lib/api"

export default function QnAAnswerClient({
  category,
  question,
}: {
  category: string
  question: string
}) {
  const [data, setData] = useState<QuestionResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [displayedText, setDisplayedText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isShowingAnswer, setIsShowingAnswer] = useState(false)
  const [isVideoLoading, setIsVideoLoading] = useState(true)
  const [hasStartedTyping, setHasStartedTyping] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const textContainerRef = useRef<HTMLDivElement>(null)

  const toggleVideo = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
        setIsPlaying(false)
      } else {
        videoRef.current.play()
        setIsPlaying(true)
        
        // 동영상 재생 시 자막 타이핑 시작
        if (!hasStartedTyping && data) {
          const textToShow = isShowingAnswer ? data.answerText : data.questionText
          if (textToShow) {
            setHasStartedTyping(true)
            setTimeout(() => {
              typeText(textToShow, 70)
            }, 300)
          }
        }
      }
    }
  }

  const typeText = (text: string, speed: number = 50) => {
    setIsTyping(true)
    setDisplayedText("")
    
    let index = 0
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1))
        index++
        
        // 타이핑 중에 자동 스크롤
        if (textContainerRef.current) {
          textContainerRef.current.scrollTop = textContainerRef.current.scrollHeight
        }
      } else {
        clearInterval(timer)
        setIsTyping(false)
      }
    }, speed)
  }

  const toggleQuestionAnswer = () => {
    const newShowingAnswer = !isShowingAnswer
    setIsShowingAnswer(newShowingAnswer)
    
    // 비디오 일시정지
    if (videoRef.current) {
      videoRef.current.pause()
      setIsPlaying(false)
    }
    
    // 새로운 비디오 로딩 시작
    setIsVideoLoading(true)
    
    // 타이핑 상태 초기화 (새로운 텍스트로 전환)
    setHasStartedTyping(false)
    setDisplayedText("")
    setIsTyping(false)
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const questionData = await fetchWithErrorHandling<QuestionResponse>(
          API_ENDPOINTS.question(category, question)
        )
        setData(questionData)
        
        // 비디오 로딩 상태 초기화
        setIsVideoLoading(true)
        
        // 타이핑 상태 초기화
        setHasStartedTyping(false)
        setDisplayedText("")
        setIsTyping(false)
      } catch (error) {
        console.error('Failed to fetch question data:', error)
        setError('질문을 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [category, question])

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sk-red mx-auto mb-4"></div>
          <p className="text-white">질문을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center bg-black">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            {error || "질문을 찾을 수 없습니다"}
          </h1>
          <Link href={`/qna/${category}`} className="text-sk-red hover:underline">
            질문 목록으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-sk-red rounded flex items-center justify-center">
            <span className="text-white font-bold text-xl">SK</span>
          </div>
          <div>
            <div className="text-sm text-gray-400">SK GROUP</div>
            <div className="text-sm font-semibold">CEO 세미나</div>
          </div>
        </div>
        <div className="text-lg font-semibold">AI Biz.Model 구축 방향</div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-4">
        {/* Question Text */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
          className="relative mb-8 max-w-4xl"
        >
          {/* Background Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-sk-red/20 via-blue-500/20 to-sk-red/20 blur-xl rounded-2xl opacity-30"></div>
          
          {/* Text Container */}
          <motion.h1
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
            className="relative text-2xl md:text-3xl lg:text-4xl font-semibold text-center text-balance leading-tight select-none"
            style={{
              background: "linear-gradient(135deg, #ffffff 0%, #f0f0f0 50%, #ffffff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {data.title}
          </motion.h1>
          
          {/* Decorative Line */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ delay: 0.8, duration: 1.2, ease: "easeOut" }}
            className="h-0.5 bg-gradient-to-r from-transparent via-sk-red to-transparent mt-4 mx-auto"
            style={{ maxWidth: "200px" }}
          />
        </motion.div>

        {/* Video and Text Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-7xl mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Video Player */}
            <div className="flex-1">
              <div 
                className="relative w-full h-[60vh] rounded-2xl overflow-hidden shadow-2xl shadow-sk-red/30 bg-black"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                {(isShowingAnswer ? data.answerVideoUrl : data.questionVideoUrl) ? (
                  <>
                    {/* 비디오 로딩 중일 때 */}
                    {isVideoLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                        <div className="text-center text-white">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sk-red mx-auto mb-4"></div>
                          <p className="text-lg">동영상 로딩 중...</p>
                        </div>
                      </div>
                    )}
                    
                    <video
                      ref={videoRef}
                      src={isShowingAnswer ? data.answerVideoUrl : data.questionVideoUrl}
                      className="w-full h-full object-cover"
                      onLoadStart={() => setIsVideoLoading(true)}
                      onCanPlay={() => setIsVideoLoading(false)}
                      onEnded={() => setIsPlaying(false)}
                      onPlay={() => {
                        setIsPlaying(true)
                        // 동영상 재생 시 자막 타이핑 시작
                        if (!hasStartedTyping && data) {
                          const textToShow = isShowingAnswer ? data.answerText : data.questionText
                          if (textToShow) {
                            setHasStartedTyping(true)
                            setTimeout(() => {
                              typeText(textToShow, 70)
                            }, 300)
                          }
                        }
                      }}
                      onPause={() => setIsPlaying(false)}
                    />
                    
                    {/* Play/Pause Overlay - only show on hover and when not loading */}
                    {isHovered && !isVideoLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity duration-200">
                        <button
                          onClick={toggleVideo}
                          className="w-20 h-20 rounded-full bg-white/90 hover:bg-white transition-colors flex items-center justify-center shadow-lg"
                        >
                          {isPlaying ? (
                            <Pause className="w-8 h-8 text-black" />
                          ) : (
                            <Play className="w-8 h-8 text-black ml-1" />
                          )}
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <div className="text-center text-gray-400">
                      <Play className="w-16 h-16 mx-auto mb-4" />
                      <p>비디오를 불러올 수 없습니다</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Text Display */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex-1"
            >
              <div className="h-[60vh] rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 flex flex-col">
                <h3 className="text-lg font-semibold mb-4 text-white">
                  {isShowingAnswer ? "답변 내용" : "질문 내용"}
                </h3>
                <div 
                  ref={textContainerRef}
                  className="bg-black/20 rounded-lg p-6 flex-1 overflow-y-auto"
                >
                  <p className="text-gray-300 leading-relaxed text-4xl">
                    {displayedText}
                    {isTyping && <span className="animate-pulse">|</span>}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          {/* Back to List Button */}
          <Link
            href={`/qna/${category}`}
            className="px-6 py-3 rounded-lg border border-white/20 hover:border-white/40 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <List className="w-5 h-5" />
            <span>목록으로</span>
          </Link>

          {/* Toggle Question/Answer Button */}
          <button
            onClick={toggleQuestionAnswer}
            className="px-8 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors font-semibold shadow-lg shadow-blue-600/30 w-full sm:w-auto"
          >
            {isShowingAnswer ? "질문 보기" : "답변 보기"}
          </button>
        </motion.div>

      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-6 flex items-center justify-between border-t border-white/10 bg-black/80 backdrop-blur-sm">
        <div className="text-xs text-gray-500">© 2025 SK Group. All rights reserved.</div>
        <Link
          href="/"
          className="px-4 py-2 rounded-lg border border-white/20 hover:border-white/40 transition-colors flex items-center gap-2 text-sm"
        >
          <Home className="w-4 h-4" />
          <span>홈으로</span>
        </Link>
      </div>
    </div>
  )
}
