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
      
      // created_at desc로 정렬 후 최근 4개만 선택
      const sortedQuestions = qnaQuestions
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 4)
      
      // QnAQuestionResponse를 CategoryData 형식으로 변환
      const categoryData: CategoryData = {
        title: category,
        subtitle: category,
        questions: sortedQuestions.map((q) => ({
          id: q.question_id.toString(),
          question: q.title,
          description: q.timestamp_label || "질문 Keyword",
          video_created: q.video_created, // video_created 상태 추가
        }))
      }
      
      setData(categoryData)
      
      // video_created가 false인 질문이 있는지 확인 (최근 4개 질문에 대해서만)
      const hasIncompleteVideos = sortedQuestions.some(q => !q.video_created)
      
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

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <Link
            href="/qna"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>카테고리 목록으로</span>
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-sk-red rounded-xl flex items-center justify-center shadow-lg">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground text-balance">{data.title}</h1>
              <p className="text-sk-red/70 mt-2">{data.subtitle}</p>
            </div>
          </div>
          {data && data.questions.some(q => !q.video_created) ? (
            <p className="text-muted-foreground">AI 아바타가 순차적으로 생성되고 있습니다...</p>
          ) : (
            <p className="text-muted-foreground">생성된 질문을 선택하여 상세 내용을 확인하세요</p>
          )}
          {retryCount > 0 && (
            <p className="text-sm text-sk-red/70 mt-2">
              자동 새로고침 {retryCount}회
            </p>
          )}
        </motion.div>

        {/* Questions List */}
        <div className="grid grid-cols-2 gap-6">
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
                  <Link href={`/qna/${category}/${question.id}`} className="block group">
                    <div className="relative rounded-xl overflow-hidden border border-border/50 transition-all duration-300 hover:border-sk-red/50 hover:shadow-lg hover:shadow-sk-red/10 active:scale-[0.99] h-full">
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-sk-red/0 via-sk-red/5 to-sk-red/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Content */}
                      <div
                        className={`relative backdrop-blur-sm bg-card/50 p-8`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3
                              className={`font-semibold text-foreground mb-2 group-hover:text-sk-red transition-colors text-2xl`}
                            >
                              {question.question}
                            </h3>
                            <p
                              className={`text-muted-foreground text-base`}
                            >
                              {question.description}
                            </p>
                          </div>
                          <div className="flex-shrink-0 flex items-center gap-3">
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-xs text-green-500 font-medium whitespace-nowrap">
                                AI 이미지 생성 완료
                              </span>
                            </div>
                            <div
                              className={`rounded-full bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors w-12 h-12`}
                            >
                              <CheckCircle
                                className={`text-green-500 w-6 h-6`}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="relative rounded-xl overflow-hidden border border-border/30 opacity-60 cursor-not-allowed h-full">
                    {/* Content */}
                    <div
                      className={`relative backdrop-blur-sm bg-card/30 p-8`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3
                            className={`font-semibold text-foreground/70 mb-2 text-2xl`}
                          >
                            {question.question}
                          </h3>
                          <p
                            className={`text-muted-foreground/70 text-base`}
                          >
                            {question.description}
                          </p>
                        </div>
                        <div className="flex-shrink-0 flex items-center gap-3">
                          {status === "generating" && (
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-xs text-sk-red font-medium whitespace-nowrap">
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
                            </div>
                          )}
                          <div
                            className={`rounded-full bg-sk-red/10 flex items-center justify-center w-12 h-12`}
                          >
                            <AnimatePresence mode="wait">
                              {status === "generating" ? (
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
                                  <Brain
                                    className={`text-sk-red w-6 h-6`}
                                  />
                                </motion.div>
                              ) : (
                                <motion.div key="pending" initial={{ opacity: 0.3 }} animate={{ opacity: 0.3 }}>
                                  <Brain
                                    className={`text-muted-foreground w-6 h-6`}
                                  />
                                </motion.div>
                              )}
                            </AnimatePresence>
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
