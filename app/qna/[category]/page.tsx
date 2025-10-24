"use client"

import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, MessageCircle, Brain, CheckCircle, Sparkles } from "lucide-react"
import { useState, useEffect } from "react"

const categoryData: Record<
  string,
  {
    title: string
    subtitle: string
    questions: Array<{ id: string; question: string; description: string }>
  }
> = {
  business: {
    title: "비즈니스",
    subtitle: "Business",
    questions: [
      {
        id: "strategy",
        question: "우리 회사의 핵심 비즈니스 전략은 무엇인가요?",
        description: "장기 비전과 전략적 방향성",
      },
      {
        id: "innovation",
        question: "디지털 혁신은 어떻게 추진하고 있나요?",
        description: "디지털 전환과 기술 혁신 계획",
      },
      {
        id: "growth",
        question: "신규 사업 확장 계획은?",
        description: "새로운 성장 동력 발굴",
      },
      {
        id: "customer",
        question: "고객 가치 창출 방안은?",
        description: "고객 중심 경영과 서비스 혁신",
      },
    ],
  },
  group: {
    title: "그룹사",
    subtitle: "SK Group",
    questions: [
      {
        id: "vision",
        question: "SK그룹의 비전과 미션은 무엇인가요?",
        description: "그룹의 핵심 가치와 목표",
      },
      {
        id: "synergy",
        question: "계열사 간 시너지는 어떻게 창출하나요?",
        description: "그룹 차원의 협력과 통합",
      },
      {
        id: "culture",
        question: "SK그룹의 조직 문화는?",
        description: "기업 문화와 핵심 가치",
      },
      {
        id: "esg",
        question: "ESG 경영 추진 현황은?",
        description: "지속가능경영과 사회적 책임",
      },
    ],
  },
  market: {
    title: "시장",
    subtitle: "Market",
    questions: [
      {
        id: "trend",
        question: "현재 시장 트렌드는 어떻게 변화하고 있나요?",
        description: "산업 동향과 시장 변화",
      },
      {
        id: "competition",
        question: "경쟁 환경은 어떻게 분석하고 있나요?",
        description: "경쟁사 분석과 시장 포지셔닝",
      },
      {
        id: "opportunity",
        question: "새로운 시장 기회는?",
        description: "시장과 성장 가능성",
      },
      {
        id: "customer-needs",
        question: "고객 니즈는 어떻게 변화하고 있나요?",
        description: "소비자 행동과 수요 변화",
      },
      {
        id: "regulation",
        question: "규제 환경 변화에 어떻게 대응하나요?",
        description: "법규 준수와 리스크 관리",
      },
      {
        id: "forecast",
        question: "시장 전망과 예측은?",
        description: "미래 시장 예측과 대응 전략",
      },
    ],
  },
}

export default function QnAQuestions({ params }: { params: { category: string } }) {
  const { category } = params
  const data = categoryData[category]

  const [generationStatus, setGenerationStatus] = useState<Record<string, "pending" | "generating" | "complete">>({})
  const [currentGeneratingIndex, setCurrentGeneratingIndex] = useState(0)

  useEffect(() => {
    if (!data) return

    // Initialize all questions as pending
    const initialStatus: Record<string, "pending" | "generating" | "complete"> = {}
    data.questions.forEach((q) => {
      initialStatus[q.id] = "pending"
    })
    setGenerationStatus(initialStatus)

    // Start sequential generation
    let index = 0
    const generateNext = () => {
      if (index >= data.questions.length) return

      const questionId = data.questions[index].id

      // Set to generating
      setGenerationStatus((prev) => ({ ...prev, [questionId]: "generating" }))
      setCurrentGeneratingIndex(index)

      // Simulate generation time (2-3 seconds per question)
      setTimeout(
        () => {
          setGenerationStatus((prev) => ({ ...prev, [questionId]: "complete" }))
          index++
          if (index < data.questions.length) {
            setTimeout(generateNext, 500) // Small delay before next generation
          }
        },
        2000 + Math.random() * 1000,
      )
    }

    generateNext()
  }, [data])

  if (!data) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">카테고리를 찾을 수 없습니다</h1>
          <Link href="/qna" className="text-sk-red hover:underline">
            카테고리 목록으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-8 relative overflow-hidden">
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
          <p className="text-muted-foreground">AI 아바타가 순차적으로 생성되고 있습니다...</p>
        </motion.div>

        {/* Questions List */}
        <div className={category === "group" || category === "business" ? "grid grid-cols-2 gap-6" : "space-y-4"}>
          {data.questions.map((question, index) => {
            const status = generationStatus[question.id] || "pending"
            const isClickable = status === "complete"

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
                        className={`relative backdrop-blur-sm bg-card/50 ${category === "group" || category === "business" ? "p-8" : "p-6"}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3
                              className={`font-semibold text-foreground mb-2 group-hover:text-sk-red transition-colors ${category === "group" || category === "business" ? "text-2xl" : "text-xl"}`}
                            >
                              {question.question}
                            </h3>
                            <p
                              className={`text-muted-foreground ${category === "group" || category === "business" ? "text-base" : "text-sm"}`}
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
                              className={`rounded-full bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors ${category === "group" || category === "business" ? "w-12 h-12" : "w-10 h-10"}`}
                            >
                              <CheckCircle
                                className={`text-green-500 ${category === "group" || category === "business" ? "w-6 h-6" : "w-5 h-5"}`}
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
                      className={`relative backdrop-blur-sm bg-card/30 ${category === "group" || category === "business" ? "p-8" : "p-6"}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3
                            className={`font-semibold text-foreground/70 mb-2 ${category === "group" || category === "business" ? "text-2xl" : "text-xl"}`}
                          >
                            {question.question}
                          </h3>
                          <p
                            className={`text-muted-foreground/70 ${category === "group" || category === "business" ? "text-base" : "text-sm"}`}
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
                            className={`rounded-full bg-sk-red/10 flex items-center justify-center ${category === "group" || category === "business" ? "w-12 h-12" : "w-10 h-10"}`}
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
                                    className={`text-sk-red ${category === "group" || category === "business" ? "w-6 h-6" : "w-5 h-5"}`}
                                  />
                                </motion.div>
                              ) : (
                                <motion.div key="pending" initial={{ opacity: 0.3 }} animate={{ opacity: 0.3 }}>
                                  <Brain
                                    className={`text-muted-foreground ${category === "group" || category === "business" ? "w-6 h-6" : "w-5 h-5"}`}
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
