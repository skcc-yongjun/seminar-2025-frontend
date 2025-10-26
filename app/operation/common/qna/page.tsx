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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

interface QnA {
  id: number
  presentation: string
  question: string
  character: string
  answer: string
}

export default function QnaPage() {
  const [qnas, setQnas] = useState<QnA[]>([
    {
      id: 1,
      presentation: "친환경 에너지",
      question: "재생 에너지의 경제성은 어떻게 평가하시나요?",
      character: "전문가",
      answer: "재생 에너지는 초기 투자 비용이 높지만 장기적으로는...",
    },
    {
      id: 2,
      presentation: "친환경 에너지",
      question: "수소 에너지의 상용화 시기는 언제쯤 예상하시나요?",
      character: "CEO",
      answer: "현재 기술 발전 속도를 고려하면 2030년경에는...",
    },
  ])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingQna, setEditingQna] = useState<QnA | null>(null)
  const [formData, setFormData] = useState({
    presentation: "",
    question: "",
    character: "",
    answer: "",
  })

  const handleAdd = () => {
    setEditingQna(null)
    setFormData({ presentation: "", question: "", character: "", answer: "" })
    setIsDialogOpen(true)
  }

  const handleEdit = (qna: QnA) => {
    setEditingQna(qna)
    setFormData({
      presentation: qna.presentation,
      question: qna.question,
      character: qna.character,
      answer: qna.answer,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: number) => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      setQnas(qnas.filter((q) => q.id !== id))
    }
  }

  const handleSave = () => {
    if (!formData.presentation || !formData.question || !formData.character || !formData.answer) {
      alert("모든 필드를 입력해주세요.")
      return
    }

    if (editingQna) {
      setQnas(qnas.map((q) => (q.id === editingQna.id ? { ...q, ...formData } : q)))
    } else {
      const newQna: QnA = {
        id: Math.max(...qnas.map((q) => q.id), 0) + 1,
        ...formData,
      }
      setQnas([...qnas, newQna])
    }

    setIsDialogOpen(false)
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
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Q&A 관리</h1>
              <p className="text-muted-foreground">Session 2 Q&A를 관리합니다</p>
            </div>
            <Button onClick={handleAdd} className="bg-sk-red hover:bg-sk-red/90">
              <Plus className="w-4 h-4 mr-2" />
              Q&A 추가
            </Button>
          </div>
        </motion.div>

        <div className="space-y-4">
          {qnas.map((qna, index) => (
            <motion.div
              key={qna.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <div className="corporate-card rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="border-sk-red/30 text-sk-red">
                      {qna.presentation}
                    </Badge>
                    <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                      {qna.character}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleEdit(qna)} variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(qna.id)}
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive bg-transparent"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">질문</p>
                    <p className="text-sm text-foreground">{qna.question}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">답변</p>
                    <p className="text-sm text-muted-foreground">{qna.answer}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingQna ? "Q&A 수정" : "Q&A 추가"}</DialogTitle>
            <DialogDescription>Q&A 정보를 입력해주세요.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="presentation">발표</Label>
              <Input
                id="presentation"
                value={formData.presentation}
                onChange={(e) => setFormData({ ...formData, presentation: e.target.value })}
                placeholder="발표 제목"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="character">캐릭터</Label>
              <Select
                value={formData.character}
                onValueChange={(value) => setFormData({ ...formData, character: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="캐릭터 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CEO">CEO</SelectItem>
                  <SelectItem value="전문가">전문가</SelectItem>
                  <SelectItem value="일반인">일반인</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="question">질문</Label>
              <Textarea
                id="question"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                placeholder="질문 내용을 입력하세요"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="answer">답변</Label>
              <Textarea
                id="answer"
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                placeholder="답변 내용을 입력하세요"
                rows={4}
              />
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
