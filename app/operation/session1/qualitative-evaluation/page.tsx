"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, Loader2, Plus, Edit, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { RefreshButton } from "@/components/ui/refresh-button"
import {
  fetchPresentationAnalysisComments,
  fetchPresentations,
  fetchPresenters,
  createPresentationAnalysisComment,
  updatePresentationAnalysisComment,
  deletePresentationAnalysisComment,
  type PresentationAnalysisCommentResponse,
  type PresentationResponse,
  type PresenterResponse,
} from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function QualitativeEvaluationPage() {
  // 상태 관리
  const [comments, setComments] = useState<PresentationAnalysisCommentResponse[]>([])
  const [allComments, setAllComments] = useState<PresentationAnalysisCommentResponse[]>([]) // 전체 코멘트 목록
  const [presentations, setPresentations] = useState<PresentationResponse[]>([])
  const [session1Presentations, setSession1Presentations] = useState<PresentationResponse[]>([]) // 세션1 발표만
  const [presenters, setPresenters] = useState<PresenterResponse[]>([])
  const [selectedPresentationId, setSelectedPresentationId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingComment, setEditingComment] = useState<PresentationAnalysisCommentResponse | null>(null)
  const [formData, setFormData] = useState({
    type: "강점",
    title: "",
    comment: "",
    source_type: "발표",
    source: "",
  })
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  /**
   * 초기 데이터 로드
   * 코멘트 목록, 발표 목록, 발표자 목록을 동시에 조회
   */
  useEffect(() => {
    loadData()
  }, [])

  /**
   * 선택된 발표가 변경되면 코멘트 필터링
   */
  useEffect(() => {
    if (selectedPresentationId) {
      const filteredComments = allComments.filter((comment) => comment.presentation_id === selectedPresentationId)
      setComments(filteredComments)
    } else {
      setComments([])
    }
  }, [selectedPresentationId, allComments])

  /**
   * 코멘트, 발표, 발표자 데이터 로드
   */
  const loadData = async () => {
    try {
      setIsLoading(true)
      const [presentationsData, presentersData] = await Promise.all([
        fetchPresentations("세션1"),
        fetchPresenters(),
      ])
      setPresentations(presentationsData)
      setPresenters(presentersData)
      
      // 세션1 발표만 필터링 + presentation_order 순 정렬
      const session1Only = presentationsData
        .filter((p) => p.session_type === "세션1")
        .sort((a, b) => a.presentation_order - b.presentation_order)
      setSession1Presentations(session1Only)
      
      // 첫 번째 세션1 발표를 자동 선택
      if (session1Only.length > 0) {
        setSelectedPresentationId(session1Only[0].presentation_id)
        // 선택된 발표의 코멘트 로드
        const commentsData = await fetchPresentationAnalysisComments(session1Only[0].presentation_id)
        setAllComments(commentsData)
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
   * 코멘트 목록만 새로고침
   */
  const refreshCommentsOnly = async () => {
    if (!selectedPresentationId) return
    
    try {
      const commentsData = await fetchPresentationAnalysisComments(selectedPresentationId)
      setAllComments(commentsData)
      
      const filteredComments = commentsData.filter((comment) => comment.presentation_id === selectedPresentationId)
      setComments(filteredComments)
    } catch (error) {
      console.error("코멘트 새로고침 실패:", error)
    }
  }

  /**
   * 발표 선택
   * @param presentationId 발표 ID
   */
  const handleSelectPresentation = async (presentationId: string) => {
    setSelectedPresentationId(presentationId)
    
    try {
      const commentsData = await fetchPresentationAnalysisComments(presentationId)
      setAllComments(commentsData)
    } catch (error) {
      console.error("코멘트 조회 실패:", error)
      toast({
        variant: "destructive",
        title: "오류",
        description: "코멘트를 불러오는데 실패했습니다.",
      })
    }
  }

  /**
   * 코멘트 개수 조회
   * @param presentationId 발표 ID
   * @returns 코멘트 개수
   */
  const getCommentCount = (presentationId: string): number => {
    return allComments.filter((comment) => comment.presentation_id === presentationId).length
  }

  /**
   * 코멘트 추가 다이얼로그 열기
   */
  const handleAdd = () => {
    setEditingComment(null)
    setFormData({
      type: "강점",
      title: "",
      comment: "",
      source_type: "발표",
      source: "",
    })
    setIsDialogOpen(true)
  }

  /**
   * 코멘트 수정 다이얼로그 열기
   * @param comment 수정할 코멘트
   */
  const handleEdit = (comment: PresentationAnalysisCommentResponse) => {
    setEditingComment(comment)
    setFormData({
      type: comment.type,
      title: comment.title || "",
      comment: comment.comment,
      source_type: comment.source_type,
      source: comment.source || "",
    })
    setIsDialogOpen(true)
  }

  /**
   * 코멘트 삭제
   * @param commentId 코멘트 ID
   */
  const handleDelete = async (commentId: number) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) {
      return
    }

    try {
      await deletePresentationAnalysisComment(commentId)
      toast({
        title: "성공",
        description: "코멘트가 삭제되었습니다.",
      })
      // 목록 다시 로드
      await refreshCommentsOnly()
    } catch (error) {
      console.error("코멘트 삭제 실패:", error)
      toast({
        variant: "destructive",
        title: "오류",
        description: "코멘트 삭제에 실패했습니다.",
      })
    }
  }

  /**
   * 코멘트 저장 (생성 또는 수정)
   */
  const handleSave = async () => {
    // 입력값 검증
    if (!formData.comment) {
      toast({
        variant: "destructive",
        title: "입력 오류",
        description: "코멘트 내용은 필수 입력 항목입니다.",
      })
      return
    }

    if (!selectedPresentationId) {
      toast({
        variant: "destructive",
        title: "입력 오류",
        description: "발표를 선택해주세요.",
      })
      return
    }

    try {
      setIsSaving(true)

      if (editingComment) {
        // 기존 코멘트 수정
        await updatePresentationAnalysisComment(editingComment.comment_id, {
          type: formData.type,
          title: formData.title || null,
          comment: formData.comment,
          source_type: formData.source_type,
          source: formData.source || null,
        })
        toast({
          title: "성공",
          description: "코멘트가 수정되었습니다.",
        })
      } else {
        // 새 코멘트 생성
        await createPresentationAnalysisComment({
          presentation_id: selectedPresentationId,
          type: formData.type,
          title: formData.title || null,
          comment: formData.comment,
          source_type: formData.source_type,
          source: formData.source || null,
        })
        toast({
          title: "성공",
          description: "새 코멘트가 추가되었습니다.",
        })
      }

      // 다이얼로그 닫기 및 폼 초기화
      setIsDialogOpen(false)
      setFormData({
        type: "강점",
        title: "",
        comment: "",
        source_type: "발표",
        source: "",
      })

      // 목록 다시 로드
      await refreshCommentsOnly()
    } catch (error) {
      console.error("코멘트 저장 실패:", error)
      toast({
        variant: "destructive",
        title: "오류",
        description: editingComment
          ? "코멘트 수정에 실패했습니다."
          : "코멘트 추가에 실패했습니다.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  /**
   * 코멘트 타입별 색상 반환
   * @param type 코멘트 타입 ('강점' | '약점' | '총평')
   * @returns 색상 클래스
   */
  const getTypeColor = (type: string): string => {
    switch (type) {
      case "강점":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "약점":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      case "총평":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  /**
   * 소스 타입별 색상 반환
   * @param sourceType 소스 타입 ('발표' | '자료')
   * @returns 색상 클래스
   */
  const getSourceTypeColor = (sourceType: string): string => {
    switch (sourceType) {
      case "발표":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "자료":
        return "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
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

      <div className="max-w-[1600px] mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link
            href="/operation/session1"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-sk-red transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>돌아가기</span>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">AI 정성평가 관리</h1>
              <p className="text-muted-foreground">Session 1 AI 코멘트를 관리합니다</p>
            </div>
            <div className="flex items-center gap-3">
              <RefreshButton onRefresh={refreshCommentsOnly} autoRefreshInterval={8000} />
              <Button 
                onClick={handleAdd} 
                className="bg-sk-red hover:bg-sk-red/90"
                disabled={!selectedPresentationId}
              >
                <Plus className="w-4 h-4 mr-2" />
                코멘트 추가
              </Button>
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
            {/* 왼쪽: 세션1 발표 리스트 */}
            <div className="space-y-3">
              <div className="corporate-card rounded-xl p-4">
                <h2 className="text-lg font-semibold text-foreground mb-4">세션1 발표 목록</h2>
                <div className="space-y-2">
                  {session1Presentations.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      세션1 발표가 없습니다.
                    </p>
                  ) : (
                    session1Presentations.map((presentation) => {
                      const commentCount = getCommentCount(presentation.presentation_id)
                      const isSelected = selectedPresentationId === presentation.presentation_id
                      const presenter = presenters.find(p => p.presenter_id === presentation.presenter_id)
                      
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
                                {presenter?.name} ({presenter?.company})
                              </p>
                              <p className="text-xs text-muted-foreground">
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
                              {commentCount}개
                            </Badge>
                          </div>
                        </button>
                      )
                    })
                  )}
                </div>
              </div>
            </div>

            {/* 오른쪽: 선택된 발표의 코멘트 목록 */}
            <div>
              {!selectedPresentationId ? (
                <div className="corporate-card rounded-xl p-12 text-center">
                  <p className="text-muted-foreground">왼쪽에서 발표를 선택해주세요.</p>
                </div>
              ) : comments.length === 0 ? (
                <div className="corporate-card rounded-xl p-12 text-center">
                  <p className="text-muted-foreground mb-4">이 발표에 등록된 AI 코멘트가 없습니다.</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    AI 평가를 실행하면 코멘트가 자동으로 생성됩니다.
                  </p>
                  <Button onClick={handleAdd} className="bg-sk-red hover:bg-sk-red/90">
                    <Plus className="w-4 h-4 mr-2" />
                    첫 코멘트 추가하기
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* 코멘트를 타입별로 그룹화하여 표시 */}
                  {["강점", "약점", "총평"].map((type) => {
                    const typeComments = comments.filter((comment) => comment.type === type)
                    
                    if (typeComments.length === 0) return null
                    
                    return (
                      <div key={type} className="space-y-3">
                        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                          <Badge variant="outline" className={getTypeColor(type)}>
                            {type}
                          </Badge>
                          <span className="text-sm text-muted-foreground">({typeComments.length}개)</span>
                        </h3>
                        
                        {typeComments.map((comment, index) => (
                          <motion.div
                            key={comment.comment_id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 * index }}
                          >
                            <div className="corporate-card rounded-xl p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3 flex-wrap">
                                  <Badge variant="outline" className={getSourceTypeColor(comment.source_type)}>
                                    {comment.source_type}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="text-xs text-muted-foreground">
                                    {new Date(comment.created_at).toLocaleString('ko-KR')}
                                  </div>
                                  <Button
                                    onClick={() => handleEdit(comment)}
                                    variant="outline"
                                    size="sm"
                                    disabled={isSaving}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    onClick={() => handleDelete(comment.comment_id)}
                                    variant="outline"
                                    size="sm"
                                    className="text-destructive hover:text-destructive"
                                    disabled={isSaving}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="space-y-3">
                                {/* 제목 */}
                                {comment.title && (
                                  <div>
                                    <p className="text-xs text-muted-foreground mb-1 font-medium">제목</p>
                                    <p className="text-base font-semibold text-foreground">{comment.title}</p>
                                  </div>
                                )}
                                
                                {/* 본문 */}
                                <div>
                                  {comment.title && (
                                    <p className="text-xs text-muted-foreground mb-1 font-medium">본문</p>
                                  )}
                                  <p className="text-sm text-foreground whitespace-pre-wrap">{comment.comment}</p>
                                </div>
                                
                                {comment.source && (
                                  <div className="bg-muted/50 rounded-lg p-3 mt-3">
                                    <p className="text-xs text-muted-foreground mb-1 font-medium">출처</p>
                                    <p className="text-xs text-muted-foreground">{comment.source}</p>
                                  </div>
                                )}
                                
                                <div className="flex items-center gap-4 text-xs text-muted-foreground/60 pt-2 border-t">
                                  <span>ID: {comment.comment_id}</span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 코멘트 추가/수정 다이얼로그 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen} modal={true}>
        <DialogContent className="max-w-2xl bg-background">
          <DialogHeader>
            <DialogTitle>{editingComment ? "코멘트 수정" : "코멘트 추가"}</DialogTitle>
            <DialogDescription>AI 정성평가 코멘트 정보를 입력해주세요.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="type">타입 *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
                disabled={isSaving}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="타입 선택" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="강점">강점</SelectItem>
                  <SelectItem value="약점">약점</SelectItem>
                  <SelectItem value="총평">총평</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="source_type">소스 타입 *</Label>
              <Select
                value={formData.source_type}
                onValueChange={(value) => setFormData({ ...formData, source_type: value })}
                disabled={isSaving}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="소스 타입 선택" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="발표">발표</SelectItem>
                  <SelectItem value="자료">자료</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">제목</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="제목을 입력하세요 (선택사항)"
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="comment">본문 *</Label>
              <Textarea
                id="comment"
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                placeholder="코멘트 본문을 입력하세요"
                rows={6}
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="source">출처</Label>
              <Textarea
                id="source"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                placeholder="출처 정보를 입력하세요 (선택사항)"
                rows={3}
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

