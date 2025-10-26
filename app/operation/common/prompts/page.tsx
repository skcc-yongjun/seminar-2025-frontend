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
import { useState, useEffect } from "react"
import {
  fetchPrompts,
  fetchPresentations,
  fetchPresenters,
  createPrompt,
  updatePrompt,
  deletePrompt,
  type PromptResponse,
  type PresentationResponse,
  type PresenterResponse,
} from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function PromptsPage() {
  // 상태 관리
  const [prompts, setPrompts] = useState<PromptResponse[]>([])
  const [presentations, setPresentations] = useState<PresentationResponse[]>([])
  const [presenters, setPresenters] = useState<PresenterResponse[]>([])
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

  /**
   * 초기 데이터 로드
   * 프롬프트 목록, 발표 목록, 발표자 목록을 동시에 조회
   */
  useEffect(() => {
    loadData()
  }, [])

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
      setPrompts(promptsData)
      setPresentations(presentationsData)
      setPresenters(presentersData)
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

  return (
    <div className="min-h-screen p-4 md:p-6 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sk-red/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sk-red/3 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
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
        ) : prompts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">등록된 프롬프트가 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {prompts.map((prompt, index) => (
              <motion.div
                key={prompt.prompt_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <div className="corporate-card rounded-xl p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge variant="outline" className="border-sk-red/30 text-sk-red">
                          {getPresentationTitle(prompt.presentation_id)}
                        </Badge>
                        <Badge variant="outline" className={getTypeColor(prompt.prompt_type)}>
                          {prompt.prompt_type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{prompt.content}</p>
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
            ))}
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
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen} modal={true}>
          <DialogContent 
            className="bg-background dark:bg-background backdrop-blur-none border-2 border-border shadow-2xl"
            showCloseButton={true}
          >
          <DialogHeader className="pb-4">
            <DialogTitle className="text-2xl">{editingPrompt ? "프롬프트 수정" : "프롬프트 추가"}</DialogTitle>
            <DialogDescription className="text-base">프롬프트 정보를 입력해주세요.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-[400px_1fr] gap-8 py-4">
            {/* 좌측 컬럼 - 발표 및 타입 선택 */}
            <div className="space-y-6">
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
            <div className="space-y-3 flex flex-col">
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
                className="h-[450px] resize-none overflow-y-auto font-mono text-sm leading-relaxed bg-background"
              />
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {formData.content.length}자 입력됨
                </p>
                <p className="text-xs text-muted-foreground">
                  Ctrl+Enter로 저장
                </p>
              </div>
            </div>
          </div>
          <DialogFooter className="pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)} 
              disabled={isSaving}
              className="h-11 px-8"
            >
              취소
            </Button>
            <Button 
              onClick={handleSave} 
              className="bg-sk-red hover:bg-sk-red/90 h-11 px-8" 
              disabled={isSaving}
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
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </>
    </div>
  )
}
