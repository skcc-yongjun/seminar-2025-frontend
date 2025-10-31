"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, Sparkles, Lightbulb, Calculator, Users, Loader2, Clock, CheckCircle, Play, Pause, AlertCircle, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RefreshButton } from "@/components/ui/refresh-button"
import { useState, useEffect } from "react"
import { 
  fetchPresentations, 
  fetchPresenters,
  generateAIEvaluation,
  calculatePresentationSummary,
  fetchEvaluatorCount,
  fetchPresentation,
  fetchAIEvaluationScores,
  type PresentationResponse,
  type PresenterResponse,
  type EvaluatorCountResponse,
  type AIEvaluationScoreResponse
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
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isRefreshingStatus, setIsRefreshingStatus] = useState(false)
  const [currentPresentation, setCurrentPresentation] = useState<PresentationResponse | null>(null)
  const [aiScores, setAiScores] = useState<AIEvaluationScoreResponse[]>([])
  const [isLoadingAiScores, setIsLoadingAiScores] = useState(false)
  const { toast } = useToast()

  // 발표 목록 로드
  useEffect(() => {
    loadPresentations()
  }, [])

  // 선택된 발표의 평가 인원 수 조회, 발표 상태 조회, AI 점수 조회
  useEffect(() => {
    if (selectedPresentation) {
      loadEvaluatorCount()
      loadCurrentPresentation()
      loadAIScores()
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

  const loadCurrentPresentation = async () => {
    if (!selectedPresentation) return
    
    try {
      const presentation = await fetchPresentation(selectedPresentation)
      setCurrentPresentation(presentation)
    } catch (error) {
      console.error("발표 상태 조회 실패:", error)
    }
  }

  const handleRefreshStatusOnly = async () => {
    if (!selectedPresentation) return
    try {
      setIsRefreshingStatus(true)
      await loadCurrentPresentation()
    } catch (error) {
      console.error("발표 상태 새로고침 실패:", error)
    } finally {
      setIsRefreshingStatus(false)
    }
  }

  const loadAIScores = async () => {
    if (!selectedPresentation) return
    
    try {
      setIsLoadingAiScores(true)
      const scores = await fetchAIEvaluationScores(selectedPresentation)
      setAiScores(scores)
    } catch (error) {
      console.error("AI 점수 조회 실패:", error)
      setAiScores([])
    } finally {
      setIsLoadingAiScores(false)
    }
  }

  const handleRefreshEvaluatorCount = async () => {
    if (!selectedPresentation) return
    
    try {
      setIsRefreshing(true)
      await Promise.all([
        loadEvaluatorCount(),
        loadCurrentPresentation(),
        loadAIScores()
      ])
    } catch (error) {
      console.error("새로고침 실패:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleRefreshAIScores = async () => {
    if (!selectedPresentation) return
    
    try {
      setIsLoadingAiScores(true)
      await loadAIScores()
    } catch (error) {
      console.error("AI 점수 새로고침 실패:", error)
    }
  }

  const handleGenerateScore = async () => {
    if (!window.confirm("AI 점수를 생성하시겠습니까?\n처리 시간이 10~30초 정도 소요될 수 있습니다.")) {
      return
    }

    try {
      setIsGeneratingScore(true)
      const result = await generateAIEvaluation(selectedPresentation)
      
      // AI 점수 생성 후 점수 목록 새로고침
      await loadAIScores()
      
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

  const getStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
      case '대기중':
      case 'waiting':
        return {
          icon: Clock,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          label: '대기중'
        }
      case '진행중':
      case 'in_progress':
      case 'in-progress':
        return {
          icon: Play,
          color: 'text-blue-500',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
          label: '진행중'
        }
      case '완료':
      case 'completed':
      case 'finished':
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          label: '완료'
        }
      case '일시정지':
      case 'paused':
        return {
          icon: Pause,
          color: 'text-orange-500',
          bgColor: 'bg-orange-50 dark:bg-orange-900/20',
          borderColor: 'border-orange-200 dark:border-orange-800',
          label: '일시정지'
        }
      case '오류':
      case 'error':
      case 'failed':
        return {
          icon: AlertCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          label: '오류'
        }
      default:
        return {
          icon: Clock,
          color: 'text-gray-500',
          bgColor: 'bg-gray-50 dark:bg-gray-900/20',
          borderColor: 'border-gray-200 dark:border-gray-800',
          label: status || '알 수 없음'
        }
    }
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
                <SelectTrigger className="w-full bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                  <SelectValue placeholder="발표를 선택하세요" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-xl backdrop-blur-none">
                  {presentations.map((presentation) => (
                    <SelectItem 
                      key={presentation.presentation_id} 
                      value={presentation.presentation_id} 
                      className="bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 cursor-pointer"
                    >
                      {getPresentationName(presentation.presentation_id)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </motion.div>

        {/* Presentation Status */}
        {currentPresentation && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div className="corporate-card rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${getStatusInfo(currentPresentation.status).bgColor} rounded-lg flex items-center justify-center border ${getStatusInfo(currentPresentation.status).borderColor}`}>
                    {(() => {
                      const StatusIcon = getStatusInfo(currentPresentation.status).icon
                      return <StatusIcon className={`w-6 h-6 ${getStatusInfo(currentPresentation.status).color}`} />
                    })()}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">발표 상태</h3>
                    <p className="text-sm text-muted-foreground">현재 선택된 발표의 진행 상태</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <RefreshButton
                    onRefresh={handleRefreshStatusOnly}
                    isRefreshing={isRefreshingStatus}
                    autoRefreshInterval={8000}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div />
                <div className="text-right">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${getStatusInfo(currentPresentation.status).bgColor} border ${getStatusInfo(currentPresentation.status).borderColor}`}>
                    {(() => {
                      const StatusIcon = getStatusInfo(currentPresentation.status).icon
                      return <StatusIcon className={`w-4 h-4 ${getStatusInfo(currentPresentation.status).color}`} />
                    })()}
                    <span className={`font-medium ${getStatusInfo(currentPresentation.status).color}`}>
                      {getStatusInfo(currentPresentation.status).label}
                    </span>
                  </div>
                  {currentPresentation.start_time && (
                    <p className="text-xs text-muted-foreground mt-1">
                      시작: {new Date(currentPresentation.start_time).toLocaleString('ko-KR')}
                    </p>
                  )}
                  {currentPresentation.end_time && (
                    <p className="text-xs text-muted-foreground">
                      종료: {new Date(currentPresentation.end_time).toLocaleString('ko-KR')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Operation Buttons */}
        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="corporate-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">AI 점수 생성</h3>
                    <p className="text-sm text-muted-foreground">문제 발생 시 AI 점수를 재생성합니다</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <RefreshButton
                    onRefresh={handleRefreshAIScores}
                    isRefreshing={isLoadingAiScores}
                    autoRefreshInterval={10000}
                  />
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
              
              {/* AI 점수 표시 */}
              {isLoadingAiScores ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                  <span className="ml-2 text-sm text-muted-foreground">AI 점수 로딩 중...</span>
                </div>
              ) : aiScores.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-foreground mb-2">현재 AI 점수</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {aiScores.map((score, index) => (
                      <div
                        key={`${score.score_id}-${index}`}
                        className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3"
                      >
                        <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
                          {score.category}
                        </div>
                        <div className="text-lg font-bold text-blue-700 dark:text-blue-300">
                          {typeof score.score === 'string' ? parseFloat(score.score).toFixed(1) : score.score.toFixed(1)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(score.evaluated_at).toLocaleString('ko-KR', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-sm text-muted-foreground">
                    AI 점수가 생성되지 않았습니다.
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    "생성" 버튼을 눌러 AI 점수를 생성해보세요.
                  </div>
                </div>
              )}
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
                    <h3 className="text-lg font-semibold text-foreground mb-1">투표 강제 종료 및 총점 계산</h3>
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
                <div className="flex items-center gap-4">
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
                  <RefreshButton
                    onRefresh={handleRefreshEvaluatorCount}
                    isRefreshing={isRefreshing}
                    autoRefreshInterval={5000}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <div className="corporate-card rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">AI 정성평가 관리</h3>
                    <p className="text-sm text-muted-foreground">AI 코멘트를 조회하고 관리합니다</p>
                  </div>
                </div>
                <Link href="/operation/session1/qualitative-evaluation">
                  <Button className="bg-purple-500 hover:bg-purple-600">
                    관리하기
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
