"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, MessageSquare, Video, Loader2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect, useRef } from "react"
import {
  fetchPresentations,
  fetchPresenters,
  generateQnAQuestions,
  fetchQnAQuestions,
  uploadDocxTranscript,
  type PresentationResponse,
  type PresenterResponse,
} from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function Session2OperationPage() {
  const [selectedPresentation, setSelectedPresentation] = useState("")
  const [presentations, setPresentations] = useState<PresentationResponse[]>([])
  const [presenters, setPresenters] = useState<PresenterResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGeneratingQnA, setIsGeneratingQnA] = useState(false)
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false)
  const [isUploadingDocx, setIsUploadingDocx] = useState(false)
  const [selectedDocxFile, setSelectedDocxFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // 발표 목록 로드
  useEffect(() => {
    loadPresentations()
  }, [])

  const loadPresentations = async () => {
    try {
      setIsLoading(true)
      const [presentationsData, presentersData] = await Promise.all([
        fetchPresentations("세션2"),
        fetchPresenters(),
      ])
      setPresentations(presentationsData)
      setPresenters(presentersData)
      
      // 첫 번째 발표 자동 선택
      if (presentationsData.length > 0) {
        setSelectedPresentation(presentationsData[0].presentation_id)
      }
    } catch (error) {
      console.error("발표 목록 조회 실패:", error)
      toast({
        variant: "destructive",
        title: "오류",
        description: "발표 목록을 불러오는데 실패했습니다.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDocxFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // DOCX 파일인지 확인
      if (!file.name.endsWith('.docx')) {
        toast({
          variant: "destructive",
          title: "오류",
          description: "DOCX 파일만 업로드 가능합니다.",
        })
        return
      }
      setSelectedDocxFile(file)
    }
  }

  const handleUploadDocx = async () => {
    if (!selectedPresentation || !selectedDocxFile) {
      toast({
        variant: "destructive",
        title: "오류",
        description: "발표와 DOCX 파일을 선택해주세요.",
      })
      return
    }

    if (!window.confirm(`선택된 DOCX 파일을 업로드하시겠습니까?\n파일명: ${selectedDocxFile.name}\n\n기존 STT 트랜스크립트가 있다면 삭제됩니다.`)) {
      return
    }

    try {
      setIsUploadingDocx(true)
      const result = await uploadDocxTranscript(selectedPresentation, selectedDocxFile)
      
      toast({
        title: "성공",
        description: `DOCX 파일이 업로드되었습니다. (트랜스크립트: ${result.transcript_count}개, 총 시간: ${Math.floor(result.total_duration_ms / 60000)}분 ${Math.floor((result.total_duration_ms % 60000) / 1000)}초)`,
      })
      
      // 파일 선택 초기화
      setSelectedDocxFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error("DOCX 파일 업로드 실패:", error)
      toast({
        variant: "destructive",
        title: "오류",
        description: error instanceof Error ? error.message : "DOCX 파일 업로드에 실패했습니다.",
      })
    } finally {
      setIsUploadingDocx(false)
    }
  }

  const handleGenerateQnA = async () => {
    if (!window.confirm("선택된 발표에 대한 Q&A를 생성하시겠습니까?\nAI가 발표 자료와 STT를 분석하여 질문을 생성합니다. (처리 시간: 약 30초~1분)")) {
      return
    }

    try {
      setIsGeneratingQnA(true)
      const result = await generateQnAQuestions(selectedPresentation)
      
      toast({
        title: "성공",
        description: `Q&A 질문이 생성되었습니다. (첫 번째 질문: ${result.question_text})`,
      })
      
      // 생성된 Q&A 목록 조회하여 토스트 추가
      const qnas = await fetchQnAQuestions(selectedPresentation)
      toast({
        title: "정보",
        description: `총 ${qnas.length}개의 Q&A가 생성되었습니다.`,
      })
    } catch (error) {
      console.error("Q&A 생성 실패:", error)
      toast({
        variant: "destructive",
        title: "오류",
        description: error instanceof Error ? error.message : "Q&A 생성에 실패했습니다.",
      })
    } finally {
      setIsGeneratingQnA(false)
    }
  }

  

  const handleGenerateVideo = async () => {
    if (!window.confirm("영상을 생성하시겠습니까?\n선택된 Q&A들의 아바타 비디오를 생성합니다.")) {
      return
    }

    try {
      setIsGeneratingVideo(true)
      
      // 선택된 Q&A 목록 조회
      const qnas = await fetchQnAQuestions(selectedPresentation)
      const selectedQnas = qnas.filter(q => q.is_selected)
      
      if (selectedQnas.length === 0) {
        toast({
          variant: "destructive",
          title: "알림",
          description: "선택된 Q&A가 없습니다. Q&A 관리 페이지에서 Q&A를 선택해주세요.",
        })
        return
      }
      
      toast({
        title: "정보",
        description: `선택된 ${selectedQnas.length}개의 Q&A에 대한 영상 생성 요청이 접수되었습니다. Q&A 관리 페이지에서 진행 상황을 확인하세요.`,
      })
      
      // TODO: 실제 아바타 비디오 생성 API 연동
      // 각 Q&A에 대해 generateAvatarVideo 호출 필요
      
    } catch (error) {
      console.error("영상 생성 실패:", error)
      toast({
        variant: "destructive",
        title: "오류",
        description: error instanceof Error ? error.message : "영상 생성에 실패했습니다.",
      })
    } finally {
      setIsGeneratingVideo(false)
    }
  }

  const getPresentationName = (presentationId: string): string => {
    const presentation = presentations.find(p => p.presentation_id === presentationId)
    if (!presentation) return presentationId
    
    const presenter = presenters.find(p => p.presenter_id === presentation.presenter_id)
    return `${presentation.topic} - ${presenter?.name || '알 수 없음'}`
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
            {isLoading ? (
              <div className="flex items-center justify-center py-3">
                <Loader2 className="w-5 h-5 animate-spin text-sk-red" />
              </div>
            ) : presentations.length === 0 ? (
              <div className="text-sm text-muted-foreground py-3 text-center">
                세션2 발표가 없습니다.
              </div>
            ) : (
              <Select value={selectedPresentation} onValueChange={setSelectedPresentation}>
                <SelectTrigger className="w-full bg-background border-input">
                  <SelectValue placeholder="발표를 선택하세요" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border shadow-lg">
                  {presentations.map((presentation) => (
                    <SelectItem key={presentation.presentation_id} value={presentation.presentation_id} className="bg-background hover:bg-accent">
                      {getPresentationName(presentation.presentation_id)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </motion.div>

        {/* Operation Buttons */}
        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div className="corporate-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                    <Upload className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">DOCX 트랜스크립트 업로드</h3>
                    <p className="text-sm text-muted-foreground">DOCX 파일로 STT 트랜스크립트를 업로드합니다</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".docx"
                    onChange={handleDocxFileSelect}
                    className="hidden"
                    id="docx-file-input-session2"
                  />
                  <label
                    htmlFor="docx-file-input-session2"
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <span className="text-sm text-muted-foreground">
                      {selectedDocxFile ? selectedDocxFile.name : "DOCX 파일 선택..."}
                    </span>
                  </label>
                  <Button
                    onClick={handleUploadDocx}
                    disabled={!selectedPresentation || !selectedDocxFile || isUploadingDocx}
                    className="bg-purple-500 hover:bg-purple-600"
                  >
                    {isUploadingDocx ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        업로드 중...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        업로드
                      </>
                    )}
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground">
                  <p>• 클로바노트 →  음성기록 다운로드 → word문서(포함정보 : 시간기록)</p>
                  <p>• 업로드 시 기존 STT 트랜스크립트가 삭제됩니다</p>
                </div>
              </div>
            </div>
          </motion.div>

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
                  disabled={!selectedPresentation || isGeneratingQnA}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  {isGeneratingQnA ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      생성 중...
                    </>
                  ) : (
                    "생성"
                  )}
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
                  disabled={!selectedPresentation || isGeneratingVideo}
                  className="bg-green-500 hover:bg-green-600"
                >
                  {isGeneratingVideo ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      생성 중...
                    </>
                  ) : (
                    "생성"
                  )}
                </Button>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <div className="corporate-card rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-sk-red/10 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-sk-red" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">Q&A 관리</h3>
                    <p className="text-sm text-muted-foreground">Q&A 질문을 추가, 수정, 삭제하고 선택합니다</p>
                  </div>
                </div>
                <Link href="/operation/session2/qna">
                  <Button className="bg-sk-red hover:bg-sk-red/90">
                    Q&A 관리
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
