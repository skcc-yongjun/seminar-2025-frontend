"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, Plus, Edit, Trash2 } from "lucide-react"
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
import { useState } from "react"

interface Speaker {
  id: number
  name: string
  company: string
}

export default function SpeakersPage() {
  const [speakers, setSpeakers] = useState<Speaker[]>([
    { id: 1, name: "김철수", company: "SK텔레콤" },
    { id: 2, name: "이영희", company: "SK하이닉스" },
    { id: 3, name: "박민수", company: "SK이노베이션" },
  ])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSpeaker, setEditingSpeaker] = useState<Speaker | null>(null)
  const [formData, setFormData] = useState({ name: "", company: "" })

  const handleAdd = () => {
    setEditingSpeaker(null)
    setFormData({ name: "", company: "" })
    setIsDialogOpen(true)
  }

  const handleEdit = (speaker: Speaker) => {
    setEditingSpeaker(speaker)
    setFormData({ name: speaker.name, company: speaker.company })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: number) => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      setSpeakers(speakers.filter((s) => s.id !== id))
    }
  }

  const handleSave = () => {
    if (!formData.name || !formData.company) {
      alert("모든 필드를 입력해주세요.")
      return
    }

    if (editingSpeaker) {
      // Update existing speaker
      setSpeakers(speakers.map((s) => (s.id === editingSpeaker.id ? { ...s, ...formData } : s)))
    } else {
      // Add new speaker
      const newSpeaker: Speaker = {
        id: Math.max(...speakers.map((s) => s.id), 0) + 1,
        ...formData,
      }
      setSpeakers([...speakers, newSpeaker])
    }

    setIsDialogOpen(false)
    setFormData({ name: "", company: "" })
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

        <div className="space-y-3">
          {speakers.map((speaker, index) => (
            <motion.div
              key={speaker.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <div className="corporate-card rounded-xl p-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">{speaker.name}</h3>
                  <p className="text-sm text-muted-foreground">{speaker.company}</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleEdit(speaker)} variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(speaker.id)}
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive bg-transparent"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">회사</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="소속 회사"
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
