"use client"

import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, MessageCircle, Brain, CheckCircle, Sparkles } from "lucide-react"
import { useState, useEffect, use } from "react"
import { fetchQnAQuestionsByKeyword, type QnAQuestionResponse } from "@/lib/api"

interface CategoryData {
  title: string
  subtitle: string
  questions: Array<{
    id: string
    question: string
    description: string
    video_created: boolean
  }>
}

export default function QnAQuestions({ params }: { params: Promise<{ category: string }> }) {
  const { category: rawCategory } = use(params)
  // URL 디코딩 처리
  const category = decodeURIComponent(rawCategory)
  
  const [data, setData] = useState<CategoryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  // video_created 상태를 기반으로 상태 결정
  const getQuestionStatus = (question: { video_created: boolean }) => {
    return question.video_created ? "complete" : "generating"
  }

  // 데이터 가져오기 함수 (초기 로드용)
  const fetchCategoryData = async (isInitialLoad = false) => {
    try {
      if (isInitialLoad) {
        setLoading(true)
        setError(null)
      }
      
      // 백엔드에서 키워드별 질문 조회
      const qnaQuestions = await fetchQnAQuestionsByKeyword(category)
      
      // QnAQuestionResponse를 CategoryData 형식으로 변환
      const categoryData: CategoryData = {
        title: category,
        subtitle: category,
        questions: qnaQuestions.map((q) => ({
          id: q.question_id.toString(),
          question: q.title,
          description: q.timestamp_label || "질문 Keyword",
          video_created: q.video_created, // video_created 상태 추가
        }))
      }
      
      setData(categoryData)
      
      // video_created가 false인 질문이 있는지 확인
      const hasIncompleteVideos = qnaQuestions.some(q => !q.video_created)
      
      if (hasIncompleteVideos) {
        console.log('일부 비디오가 아직 생성되지 않았습니다. 5초 후 재시도합니다.')
        setTimeout(() => {
          setRetryCount(prev => prev + 1)
        }, 5000)
      }

    } catch (err) {
      console.error('Error fetching category data:', err)
      if (isInitialLoad) {
        setError(err instanceof Error ? err.message : 'Failed to fetch category data')
        
        // Fallback to empty data if API fails
        setData({
          title: category,
          subtitle: category,
          questions: []
        })
      }
    } finally {
      if (isInitialLoad) {
        setLoading(false)
      }
    }
  }

  // 초기 데이터 로드
  useEffect(() => {
    fetchCategoryData(true)
  }, [category])

  // 재시도 로직
  useEffect(() => {
    if (retryCount > 0) {
      fetchCategoryData(false) // 재시도 시에는 로딩 상태 없이
    }
  }, [retryCount])



  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-sk-red mx-auto mb-4"></div>
          <p className="text-2xl text-muted-foreground">질문 목록 로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!data || data.questions.length === 0) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-6">
            {error ? "질문을 불러오는데 실패했습니다" : "해당 키워드에 대한 질문이 없습니다"}
          </h1>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <Link href="/qna" className="text-sk-red hover:underline text-xl">
            카테고리 목록으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen h-screen p-4 md:p-8 relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sk-red/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sk-red/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-[1800px] mx-auto relative z-10 px-8 h-full flex flex-col">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link
            href="/qna"
            className="inline-flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors mb-8 text-lg"
          >
            <ArrowLeft className="w-7 h-7" />
            <span>카테고리 목록으로</span>
          </Link>

          <div className="flex items-center gap-6 mb-6">
            <div className="w-24 h-24 bg-sk-red rounded-xl flex items-center justify-center shadow-lg">
              <MessageCircle className="w-12 h-12 text-white" />
            </div>
            <div>
              <h1 className="text-6xl md:text-7xl font-bold text-foreground text-balance">{data.title}</h1>
              <p className="text-sk-red/70 mt-3 text-2xl">{data.subtitle}</p>
            </div>
          </div>
          {data && data.questions.some(q => !q.video_created) && (
            <div className="flex items-center gap-3">
              <p className="text-muted-foreground text-xl">일부 질문의 AI 아바타가 생성 중입니다...</p>
              {retryCount > 0 && (
                <span className="text-sm text-sk-red/70">
                  (자동 새로고침 {retryCount}회)
                </span>
              )}
            </div>
          )}
        </motion.div>

        {/* Questions List */}
        <div className={`flex-1 grid grid-cols-2 gap-12`}>
          {data.questions.map((question, index) => {
            const status = getQuestionStatus(question)
            const isClickable = question.video_created

            return (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {isClickable ? (
                  <Link href={`/qna/${category}/${question.id}`} className="block group h-full">
                    <div className="relative rounded-xl overflow-hidden border border-border/50 transition-all duration-300 hover:border-border hover:shadow-xl hover:shadow-black/10 hover:scale-[1.02] active:scale-[0.98] h-full min-h-[350px] flex flex-col">
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-white/10 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Content */}
                      <div
                        className={`relative backdrop-blur-sm bg-card/50 flex-1 flex flex-col p-8`}
                      >
                        <div className="flex-1 flex flex-col">
                          <div className="flex-1">
                            <p
                              className={`text-muted-foreground/80 text-3xl leading-relaxed group-hover:text-muted-foreground/70 transition-colors mb-4`}
                              style={{ wordBreak: 'keep-all' }}
                            >
                              {question.description}
                            </p>
                            
                            <h3
                              className={`font-semibold text-foreground/90 mb-8 group-hover:text-foreground/80 transition-colors text-6xl leading-tight`}
                              style={{ wordBreak: 'keep-all' }}
                            >
                              {question.question}
                            </h3>
                          </div>
                          <div className="flex justify-end items-end mt-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-green-500 font-medium">
                                AI 이미지 생성 완료
                              </span>
                              <div className="rounded-full bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors w-8 h-8">
                                <CheckCircle className="text-green-500 w-4 h-4" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="relative rounded-xl overflow-hidden border border-border/30 opacity-60 cursor-not-allowed h-full min-h-[350px] flex flex-col">
                    {/* Content */}
                    <div
                      className={`relative backdrop-blur-sm bg-card/30 flex-1 flex flex-col p-8`}
                    >
                      <div className="flex-1 flex flex-col">
                        <div className="flex-1">
                          <p
                            className={`text-gray-500 text-3xl leading-relaxed mb-4`}
                            style={{ wordBreak: 'keep-all' }}
                          >
                            {question.description}
                          </p>
                          <h3
                            className={`font-semibold text-gray-400 mb-8 text-6xl leading-tight`}
                            style={{ wordBreak: 'keep-all' }}
                          >
                            {question.question}
                          </h3>
                        </div>
                        <div className="flex justify-end items-end mt-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-sk-red font-medium">
                              AI 이미지 생성중
                            </span>
                            <div className="flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-sk-red animate-pulse" />
                              <div className="flex gap-0.5">
                                <motion.div
                                  className="w-1 h-1 bg-sk-red rounded-full"
                                  animate={{ opacity: [0.3, 1, 0.3] }}
                                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, delay: 0 }}
                                />
                                <motion.div
                                  className="w-1 h-1 bg-sk-red rounded-full"
                                  animate={{ opacity: [0.3, 1, 0.3] }}
                                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, delay: 0.2 }}
                                />
                                <motion.div
                                  className="w-1 h-1 bg-sk-red rounded-full"
                                  animate={{ opacity: [0.3, 1, 0.3] }}
                                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, delay: 0.4 }}
                                />
                              </div>
                            </div>
                            <div className="rounded-full bg-sk-red/10 flex items-center justify-center w-8 h-8">
                              <AnimatePresence mode="wait">
                                <motion.div
                                  key="generating"
                                  initial={{ scale: 0.8, opacity: 0 }}
                                  animate={{
                                    scale: [0.8, 1.1, 0.8],
                                    opacity: 1,
                                    rotate: [0, 5, -5, 0],
                                  }}
                                  exit={{ scale: 0.8, opacity: 0 }}
                                  transition={{
                                    scale: {
                                      duration: 1.5,
                                      repeat: Number.POSITIVE_INFINITY,
                                      ease: "easeInOut",
                                    },
                                    rotate: {
                                      duration: 2,
                                      repeat: Number.POSITIVE_INFINITY,
                                      ease: "easeInOut",
                                    },
                                  }}
                                >
                                  <Brain className="text-sk-red w-4 h-4" />
                                </motion.div>
                              </AnimatePresence>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
