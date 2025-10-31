"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, Edit, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import {
  fetchPrompts,
  fetchPresentations,
  fetchPresenters,
  createPrompt,
  updatePrompt,
  deletePrompt,
  postPromptTest,
  type PromptResponse,
  type PresentationResponse,
  type PresenterResponse,
  type PromptTestResponse,
} from "@/lib/api"

export default function PromptsPage() {
  // 상태 관리
  const [prompts, setPrompts] = useState<PromptResponse[]>([])
  const [allPrompts, setAllPrompts] = useState<PromptResponse[]>([]) // 전체 프롬프트 목록
  const [presentations, setPresentations] = useState<PresentationResponse[]>([])
  const [presenters, setPresenters] = useState<PresenterResponse[]>([])
  const [selectedSession, setSelectedSession] = useState<string | null>(null) // 선택된 세션 ("세션1", "세션2", "패널토의")
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<PromptResponse | null>(null)
  const [formData, setFormData] = useState<{
    presentation_id: string
    prompt_type: 'AI 평가' | '질문 생성'
    content: string
  }>({
    presentation_id: "",
    prompt_type: "AI 평가",
    content: "",
  })
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<PromptTestResponse | null>(null)
  const [testError, setTestError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>("raw")

  // 프롬프트 테스트 (DB 저장 없음)
  const handlePromptTest = async () => {
    if (!formData.presentation_id) {
      toast({
        variant: "destructive",
        title: "입력 오류",
        description: "발표를 선택하세요.",
      })
      return
    }
    
    setIsTesting(true)
    setTestResult(null)
    setTestError(null)
    
    try {
      const result = await postPromptTest({
        presentation_id: formData.presentation_id,
        prompt_override: formData.content,
        count: 6,
      })
      setTestResult(result)
    } catch (err: any) {
      setTestError(err?.message || "테스트 실패")
    } finally {
      setIsTesting(false)
    }
  }

  /**
   * 초기 데이터 로드
   * 프롬프트 목록, 발표 목록, 발표자 목록을 동시에 조회
   */
  useEffect(() => {
    loadData()
  }, [])

  /**
   * 선택된 세션이 변경되면 프롬프트 필터링
   */
  useEffect(() => {
    if (!selectedSession) {
      setPrompts([])
      return
    }
    
    // 선택된 세션의 모든 발표의 프롬프트
    const sessionPresentationIds = presentations
      .filter((p) => p.session_type === selectedSession)
      .map((p) => p.presentation_id)
    
    const filteredPrompts = allPrompts.filter((prompt) => 
      prompt.presentation_id && sessionPresentationIds.includes(prompt.presentation_id)
    )
    setPrompts(filteredPrompts)
  }, [selectedSession, allPrompts, presentations])

  /**
   * 프롬프트, 발표, 발표자 데이터 로드
   */
  const loadData = async () => {
    try {
      setIsLoading(true)
      const [promptsData, presentationsData, presentersData] = await Promise.all([
        fetchPrompts(),
        fetchPresentations(),
        fetchPresenters(),
      ])
      setAllPrompts(promptsData)
      setPresentations(presentationsData)
      setPresenters(presentersData)
      
      // 초기 선택: 첫 번째 세션으로 시작
      const availableSessions = Array.from(new Set(presentationsData.map((p) => p.session_type))).sort()
      if (availableSessions.length > 0) {
        setSelectedSession(availableSessions[0])
      }
    } catch (error) {
      console.error("데이터 조회 실패:", error)
      toast({
        variant: "destructive",
        title: "오류",
        description: "데이터를 불러오는데 실패했습니다.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 프롬프트 추가 다이얼로그 열기
   */
  const handleAdd = () => {
    setEditingPrompt(null)
    setFormData({
      presentation_id: "",
      prompt_type: "AI 평가",
      content: "",
    })
    setIsDialogOpen(true)
  }

  /**
   * 프롬프트 수정 다이얼로그 열기
   * @param prompt 수정할 프롬프트
   */
  const handleEdit = (prompt: PromptResponse) => {
    setEditingPrompt(prompt)
    setFormData({
      presentation_id: prompt.presentation_id || "",
      prompt_type: prompt.prompt_type,
      content: prompt.content,
    })
    setIsDialogOpen(true)
  }

  /**
   * 프롬프트 삭제
   * @param promptId 프롬프트 ID
   */
  const handleDelete = async (promptId: string) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) {
      return
    }

    try {
      await deletePrompt(promptId)
      toast({
        title: "성공",
        description: "프롬프트가 삭제되었습니다.",
      })
      // 목록 다시 로드
      await loadData()
    } catch (error) {
      console.error("프롬프트 삭제 실패:", error)
      toast({
        variant: "destructive",
        title: "오류",
        description: "프롬프트 삭제에 실패했습니다.",
      })
    }
  }

  /**
   * 프롬프트 저장 (생성 또는 수정)
   */
  const handleSave = async () => {
    // 입력값 검증
    if (!formData.prompt_type || !formData.content) {
      toast({
        variant: "destructive",
        title: "입력 오류",
        description: "타입과 내용은 필수 입력 항목입니다.",
      })
      return
    }

    try {
      setIsSaving(true)

      if (editingPrompt) {
        // 기존 프롬프트 수정
        await updatePrompt(editingPrompt.prompt_id, {
          prompt_type: formData.prompt_type,
          content: formData.content,
          presentation_id: formData.presentation_id || undefined,
        })
        toast({
          title: "성공",
          description: "프롬프트 정보가 수정되었습니다.",
        })
      } else {
        // 새 프롬프트 생성
        await createPrompt({
          prompt_type: formData.prompt_type,
          content: formData.content,
          presentation_id: formData.presentation_id || undefined,
        })
        toast({
          title: "성공",
          description: "새 프롬프트가 추가되었습니다.",
        })
      }

      // 다이얼로그 닫기 및 폼 초기화
      setIsDialogOpen(false)
      setFormData({
        presentation_id: "",
        prompt_type: "AI 평가",
        content: "",
      })

      // 목록 다시 로드
      await loadData()
    } catch (error) {
      console.error("프롬프트 저장 실패:", error)
      toast({
        variant: "destructive",
        title: "오류",
        description: editingPrompt
          ? "프롬프트 수정에 실패했습니다."
          : "프롬프트 추가에 실패했습니다.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  /**
   * 발표 ID로 발표 제목, 발표자, 회사 정보 찾기
   * @param presentationId 발표 ID
   * @returns 발표 정보 문자열
   */
  const getPresentationTitle = (presentationId?: string): string => {
    if (!presentationId) return "공통"
    const presentation = presentations.find((p) => p.presentation_id === presentationId)
    if (!presentation) return presentationId
    
    const presenter = presenters.find((p) => p.presenter_id === presentation.presenter_id)
    if (presenter) {
      return `[${presentation.session_type}] ${presentation.topic} - ${presenter.name} (${presenter.company})`
    }
    return `[${presentation.session_type}] ${presentation.topic}`
  }

  /**
   * 프롬프트 타입별 색상 반환
   * @param type 프롬프트 타입
   * @returns 색상 클래스
   */
  const getTypeColor = (type: string) => {
    switch (type) {
      case "AI 평가":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "질문 생성":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  /**
   * 세션 선택
   * @param session 세션 타입 ("세션1", "세션2", "패널토의")
   */
  const handleSelectSession = (session: string) => {
    setSelectedSession(session)
  }

  /**
   * 세션별 프롬프트 개수 조회
   * @param session 세션 타입 ("세션1", "세션2", "패널토의")
   * @returns 프롬프트 개수
   */
  const getPromptCountBySession = (session: string): number => {
    // 해당 세션의 모든 발표의 프롬프트 개수
    const sessionPresentationIds = presentations
      .filter((p) => p.session_type === session)
      .map((p) => p.presentation_id)
    
    return allPrompts.filter((prompt) => 
      prompt.presentation_id && sessionPresentationIds.includes(prompt.presentation_id)
    ).length
  }

  /**
   * 사용 가능한 세션 목록 조회
   * @returns 세션 타입 배열
   */
  const getAvailableSessions = (): string[] => {
    const sessions = new Set(presentations.map((p) => p.session_type))
    return Array.from(sessions).sort()
  }

  return (
    <div className="min-h-screen p-4 md:p-6 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sk-red/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sk-red/3 rounded-full blur-3xl" />
      </div>

      <div className="max-w-[1600px] mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link
            href="/operation/common"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-sk-red transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>돌아가기</span>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">프롬프트 관리</h1>
              <p className="text-muted-foreground">AI 프롬프트를 관리합니다</p>
            </div>
          </div>
        </motion.div>

        {/* 로딩 상태 표시 */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-sk-red" />
          </div>
        ) : (
          <div className="grid grid-cols-[320px_1fr] gap-6">
            {/* 왼쪽: 세션 리스트 */}
            <div className="space-y-3">
              <div className="corporate-card rounded-xl p-4">
                <h2 className="text-lg font-semibold text-foreground mb-4">세션 목록</h2>
                <div className="space-y-2">
                  {/* 각 세션별 프롬프트 */}
                  {getAvailableSessions().length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      등록된 세션이 없습니다.
                    </p>
                  ) : (
                    getAvailableSessions().map((session) => {
                      const promptCount = getPromptCountBySession(session)
                      const isSelected = selectedSession === session
                      const sessionPresentations = presentations.filter((p) => p.session_type === session)
                      
                      return (
                        <button
                          key={session}
                          onClick={() => handleSelectSession(session)}
                          className={`w-full text-left p-3 rounded-lg transition-all ${
                            isSelected
                              ? "bg-sk-red/20 border-2 border-sk-red"
                              : "bg-card/50 border-2 border-transparent hover:border-sk-red/30"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium truncate ${
                                isSelected ? "text-sk-red" : "text-foreground"
                              }`}>
                                {session}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                발표 {sessionPresentations.length}개
                              </p>
                            </div>
                            <Badge 
                              variant="outline" 
                              className={`shrink-0 ${
                                isSelected 
                                  ? "bg-sk-red text-white border-sk-red" 
                                  : "bg-muted"
                              }`}
                            >
                              {promptCount}개
                            </Badge>
                          </div>
                        </button>
                      )
                    })
                  )}
                </div>
              </div>
            </div>

            {/* 오른쪽: 선택된 세션의 프롬프트 목록 */}
            <div>
              {!selectedSession ? (
                <div className="corporate-card rounded-xl p-12 text-center">
                  <p className="text-muted-foreground">왼쪽에서 세션을 선택해주세요.</p>
                </div>
              ) : prompts.length === 0 ? (
                <div className="corporate-card rounded-xl p-12 text-center">
                  <p className="text-muted-foreground mb-4">
                    {selectedSession}에 등록된 프롬프트가 없습니다.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {prompts.map((prompt, index) => {
                    // 프롬프트가 속한 발표 정보 찾기
                    const presentation = prompt.presentation_id 
                      ? presentations.find((p) => p.presentation_id === prompt.presentation_id)
                      : null
                    const presenter = presentation
                      ? presenters.find((p) => p.presenter_id === presentation.presenter_id)
                      : null
                    
                    return (
                      <motion.div
                        key={prompt.prompt_id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * index }}
                      >
                        <div className="corporate-card rounded-xl p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <Badge variant="outline" className={getTypeColor(prompt.prompt_type)}>
                                  {prompt.prompt_type}
                                </Badge>
                                {/* 발표 정보 표시 */}
                                {presentation && (
                                  <Badge variant="outline" className="border-sk-red/30 text-sk-red text-xs">
                                    {presentation.topic}
                                    {presenter && ` - ${presenter.name}`}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-3">{prompt.content}</p>
                              <p className="text-xs text-muted-foreground/60 mt-2">ID: {prompt.prompt_id}</p>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button
                                onClick={() => handleEdit(prompt)}
                                variant="outline"
                                size="sm"
                                disabled={isSaving}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <>
        <style>{`
          /* Dialog 오버레이 불투명하게 */
          [data-slot="dialog-overlay"] {
            background-color: rgba(0, 0, 0, 0.85) !important;
            backdrop-filter: blur(8px) !important;
          }
          
          /* Dialog 콘텐츠 크기 확대 및 배경색 수정 */
          [data-slot="dialog-content"] {
            width: 1400px !important;
            max-width: 90vw !important;
            max-height: 85vh !important;
            background-color: hsl(var(--background)) !important;
          }
        `}</style>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setTestResult(null);
            setTestError(null);
            setActiveTab("raw");
          }
        }} modal={true}>
          <DialogContent 
            className="bg-background dark:bg-background backdrop-blur-none border-2 border-border shadow-2xl max-w-[100vw] w-full min-w-0 max-h-[90vh]"
            showCloseButton={true}
          >
          <DialogHeader className="pb-4">
            <DialogTitle className="text-2xl">{editingPrompt ? "프롬프트 수정" : "프롬프트 추가"}</DialogTitle>
            <DialogDescription className="text-base">프롬프트 정보를 입력해주세요.</DialogDescription>
          </DialogHeader>
          <div
            className="flex flex-row gap-6 py-4 min-h-[500px] max-h-[60vh] h-[60vh] w-full min-w-0 overflow-x-auto"
            style={{flexWrap: 'nowrap'}}
          >
              {/* 좌측 컬럼 - 발표 및 타입 선택 */}
              <div className="space-y-6 overflow-y-auto min-w-[220px] max-w-[350px] flex-shrink-0 flex-grow-0" style={{minWidth:220, maxWidth:350}}>
              <div className="space-y-3">
                <Label htmlFor="presentation" className="text-base font-semibold">발표</Label>
                <Select
                  value={formData.presentation_id || "__none__"}
                  onValueChange={(value) => 
                    setFormData({ ...formData, presentation_id: value === "__none__" ? "" : value })
                  }
                  disabled={true}
                >
                  <SelectTrigger className="h-11 bg-muted">
                    <SelectValue placeholder="발표 선택" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="__none__">공통 (발표 없음)</SelectItem>
                    {presentations.map((presentation) => {
                      const presenter = presenters.find(p => p.presenter_id === presentation.presenter_id)
                      return (
                        <SelectItem key={presentation.presentation_id} value={presentation.presentation_id}>
                          [{presentation.session_type}] {presentation.topic} - {presenter?.name} ({presenter?.company})
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
                {formData.presentation_id && formData.presentation_id !== "__none__" && (
                  <div className="text-sm text-muted-foreground space-y-1 p-3 bg-muted/50 rounded-md">
                    {(() => {
                      const presentation = presentations.find(p => p.presentation_id === formData.presentation_id)
                      const presenter = presentation ? presenters.find(p => p.presenter_id === presentation.presenter_id) : null
                      return (
                        <>
                          <p><strong>발표:</strong> {presentation?.topic}</p>
                          <p><strong>세션:</strong> {presentation?.session_type}</p>
                          <p><strong>발표자:</strong> {presenter?.name} ({presenter?.company})</p>
                        </>
                      )
                    })()}
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <Label htmlFor="type" className="text-base font-semibold">타입</Label>
                <Select
                  value={formData.prompt_type}
                  onValueChange={(value: 'AI 평가' | '질문 생성') =>
                    setFormData({ ...formData, prompt_type: value })
                  }
                  disabled={true}
                >
                  <SelectTrigger className="h-11 bg-muted">
                    <SelectValue placeholder="타입 선택" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    <SelectItem value="AI 평가">AI 평가</SelectItem>
                    <SelectItem value="질문 생성">질문 생성</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 우측 컬럼 - 내용 입력 */}
            <div className="space-y-3 flex flex-col min-w-[350px] max-w-[600px] flex-shrink-0 flex-grow-0" style={{minWidth:350, maxWidth:600}}>
              <Label htmlFor="content" className="text-base font-semibold">프롬프트 내용</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault()
                    handleSave()
                  }
                }}
                placeholder="프롬프트 내용을 입력하세요&#10;&#10;예시:&#10;- AI 평가: 발표 내용의 기술적 정확성과 혁신성을 평가해주세요...&#10;- 질문 생성: 발표 내용을 바탕으로 심화 질문을 생성해주세요..."
                disabled={isSaving}
                className="flex-1 min-h-0 resize-none overflow-y-auto font-mono text-sm leading-relaxed bg-background w-full max-w-full"
                style={{height: '100%', maxHeight: 'calc(60vh - 100px)', minWidth:0, overflowX:'auto'}}
              />
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {formData.content.length}자 입력됨
                </p>
                <p className="text-xs text-muted-foreground">
                  Ctrl+Enter로 저장
                </p>
              </div>
              <div className="flex gap-2 w-full mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)} 
                  disabled={isSaving || isTesting}
                  className="h-11 px-8"
                >
                  취소
                </Button>
                <Button 
                  onClick={handleSave} 
                  className="bg-sk-red hover:bg-sk-red/90 h-11 px-8" 
                  disabled={isSaving || isTesting}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      저장 중...
                    </>
                  ) : (
                    "저장"
                  )}
                </Button>
                <Button
                  onClick={handlePromptTest}
                  className="bg-green-600 hover:bg-green-700 h-11 px-8"
                  disabled={isTesting || isSaving || !formData.presentation_id}
                  type="button"
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      테스트 중...
                    </>
                  ) : (
                    "테스트 (DB 저장 안함)"
                  )}
                </Button>
              </div>
            </div>

            {/* 우측 컬럼 - 테스트 결과 */}
            <div className="flex flex-col min-w-[350px] max-w-[600px] max-h-full bg-muted/30 rounded-md border p-4 flex-shrink-0 flex-grow-0" style={{minWidth:350, maxWidth:600}}>
              <div className="font-bold mb-3 text-green-700 flex items-center gap-2">
                테스트 결과
                {isTesting && <Loader2 className="w-4 h-4 animate-spin" />}
              </div>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col min-h-0">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="raw">RAW</TabsTrigger>
                  <TabsTrigger 
                    value="parsed" 
                    disabled={!testResult || isTesting}
                    className="disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Parsed
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="raw" className="flex-1 min-h-0 overflow-auto mt-2">
              {testError ? (
                    <div className="text-red-500 font-semibold p-3 bg-red-50 dark:bg-red-950 rounded border border-red-200 dark:border-red-800">
                      <strong>오류:</strong> {testError}
                    </div>
              ) : testResult ? (
                <textarea
                      className="w-full h-full min-h-[300px] font-mono text-xs bg-background border rounded p-2 resize-none"
                      value={testResult.raw_result || ""}
                  readOnly
                />
              ) : (
                    <div className="text-muted-foreground text-sm p-3">테스트 버튼을 눌러 결과를 확인하세요.</div>
                  )}
                </TabsContent>
                
                <TabsContent value="parsed" className="flex-1 min-h-0 overflow-auto mt-2">
                  {!testResult ? (
                    <div className="text-muted-foreground text-sm p-3">테스트 결과가 없습니다.</div>
                  ) : testResult.parse_error ? (
                    <div className="text-red-500 text-sm p-2 bg-red-50 dark:bg-red-950 rounded border border-red-200 dark:border-red-800">
                      <strong>파싱 오류:</strong> {testResult.parse_error}
                    </div>
                  ) : testResult.parsed_result ? (
                      <div className="space-y-3">
                        {/* 질문 생성인 경우 (세션2) */}
                        {testResult.metadata.prompt_type === "질문 생성" && testResult.parsed_result.result && (
                          <div className="space-y-3">
                            <div className="font-bold text-lg mb-2">질문 생성 결과</div>
                            {testResult.parsed_result.result.map((q: any, idx: number) => (
                              <div key={idx} className="p-4 bg-background border rounded-lg space-y-2">
                                <div className="font-bold text-base text-blue-600 dark:text-blue-400 mb-2">
                                  질문 {idx + 1}
                                </div>
                                
                                {/* 키워드 */}
                                {q.keyword && (
                                  <div className="flex gap-2 items-start">
                                    <span className="font-semibold text-sm min-w-[80px]">키워드:</span>
                                    <span className="text-sm">{q.keyword}</span>
                                  </div>
                                )}
                                
                                {/* 제목 */}
                                {q.title && (
                                  <div className="flex gap-2 items-start">
                                    <span className="font-semibold text-sm min-w-[80px]">제목:</span>
                                    <span className="text-sm font-medium">{q.title}</span>
                                  </div>
                                )}
                                
                                {/* 질문 */}
                                <div className="flex gap-2 items-start">
                                  <span className="font-semibold text-sm min-w-[80px]">질문:</span>
                                  <span className="text-sm flex-1">{q.question}</span>
                                </div>
                                
                                {/* 질문 자막 */}
                                {q.question_korean_caption && (
                                  <div className="flex gap-2 items-start">
                                    <span className="font-semibold text-sm min-w-[80px]">질문 자막:</span>
                                    <span className="text-sm text-muted-foreground flex-1">{q.question_korean_caption}</span>
                                  </div>
                                )}
                                
                                {/* 답변 */}
                                {q.answer_text && (
                                  <div className="flex gap-2 items-start">
                                    <span className="font-semibold text-sm min-w-[80px]">답변:</span>
                                    <span className="text-sm text-muted-foreground flex-1">{q.answer_text}</span>
                                  </div>
                                )}
                                
                                {/* 답변 자막 */}
                                {q.answer_korean_caption && (
                                  <div className="flex gap-2 items-start">
                                    <span className="font-semibold text-sm min-w-[80px]">답변 자막:</span>
                                    <span className="text-sm text-muted-foreground flex-1">{q.answer_korean_caption}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                          
                        {/* AI 평가인 경우 (세션1) */}
                        {testResult.metadata.prompt_type === "AI 평가" && (
                          <div className="space-y-4">
                            <div className="font-bold text-lg mb-2">AI 평가 결과</div>
                            
                            {/* 평가 점수 */}
                            {testResult.parsed_result.scores && Array.isArray(testResult.parsed_result.scores) && (
                              <div className="space-y-2">
                                <div className="font-semibold text-base text-blue-600 dark:text-blue-400">평가 점수</div>
                                <div className="grid gap-2">
                                  {testResult.parsed_result.scores.map((scoreItem: any, idx: number) => (
                                    <div key={idx} className="p-3 bg-background border rounded-lg">
                                      <div className="flex justify-between items-center">
                                        <div className="font-semibold text-sm">{scoreItem.category}</div>
                                        <span className="font-bold text-lg text-blue-600 dark:text-blue-400 ml-2">
                                          {scoreItem.score}점
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* 강점 */}
                            {testResult.parsed_result.feedback.strengths && (
                              <div className="space-y-2">
                                <div className="font-semibold text-base text-green-600 dark:text-green-400">강점</div>
                                {Array.isArray(testResult.parsed_result.feedback.strengths) ? (
                                  <div className="space-y-2">
                                    {testResult.parsed_result.feedback.strengths.map((strength: any, idx: number) => (
                                      <div key={idx} className="p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg">
                                        {typeof strength === 'object' ? (
                                          <div className="space-y-1">
                                            {/* 제목 */}
                                            {strength.title && (
                                              <div className="text-sm text-green-900 dark:text-green-100 font-bold mb-1">{strength.title}</div>
                                            )}
                                            {/* 본문 */}
                                            <div className="text-sm text-green-900 dark:text-green-100 font-medium">{strength.text}</div>
                                            {strength.source && (
                                              <div className="text-xs text-green-700 dark:text-green-300 mt-2 p-2 bg-green-100/50 dark:bg-green-950/50 rounded flex gap-2">
                                                <strong>출처:</strong> 
                                                <span>[{strength.sourceType}] {strength.source}</span>
                                              </div>
                                            )}
                                          </div>
                                        ) : (
                                          <div className="text-sm text-green-900 dark:text-green-100">{strength}</div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-sm p-3 bg-green-50 dark:bg-green-950 rounded">
                                    {testResult.parsed_result.strengths}
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* 약점 (개선점) */}
                            {testResult.parsed_result.feedback?.weakness && (
                              <div className="space-y-2">
                                <div className="font-semibold text-base text-orange-600 dark:text-orange-400">약점 / 개선점</div>
                                {Array.isArray(testResult.parsed_result.feedback.weakness) ? (
                                  <div className="space-y-2">
                                    {testResult.parsed_result.feedback.weakness.map((weakness: any, idx: number) => (
                                      <div key={idx} className="p-3 bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-700 rounded-lg">
                                        {typeof weakness === 'object' ? (
                                          <div className="space-y-1">
                                            {/* 제목 */}
                                            {weakness.title && (
                                              <div className="text-sm text-orange-900 dark:text-orange-100 font-bold mb-1">{weakness.title}</div>
                                            )}
                                            {/* 본문 */}
                                            <div className="text-sm text-orange-900 dark:text-orange-100 font-medium">{weakness.text}</div>
                                            {weakness.source && (
                                              <div className="text-xs text-orange-700 dark:text-orange-300 mt-2 p-2 bg-orange-100/50 dark:bg-orange-950/50 rounded flex gap-2">
                                                <strong>출처:</strong>
                                                <span>[{weakness.sourceType}] {weakness.source}</span>
                                              </div>
                                            )}
                                          </div>
                                        ) : (
                                          <div className="text-sm text-orange-900 dark:text-orange-100">{weakness}</div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-sm p-3 bg-orange-50 dark:bg-orange-950 rounded">
                                    {testResult.parsed_result.feedback.weakness}
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* 총평 */}
                            {testResult.parsed_result.feedback?.overall && (
                              <div className="space-y-2">
                                <div className="font-semibold text-base text-purple-600 dark:text-purple-400">총평</div>
                                {Array.isArray(testResult.parsed_result.feedback.overall) ? (
                                  <div className="space-y-2">
                                    {testResult.parsed_result.feedback.overall.map((item: any, idx: number) => (
                                      <div key={idx} className="p-3 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded-lg">
                                        <div className="space-y-1">
                                          {/* 제목 */}
                                          {item.title && (
                                            <div className="text-sm text-purple-900 dark:text-purple-100 font-bold mb-1">{item.title}</div>
                                          )}
                                          {/* 본문 */}
                                          <div className="text-sm text-purple-900 dark:text-purple-100 font-medium whitespace-pre-wrap">{item.text}</div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="p-3 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded-lg">
                                    <div className="text-sm text-purple-900 dark:text-purple-100 whitespace-pre-wrap">{testResult.parsed_result.feedback.overall}</div>
                                  </div>
                                )}
                              </div>
                            )}
                            
                          </div>
                        )}
                          
                        {/* 기타 결과는 JSON으로 표시 */}
                        {(!testResult.parsed_result.questions && !testResult.parsed_result.scores && !testResult.parsed_result.feedback) && (
                          <pre className="text-xs bg-muted/50 p-2 rounded overflow-auto max-h-[400px]">
                            {JSON.stringify(testResult.parsed_result, null, 2)}
                          </pre>
                        )}
                      </div>
                  ) : (
                    <div className="text-muted-foreground text-sm p-3">파싱된 결과가 없습니다.</div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </>
    </div>
  )
}
