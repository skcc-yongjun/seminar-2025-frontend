"use client"

import { useMemo, useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, BarChart3, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import {
  fetchPresentationsWithPresenters,
  fetchAIEvaluationScores,
  fetchHumanEvaluationAverageScores,
  PresentationWithPresenter,
} from "@/lib/api"

interface RankingData {
  rank: number
  company: string
  ceo: string
  score: number
  topic?: string
  presentation_id?: string
}

export default function RankingPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [allAiRankings, setAllAiRankings] = useState<RankingData[]>([])
  const [allOnsiteRankings, setAllOnsiteRankings] = useState<RankingData[]>([])
  const [allCombinedRankings, setAllCombinedRankings] = useState<RankingData[]>([])

  // 데이터 로딩
  useEffect(() => {
    const loadRankingData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // 세션1 발표 목록 가져오기
        const presentations = await fetchPresentationsWithPresenters('세션1')
        
        // 각 발표의 점수 가져오기
        const aiScoresPromises = presentations.map(async (presentation) => {
          try {
            const scores = await fetchAIEvaluationScores(presentation.presentation_id)
            // 모든 카테고리 점수의 평균 계산
            const avgScore = scores.length > 0
              ? scores.reduce((sum, s) => {
                  const score = typeof s.score === 'string' ? parseFloat(s.score) : s.score
                  return sum + score
                }, 0) / scores.length
              : 0
            
            return {
              presentationId: presentation.presentation_id,
              company: presentation.presenter?.company || "회사",
              ceo: presentation.presenter?.name || "발표자",
              topic: presentation.topic,
              score: avgScore,
            }
          } catch (error) {
            console.warn(`AI 점수 로딩 실패 (${presentation.presentation_id}):`, error)
            return null
          }
        })

        const humanScoresPromises = presentations.map(async (presentation) => {
          try {
            const scores = await fetchHumanEvaluationAverageScores(presentation.presentation_id)
            // 모든 카테고리 평균 점수의 평균 계산
            const avgScore = scores.length > 0
              ? scores.reduce((sum, s) => {
                  const score = typeof s.avg_score === 'string' ? parseFloat(s.avg_score) : s.avg_score
                  return sum + score
                }, 0) / scores.length
              : 0
            
            return {
              presentationId: presentation.presentation_id,
              company: presentation.presenter?.company || "회사",
              ceo: presentation.presenter?.name || "발표자",
              topic: presentation.topic,
              score: avgScore,
            }
          } catch (error) {
            console.warn(`경영진 점수 로딩 실패 (${presentation.presentation_id}):`, error)
            return null
          }
        })

        const aiScoresData = await Promise.all(aiScoresPromises)
        const humanScoresData = await Promise.all(humanScoresPromises)

        // null 제거 및 정렬 (점수가 0이어도 포함하도록 수정)
        const validAiScores = aiScoresData.filter((d): d is NonNullable<typeof d> => d !== null)
        const validHumanScores = humanScoresData.filter((d): d is NonNullable<typeof d> => d !== null)
        
        console.log("AI 점수 데이터:", validAiScores.length, "개")
        console.log("경영진 점수 데이터:", validHumanScores.length, "개")

        // AI 랭킹 (전체)
        const aiRanked = validAiScores
          .sort((a, b) => b.score - a.score)
          .map((item, index) => ({
            rank: index + 1,
            company: item.company,
            ceo: item.ceo,
            score: item.score,
            topic: item.topic,
            presentation_id: item.presentationId,
          }))

        // 경영진 랭킹 (전체)
        const humanRanked = validHumanScores
          .sort((a, b) => b.score - a.score)
          .map((item, index) => ({
            rank: index + 1,
            company: item.company,
            ceo: item.ceo,
            score: item.score,
            topic: item.topic,
            presentation_id: item.presentationId,
          }))

        setAllAiRankings(aiRanked)
        setAllOnsiteRankings(humanRanked)

        // 종합 랭킹 계산
        const scoreMap = new Map<string, { company: string; ceo: string; aiScore: number; onsiteScore: number; topic?: string; presentation_id?: string }>()

        aiRanked.forEach((ai) => {
          scoreMap.set(ai.company, {
            company: ai.company,
            ceo: ai.ceo,
            aiScore: ai.score,
            onsiteScore: 0,
            topic: ai.topic,
            presentation_id: ai.presentation_id,
          })
        })

        humanRanked.forEach((onsite) => {
          const existing = scoreMap.get(onsite.company)
          if (existing) {
            existing.onsiteScore = onsite.score
          } else {
            scoreMap.set(onsite.company, {
              company: onsite.company,
              ceo: onsite.ceo,
              aiScore: 0,
              onsiteScore: onsite.score,
              topic: onsite.topic,
              presentation_id: onsite.presentation_id,
            })
          }
        })

        const combined = Array.from(scoreMap.values())
          .map((item) => ({
            company: item.company,
            ceo: item.ceo,
            score: item.aiScore > 0 && item.onsiteScore > 0 ? (item.aiScore + item.onsiteScore) / 2 : Math.max(item.aiScore, item.onsiteScore),
            topic: item.topic,
            presentation_id: item.presentation_id,
          }))
          .sort((a, b) => b.score - a.score)
          .map((item, index) => ({
            rank: index + 1,
            ...item,
          }))
        
        console.log("종합 랭킹:", combined.length, "개")

        setAllCombinedRankings(combined)
        
        console.log("랭킹 데이터 로딩 완료:", {
          aiCount: aiRanked.length,
          onsiteCount: humanRanked.length,
          combinedCount: combined.length,
        })
      } catch (error) {
        console.error("랭킹 데이터 로딩 실패:", error)
        setError("데이터를 불러오는데 실패했습니다.")
      } finally {
        setIsLoading(false)
      }
    }

    loadRankingData()
  }, [])

  // 표시할 데이터 필터링 (종합 랭킹은 항상 최대 3개만)
  const aiRankings = allAiRankings
  const onsiteRankings = allOnsiteRankings
  const combinedRankings = allCombinedRankings.slice(0, 3)

  // 디버깅을 위한 useEffect
  useEffect(() => {
    console.log("전체 종합 랭킹:", allCombinedRankings.length)
    console.log("표시할 종합 랭킹:", combinedRankings.length)
  }, [allCombinedRankings.length, combinedRankings.length])

  // AI 평가 목록 (6개 채우기)
  const aiDisplay = [
    ...aiRankings.slice(0, 6),
    ...Array(Math.max(0, 6 - aiRankings.length)).fill(null).map((_, idx) => ({
      company: `샘플회사${idx+1+aiRankings.length}`,
      score: 0,
      presentation_id: `dummy-ai-${idx}`,
      rank: aiRankings.length + idx + 1,
    }))
  ]
  
  // 경영진 평가 목록 (6개 채우기)
  const onsiteDisplay = [
    ...onsiteRankings.slice(0, 6),
    ...Array(Math.max(0, 6 - onsiteRankings.length)).fill(null).map((_, idx) => ({
      company: `샘플회사${idx+1+onsiteRankings.length}`,
      score: 0,
      presentation_id: `dummy-onsite-${idx}`,
      rank: onsiteRankings.length + idx + 1,
    }))
  ]

  const colors = ["#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899"]

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
              <p className="text-white text-lg">데이터를 불러오는 중...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 에러 상태
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-white text-lg mb-4">{error}</p>
              <Button 
                onClick={() => window.location.reload()}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                다시 시도
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen p-4 md:p-6 relative overflow-x-hidden"
      style={{ background: "linear-gradient(to bottom, #0a1628, #0f1f3a, #0a1628)" }}
    >
      {/* Animated grid background */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
          animate={{ backgroundPosition: ["0px 0px", "50px 50px"] }}
          transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />
      </div>

      {/* Scanning line */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          className="fixed inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(180deg, transparent 0%, rgba(6, 182, 212, 0.08) 50%, transparent 100%)",
            height: "200px",
          }}
          animate={{ top: ["-200px", "100%"] }}
          transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />
      </div>

      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        ))}
      </div>

      <div className="max-w-[1920px] mx-auto space-y-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between border-b border-cyan-500/20 pb-4"
        >
          <div className="flex items-center gap-6">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2 hover:bg-slate-800/50 text-slate-400 hover:text-white">
                <ArrowLeft className="w-4 h-4" />
                메인으로
              </Button>
            </Link>
            <div className="flex items-center gap-4">
              <motion.div
                className="relative w-14 h-14 rounded-xl flex items-center justify-center shadow-lg group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-500 rounded-xl blur-sm opacity-75 group-hover:opacity-100 transition-opacity"
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                />
                <div className="relative w-full h-full bg-slate-900 rounded-xl flex items-center justify-center border border-cyan-500/50 group-hover:border-cyan-400 transition-colors">
                  <motion.span
                    className="text-white font-bold text-xl"
                    whileHover={{
                      textShadow: [
                        "0 0 8px rgba(6,182,212,0.8)",
                        "2px 0 8px rgba(6,182,212,0.8), -2px 0 8px rgba(168,85,247,0.8)",
                        "0 0 8px rgba(6,182,212,0.8)",
                      ],
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    SK
                  </motion.span>
                </div>
              </motion.div>
              <div className="border-l border-slate-700 pl-4">
                <p className="text-xs text-slate-500 uppercase tracking-wider">SK Group</p>
                <p className="text-xl font-bold text-white">발표 평가 랭킹</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-xl md:text-2xl font-semibold text-balance text-white">
              2025년 CEO세미나 O/I Session 종합 평가
            </h1>
            <p className="text-xs text-slate-400">전체 세션 평가 자료 비교</p>
          </div>
        </motion.div>

        {/* Main Ranking Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white text-center mb-8">전체 랭킹</h2>
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
            {/* AI Ranking - 2 columns */}
            <Card className="lg:col-span-2 bg-slate-900/40 backdrop-blur-sm border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
              <CardHeader>
                <CardTitle className="text-xl text-center text-white">AI 평가</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiDisplay.map((presenter, idx) => (
                    <div
                      key={presenter.presentation_id || idx}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-cyan-500/20"
                    >
                      <div>
                        <p className="text-white font-medium">{presenter.company}</p>
                      </div>
                      <p className="text-cyan-400 font-bold text-lg">
                        {typeof presenter.score === 'number' ? presenter.score.toFixed(1) : presenter.score}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Final Ranking - 3 columns (Center, highlighted) */}
            <Card
              className="lg:col-span-3 bg-slate-900/60 backdrop-blur-md border-cyan-400/80 shadow-[0_0_120px_40px_rgba(6,182,212,0.8)] relative overflow-hidden"
              style={{ zIndex: 2 }}
            >
              {/* 훨씬 더 진하고 큰 흰색 글로우 오버레이 */}
              <motion.div
                className="absolute -inset-10 rounded-2xl pointer-events-none"
                style={{
                  zIndex: 1,
                  background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.78) 0%, rgba(255,255,255,0.35) 40%, transparent 80%)",
                  filter: "blur(30px)"
                }}
                animate={{
                  opacity: [0.84, 1, 0.84],
                  boxShadow: [
                    '0 0 350px 110px #fff, 0 0 260px 90px #fff8',
                    '0 0 420px 160px #fff, 0 0 320px 140px #ffffff',
                    '0 0 350px 110px #fff, 0 0 260px 90px #fff8',
                  ],
                }}
                transition={{ duration: 3.2, repeat: Number.POSITIVE_INFINITY, repeatType: 'reverse', ease: 'easeInOut' }}
              />
              {/* 기존 오로라/그라데이션 배경 효과 */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-purple-500/20"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              />

              {/* Rotating gradient border effect */}
              <motion.div
                className="absolute inset-0 opacity-50"
                style={{
                  background: "conic-gradient(from 0deg, transparent, #06b6d4, transparent, #3b82f6, transparent)",
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              />

              {/* Glowing orbs */}
              <motion.div
                className="absolute -top-20 -right-20 w-60 h-60 bg-cyan-400/30 rounded-full blur-3xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
              />
              <motion.div
                className="absolute -bottom-20 -left-20 w-60 h-60 bg-blue-400/30 rounded-full blur-3xl"
                animate={{
                  scale: [1.2, 1, 1.2],
                  opacity: [0.5, 0.3, 0.5],
                }}
                transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
              />

              <CardHeader className="relative z-10">
                <CardTitle className="text-2xl text-center text-white drop-shadow-[0_0_25px_cyan] font-extrabold animate-pulse">종합 랭킹</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="space-y-3">
                  {combinedRankings.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-slate-400">표시할 데이터가 없습니다.</p>
                      <p className="text-slate-500 text-sm mt-2">
                        {allCombinedRankings.length > 0 ? "필터 조건을 변경해보세요." : "데이터를 불러오는 중입니다..."}
                      </p>
                    </div>
                  ) : (
                    combinedRankings.map((presenter, idx) => (
                    <motion.div
                      key={`${presenter.presentation_id || presenter.company}-${idx}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + idx * 0.05 }}
                      whileHover={{ scale: 1.04 }}
                      className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border-2 border-cyan-400/60 transition-all relative overflow-hidden group shadow-[0_0_60px_10px_rgba(6,182,212,0.7)]"
                    >
                      {/* Hover glow effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/20 to-cyan-500/0 opacity-0 group-hover:opacity-100"
                        animate={{
                          x: ["-100%", "100%"],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Number.POSITIVE_INFINITY,
                        }}
                      />

                      <div className="flex items-center gap-4 relative z-10">
                        <motion.div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-extrabold text-xl"
                          style={{
                            background: `linear-gradient(135deg, ${colors[idx % colors.length]}, ${colors[(idx + 1) % colors.length]})`,
                            boxShadow: `0 0 30px ${colors[idx % colors.length]}80`,
                          }}
                          animate={{
                            boxShadow: [
                              `0 0 30px ${colors[idx % colors.length]}80`,
                              `0 0 40px ${colors[idx % colors.length]}`,
                              `0 0 30px ${colors[idx % colors.length]}80`,
                            ],
                          }}
                          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                        >
                          {idx + 1}
                        </motion.div>
                        <div>
                          <p className="text-white font-bold text-lg group-hover:text-cyan-300 transition-colors">
                            {presenter.company}
                          </p>
                        </div>
                      </div>
                      <motion.p
                        className="text-cyan-300 font-extrabold text-2xl relative z-10"
                        style={{
                          textShadow: "0 0 20px rgba(6, 182, 212, 0.8)",
                        }}
                        animate={{
                          textShadow: [
                            "0 0 20px rgba(6, 182, 212, 0.8)",
                            "0 0 30px rgba(6, 182, 212, 1)",
                            "0 0 20px rgba(6, 182, 212, 0.8)",
                          ],
                        }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                      >
                        {presenter.score.toFixed(1)}
                      </motion.p>
                    </motion.div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Onsite Ranking - 2 columns */}
            <Card className="lg:col-span-2 bg-slate-900/40 backdrop-blur-sm border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
              <CardHeader>
                <CardTitle className="text-xl text-center text-white">경영진 평가</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {onsiteDisplay.map((presenter, idx) => (
                    <div
                      key={presenter.presentation_id || idx}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-cyan-500/20"
                    >
                      <div>
                        <p className="text-white font-medium">{presenter.company}</p>
                      </div>
                      <p className="text-cyan-400 font-bold text-lg">
                        {typeof presenter.score === 'number' ? presenter.score.toFixed(1) : presenter.score}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-between pt-6 border-t border-cyan-500/20"
        >
          <p className="text-xs text-slate-500">© 2025 SK Group. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/all-summary">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-300 hover:border-cyan-400"
              >
                <BarChart3 className="w-4 h-4" />
                전체 랭킹 확인하기
              </Button>
            </Link>
            <p className="text-xs text-slate-500">AI 기반 종합 평가 시스템</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
