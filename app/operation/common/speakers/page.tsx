"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, Plus, Edit, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { useState, useEffect } from "react"
import { 
  fetchPresenters, 
  createPresenter, 
  updatePresenter, 
  deletePresenter,
  type PresenterResponse 
} from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function SpeakersPage() {
  // 상태 관리
  const [speakers, setSpeakers] = useState<PresenterResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSpeaker, setEditingSpeaker] = useState<PresenterResponse | null>(null)
  const [formData, setFormData] = useState({ name: "", company: "" })
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  /**
   * 발표자 목록 로드
   * 컴포넌트 마운트 시 실행
   */
  useEffect(() => {
    loadSpeakers()
  }, [])

  /**
   * 발표자 목록 조회
   */
  const loadSpeakers = async () => {
    try {
      setIsLoading(true)
      const data = await fetchPresenters()
      setSpeakers(data)
    } catch (error) {
      console.error("발표자 목록 조회 실패:", error)
      toast({
        variant: "destructive",
        title: "오류",
        description: "발표자 목록을 불러오는데 실패했습니다.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 발표자 추가 다이얼로그 열기
   */
  const handleAdd = () => {
    setEditingSpeaker(null)
    setFormData({ name: "", company: "" })
    setIsDialogOpen(true)
  }

  /**
   * 발표자 수정 다이얼로그 열기
   * @param speaker 수정할 발표자
   */
  const handleEdit = (speaker: PresenterResponse) => {
    setEditingSpeaker(speaker)
    setFormData({ name: speaker.name, company: speaker.company })
    setIsDialogOpen(true)
  }

  /**
   * 발표자 삭제
   * @param presenterId 발표자 ID
   */
  const handleDelete = async (presenterId: string) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) {
      return
    }

    try {
      await deletePresenter(presenterId)
      toast({
        title: "성공",
        description: "발표자가 삭제되었습니다.",
      })
      // 목록 다시 로드
      await loadSpeakers()
    } catch (error) {
      console.error("발표자 삭제 실패:", error)
      toast({
        variant: "destructive",
        title: "오류",
        description: "발표자 삭제에 실패했습니다.",
      })
    }
  }

  /**
   * 발표자 저장 (생성 또는 수정)
   */
  const handleSave = async () => {
    // 입력값 검증
    if (!formData.name || !formData.company) {
      toast({
        variant: "destructive",
        title: "입력 오류",
        description: "모든 필드를 입력해주세요.",
      })
      return
    }

    try {
      setIsSaving(true)

      if (editingSpeaker) {
        // 기존 발표자 수정
        await updatePresenter(editingSpeaker.presenter_id, formData)
        toast({
          title: "성공",
          description: "발표자 정보가 수정되었습니다.",
        })
      } else {
        // 새 발표자 생성
        await createPresenter(formData)
        toast({
          title: "성공",
          description: "새 발표자가 추가되었습니다.",
        })
      }

      // 다이얼로그 닫기 및 폼 초기화
      setIsDialogOpen(false)
      setFormData({ name: "", company: "" })
      
      // 목록 다시 로드
      await loadSpeakers()
    } catch (error) {
      console.error("발표자 저장 실패:", error)
      toast({
        variant: "destructive",
        title: "오류",
        description: editingSpeaker 
          ? "발표자 수정에 실패했습니다." 
          : "발표자 추가에 실패했습니다.",
      })
    } finally {
      setIsSaving(false)
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
            href="/operation/common"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-sk-red transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>돌아가기</span>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">발표자 관리</h1>
              <p className="text-muted-foreground">발표자 정보를 관리합니다</p>
            </div>
            <Button onClick={handleAdd} className="bg-sk-red hover:bg-sk-red/90">
              <Plus className="w-4 h-4 mr-2" />
              발표자 추가
            </Button>
          </div>
        </motion.div>

        {/* 로딩 상태 표시 */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-sk-red" />
          </div>
        ) : speakers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">등록된 발표자가 없습니다.</p>
            <Button onClick={handleAdd} className="mt-4 bg-sk-red hover:bg-sk-red/90">
              <Plus className="w-4 h-4 mr-2" />
              첫 발표자 추가하기
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {speakers.map((speaker, index) => (
              <motion.div
                key={speaker.presenter_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <div className="corporate-card rounded-xl p-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">{speaker.name}</h3>
                    <p className="text-sm text-muted-foreground">{speaker.company}</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">ID: {speaker.presenter_id}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleEdit(speaker)} 
                      variant="outline" 
                      size="sm"
                      disabled={isSaving}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(speaker.presenter_id)}
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive bg-transparent"
                      disabled={isSaving}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-background">
          <DialogHeader>
            <DialogTitle>{editingSpeaker ? "발표자 수정" : "발표자 추가"}</DialogTitle>
            <DialogDescription>발표자 정보를 입력해주세요.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="발표자 이름"
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">회사</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="소속 회사"
                disabled={isSaving}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              disabled={isSaving}
            >
              취소
            </Button>
            <Button 
              onClick={handleSave} 
              className="bg-sk-red hover:bg-sk-red/90"
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
    </div>
  )
}
