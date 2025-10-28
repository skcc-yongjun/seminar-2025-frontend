"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, Plus, Edit, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import {
  fetchQnAQuestions,
  fetchPresentations,
  fetchCharacters,
  createQnAQuestion,
  updateQnAQuestion,
  deleteQnAQuestion,
  toggleQnAQuestionSelect,
  type QnAQuestionResponse,
  type PresentationResponse,
  type CharacterResponse,
} from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function QnaPage() {
  // 상태 관리
  const [qnas, setQnas] = useState<QnAQuestionResponse[]>([])
  const [allQnas, setAllQnas] = useState<QnAQuestionResponse[]>([]) // 전체 Q&A 목록
  const [presentations, setPresentations] = useState<PresentationResponse[]>([])
  const [session2Presentations, setSession2Presentations] = useState<PresentationResponse[]>([]) // 세션2 발표만
  const [characters, setCharacters] = useState<CharacterResponse[]>([]) // 캐릭터 목록
  const [selectedPresentationId, setSelectedPresentationId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingQna, setEditingQna] = useState<QnAQuestionResponse | null>(null)
  const [formData, setFormData] = useState({
    presentation_id: "",
    character_name: "",
    title: "",
    keyword: "",
    question_text: "",
    answer_text: "",
  })
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  /**
   * 초기 데이터 로드
   * QnA 목록과 발표 목록을 동시에 조회
   */
  useEffect(() => {
    loadData()
  }, [])

  /**
   * 선택된 발표가 변경되면 Q&A 필터링
   */
  useEffect(() => {
    if (selectedPresentationId) {
      const filteredQnas = allQnas.filter((qna) => qna.presentation_id === selectedPresentationId)
      setQnas(filteredQnas)
    } else {
      setQnas([])
    }
  }, [selectedPresentationId, allQnas])

  /**
   * QnA 및 발표 데이터 로드
   */
  const loadData = async () => {
    try {
      setIsLoading(true)
      const [qnasData, presentationsData, charactersData] = await Promise.all([
        fetchQnAQuestions(),
        fetchPresentations(),
        fetchCharacters(),
      ])
      setAllQnas(qnasData)
      setPresentations(presentationsData)
      setCharacters(charactersData)
      
      // 세션2 발표만 필터링
      const session2Only = presentationsData.filter((p) => p.session_type === "세션2")
      setSession2Presentations(session2Only)
      
      // 첫 번째 세션2 발표를 자동 선택
      if (session2Only.length > 0 && !selectedPresentationId) {
        setSelectedPresentationId(session2Only[0].presentation_id)
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
   * Q&A 추가 다이얼로그 열기
   */
  const handleAdd = () => {
    setEditingQna(null)
    setFormData({
      presentation_id: selectedPresentationId || "",
      character_name: characters.length > 0 ? characters[0].character_name : "",
      title: "",
      keyword: "",
      question_text: "",
      answer_text: "",
    })
    setIsDialogOpen(true)
  }

  /**
   * Q&A 수정 다이얼로그 열기
   * @param qna 수정할 Q&A
   */
  const handleEdit = (qna: QnAQuestionResponse) => {
    setEditingQna(qna)
    setFormData({
      presentation_id: qna.presentation_id,
      character_name: characters.length > 0 ? characters[0].character_name : "",
      title: qna.title || "",
      keyword: qna.keyword || "",
      question_text: qna.question_text,
      answer_text: qna.answer_text || "",
    })
    setIsDialogOpen(true)
  }

  /**
   * Q&A 삭제
   * @param questionId 질문 ID
   */
  const handleDelete = async (questionId: number) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) {
      return
    }

    try {
      await deleteQnAQuestion(questionId)
      toast({
        title: "성공",
        description: "Q&A가 삭제되었습니다.",
      })
      // 목록 다시 로드
      await loadData()
    } catch (error) {
      console.error("Q&A 삭제 실패:", error)
      toast({
        variant: "destructive",
        title: "오류",
        description: "Q&A 삭제에 실패했습니다.",
      })
    }
  }

  /**
   * Q&A 저장 (생성 또는 수정)
   */
  const handleSave = async () => {
    // 입력값 검증
    if (!formData.presentation_id || !formData.question_text || !formData.answer_text) {
      toast({
        variant: "destructive",
        title: "입력 오류",
        description: "발표, 질문, 답변은 필수 입력 항목입니다.",
      })
      return
    }

    if (!editingQna && !formData.character_name) {
      toast({
        variant: "destructive",
        title: "입력 오류",
        description: "캐릭터를 선택해주세요.",
      })
      return
    }

    try {
      setIsSaving(true)

      if (editingQna) {
        // 기존 Q&A 수정
        await updateQnAQuestion(editingQna.question_id, {
          title: formData.title,
          keyword: formData.keyword,
          question_text: formData.question_text,
          answer_text: formData.answer_text,
        })
        toast({
          title: "성공",
          description: "Q&A 정보가 수정되었습니다.",
        })
      } else {
        // 새 Q&A 생성 (아바타 비디오 생성 포함)
        const result = await createQnAQuestion({
          presentation_id: formData.presentation_id,
          character_name: formData.character_name,
          title: formData.title,
          keyword: formData.keyword,
          question_text: formData.question_text,
          answer_text: formData.answer_text,
          question_korean_caption: formData.question_text, // 질문 자막 (질문과 동일)
          answer_korean_caption: formData.answer_text, // 답변 자막 (답변과 동일)
          created_by: 2, // 수동 생성
        })

        // 아바타 생성 결과에 따라 다른 메시지 표시
        if (result.avatar_generation_status === "completed") {
          toast({
            title: "성공",
            description: `새 Q&A가 추가되었습니다. 아바타 비디오가 생성되었습니다. (${result.processing_time_seconds?.toFixed(1)}초)`,
          })
        } else if (result.avatar_generation_status === "failed") {
          toast({
            variant: "destructive",
            title: "부분 성공",
            description: `Q&A는 추가되었으나 아바타 비디오 생성에 실패했습니다: ${result.avatar_error_message}`,
          })
        } else {
          toast({
            title: "성공",
            description: "새 Q&A가 추가되었습니다.",
          })
        }
      }

      // 다이얼로그 닫기 및 폼 초기화
      setIsDialogOpen(false)
      setFormData({
        presentation_id: "",
        character_name: "",
        title: "",
        keyword: "",
        question_text: "",
        answer_text: "",
      })

      // 목록 다시 로드
      await loadData()
    } catch (error) {
      console.error("Q&A 저장 실패:", error)
      toast({
        variant: "destructive",
        title: "오류",
        description: editingQna
          ? "Q&A 수정에 실패했습니다."
          : `Q&A 추가에 실패했습니다: ${error instanceof Error ? error.message : "알 수 없는 오류"}`,
      })
    } finally {
      setIsSaving(false)
    }
  }

  /**
   * 선택 상태 토글
   * @param questionId 질문 ID
   * @param qna Q&A 정보 (created_by, is_selected 확인용)
   */
  const handleToggleSelect = async (questionId: number, qna: QnAQuestionResponse, event: React.MouseEvent) => {
    event.stopPropagation() // 이벤트 전파 방지
    
    // AI 생성 Q&A를 선택하려고 할 때만 확인 창 표시
    if (!qna.is_selected && qna.created_by === 1) {
      const confirmed = window.confirm(
        "AI가 생성한 Q&A입니다. 이 질문을 선택하시겠습니까?\n\n" +
        "선택하면 실제 세션에서 사용됩니다."
      )
      
      if (!confirmed) {
        return // 사용자가 취소하면 함수 종료
      }
    }
    
    try {
      await toggleQnAQuestionSelect(questionId)
      // 목록 다시 로드
      await loadData()
    } catch (error) {
      console.error("선택 상태 토글 실패:", error)
      toast({
        variant: "destructive",
        title: "오류",
        description: "선택 상태 변경에 실패했습니다.",
      })
    }
  }

  /**
   * 발표 선택
   * @param presentationId 발표 ID
   */
  const handleSelectPresentation = (presentationId: string) => {
    setSelectedPresentationId(presentationId)
  }

  /**
   * Q&A 개수 조회
   * @param presentationId 발표 ID
   * @returns Q&A 개수
   */
  const getQnACount = (presentationId: string): number => {
    return allQnas.filter((qna) => qna.presentation_id === presentationId).length
  }

  /**
   * 발표 ID로 발표 주제 찾기
   * @param presentationId 발표 ID
   * @returns 발표 주제
   */
  const getPresentationTopic = (presentationId: string): string => {
    const presentation = presentations.find((p) => p.presentation_id === presentationId)
    return presentation ? presentation.topic : presentationId
  }

  /**
   * 생성 주체 라벨 반환
   * @param createdBy 생성 주체 (1: 자동, 2: 수동)
   * @returns 라벨 텍스트
   */
  const getCreatedByLabel = (createdBy: number): string => {
    return createdBy === 1 ? "AI 생성" : "수동 생성"
  }

  /**
   * 생성 주체 색상 반환
   * @param createdBy 생성 주체 (1: 자동, 2: 수동)
   * @returns Tailwind CSS 클래스
   */
  const getCreatedByColor = (createdBy: number): string => {
    return createdBy === 1
      ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
      : "bg-green-500/20 text-green-400 border-green-500/30"
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
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Q&A 관리</h1>
              <p className="text-muted-foreground">Session 2 Q&A를 관리합니다</p>
            </div>
            <Button 
              onClick={handleAdd} 
              className="bg-sk-red hover:bg-sk-red/90"
              disabled={!selectedPresentationId}
            >
              <Plus className="w-4 h-4 mr-2" />
              Q&A 추가
            </Button>
          </div>
        </motion.div>

        {/* 로딩 상태 표시 */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-sk-red" />
          </div>
        ) : (
          <div className="grid grid-cols-[320px_1fr] gap-6">
            {/* 왼쪽: 세션2 발표 리스트 */}
            <div className="space-y-3">
              <div className="corporate-card rounded-xl p-4">
                <h2 className="text-lg font-semibold text-foreground mb-4">세션2 발표 목록</h2>
                <div className="space-y-2">
                  {session2Presentations.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      세션2 발표가 없습니다.
                    </p>
                  ) : (
                    session2Presentations.map((presentation) => {
                      const qnaCount = getQnACount(presentation.presentation_id)
                      const isSelected = selectedPresentationId === presentation.presentation_id
                      
                      return (
                        <button
                          key={presentation.presentation_id}
                          onClick={() => handleSelectPresentation(presentation.presentation_id)}
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
                                {presentation.topic}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                순서: {presentation.presentation_order}
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
                              {qnaCount}개
                            </Badge>
                          </div>
                        </button>
                      )
                    })
                  )}
                </div>
              </div>
            </div>

            {/* 오른쪽: 선택된 발표의 Q&A 목록 */}
            <div>
              {!selectedPresentationId ? (
                <div className="corporate-card rounded-xl p-12 text-center">
                  <p className="text-muted-foreground">왼쪽에서 발표를 선택해주세요.</p>
                </div>
              ) : qnas.length === 0 ? (
                <div className="corporate-card rounded-xl p-12 text-center">
                  <p className="text-muted-foreground mb-4">이 발표에 등록된 Q&A가 없습니다.</p>
                  <Button onClick={handleAdd} className="bg-sk-red hover:bg-sk-red/90">
                    <Plus className="w-4 h-4 mr-2" />
                    첫 Q&A 추가하기
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* 선택된 Q&A가 먼저 보이도록 정렬 */}
                  {qnas
                    .sort((a, b) => {
                      // is_selected가 true인 것이 먼저 오도록 정렬
                      if (a.is_selected && !b.is_selected) return -1
                      if (!a.is_selected && b.is_selected) return 1
                      // 선택 여부가 같으면 question_id 순서 유지
                      return a.question_id - b.question_id
                    })
                    .map((qna, index) => (
                    <motion.div
                      key={qna.question_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * index }}
                    >
                      <div className="corporate-card rounded-xl p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3 flex-wrap">
                            {/* 생성 주체 배지 - 더 눈에 띄게 */}
                            <Badge 
                              variant="outline" 
                              className={`${getCreatedByColor(qna.created_by)} font-semibold text-sm px-3 py-1`}
                            >
                              {getCreatedByLabel(qna.created_by)}
                            </Badge>
                            {qna.character_name && (
                              <Badge variant="outline" className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 font-medium">
                                🎭 {qna.character_name}
                              </Badge>
                            )}
                            {qna.keyword && (
                              <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                                {qna.keyword}
                              </Badge>
                            )}
                            {qna.video_created && (
                              <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                                비디오 생성됨
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            {/* 선택 상태 토글 버튼 - 더 명확하게 */}
                            <Button
                              onClick={(e) => handleToggleSelect(qna.question_id, qna, e)}
                              variant="outline"
                              size="sm"
                              className={`min-w-[80px] transition-all ${
                                qna.is_selected
                                  ? "bg-sk-red text-white border-sk-red hover:bg-sk-red/90 hover:text-white"
                                  : "bg-muted text-muted-foreground hover:bg-muted/80"
                              }`}
                              disabled={isSaving}
                            >
                              {qna.is_selected ? "선택됨 ✓" : "선택"}
                            </Button>
                            <Button
                              onClick={() => handleEdit(qna)}
                              variant="outline"
                              size="sm"
                              disabled={isSaving}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => handleDelete(qna.question_id)}
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:text-destructive bg-transparent"
                              disabled={isSaving}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-3">
                          {qna.title && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">제목</p>
                              <p className="text-sm font-semibold text-foreground">{qna.title}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">질문</p>
                            <p className="text-sm text-foreground">{qna.question_text}</p>
                          </div>
                          {qna.answer_text && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">답변</p>
                              <p className="text-sm text-muted-foreground">{qna.answer_text}</p>
                            </div>
                          )}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground/60 pt-2 border-t">
                            <span>ID: {qna.question_id}</span>
                            {qna.timestamp_label && <span>타임스탬프: {qna.timestamp_label}</span>}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
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
        <DialogContent className="max-w-2xl bg-background">
          <DialogHeader>
            <DialogTitle>{editingQna ? "Q&A 수정" : "Q&A 추가"}</DialogTitle>
            <DialogDescription>Q&A 정보를 입력해주세요.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="presentation">발표 *</Label>
              <Select
                value={formData.presentation_id || undefined}
                onValueChange={(value) => setFormData({ ...formData, presentation_id: value })}
                disabled={true} // 항상 비활성화 - 선택된 발표에만 추가 가능
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="발표 선택" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  {session2Presentations.map((presentation) => (
                    <SelectItem key={presentation.presentation_id} value={presentation.presentation_id}>
                      [{presentation.session_type}] {presentation.topic}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                현재 선택된 발표에 Q&A가 추가됩니다.
              </p>
            </div>
            {!editingQna && (
              <div className="space-y-2">
                <Label htmlFor="character">캐릭터 * (아바타 비디오 생성용)</Label>
                <Select
                  value={formData.character_name || undefined}
                  onValueChange={(value) => setFormData({ ...formData, character_name: value })}
                  disabled={isSaving}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="캐릭터 선택" />
                  </SelectTrigger>
                  <SelectContent className="bg-background">
                    {characters.map((character) => (
                      <SelectItem key={character.character_id} value={character.character_name}>
                        {character.character_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  선택한 캐릭터로 질문과 답변 아바타 비디오가 자동 생성됩니다.
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="title">제목</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Q&A 제목 (선택사항)"
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="keyword">키워드</Label>
              <Input
                id="keyword"
                value={formData.keyword}
                onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                placeholder="키워드 (예: 비즈니스, 기술)"
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="question">질문 *</Label>
              <Textarea
                id="question"
                value={formData.question_text}
                onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                placeholder="질문 내용을 입력하세요"
                rows={3}
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="answer">답변 *</Label>
              <Textarea
                id="answer"
                value={formData.answer_text}
                onChange={(e) => setFormData({ ...formData, answer_text: e.target.value })}
                placeholder="답변 내용을 입력하세요"
                rows={4}
                disabled={isSaving}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
              취소
            </Button>
            <Button onClick={handleSave} className="bg-sk-red hover:bg-sk-red/90" disabled={isSaving}>
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
    </div>
  )
}
