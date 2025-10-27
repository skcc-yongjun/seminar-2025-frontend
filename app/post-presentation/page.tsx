"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Home, Sparkles, Brain } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

function TypewriterText({ text, delay = 50, onComplete }: { text: string; delay?: number; onComplete?: () => void }) {
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const hasCompletedRef = useRef(false)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex])
        setCurrentIndex((prev) => prev + 1)
      }, delay)

      return () => clearTimeout(timeout)
    } else if (currentIndex === text.length && onComplete && !hasCompletedRef.current) {
      hasCompletedRef.current = true
      onComplete()
    }
  }, [currentIndex, text, delay, onComplete])

  return <span>{displayedText}</span>
}

const presentations = [
  {
    id: "1",
    title: "Global Top-tier 대비 O/I 경쟁력 분석 및 개선방안",
    presenter: "윤풍영",
    company: "SK AX",
  },
  {
    id: "2",
    title: "AI Biz.Model 구축 방향",
    presenter: "김민수",
    company: "SK Telecom",
  },
  {
    id: "3",
    title: "5G 기반 AI 서비스 전략",
    presenter: "이지은",
    company: "SK Hynix",
  },
  {
    id: "4",
    title: "AI 기반 에너지 최적화",
    presenter: "박준호",
    company: "SK E&S",
  },
]

interface PresentationAnalysis {
  id: string
  title: string
  presenter: string
  company: string
  strengths: { text: string; voiceAnalysis: string | null; presentationMaterial: string | null }[]
  improvements: { text: string; voiceAnalysis: string | null; presentationMaterial: string | null }[]
  summary: string
  aiScores: {
    "[O/I 수준 진단]": number
    "[과제 목표 수준]": number
    "[성과 지속 가능성]": number
    "[Process/System]": number
    "[본원적 경쟁력 연계]": number
    "[혁신성]": number
    "[실행 가능성]": number
    "[기대 효과]": number
  }
  onSiteScores: {
    "[전략적 중요도]": number
    "[실행 가능성]": number
    "[발표 완성도]": number
  }
}

export default function PostPresentationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const presentationIdFromQuery = searchParams.get("presentationId")

  const [selectedPresentationId, setSelectedPresentationId] = useState("1")
  const selectedPresentation = presentations.find((p) => p.id === selectedPresentationId) || presentations[0]

  const [presentation] = useState<PresentationAnalysis>({
    id: "1",
    title: "Global Top-tier 대비 O/I 경쟁력 분석 및 개선방안",
    presenter: "윤풍영",
    company: "SK AX",
    strengths: [
      {
        text: "책임 명료. 핵·비핵 구분이 단호하고, 철수 기준이 수익성 중심이다.",
        voiceAnalysis: "08:12",
        presentationMaterial: null,
      },
      {
        text: "인과 명확. MPRS 구조가 연결되고 실행 책임이 드러난다.",
        voiceAnalysis: null,
        presentationMaterial: "p.12",
      },
    ],
    improvements: [
      {
        text: "루트코즈 피상. 장애요인 나열로 끝나며 발목 원인 분석이 없다.",
        voiceAnalysis: "18:44",
        presentationMaterial: null,
      },
      { text: "목표 저강도. 2027 목표가 낮고 재무 연계가 끊겼다.", voiceAnalysis: null, presentationMaterial: "p.7" },
    ],
    summary:
      "논리는 충분하나 결단이 약하다. 성과-재무 인과가 끊겨 도전이 보이지 않는다. 리스크를 감수하는 목표 전환 없이는 그룹 내 리더십을 확보하기 어렵다.",
    aiScores: {
      "[O/I 수준 진단]": 8.5,
      "[과제 목표 수준]": 5.5,
      "[성과 지속 가능성]": 7.0,
      "[Process/System]": 5.0,
      "[본원적 경쟁력 연계]": 8.2,
      "[혁신성]": 7.5,
      "[실행 가능성]": 6.8,
      "[기대 효과]": 7.8,
    },
    onSiteScores: {
      "[전략적 중요도]": 8.0,
      "[실행 가능성]": 6.5,
      "[발표 완성도]": 7.5,
    },
  })

  const [isAnalyzingImplication, setIsAnalyzingImplication] = useState(false)

  const [showAnalysis, setShowAnalysis] = useState(false)

  const [showStrengths, setShowStrengths] = useState(false)
  const [showWeaknesses, setShowWeaknesses] = useState(false)
  const [showSummary, setShowSummary] = useState(false)

  const [visibleStrengthItems, setVisibleStrengthItems] = useState<number[]>([])
  const [visibleWeaknessItems, setVisibleWeaknessItems] = useState<number[]>([])

  const [analyzingLine, setAnalyzingLine] = useState<string>("")

  const [isImplicationAnalysisComplete, setIsImplicationAnalysisComplete] = useState(false)

  const [loadingStage, setLoadingStage] = useState<"analyzing" | "ready" | "button" | "revealed">(
    presentationIdFromQuery ? "revealed" : "analyzing",
  )

  const [showScores, setShowScores] = useState(false)

  const [completedStrengthItems, setCompletedStrengthItems] = useState<number[]>([])
  const [completedWeaknessItems, setCompletedWeaknessItems] = useState<number[]>([])
  const [completedSummary, setCompletedSummary] = useState(false)

  const handleImplicationAnalysis = () => {
    if (isImplicationAnalysisComplete) {
      router.push(`/post-presentation/evaluations?presentationId=${selectedPresentationId}`)
      return
    }

    setShowAnalysis(true)
    setShowStrengths(true)
    setShowWeaknesses(true)

    setTimeout(() => {
      setAnalyzingLine("책임 명료. 핵·비핵 구분이 단호하고, 철수 기준이 수익성 중심이다.")
      setVisibleStrengthItems([0])
    }, 800)

    setTimeout(() => {
      setAnalyzingLine("루트코즈 피상. 장애요인 나열로 끝나며 발목 원인 분석이 없다.")
      setVisibleWeaknessItems([0])
    }, 2200)

    setTimeout(() => {
      setAnalyzingLine("인과 명확. MPRS 구조가 연결되고 실행 책임이 드러난다.")
      setVisibleStrengthItems([0, 1])
    }, 3600)

    setTimeout(() => {
      setAnalyzingLine("목표 저강도. 2027 목표가 낮고 재무 연계가 끊겼다.")
      setVisibleWeaknessItems([0, 1])
    }, 5000)

    setTimeout(() => {
      setAnalyzingLine("총평 작성 중...")
      setShowSummary(true)

      setTimeout(() => {
        setAnalyzingLine("")
        setIsAnalyzingImplication(false)
        setIsImplicationAnalysisComplete(true)
        setShowScores(true)
      }, 2000)
    }, 6400)
  }

  const handleRevealResults = () => {
    setLoadingStage("revealed")
    handleImplicationAnalysis()
  }

  useEffect(() => {
    if (presentationIdFromQuery) {
      setLoadingStage("revealed")
      handleImplicationAnalysis()
      return
    }

    const timer1 = setTimeout(() => {
      setLoadingStage("ready")
    }, 3000)

    const timer2 = setTimeout(() => {
      setLoadingStage("button")
    }, 5500)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [presentationIdFromQuery])

  return (
    <div className="min-h-screen p-4 md:p-6 relative overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sk-red/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sk-red/3 rounded-full blur-3xl" />
      </div>

      <div className="max-w-[1800px] mx-auto space-y-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 hover:bg-sk-red/10">
              <Home className="w-4 h-4" />
              홈으로
            </Button>
          </Link>

          <div className="flex-1 flex justify-center">
            <div className="text-center">
              <Select value={selectedPresentationId} onValueChange={setSelectedPresentationId}>
                <SelectTrigger className="w-auto border-0 bg-transparent hover:bg-muted/50 focus:ring-0 focus:ring-offset-0 h-auto py-0 px-2 gap-2 mb-1">
                  <SelectValue>
                    <h1 className="text-xl md:text-2xl font-semibold text-balance text-foreground">
                      {selectedPresentation.title}
                    </h1>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-card/95 backdrop-blur-md border-border">
                  {presentations.map((presentation) => (
                    <SelectItem
                      key={presentation.id}
                      value={presentation.id}
                      className="text-foreground focus:bg-muted focus:text-foreground cursor-pointer"
                    >
                      <div className="flex flex-col items-start gap-1 py-1">
                        <span className="font-semibold">{presentation.title}</span>
                        <span className="text-sm text-muted-foreground">
                          {presentation.presenter} · {presentation.company}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
                <Sparkles className="w-3 h-3 text-sk-red" />
                AI 기반 종합 분석 시스템
              </p>
            </div>
          </div>

          <div className="w-[88px]" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="corporate-card p-8 rounded-lg border-2 border-sk-red/30 shadow-lg relative"
        >
          {loadingStage === "revealed" && (
            <div className="mb-8">
              <h3 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">AI 종합 분석</h3>
            </div>
          )}

          <AnimatePresence>
            {loadingStage !== "revealed" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 z-20 flex items-center justify-center backdrop-blur-md bg-black/60 rounded-lg"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-center space-y-6"
                >
                  {loadingStage === "analyzing" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      <div className="relative">
                        <Brain className="w-16 h-16 text-sk-red mx-auto animate-pulse" />
                        <motion.div
                          animate={{
                            rotate: [0, 360],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "linear",
                          }}
                          className="absolute -inset-3 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                        >
                          <Sparkles className="w-6 h-6 text-sk-red/60 absolute top-0 right-0" />
                          <Sparkles className="w-5 h-5 text-sk-red/40 absolute bottom-0 left-0" />
                        </motion.div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-2xl font-bold text-white">AI가 발표내용을 분석하는 중입니다</h4>
                        <motion.p
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                          className="text-sm text-white/70"
                        >
                          잠시만 기다려주세요...
                        </motion.p>
                      </div>
                    </motion.div>
                  )}

                  {loadingStage === "ready" && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      >
                        <Brain className="w-16 h-16 text-sk-red mx-auto" />
                      </motion.div>
                      <motion.h4
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-2xl font-bold text-white"
                      >
                        분석이 준비되었습니다
                      </motion.h4>
                    </motion.div>
                  )}

                  {loadingStage === "button" && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-6"
                    >
                      <div className="space-y-2">
                        <Brain className="w-16 h-16 text-sk-red mx-auto" />
                        <h4 className="text-2xl font-bold text-white">AI 분석 완료</h4>
                        <p className="text-sm text-white/70">발표에 대한 종합 분석이 준비되었습니다</p>
                      </div>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Button
                          onClick={handleRevealResults}
                          size="lg"
                          className="bg-sk-red hover:bg-sk-red/90 text-white px-8 py-6 text-lg font-semibold rounded-lg shadow-xl hover:shadow-2xl transition-all gap-3"
                        >
                          <Sparkles className="w-5 h-5" />
                          결과 확인하기
                        </Button>
                      </motion.div>
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative min-h-[600px]">
            {loadingStage === "revealed" && (
              <div className="space-y-10">
                {isAnalyzingImplication && analyzingLine && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-3 text-lg font-semibold text-sk-red"
                  >
                    <Brain className="w-5 h-5 animate-pulse" />
                    <span className="animate-pulse">{analyzingLine}</span>
                  </motion.div>
                )}

                {/* Strengths Section */}
                <div className="flex gap-10">
                  <div className="w-1/6 flex-shrink-0 flex items-center justify-center min-h-[140px]">
                    <h4 className="text-3xl font-bold text-foreground">잘한 점</h4>
                  </div>
                  <div className="w-5/6">
                    <div className="border-2 border-border/60 rounded-xl p-7 min-h-[140px] bg-muted/10">
                      <ul className="space-y-5">
                        {presentation.strengths.map((strength, idx) => (
                          <AnimatePresence key={idx}>
                            {visibleStrengthItems.includes(idx) && (
                              <motion.li
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className="text-lg font-medium text-foreground leading-relaxed flex items-start gap-4"
                              >
                                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-bold mt-1">
                                  {idx + 1}
                                </span>
                                <span className="flex-1 flex items-center gap-2 flex-wrap">
                                  <span>
                                    <TypewriterText
                                      text={strength.text}
                                      delay={50}
                                      onComplete={() => {
                                        setCompletedStrengthItems((prev) => [...prev, idx])
                                      }}
                                    />
                                  </span>
                                  {completedStrengthItems.includes(idx) && (
                                    <motion.span
                                      initial={{ opacity: 0, scale: 0.8 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      transition={{ duration: 0.3 }}
                                      className="flex items-center gap-2"
                                    >
                                      {strength.voiceAnalysis && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-semibold bg-foreground/90 text-background border border-foreground/30">
                                          음성분석 {strength.voiceAnalysis}
                                        </span>
                                      )}
                                      {strength.presentationMaterial && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-semibold bg-slate-200 text-slate-800 border border-slate-300">
                                          발표자료 {strength.presentationMaterial}
                                        </span>
                                      )}
                                    </motion.span>
                                  )}
                                </span>
                              </motion.li>
                            )}
                          </AnimatePresence>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Weaknesses Section */}
                <div className="flex gap-10">
                  <div className="w-1/6 flex-shrink-0 flex items-center justify-center min-h-[140px]">
                    <h4 className="text-3xl font-bold text-foreground">아쉬운 점</h4>
                  </div>
                  <div className="w-5/6">
                    <div className="border-2 border-sk-red/40 rounded-xl p-7 min-h-[140px] bg-muted/10">
                      <ul className="space-y-5">
                        {presentation.improvements.map((improvement, idx) => (
                          <AnimatePresence key={idx}>
                            {visibleWeaknessItems.includes(idx) && (
                              <motion.li
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className="text-lg font-medium text-foreground leading-relaxed flex items-start gap-4"
                              >
                                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-bold mt-1">
                                  {idx + 1}
                                </span>
                                <span className="flex-1 flex items-center gap-2 flex-wrap">
                                  <span>
                                    <TypewriterText
                                      text={improvement.text}
                                      delay={50}
                                      onComplete={() => {
                                        setCompletedWeaknessItems((prev) => [...prev, idx])
                                      }}
                                    />
                                  </span>
                                  {completedWeaknessItems.includes(idx) && (
                                    <motion.span
                                      initial={{ opacity: 0, scale: 0.8 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      transition={{ duration: 0.3 }}
                                      className="flex items-center gap-2"
                                    >
                                      {improvement.voiceAnalysis && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-semibold bg-foreground/90 text-background border border-foreground/30">
                                          음성분석 {improvement.voiceAnalysis}
                                        </span>
                                      )}
                                      {improvement.presentationMaterial && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-semibold bg-slate-200 text-slate-800 border border-slate-300">
                                          발표자료 {improvement.presentationMaterial}
                                        </span>
                                      )}
                                    </motion.span>
                                  )}
                                </span>
                              </motion.li>
                            )}
                          </AnimatePresence>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Summary Section */}
                <div className="flex gap-10">
                  <div className="w-1/6 flex-shrink-0 flex items-center justify-center min-h-[120px]">
                    <h4 className="text-3xl font-bold text-foreground">종합 의견</h4>
                  </div>
                  <div className="w-5/6">
                    <div className="border-2 border-sk-red/40 rounded-xl p-7 min-h-[120px] bg-sk-red/10">
                      <AnimatePresence>
                        {showSummary && (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="text-lg font-medium text-foreground leading-relaxed"
                          >
                            <TypewriterText
                              text={presentation.summary}
                              delay={50}
                              onComplete={() => setCompletedSummary(true)}
                            />
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {isImplicationAnalysisComplete && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 flex justify-center"
            >
              <Button
                onClick={() => router.push(`/post-presentation/evaluations?presentationId=${selectedPresentationId}`)}
                className="bg-sk-red hover:bg-sk-red/90 text-white px-6 py-3 text-base font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all gap-2"
              >
                평가 결과 보기
              </Button>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-between pt-3 border-t border-border/30"
        >
          <p className="text-xs text-muted-foreground">© 2025 SK Group. All rights reserved.</p>
          <p className="text-xs text-muted-foreground">AI 기반 발표 평가 시스템</p>
        </motion.div>
      </div>
    </div>
  )
}
