"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, Plus, Edit, Trash2 } from "lucide-react"
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
import { useState } from "react"

interface Presentation {
  id: number
  session: string
  speaker: string
  topic: string
  order: number
  status: string
}

export default function PresentationsPage() {
  const [presentations, setPresentations] = useState<Presentation[]>([
    {
      id: 1,
      session: "Session 1",
      speaker: "김철수",
      topic: "AI 기술의 미래",
      order: 1,
      status: "완료",
    },
    {
      id: 2,
      session: "Session 1",
      speaker: "이영희",
      topic: "반도체 산업 전망",
      order: 2,
      status: "진행중",
    },
    {
      id: 3,
      session: "Session 2",
      speaker: "박민수",
      topic: "친환경 에너지",
      order: 1,
      status: "대기",
    },
  ])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPresentation, setEditingPresentation] = useState<Presentation | null>(null)
  const [formData, setFormData] = useState({
    session: "",
    speaker: "",
    topic: "",
    order: 1,
    status: "대기",
  })

  const handleAdd = () => {
    setEditingPresentation(null)
    setFormData({ session: "", speaker: "", topic: "", order: 1, status: "대기" })
    setIsDialogOpen(true)
  }

  const handleEdit = (presentation: Presentation) => {
    setEditingPresentation(presentation)
    setFormData({
      session: presentation.session,
      speaker: presentation.speaker,
      topic: presentation.topic,
      order: presentation.order,
      status: presentation.status,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: number) => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      setPresentations(presentations.filter((p) => p.id !== id))
    }
  }

  const handleSave = () => {
    if (!formData.session || !formData.speaker || !formData.topic) {
      alert("모든 필드를 입력해주세요.")
      return
    }

    if (editingPresentation) {
      setPresentations(presentations.map((p) => (p.id === editingPresentation.id ? { ...p, ...formData } : p)))
    } else {
      const newPresentation: Presentation = {
        id: Math.max(...presentations.map((p) => p.id), 0) + 1,
        ...formData,
      }
      setPresentations([...presentations, newPresentation])
    }

    setIsDialogOpen(false)
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

        <div className="space-y-3">
          {presentations.map((presentation, index) => (
            <motion.div
              key={presentation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <div className="corporate-card rounded-xl p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant="outline" className="border-sk-red/30 text-sk-red">
                        {presentation.session}
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(presentation.status)}>
                        {presentation.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">순서: {presentation.order}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{presentation.topic}</h3>
                    <p className="text-sm text-muted-foreground">발표자: {presentation.speaker}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleEdit(presentation)} variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(presentation.id)}
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive bg-transparent"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingPresentation ? "발표 수정" : "발표 추가"}</DialogTitle>
            <DialogDescription>발표 정보를 입력해주세요.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="session">세션</Label>
              <Select value={formData.session} onValueChange={(value) => setFormData({ ...formData, session: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="세션 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Session 1">Session 1</SelectItem>
                  <SelectItem value="Session 2">Session 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="speaker">발표자</Label>
              <Input
                id="speaker"
                value={formData.speaker}
                onChange={(e) => setFormData({ ...formData, speaker: e.target.value })}
                placeholder="발표자 이름"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="topic">주제</Label>
              <Input
                id="topic"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                placeholder="발표 주제"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order">순서</Label>
              <Input
                id="order"
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: Number.parseInt(e.target.value) || 1 })}
                min="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">상태</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="대기">대기</SelectItem>
                  <SelectItem value="진행중">진행중</SelectItem>
                  <SelectItem value="평가">평가</SelectItem>
                  <SelectItem value="완료">완료</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleSave} className="bg-sk-red hover:bg-sk-red/90">
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
