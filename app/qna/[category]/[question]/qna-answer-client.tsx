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
  const videoRef = useRef<HTMLVideoElement>(null)

  const toggleVideo = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
        setIsPlaying(false)
      } else {
        videoRef.current.play()
        setIsPlaying(true)
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
    
    // 타이핑 효과로 텍스트 변경
    const textToShow = newShowingAnswer ? data?.answerText : data?.questionText
    if (textToShow) {
      setTimeout(() => {
        typeText(textToShow, 40)
      }, 300)
    }
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
        
        // 타이핑 효과 시작 (초기에는 질문 텍스트)
        if (questionData.questionText) {
          setTimeout(() => {
            typeText(questionData.questionText, 50)
          }, 500) // 0.5초 후 시작
        }
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
        {/* Question Badge */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="w-16 h-16 rounded-full bg-sk-red flex items-center justify-center text-white font-bold text-xl mb-8 shadow-lg shadow-sk-red/50"
        >
          {data.categoryName}
        </motion.div>

        {/* Question Text */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl md:text-3xl font-medium text-center mb-8 max-w-3xl text-balance"
        >
          {data.title}
        </motion.h1>

        {/* Video Player */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col items-center gap-4 mb-8"
        >
          {/* Video Container */}
          <div 
            className="relative w-full max-w-4xl h-[50vh] rounded-2xl overflow-hidden shadow-2xl shadow-sk-red/30 bg-black"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {(isShowingAnswer ? data.answerVideoUrl : data.questionVideoUrl) ? (
              <>
                <video
                  ref={videoRef}
                  src={isShowingAnswer ? data.answerVideoUrl : data.questionVideoUrl}
                  className="w-full h-full object-cover"
                  onEnded={() => setIsPlaying(false)}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
                {/* Play/Pause Overlay - only show on hover */}
                {isHovered && (
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
        </motion.div>

        {/* Question Text Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-5xl mb-8"
        >
          <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-8">
            <h3 className="text-lg font-semibold mb-4 text-white">
              {isShowingAnswer ? "답변 내용" : "질문 내용"}
            </h3>
            <div className="bg-black/20 rounded-lg p-6 max-h-40 overflow-y-auto">
              <p className="text-gray-300 leading-relaxed text-3xl">
                {displayedText}
                {isTyping && <span className="animate-pulse">|</span>}
              </p>
            </div>
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
