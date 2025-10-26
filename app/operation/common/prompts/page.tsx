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

interface Prompt {
  id: number
  presentation: string
  type: string
  content: string
}

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([
    {
      id: 1,
      presentation: "AI 기술의 미래",
      type: "AI 평가",
      content: "발표 내용의 기술적 정확성과 혁신성을 평가해주세요...",
    },
    {
      id: 2,
      presentation: "AI 기술의 미래",
      type: "AI Implication",
      content: "이 발표가 산업에 미칠 영향을 분석해주세요...",
    },
    {
      id: 3,
      presentation: "반도체 산업 전망",
      type: "질문생성",
      content: "발표 내용을 바탕으로 심화 질문을 생성해주세요...",
    },
  ])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null)
  const [formData, setFormData] = useState({
    presentation: "",
    type: "",
    content: "",
  })

  const handleAdd = () => {
    setEditingPrompt(null)
    setFormData({ presentation: "", type: "", content: "" })
    setIsDialogOpen(true)
  }

  const handleEdit = (prompt: Prompt) => {
    setEditingPrompt(prompt)
    setFormData({
      presentation: prompt.presentation,
      type: prompt.type,
      content: prompt.content,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: number) => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      setPrompts(prompts.filter((p) => p.id !== id))
    }
  }

  const handleSave = () => {
    if (!formData.presentation || !formData.type || !formData.content) {
      alert("모든 필드를 입력해주세요.")
      return
    }

    if (editingPrompt) {
      setPrompts(prompts.map((p) => (p.id === editingPrompt.id ? { ...p, ...formData } : p)))
    } else {
      const newPrompt: Prompt = {
        id: Math.max(...prompts.map((p) => p.id), 0) + 1,
        ...formData,
      }
      setPrompts([...prompts, newPrompt])
    }

    setIsDialogOpen(false)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "AI 평가":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "AI Implication":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      case "질문생성":
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
            <Button onClick={handleAdd} className="bg-sk-red hover:bg-sk-red/90">
              <Plus className="w-4 h-4 mr-2" />
              프롬프트 추가
            </Button>
          </div>
        </motion.div>

        <div className="space-y-3">
          {prompts.map((prompt, index) => (
            <motion.div
              key={prompt.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <div className="corporate-card rounded-xl p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant="outline" className="border-sk-red/30 text-sk-red">
                        {prompt.presentation}
                      </Badge>
                      <Badge variant="outline" className={getTypeColor(prompt.type)}>
                        {prompt.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{prompt.content}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button onClick={() => handleEdit(prompt)} variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(prompt.id)}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingPrompt ? "프롬프트 수정" : "프롬프트 추가"}</DialogTitle>
            <DialogDescription>프롬프트 정보를 입력해주세요.</DialogDescription>
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
              <Label htmlFor="type">타입</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="타입 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AI 평가">AI 평가</SelectItem>
                  <SelectItem value="AI Implication">AI Implication</SelectItem>
                  <SelectItem value="질문생성">질문생성</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">내용</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="프롬프트 내용을 입력하세요"
                rows={6}
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
