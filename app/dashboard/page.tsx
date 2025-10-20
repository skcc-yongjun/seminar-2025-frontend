"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Trophy } from "lucide-react"
import { ScoreBarChart } from "@/components/score-bar-chart"
import { ScoreRadarChart } from "@/components/score-radar-chart"
import { RankingList } from "@/components/ranking-list"
import { KeywordStream } from "@/components/keyword-stream"
import { SummarySheet } from "@/components/summary-sheet"
import { JarvisVisualizer } from "@/components/jarvis-visualizer"
import Link from "next/link"
import { BarChart3, Home } from "lucide-react"
import { Network } from "lucide-react"
import { MessageSquare } from "lucide-react"

export default function LiveDashboard() {
  const [mode, setMode] = useState<"live" | "afterview">("live")
  const [currentSpeaker, setCurrentSpeaker] = useState({
    name: "SK AX 윤풍영",
    scores: {
      "전략 명확성": 7.5,
      "실행 구체성": 7.8,
      "혁신 차별성": 8.2,
      "그룹 연계성": 7.0,
    },
  })

  const [ranking, setRanking] = useState([
    { name: "SK AX 윤풍영", total: 7.6, change: 0, rank: 1 },
    { name: "SK하이닉스 곽노정", total: 7.4, change: 0, rank: 2 },
    { name: "SK텔레콤 유영상", total: 7.3, change: 1, rank: 3 },
    { name: "SK네트웍스 이호정", total: 7.1, change: -1, rank: 4 },
    { name: "SK이노베이션 박상규", total: 7.0, change: 0, rank: 5 },
    { name: "SK가스 윤병석", total: 6.9, change: 0, rank: 6 },
    { name: "SK바이오사이언스 안재용", total: 6.8, change: 0, rank: 7 },
    { name: "SK온 이석희", total: 6.7, change: 0, rank: 8 },
  ])

  const [keywords, setKeywords] = useState([
    { term: "글로벌 벤치마크", sentiment: "positive", isNew: false },
    { term: "본원경쟁력", sentiment: "positive", isNew: false },
    { term: "Function(MPR/S)", sentiment: "neutral", isNew: false },
    { term: "실행 연계", sentiment: "positive", isNew: false },
    { term: "ROI 15%", sentiment: "positive", isNew: false },
  ])

  const [comments, setComments] = useState([
    {
      timestamp: "00:05",
      text: "실행 구체성: 단계/마일스톤 제시 양호",
      evidence: "슬라이드 7: 실행 로드맵",
    },
    {
      timestamp: "00:12",
      text: "전략 명확성: 글로벌 벤치마크 비교 우수",
      evidence: "슬라이드 3: 경쟁사 분석",
    },
    {
      timestamp: "00:18",
      text: "혁신 차별성: Function 연계 방안 구체적",
      evidence: "슬라이드 10: MPR/S 통합",
    },
  ])

  const [timer, setTimer] = useState(0)
  const [burstingComments, setBurstingComments] = useState<string[]>([])
  const [blinkingComment, setBlinkingComment] = useState<string | null>(null)

  const summary = {
    total: 8.3,
    comment: "전략 명확성과 그룹 연계성에서 높은 평가. 혁신 차별성은 추가 근거 제시 필요.",
    aei: 7.9,
    topKeywords: [
      { term: "글로벌", score: 0.92 },
      { term: "본원경쟁력", score: 0.88 },
      { term: "Function", score: 0.84 },
      { term: "MPR/S", score: 0.8 },
      { term: "실행연계", score: 0.79 },
    ],
    hotspots: [
      { time: 120, intensity: 0.9, label: "데이터 표준화" },
      { time: 380, intensity: 0.8, label: "ROI 15%" },
      { time: 520, intensity: 0.75, label: "MPR/S 연계" },
    ],
    repComments: [
      { sentiment: "positive", text: "그룹 연계 로드맵이 구체적이어서 신뢰감이 큽니다." },
      { sentiment: "negative", text: "혁신 항목의 차별성 근거가 더 필요해 보입니다." },
      { sentiment: "positive", text: "'26년 목표와 실행 연결이 명확합니다." },
    ],
    allKeywords: keywords,
  }

  const handleCloseSummary = (open: boolean) => {
    setMode(open ? "afterview" : "live")
    if (!open) {
      setTimer(0)
    }
  }

  const handleKeywordBurst = () => {
    const newKeywords = ["디지털 전환", "시너지 효과", "경쟁우위", "핵심역량", "가치창출", "지속가능성", "혁신전략"]
    const randomKeyword = newKeywords[Math.floor(Math.random() * newKeywords.length)]

    setKeywords((prev) => {
      if (prev.some((k) => k.term === randomKeyword)) return prev
      return [
        ...prev.slice(-4),
        {
          term: randomKeyword,
          sentiment: Math.random() > 0.3 ? "positive" : "neutral",
          isNew: true,
        },
      ]
    })
  }

  const handleCommentBurst = (timestamp: string) => {
    setBurstingComments((prev) => [...prev, timestamp])
    setTimeout(() => {
      setBurstingComments((prev) => prev.filter((t) => t !== timestamp))
    }, 2500)
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSpeaker((prev) => ({
        ...prev,
        scores: {
          "전략 명확성": Math.min(10, Math.max(0, prev.scores["전략 명확성"] + (Math.random() - 0.5) * 0.8)),
          "실행 구체성": Math.min(10, Math.max(0, prev.scores["실행 구체성"] + (Math.random() - 0.5) * 0.8)),
          "혁신 차별성": Math.min(10, Math.max(0, prev.scores["혁신 차별성"] + (Math.random() - 0.5) * 0.8)),
          "그룹 연계성": Math.min(10, Math.max(0, prev.scores["그룹 연계성"] + (Math.random() - 0.5) * 0.8)),
        },
      }))

      setRanking((prev) => {
        const updated = prev.map((item) => ({
          ...item,
          total: Math.min(10, Math.max(0, item.total + (Math.random() - 0.5) * 0.5)),
        }))

        const sorted = [...updated].sort((a, b) => b.total - a.total)

        return sorted.map((item, index) => {
          const oldRank = prev.find((p) => p.name === item.name)?.rank || index + 1
          const newRank = index + 1
          return {
            ...item,
            rank: newRank,
            change: oldRank - newRank,
          }
        })
      })

      handleKeywordBurst()
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (mode !== "live") return

    const commentTemplates = [
      { text: "전략 명확성: 목표 설정이 명확하고 측정 가능합니다", evidence: "슬라이드 5: KPI 정의" },
      { text: "실행 구체성: 단계별 실행 계획이 체계적입니다", evidence: "슬라이드 8: 실행 타임라인" },
      { text: "혁신 차별성: 경쟁사 대비 차별화 요소가 뚜렷합니다", evidence: "슬라이드 12: 경쟁 우위" },
      { text: "그룹 연계성: 타 계열사와의 시너지 방안이 구체적입니다", evidence: "슬라이드 15: 협업 모델" },
      { text: "데이터 근거: 정량적 분석이 설득력 있습니다", evidence: "슬라이드 6: 시장 분석" },
      { text: "리스크 관리: 잠재적 위험 요소 파악이 적절합니다", evidence: "슬라이드 14: 리스크 매트릭스" },
    ]

    const commentInterval = setInterval(() => {
      setTimer((currentTimer) => {
        const minutes = Math.floor(currentTimer / 60)
        const seconds = currentTimer % 60
        const timestamp = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`

        const randomComment = commentTemplates[Math.floor(Math.random() * commentTemplates.length)]

        console.log("[v0] Triggering comment burst for:", timestamp)
        handleCommentBurst(timestamp)

        setTimeout(() => {
          console.log("[v0] Adding comment to list:", timestamp)
          setComments((prev) => [
            ...prev,
            {
              timestamp,
              ...randomComment,
            },
          ])
        }, 1500)

        return currentTimer
      })
    }, 30000)

    return () => clearInterval(commentInterval)
  }, [mode])

  useEffect(() => {
    if (mode !== "live") return

    const timerInterval = setInterval(() => {
      setTimer((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(timerInterval)
  }, [mode])

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      if (comments.length > 0) {
        const latestComment = comments[comments.length - 1]
        setBlinkingComment(latestComment.timestamp)

        setTimeout(() => {
          setBlinkingComment(null)
        }, 2000)
      }
    }, 10000)

    return () => clearInterval(blinkInterval)
  }, [comments])

  return (
    <div className="min-h-screen p-4 md:p-6 relative overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sk-red/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sk-red/3 rounded-full blur-3xl" />
      </div>

      <div className="max-w-[1600px] mx-auto space-y-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between border-b border-border/30 pb-4"
        >
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-sk-red rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">SK</span>
              </div>
              <div className="border-l border-border/50 pl-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">SK Group</p>
                <p className="text-sm font-semibold text-foreground">{"CEO 세미나"}</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-xl md:text-2xl font-semibold text-balance mb-1 text-foreground">
              Global Top-tier 대비 O/I 경쟁력 분석 및 개선방안
            </h1>
            <p className="text-xs text-muted-foreground flex items-center justify-end gap-2">
              <Sparkles className="w-3 h-3 text-sk-red" />
              AI 실시간 평가 시스템
              <span className="ml-3 text-sk-red font-mono font-semibold">
                {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, "0")}
              </span>
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <div className="corporate-card border-2 border-sk-red/50 bg-gradient-to-r from-sk-red/10 via-sk-red/5 to-transparent p-4 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [1, 0.5, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                    className="absolute inset-0 bg-sk-red rounded-full blur-md"
                  />
                  <div className="relative bg-sk-red text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                    LIVE
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">현재 발표 중</p>
                  <p className="text-lg font-bold text-foreground">{currentSpeaker.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">현재 평균 점수</p>
                  <p className="text-2xl font-bold text-sk-red">
                    {(
                      Object.values(currentSpeaker.scores).reduce((a, b) => a + b, 0) /
                      Object.values(currentSpeaker.scores).length
                    ).toFixed(1)}
                  </p>
                </div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  className="w-10 h-10 border-2 border-sk-red/30 border-t-sk-red rounded-full"
                />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="col-span-12"
        >
          <Card className="corporate-card shadow-lg border-sk-red/30">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2 font-semibold">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  className="w-4 h-4 border-2 border-sk-red/30 border-t-sk-red rounded-full"
                />
                AI 분석 중
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-3">
                      <Trophy className="w-4 h-4 text-sk-red" />
                      실시간 랭킹 TOP 3
                    </h3>
                    <RankingList ranking={ranking.slice(0, 3)} currentSpeaker={currentSpeaker.name} compact />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-3">
                      <BarChart3 className="w-4 h-4 text-sk-red" />
                      실시간 점수
                    </h3>
                    <div className="space-y-3">
                      <ScoreBarChart scores={currentSpeaker.scores} />
                      <div className="pt-1">
                        <ScoreRadarChart scores={currentSpeaker.scores} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-between h-full min-h-[600px]">
                  <div className="flex-1 flex items-center justify-center">
                    <JarvisVisualizer size="large" onKeywordBurst={handleKeywordBurst} />
                  </div>

                  <div className="corporate-card p-4 rounded-lg border border-sk-red/20">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3">분석 현황</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">총 코멘트</p>
                        <p className="text-2xl font-bold text-sk-red">{comments.length}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">분석 시간</p>
                        <p className="text-lg font-semibold text-foreground">
                          {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, "0")}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">평균 점수</p>
                        <p className="text-lg font-semibold text-foreground">
                          {(
                            Object.values(currentSpeaker.scores).reduce((a, b) => a + b, 0) /
                            Object.values(currentSpeaker.scores).length
                          ).toFixed(1)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-3">
                      <MessageSquare className="w-4 h-4 text-sk-red" />
                      AI 코멘트
                    </h3>

                    <AnimatePresence>
                      {burstingComments.map((timestamp) => {
                        const comment = comments.find((c) => c.timestamp === timestamp)
                        if (!comment) return null

                        return (
                          <motion.div
                            key={`burst-${timestamp}`}
                            initial={{
                              position: "fixed",
                              left: "50%",
                              top: "50%",
                              x: "-50%",
                              y: "-50%",
                              opacity: 1,
                              scale: 0.3,
                            }}
                            animate={{
                              left: "auto",
                              top: "auto",
                              x: 0,
                              y: 0,
                              opacity: 0,
                              scale: 2,
                            }}
                            exit={{ opacity: 0 }}
                            transition={{
                              duration: 1.5,
                              ease: [0.34, 1.56, 0.64, 1],
                            }}
                            className="pointer-events-none"
                            style={{
                              zIndex: 99999,
                            }}
                          >
                            <div
                              className="p-3 bg-gradient-to-br from-sk-red via-sk-red/95 to-sk-red/80 rounded-lg border-2 border-white shadow-2xl min-w-[280px]"
                              style={{
                                filter:
                                  "drop-shadow(0 0 40px rgba(234, 0, 44, 1)) drop-shadow(0 0 80px rgba(234, 0, 44, 0.8))",
                              }}
                            >
                              <div className="flex items-start gap-2">
                                <MessageSquare className="w-4 h-4 text-white mt-1 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs text-white font-mono font-bold">{comment.timestamp}</span>
                                  </div>
                                  <p className="text-sm leading-relaxed text-white font-semibold">{comment.text}</p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>

                    <div className="space-y-2 pr-2">
                      {comments
                        .slice(-5)
                        .reverse()
                        .map((comment, index) => {
                          const isBursting = burstingComments.includes(comment.timestamp)
                          const isBlinking = blinkingComment === comment.timestamp

                          return (
                            <motion.div
                              key={`${comment.timestamp}-${index}`}
                              initial={{ opacity: 0, x: 50, scale: 0.8 }}
                              animate={{ opacity: 1, x: 0, scale: 1 }}
                              transition={{
                                delay: isBursting ? 1.5 : index * 0.1,
                                type: "spring",
                                stiffness: 150,
                                damping: 20,
                              }}
                              className={`p-3 bg-sk-red/5 rounded-lg border backdrop-blur-sm hover:bg-sk-red/10 transition-colors relative overflow-hidden ${
                                isBlinking ? "border-sk-red animate-pulse" : "border-sk-red/20"
                              }`}
                            >
                              {isBlinking && (
                                <>
                                  <motion.span
                                    initial={{ scale: 0, opacity: 1 }}
                                    animate={{ scale: [0, 2, 0], opacity: [1, 0.3, 0] }}
                                    transition={{ duration: 1, repeat: 2 }}
                                    className="absolute inset-0 bg-sk-red/30 rounded-lg"
                                  />
                                  <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: [0, 1, 0] }}
                                    transition={{ duration: 0.5, repeat: 4 }}
                                    className="absolute inset-0 border-2 border-sk-red rounded-lg shadow-lg shadow-sk-red/50"
                                  />
                                </>
                              )}
                              <div className="flex items-start gap-2 relative z-10">
                                <MessageSquare
                                  className={`w-3 h-3 mt-1 flex-shrink-0 ${isBlinking ? "text-sk-red animate-pulse" : "text-sk-red"}`}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs text-muted-foreground font-mono">{comment.timestamp}</span>
                                    {isBlinking && (
                                      <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="inline-block w-2 h-2 bg-sk-red rounded-full animate-pulse"
                                      />
                                    )}
                                  </div>
                                  <p className="text-xs leading-relaxed">{comment.text}</p>
                                </div>
                              </div>
                            </motion.div>
                          )
                        })}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-sk-red" />
                      키워드 하이라이트
                    </h3>
                    <KeywordStream keywords={keywords} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-between pt-3 border-t border-border/30"
        >
          <p className="text-xs text-muted-foreground">© 2025 SK Group. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button
                size="sm"
                variant="outline"
                className="gap-2 border-border/30 hover:bg-muted/50 text-foreground transition-all duration-300 bg-transparent"
              >
                <Home className="w-4 h-4" />
                홈으로
              </Button>
            </Link>
            <Link href="/architecture">
              
            </Link>
            <Link href="/all-summary">
              <Button
                size="sm"
                variant="outline"
                className="gap-2 border-sk-red/30 hover:bg-sk-red/10 text-foreground transition-all duration-300 bg-transparent"
              >
                <BarChart3 className="w-4 h-4" />
                전체 요약 보기
              </Button>
            </Link>
            <Button
              size="sm"
              onClick={() => setMode("afterview")}
              className="gap-2 bg-sk-red hover:bg-sk-red/90 text-white transition-all duration-300 shadow-md"
            >
              발표 종료 및 요약 보기
            </Button>
          </div>
        </motion.div>
      </div>

      <SummarySheet open={mode === "afterview"} onOpenChange={handleCloseSummary} summary={summary} />
    </div>
  )
}
