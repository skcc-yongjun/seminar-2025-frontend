"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, Plus, Edit, Trash2, Loader2, RefreshCw } from "lucide-react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import {
  fetchPresentations,
  fetchPresenters,
  createPresentation,
  updatePresentation,
  deletePresentation,
  resetPresentationToInProgress,
  type PresentationResponse,
  type PresenterResponse,
} from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function PresentationsPage() {
  // 상태 관리
  const [presentations, setPresentations] = useState<PresentationResponse[]>([])
  const [presenters, setPresenters] = useState<PresenterResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPresentation, setEditingPresentation] = useState<PresentationResponse | null>(null)
  const [formData, setFormData] = useState({
    session_type: "세션1",
    presenter_id: "",
    topic: "",
    presentation_order: 1,
    status: "대기",
  })
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  /**
   * 초기 데이터 로드
   * 발표 목록과 발표자 목록을 동시에 조회
   */
  useEffect(() => {
    loadData()
  }, [])

  /**
   * 발표 및 발표자 데이터 로드
   */
  const loadData = async () => {
    try {
      setIsLoading(true)
      const [presentationsData, presentersData] = await Promise.all([
        fetchPresentations(),
        fetchPresenters(),
      ])
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
   * 발표 추가 다이얼로그 열기
   */
  const handleAdd = () => {
    setEditingPresentation(null)
    setFormData({
      session_type: "세션1",
      presenter_id: "",
      topic: "",
      presentation_order: 1,
      status: "대기",
    })
    setPdfFile(null)
    setIsDialogOpen(true)
  }

  /**
   * 발표 수정 다이얼로그 열기
   * @param presentation 수정할 발표
   */
  const handleEdit = (presentation: PresentationResponse) => {
    setEditingPresentation(presentation)
    setFormData({
      session_type: presentation.session_type,
      presenter_id: presentation.presenter_id,
      topic: presentation.topic,
      presentation_order: presentation.presentation_order,
      status: presentation.status,
    })
    setPdfFile(null) // 수정 모드에서는 PDF 파일 초기화
    setIsDialogOpen(true)
  }

  /**
   * 발표 삭제
   * @param presentationId 발표 ID
   */
  const handleDelete = async (presentationId: string) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) {
      return
    }

    try {
      await deletePresentation(presentationId)
      toast({
        title: "성공",
        description: "발표가 삭제되었습니다.",
      })
      // 목록 다시 로드
      await loadData()
    } catch (error) {
      console.error("발표 삭제 실패:", error)
      toast({
        variant: "destructive",
        title: "오류",
        description: "발표 삭제에 실패했습니다.",
      })
    }
  }

  /**
   * 발표 상태를 "진행중"으로 초기화
   * @param presentationId 발표 ID
   */
  const handleResetToInProgress = async (presentationId: string) => {
    if (!window.confirm("이 발표의 상태를 '진행중'으로 초기화하시겠습니까?")) {
      return
    }

    try {
      await resetPresentationToInProgress(presentationId)
      toast({
        title: "성공",
        description: "발표 상태가 '진행중'으로 초기화되었습니다.",
      })
      // 목록 다시 로드
      await loadData()
    } catch (error) {
      console.error("발표 상태 초기화 실패:", error)
      toast({
        variant: "destructive",
        title: "오류",
        description: "발표 상태 초기화에 실패했습니다.",
      })
    }
  }

  /**
   * 발표 저장 (생성 또는 수정)
   */
  const handleSave = async () => {
    // 입력값 검증 - 누락된 필드 확인
    const missingFields: string[] = []
    
    if (!formData.session_type) {
      missingFields.push("세션")
    }
    if (!formData.presenter_id) {
      missingFields.push("발표자")
    }
    if (!formData.topic || formData.topic.trim() === "") {
      missingFields.push("주제")
    }
    
    if (missingFields.length > 0) {
      toast({
        variant: "destructive",
        title: "입력 오류",
        description: `다음 필수 항목을 입력해주세요: ${missingFields.join(", ")}`,
      })
      return
    }

    try {
      setIsSaving(true)

      if (editingPresentation) {
        // 기존 발표 수정
        await updatePresentation(editingPresentation.presentation_id, {
          topic: formData.topic,
          presentation_order: formData.presentation_order,
          status: formData.status,
        })
        toast({
          title: "성공",
          description: "발표 정보가 수정되었습니다.",
        })
      } else {
        // 새 발표 생성
        await createPresentation({
          session_type: formData.session_type,
          presenter_id: formData.presenter_id,
          topic: formData.topic,
          presentation_order: formData.presentation_order,
          status: formData.status,
          pdf_file: pdfFile || undefined,
        })
        toast({
          title: "성공",
          description: "새 발표가 추가되었습니다.",
        })
      }

      // 다이얼로그 닫기 및 폼 초기화
      setIsDialogOpen(false)
      setFormData({
        session_type: "세션1",
        presenter_id: "",
        topic: "",
        presentation_order: 1,
        status: "대기",
      })
      setPdfFile(null)

      // 목록 다시 로드
      await loadData()
    } catch (error) {
      console.error("발표 저장 실패:", error)
      toast({
        variant: "destructive",
        title: "오류",
        description: editingPresentation
          ? "발표 수정에 실패했습니다."
          : "발표 추가에 실패했습니다.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  /**
   * 발표자 ID로 발표자 이름 찾기
   * @param presenterId 발표자 ID
   * @returns 발표자 이름
   */
  const getPresenterName = (presenterId: string): string => {
    const presenter = presenters.find((p) => p.presenter_id === presenterId)
    return presenter ? presenter.name : presenterId
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "완료":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "진행중":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "평가":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "대기":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
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
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">발표 관리</h1>
              <p className="text-muted-foreground">발표 정보를 관리합니다</p>
            </div>
            <Button onClick={handleAdd} className="bg-sk-red hover:bg-sk-red/90">
              <Plus className="w-4 h-4 mr-2" />
              발표 추가
            </Button>
          </div>
        </motion.div>

        {/* 로딩 상태 표시 */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-sk-red" />
          </div>
        ) : presentations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">등록된 발표가 없습니다.</p>
            <Button onClick={handleAdd} className="mt-4 bg-sk-red hover:bg-sk-red/90">
              <Plus className="w-4 h-4 mr-2" />
              첫 발표 추가하기
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {presentations.map((presentation, index) => (
              <motion.div
                key={presentation.presentation_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <div className="corporate-card rounded-xl p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge variant="outline" className="border-sk-red/30 text-sk-red">
                          {presentation.session_type}
                        </Badge>
                        <Badge variant="outline" className={getStatusColor(presentation.status)}>
                          {presentation.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          순서: {presentation.presentation_order}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">{presentation.topic}</h3>
                      <p className="text-sm text-muted-foreground">
                        발표자: {getPresenterName(presentation.presenter_id)}
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        ID: {presentation.presentation_id}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleResetToInProgress(presentation.presentation_id)}
                        variant="outline"
                        size="sm"
                        className="text-blue-500 hover:text-blue-600 border-blue-500/30 hover:border-blue-500/50"
                        disabled={isSaving}
                        title="상태를 '진행중'으로 초기화"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleEdit(presentation)}
                        variant="outline"
                        size="sm"
                        disabled={isSaving}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(presentation.presentation_id)}
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive bg-transparent"
                        disabled={isSaving}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
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
        <DialogContent className="max-w-md bg-background">
          <DialogHeader>
            <DialogTitle>{editingPresentation ? "발표 수정" : "발표 추가"}</DialogTitle>
            <DialogDescription>발표 정보를 입력해주세요.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="session">
                세션 <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.session_type}
                onValueChange={(value) => setFormData({ ...formData, session_type: value })}
                disabled={!!editingPresentation}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="세션 선택" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="세션1">세션1</SelectItem>
                  <SelectItem value="세션2">세션2</SelectItem>
                  <SelectItem value="패널토의">패널토의</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="presenter">
                발표자 <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.presenter_id || undefined}
                onValueChange={(value) => setFormData({ ...formData, presenter_id: value })}
                disabled={!!editingPresentation}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="발표자 선택" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  {presenters.map((presenter) => (
                    <SelectItem key={presenter.presenter_id} value={presenter.presenter_id}>
                      {presenter.name} ({presenter.company})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="topic">
                주제 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="topic"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                placeholder="발표 주제"
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order">순서</Label>
              <Input
                id="order"
                type="number"
                value={formData.presentation_order}
                onChange={(e) =>
                  setFormData({ ...formData, presentation_order: Number.parseInt(e.target.value) || 1 })
                }
                min="1"
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">상태</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
                disabled={isSaving}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="대기">대기</SelectItem>
                  <SelectItem value="진행중">진행중</SelectItem>
                  <SelectItem value="QnA">QnA</SelectItem>
                  <SelectItem value="평가">평가</SelectItem>
                  <SelectItem value="완료">완료</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {!editingPresentation && (
              <div className="space-y-2">
                <Label htmlFor="pdf">PDF 자료 (선택)</Label>
                <Input
                  id="pdf"
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      // PDF 파일 확인
                      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
                        toast({
                          variant: "destructive",
                          title: "파일 형식 오류",
                          description: "PDF 파일만 업로드 가능합니다.",
                        })
                        e.target.value = ''
                        return
                      }
                      setPdfFile(file)
                    }
                  }}
                  disabled={isSaving}
                  className="cursor-pointer"
                />
                {pdfFile && (
                  <div className="text-sm text-muted-foreground mt-1">
                    선택된 파일: {pdfFile.name} ({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  * PDF 파일만 업로드 가능합니다
                </p>
              </div>
            )}
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
