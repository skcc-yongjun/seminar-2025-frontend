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
        console.log('Loaded question data:', questionData)
        console.log('questionText:', questionData.questionText)
        console.log('answerText:', questionData.answerText)
        
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
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sk-red mx-auto mb-4"></div>
          <p className="text-white">질문을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center bg-slate-900">
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
    <div className="min-h-screen bg-slate-980 text-white relative overflow-hidden">
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
      <div className="flex h-[calc(100vh-200px)]">
        {/* Left Side - Video (35%) */}
        <div className="w-[35%] flex items-end">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="relative w-full h-full rounded-2xl overflow-hidden bg-slate-900"
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
          </motion.div>
        </div>

        {/* Right Side - Question Content (65%) */}
        <div className="w-[65%] flex flex-col justify-between p-8">
          {/* Q and Title Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
            className="flex items-end gap-6"
          >
            {/* Large Q */}
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
              className="text-[200px] font-bold text-sky-400 select-none"
              style={{
                lineHeight: 0.8,
              }}
            >
              Q
            </motion.div>
            
            {/* Title */}
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, duration: 0.6, ease: "easeOut" }}
              className="text-5xl lg:text-6xl font-semibold text-amber-400 leading-tight select-none"
            >
              {data.title}
            </motion.div>
          </motion.div>

          {/* Text Content - Full Background */}
          <div className="relative flex-1 flex flex-col justify-center">
            {/* Background Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-sk-red/10 via-blue-500/10 to-sk-red/10 blur-3xl rounded-2xl opacity-50"></div>
            
            {/* Text Container */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="relative z-10"
              style={{
                perspective: '1200px',
                transformStyle: 'preserve-3d'
              }}
            >
              <div 
                ref={textContainerRef}
                className="rounded-lg p-8 min-h-[300px] overflow-y-auto"
                style={{
                  transform: 'rotateY(15deg) translateZ(0)',
                  transformOrigin: 'left center'
                }}
              >
                <p className="text-gray-300 leading-relaxed text-6xl">
                  {displayedText.split(/\r\n|\r|\n/).map((line, index) => (
                    <span key={index}>
                      {line}
                      {index < displayedText.split(/\r\n|\r|\n/).length - 1 && <br />}
                    </span>
                  ))}
                  {isTyping && <span className="animate-pulse">|</span>}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            {/* Back to List Button */}
            <Link
              href="/qna"
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
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-6 flex items-center justify-between border-t border-white/10 bg-slate-900/80 backdrop-blur-sm">
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
