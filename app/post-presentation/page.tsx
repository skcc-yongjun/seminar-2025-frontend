"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Home, Sparkles, Brain } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { API_ENDPOINTS, fetchWithErrorHandling, type PresentationResponse, type PresentationAnalysisResponse } from "@/lib/api"

interface Presentation {
  id: string
  title: string
  presenter: string
  company: string
}

interface PresentationAnalysis {
  id: string
  title: string
  presenter: string
  company: string
  strengths: string[]
  improvements: string[]
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
  const [presentations, setPresentations] = useState<Presentation[]>([])
  const [selectedPresentationId, setSelectedPresentationId] = useState("1")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [presentation, setPresentation] = useState<PresentationAnalysis | null>(null)
  const [analysisLoading, setAnalysisLoading] = useState(true)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  
  const selectedPresentation = presentations.find((p) => p.id === selectedPresentationId) || presentations[0]

  // Fetch presentations from API
  useEffect(() => {
    const fetchPresentations = async () => {
      try {
        setLoading(true)
        const data = await fetchWithErrorHandling<PresentationResponse[]>(API_ENDPOINTS.presentations)
        setPresentations(data)
        
        // Set the first presentation as selected if no specific ID is set
        if (data.length > 0 && !selectedPresentationId) {
          setSelectedPresentationId(data[0].id)
        }
      } catch (err) {
        console.error('Error fetching presentations:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch presentations')
        
        // Fallback to hardcoded data if API fails
        const fallbackData: Presentation[] = [
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
        setPresentations(fallbackData)
      } finally {
        setLoading(false)
      }
    }

    fetchPresentations()
  }, [])

  // Fetch presentation analysis from API
  useEffect(() => {
    const fetchPresentationAnalysis = async () => {
      if (!selectedPresentationId) return
      
      try {
        setAnalysisLoading(true)
        setAnalysisError(null)
        const data = await fetchWithErrorHandling<PresentationAnalysisResponse>(
          API_ENDPOINTS.presentationAnalysis(selectedPresentationId)
        )
        setPresentation(data)
      } catch (err) {
        console.error('Error fetching presentation analysis:', err)
        setAnalysisError(err instanceof Error ? err.message : 'Failed to fetch presentation analysis')
        
        // Fallback to hardcoded data if API fails
        const fallbackAnalysis: PresentationAnalysis = {
          id: selectedPresentationId,
          title: selectedPresentation?.title || "Global Top-tier 대비 O/I 경쟁력 분석 및 개선방안",
          presenter: selectedPresentation?.presenter || "윤풍영",
          company: selectedPresentation?.company || "SK AX",
          strengths: [
            "본원의 경쟁력과 인계가 잘 되어있으며, 기존 사업과의 시너지 효과를 명확하게 제시하였습니다.",
            "전략적 방향성이 명확하고 시장 분석을 통한 차별화 포인트가 구체적으로 드러났습니다.",
            "데이터 기반 분석이 체계적이며, 정량적 지표를 활용한 현황 진단이 설득력 있게 구성되었습니다.",
          ],
          improvements: [
            "과제 목표 수준이 정량적으로 명시되지 않아 성과 측정 기준을 보다 구체화할 필요가 있습니다.",
            "명확한 수행 프로세스와 단계별 마일스톤이 드러나지 않아 실행 계획의 구체성을 보완해야 합니다.",
            "리스크 관리 방안과 대응 전략이 부족하여 예상 리스크에 대한 사전 대비책 마련이 필요합니다.",
          ],
          summary:
            "전반적으로 우수한 발표였으며, 특히 본원적 경쟁력과의 연계성이 돋보였습니다. 다만 실행 계획의 구체성을 높이고 정량적 목표를 명확히 한다면 더욱 완성도 높은 과제가 될 것으로 판단됩니다.",
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
        }
        setPresentation(fallbackAnalysis)
      } finally {
        setAnalysisLoading(false)
      }
    }

    fetchPresentationAnalysis()
  }, [selectedPresentationId, selectedPresentation])

  const [isAnalyzingImplication, setIsAnalyzingImplication] = useState(false)

  const [showAnalysis, setShowAnalysis] = useState(false)

  const [showStrengths, setShowStrengths] = useState(false)
  const [showWeaknesses, setShowWeaknesses] = useState(false)
  const [showSummary, setShowSummary] = useState(false)

  const [visibleStrengthItems, setVisibleStrengthItems] = useState<number[]>([])
  const [visibleWeaknessItems, setVisibleWeaknessItems] = useState<number[]>([])

  const [analyzingLine, setAnalyzingLine] = useState<string>("")

  const [isImplicationAnalysisComplete, setIsImplicationAnalysisComplete] = useState(false)

  const handleImplicationAnalysis = () => {
    if (isImplicationAnalysisComplete) {
      router.push(`/post-presentation/evaluations?presentationId=${selectedPresentationId}`)
      return
    }

    setIsAnalyzingImplication(true)
    setShowAnalysis(false)
    setShowStrengths(false)
    setShowWeaknesses(false)
    setShowSummary(false)
    setVisibleStrengthItems([])
    setVisibleWeaknessItems([])
    setAnalyzingLine("")

    setTimeout(() => {
      setShowAnalysis(true)
      setShowStrengths(true)
      setShowWeaknesses(true)
    }, 1500)

    setTimeout(() => {
      setAnalyzingLine("본원의 경쟁력과 인계가 잘 되어있으며, 기존 사업과의 시너지 효과를 명확하게 제시하였습니다.")
      setVisibleStrengthItems([0])
    }, 2000)

    setTimeout(() => {
      setAnalyzingLine("과제 목표 수준이 정량적으로 명시되지 않아 성과 측정 기준을 보다 구체화할 필요가 있습니다.")
      setVisibleWeaknessItems([0])
    }, 2800)

    setTimeout(() => {
      setAnalyzingLine("전략적 방향성이 명확하고 시장 분석을 통한 차별화 포인트가 구체적으로 드러났습니다.")
      setVisibleStrengthItems([0, 1])
    }, 3600)

    setTimeout(() => {
      setAnalyzingLine("명확한 수행 프로세스와 단계별 마일스톤이 드러나지 않아 실행 계획의 구체성을 보완해야 합니다.")
      setVisibleWeaknessItems([0, 1])
    }, 4400)

    setTimeout(() => {
      setAnalyzingLine("데이터 기반 분석이 체계적이며, 정량적 지표를 활용한 현황 진단이 설득력 있게 구성되었습니다.")
      setVisibleStrengthItems([0, 1, 2])
    }, 5200)

    setTimeout(() => {
      setAnalyzingLine("리스크 관리 방안과 대응 전략이 부족하여 예상 리스크에 대한 사전 대비책 마련이 필요합니다.")
      setVisibleWeaknessItems([0, 1, 2])
    }, 6000)

    setTimeout(() => {
      setAnalyzingLine("총평 작성 중...")
      setShowSummary(true)

      setTimeout(() => {
        setAnalyzingLine("")
        setIsAnalyzingImplication(false)
        setIsImplicationAnalysisComplete(true)
      }, 1500)
    }, 6800)
  }

  useEffect(() => {
    // Only start analysis when presentations are loaded, analysis is loaded, and not in loading state
    if (!loading && !analysisLoading && presentations.length > 0 && presentation) {
      handleImplicationAnalysis()
    }
  }, [loading, analysisLoading, presentations, presentation])

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
              {(loading || analysisLoading) ? (
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 animate-pulse text-sk-red" />
                  <h1 className="text-xl md:text-2xl font-semibold text-balance text-foreground">
                    {loading ? "프레젠테이션 로딩 중..." : "분석 데이터 로딩 중..."}
                  </h1>
                </div>
              ) : (error || analysisError) ? (
                <div className="text-center">
                  <h1 className="text-xl md:text-2xl font-semibold text-balance text-red-500">
                    데이터 로딩 실패
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    {error || analysisError} (로컬 데이터 사용 중)
                  </p>
                </div>
              ) : selectedPresentation ? (
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
              ) : (
                <h1 className="text-xl md:text-2xl font-semibold text-balance text-foreground">
                  프레젠테이션이 없습니다
                </h1>
              )}
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
          className="corporate-card p-10 md:p-12 rounded-lg border-2 border-sk-red/30 shadow-lg"
        >
          <div className="mb-6">
            <h3 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-sk-red" />
              AI 종합 분석
            </h3>
          </div>

          <div className="relative min-h-[550px]">
            {(!showAnalysis || analysisLoading || !presentation) ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
                <div className="relative">
                  <Brain className="w-12 h-12 text-sk-red animate-pulse" />
                  <motion.div
                    animate={{
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                    className="absolute -inset-2"
                  >
                    <Sparkles className="w-6 h-6 text-sk-red/60 absolute top-0 right-0" />
                    <Sparkles className="w-5 h-5 text-sk-red/40 absolute bottom-0 left-0" />
                  </motion.div>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-base font-semibold text-foreground">
                    {analysisLoading ? "분석 데이터를 불러오는 중입니다" : "AI가 발표내용을 분석하는 중입니다"}
                  </p>
                  <motion.p
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                    className="text-sm text-muted-foreground"
                  >
                    잠시만 기다려주세요...
                  </motion.p>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {isAnalyzingImplication && analyzingLine && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-3 text-base text-sk-red"
                  >
                    <Brain className="w-4 h-4 animate-pulse" />
                    <span className="animate-pulse">{analyzingLine}</span>
                  </motion.div>
                )}

                {/* Strengths Section */}
                <div className="flex gap-8">
                  <div className="w-1/5 flex-shrink-0 flex items-center justify-center min-h-[140px]">
                    <h4 className="text-2xl font-bold text-foreground">강점</h4>
                  </div>
                  <div className="w-4/5">
                    <div className="border-2 border-border/50 rounded-lg p-6 min-h-[140px] bg-muted/5">
                      <ul className="space-y-3">
                        {presentation?.strengths.map((strength, idx) => (
                          <AnimatePresence key={idx}>
                            {visibleStrengthItems.includes(idx) && (
                              <motion.li
                                initial={{ opacity: 0, x: -10, filter: "blur(8px)" }}
                                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                                transition={{ duration: 0.7, ease: "easeOut" }}
                                className="text-base text-muted-foreground leading-relaxed"
                              >
                                • {strength}
                              </motion.li>
                            )}
                          </AnimatePresence>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Weaknesses Section */}
                <div className="flex gap-8">
                  <div className="w-1/5 flex-shrink-0 flex items-center justify-center min-h-[140px]">
                    <h4 className="text-2xl font-bold text-foreground">약점</h4>
                  </div>
                  <div className="w-4/5">
                    <div className="border-2 border-border/50 rounded-lg p-6 min-h-[140px] bg-muted/5">
                      <ul className="space-y-3">
                        {presentation?.improvements.map((improvement, idx) => (
                          <AnimatePresence key={idx}>
                            {visibleWeaknessItems.includes(idx) && (
                              <motion.li
                                initial={{ opacity: 0, x: -10, filter: "blur(8px)" }}
                                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                                transition={{ duration: 0.7, ease: "easeOut" }}
                                className="text-base text-muted-foreground leading-relaxed"
                              >
                                • {improvement}
                              </motion.li>
                            )}
                          </AnimatePresence>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Summary Section */}
                <div className="flex gap-8">
                  <div className="w-1/5 flex-shrink-0 flex items-center justify-center min-h-[140px]">
                    <h4 className="text-2xl font-bold text-foreground">총평</h4>
                  </div>
                  <div className="w-4/5">
                    <div className="border-2 border-sk-red/30 rounded-lg p-6 min-h-[140px] bg-sk-red/5">
                      <AnimatePresence>
                        {showSummary && (
                          <motion.p
                            initial={{ opacity: 0, filter: "blur(5px)" }}
                            animate={{ opacity: 1, filter: "blur(0px)" }}
                            transition={{ duration: 1 }}
                            className="text-base text-muted-foreground leading-relaxed"
                          >
                            {presentation?.summary}
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
              className="mt-8 flex justify-center"
            >
              <Button
                onClick={() => router.push(`/post-presentation/evaluations?presentationId=${selectedPresentationId}`)}
                className="bg-sk-red hover:bg-sk-red/90 text-white px-6 py-3 text-base font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all gap-2"
              >
                <Sparkles className="w-4 h-4" />
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
