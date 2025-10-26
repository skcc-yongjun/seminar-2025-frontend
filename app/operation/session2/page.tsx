"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, MessageSquare, RefreshCw, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

export default function Session2OperationPage() {
  const [selectedPresentation, setSelectedPresentation] = useState("")

  // Mock data - replace with actual data fetching
  const presentations = [
    { id: "1", name: "친환경 에너지 - 박민수" },
    { id: "2", name: "디지털 전환 전략 - 최지영" },
  ]

  const handleGenerateQnA = () => {
    if (window.confirm("선택된 발표에 대한 Q&A를 생성하시겠습니까?")) {
      // Implement Q&A generation logic
      console.log("[v0] Generating Q&A for presentation:", selectedPresentation)
    }
  }

  const handleReplaceQnA = () => {
    if (window.confirm("Q&A를 준비된 것으로 대체하시겠습니까? (영상도 함께 생성됩니다)")) {
      // Implement Q&A replacement logic
      console.log("[v0] Replacing Q&A for presentation:", selectedPresentation)
    }
  }

  const handleGenerateVideo = () => {
    if (window.confirm("영상을 생성하시겠습니까?")) {
      // Implement video generation logic
      console.log("[v0] Generating video for presentation:", selectedPresentation)
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
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-sk-red transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>돌아가기</span>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Session 2 Operation</h1>
          <p className="text-muted-foreground">Session 2 운영 관리 화면</p>
        </motion.div>

        {/* Presentation Selector */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="corporate-card rounded-xl p-6 mb-6">
            <label className="text-sm font-medium text-foreground mb-3 block">발표 선택</label>
            <Select value={selectedPresentation} onValueChange={setSelectedPresentation}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="발표를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {presentations.map((presentation) => (
                  <SelectItem key={presentation.id} value={presentation.id}>
                    {presentation.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Operation Buttons */}
        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="corporate-card rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">Q&A 생성</h3>
                    <p className="text-sm text-muted-foreground">선택된 발표에 대한 Q&A를 생성합니다</p>
                  </div>
                </div>
                <Button
                  onClick={handleGenerateQnA}
                  disabled={!selectedPresentation}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  생성
                </Button>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="corporate-card rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">Q&A 대체</h3>
                    <p className="text-sm text-muted-foreground">준비된 Q&A로 대체 (영상도 함께 생성)</p>
                  </div>
                </div>
                <Button
                  onClick={handleReplaceQnA}
                  disabled={!selectedPresentation}
                  className="bg-purple-500 hover:bg-purple-600"
                >
                  대체
                </Button>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <div className="corporate-card rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <Video className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">영상 생성</h3>
                    <p className="text-sm text-muted-foreground">문제 발생 시 영상을 재생성합니다</p>
                  </div>
                </div>
                <Button
                  onClick={handleGenerateVideo}
                  disabled={!selectedPresentation}
                  className="bg-green-500 hover:bg-green-600"
                >
                  생성
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
