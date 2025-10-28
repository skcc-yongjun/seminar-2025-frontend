"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, Sparkles, Lightbulb, Calculator, Users, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { 
  fetchPresentations, 
  fetchPresenters,
  generateAIEvaluation,
  calculatePresentationSummary,
  fetchEvaluatorCount,
  type PresentationResponse,
  type PresenterResponse,
  type EvaluatorCountResponse
} from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function Session1OperationPage() {
  const [selectedPresentation, setSelectedPresentation] = useState("")
  const [presentations, setPresentations] = useState<PresentationResponse[]>([])
  const [presenters, setPresenters] = useState<PresenterResponse[]>([])
  const [evaluatorCount, setEvaluatorCount] = useState<EvaluatorCountResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGeneratingScore, setIsGeneratingScore] = useState(false)
  const [isGeneratingImplication, setIsGeneratingImplication] = useState(false)
  const [isGeneratingTotal, setIsGeneratingTotal] = useState(false)
  const { toast } = useToast()

  // 발표 목록 로드
  useEffect(() => {
    loadPresentations()
  }, [])

  // 선택된 발표의 평가 인원 수 조회 (5초마다 갱신)
  useEffect(() => {
    if (selectedPresentation) {
      loadEvaluatorCount()
      const interval = setInterval(loadEvaluatorCount, 5000)
      return () => clearInterval(interval)
    }
  }, [selectedPresentation])

  const loadPresentations = async () => {
    try {
      setIsLoading(true)
      const [presentationsData, presentersData] = await Promise.all([
        fetchPresentations("세션1"),
        fetchPresenters(),
      ])
      setPresentations(presentationsData)
      setPresenters(presentersData)
      
      // 첫 번째 발표 자동 선택
      if (presentationsData.length > 0) {
        setSelectedPresentation(presentationsData[0].presentation_id)
      }
    } catch (error) {
      console.error("발표 목록 조회 실패:", error)
      toast({
        variant: "destructive",
        title: "오류",
        description: "발표 목록을 불러오는데 실패했습니다.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadEvaluatorCount = async () => {
    if (!selectedPresentation) return
    
    try {
      const count = await fetchEvaluatorCount(selectedPresentation)
      setEvaluatorCount(count)
    } catch (error) {
      console.error("평가 인원 조회 실패:", error)
    }
  }

  const handleGenerateScore = async () => {
    if (!window.confirm("AI 점수를 생성하시겠습니까?\n처리 시간이 10~30초 정도 소요될 수 있습니다.")) {
      return
    }

    try {
      setIsGeneratingScore(true)
      const result = await generateAIEvaluation(selectedPresentation)
      
      toast({
        title: "성공",
        description: `AI 평가가 완료되었습니다. (이미지: ${result.image_count}개, STT: ${result.transcript_count}개, 피드백: ${result.feedback_count}개, 점수: ${result.score_count}개, 소요시간: ${result.evaluation_time.toFixed(1)}초)`,
      })
    } catch (error) {
      console.error("AI 점수 생성 실패:", error)
      toast({
        variant: "destructive",
        title: "오류",
        description: error instanceof Error ? error.message : "AI 점수 생성에 실패했습니다.",
      })
    } finally {
      setIsGeneratingScore(false)
    }
  }

  const handleGenerateImplication = async () => {
    if (!window.confirm("Implication을 생성하시겠습니까?")) {
      return
    }

    try {
      setIsGeneratingImplication(true)
      // TODO: Implication 생성 API 연동 (백엔드 팀 확인 필요)
      toast({
        variant: "destructive",
        title: "알림",
        description: "Implication 생성 기능은 백엔드 API 확인이 필요합니다.",
      })
    } catch (error) {
      console.error("Implication 생성 실패:", error)
      toast({
        variant: "destructive",
        title: "오류",
        description: error instanceof Error ? error.message : "Implication 생성에 실패했습니다.",
      })
    } finally {
      setIsGeneratingImplication(false)
    }
  }

  const handleGenerateTotalScore = async () => {
    if (!window.confirm("총점을 생성하시겠습니까?")) {
      return
    }

    try {
      setIsGeneratingTotal(true)
      const result = await calculatePresentationSummary(selectedPresentation)
      
      toast({
        title: "성공",
        description: `총점 계산이 완료되었습니다. (총점: ${result.total_score.toFixed(2)}, AI: ${result.ai_score.toFixed(2)}, 휴먼: ${result.human_score.toFixed(2)})`,
      })
    } catch (error) {
      console.error("총점 생성 실패:", error)
      toast({
        variant: "destructive",
        title: "오류",
        description: error instanceof Error ? error.message : "총점 생성에 실패했습니다.",
      })
    } finally {
      setIsGeneratingTotal(false)
    }
  }

  const getPresentationName = (presentationId: string): string => {
    const presentation = presentations.find(p => p.presentation_id === presentationId)
    if (!presentation) return presentationId
    
    const presenter = presenters.find(p => p.presenter_id === presentation.presenter_id)
    return `${presentation.topic} - ${presenter?.name || '알 수 없음'}`
  }

  return (
    <div className="min-h-screen p-4 md:p-6 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sk-red/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sk-red/3 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-sk-red transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>돌아가기</span>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Session 1 Operation</h1>
          <p className="text-muted-foreground">Session 1 운영 관리 화면</p>
        </motion.div>

        {/* Presentation Selector */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="corporate-card rounded-xl p-6 mb-6">
            <label className="text-sm font-medium text-foreground mb-3 block">발표 선택</label>
            {isLoading ? (
              <div className="flex items-center justify-center py-3">
                <Loader2 className="w-5 h-5 animate-spin text-sk-red" />
              </div>
            ) : presentations.length === 0 ? (
              <div className="text-sm text-muted-foreground py-3 text-center">
                세션1 발표가 없습니다.
              </div>
            ) : (
              <Select value={selectedPresentation} onValueChange={setSelectedPresentation}>
                <SelectTrigger className="w-full bg-background border-input">
                  <SelectValue placeholder="발표를 선택하세요" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border shadow-lg">
                  {presentations.map((presentation) => (
                    <SelectItem key={presentation.presentation_id} value={presentation.presentation_id} className="bg-background hover:bg-accent">
                      {getPresentationName(presentation.presentation_id)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </motion.div>

        {/* Operation Buttons */}
        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="corporate-card rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">AI 점수 생성</h3>
                    <p className="text-sm text-muted-foreground">문제 발생 시 AI 점수를 재생성합니다</p>
                  </div>
                </div>
                <Button
                  onClick={handleGenerateScore}
                  disabled={!selectedPresentation || isGeneratingScore}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  {isGeneratingScore ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      생성 중...
                    </>
                  ) : (
                    "생성"
                  )}
                </Button>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="corporate-card rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                    <Lightbulb className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">Implication 생성</h3>
                    <p className="text-sm text-muted-foreground">문제 발생 시 또는 중간 시점에 생성 가능</p>
                  </div>
                </div>
                <Button
                  onClick={handleGenerateImplication}
                  disabled={!selectedPresentation || isGeneratingImplication}
                  className="bg-purple-500 hover:bg-purple-600"
                >
                  {isGeneratingImplication ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      생성 중...
                    </>
                  ) : (
                    "생성"
                  )}
                </Button>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <div className="corporate-card rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <Calculator className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">총점 생성</h3>
                    <p className="text-sm text-muted-foreground">문제 발생 시 총점을 재생성합니다</p>
                  </div>
                </div>
                <Button
                  onClick={handleGenerateTotalScore}
                  disabled={!selectedPresentation || isGeneratingTotal}
                  className="bg-green-500 hover:bg-green-600"
                >
                  {isGeneratingTotal ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      생성 중...
                    </>
                  ) : (
                    "생성"
                  )}
                </Button>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <div className="corporate-card rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-sk-red/10 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-sk-red" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-1">휴먼 평가 완료 인원</h3>
                  <p className="text-sm text-muted-foreground">평가 완료 인원을 확인합니다</p>
                </div>
                <div className="text-right">
                  {evaluatorCount ? (
                    <>
                      <p className="text-2xl font-bold text-sk-red">
                        {evaluatorCount.evaluator_count} / {evaluatorCount.total_evaluator_count}
                      </p>
                      <p className="text-xs text-muted-foreground">완료 / 총원</p>
                    </>
                  ) : (
                    <Loader2 className="w-6 h-6 animate-spin text-sk-red" />
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
