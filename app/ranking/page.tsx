"use client"

import { useMemo, useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowLeft, BarChart3 } from "lucide-react"
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
}

export default function RankingPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [aiRankings, setAiRankings] = useState<RankingData[]>([])
  const [onsiteRankings, setOnsiteRankings] = useState<RankingData[]>([])

  // 데이터 로딩
  useEffect(() => {
    const loadRankingData = async () => {
      try {
        setIsLoading(true)
        
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

        // null 제거 및 정렬
        const validAiScores = aiScoresData.filter((d): d is NonNullable<typeof d> => d !== null && d.score > 0)
        const validHumanScores = humanScoresData.filter((d): d is NonNullable<typeof d> => d !== null && d.score > 0)

        // AI 랭킹 (상위 3개)
        const aiRanked = validAiScores
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
          .map((item, index) => ({
            rank: index + 1,
            company: item.company,
            ceo: item.ceo,
            score: item.score,
            topic: item.topic,
          }))

        // 경영진 랭킹 (상위 3개)
        const humanRanked = validHumanScores
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
          .map((item, index) => ({
            rank: index + 1,
            company: item.company,
            ceo: item.ceo,
            score: item.score,
            topic: item.topic,
          }))

        setAiRankings(aiRanked)
        setOnsiteRankings(humanRanked)
      } catch (error) {
        console.error("랭킹 데이터 로딩 실패:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadRankingData()
  }, [])

  const combinedRankings = useMemo(() => {
    const scoreMap = new Map<string, { company: string; ceo: string; aiScore: number; onsiteScore: number; topic?: string }>()

    aiRankings.forEach((ai) => {
      scoreMap.set(ai.company, {
        company: ai.company,
        ceo: ai.ceo,
        aiScore: ai.score,
        onsiteScore: 0,
        topic: ai.topic,
      })
    })

    onsiteRankings.forEach((onsite) => {
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
        })
      }
    })

    const combined = Array.from(scoreMap.values())
      .map((item) => ({
        company: item.company,
        ceo: item.ceo,
        score: item.aiScore > 0 && item.onsiteScore > 0 ? (item.aiScore + item.onsiteScore) / 2 : Math.max(item.aiScore, item.onsiteScore),
        topic: item.topic,
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((item, index) => ({
        rank: index + 1,
        ...item,
      }))

    return combined
  }, [aiRankings, onsiteRankings])

  const SideRankingCard = ({
    title,
    rankings,
    delay,
  }: {
    title: string
    rankings: RankingData[]
    delay: number
  }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-slate-900/40 backdrop-blur-sm border border-cyan-500/30 rounded-3xl p-8 shadow-[0_0_30px_rgba(6,182,212,0.15)] h-full"
      >
        <h2 className="text-2xl font-bold text-white mb-8 text-center">{title}</h2>

        <div className="space-y-6">
          <div className="flex items-center justify-between text-slate-400 text-sm pb-2 border-b border-slate-700/50">
            <span>멤버사</span>
            <span>Score</span>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-slate-400">로딩 중...</p>
            </div>
          ) : rankings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400">데이터가 없습니다</p>
            </div>
          ) : (
            rankings.map((ranking, index) => (
              <motion.div
                key={ranking.rank}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: delay + 0.1 + index * 0.1 }}
                className="flex items-center justify-between"
              >
                <div className="flex-1">
                  <p className="text-white font-medium text-lg">{ranking.company}</p>
                  <p className="text-slate-400 text-sm mt-1">{ranking.ceo}</p>
                </div>
                <div className="text-right">
                  <p className="text-cyan-400 font-bold text-xl">{ranking.score.toFixed(1)}</p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    )
  }

  const CenterRankingCard = ({ rankings, delay }: { rankings: RankingData[]; delay: number }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-slate-900/40 backdrop-blur-sm border border-cyan-500/30 rounded-3xl p-8 shadow-[0_0_30px_rgba(6,182,212,0.15)] h-full mt-16"
      >
        <h2 className="text-2xl font-bold text-white mb-8 text-center">최종 순위</h2>

        <div className="space-y-6">
          <div className="flex items-center text-slate-400 text-sm pb-2 border-b border-slate-700/50">
            <span className="w-16">순위</span>
            <span className="flex-1">멤버사</span>
            <span className="w-24 text-right">평가점수</span>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-slate-400">로딩 중...</p>
            </div>
          ) : rankings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400">데이터가 없습니다</p>
            </div>
          ) : (
            rankings.map((ranking, index) => {
              const percentage = (ranking.score / 10) * 100

              return (
                <motion.div
                  key={ranking.rank}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: delay + 0.1 + index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center">
                      <span className="text-4xl font-bold text-white">{ranking.rank}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium text-lg">{ranking.company}</p>
                      <p className="text-slate-400 text-sm">{ranking.ceo}</p>
                    </div>
                  </div>

                  <div className="ml-16">
                    <div className="relative h-8 bg-slate-800/50 rounded-lg overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1.5, ease: "easeOut", delay: delay + 0.2 + index * 0.1 }}
                        className={`h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 rounded-lg ${
                          ranking.rank === 1 ? "shadow-[0_0_20px_rgba(6,182,212,0.6)]" : ""
                        }`}
                      />
                      <div className="absolute inset-0 flex items-center justify-end pr-4">
                        <span className="text-white font-bold text-sm">{ranking.score.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <div
      className="min-h-screen p-4 md:p-6 relative overflow-x-hidden"
      style={{ background: "linear-gradient(to bottom, #0a1628, #0f1f3a, #0a1628)" }}
    >
      {/* Animated grid background */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div
          className="absolute inset-0 animate-pulse"
          style={{
            backgroundImage:
              "linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Scanning lines */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"
          initial={{ top: 0 }}
          animate={{ top: "100%" }}
          transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />
        <motion.div
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"
          initial={{ top: 0 }}
          animate={{ top: "100%" }}
          transition={{ duration: 12, repeat: Number.POSITIVE_INFINITY, ease: "linear", delay: 4 }}
        />
      </div>

      {/* Diagonal pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(6, 182, 212, 0.1) 35px, rgba(6, 182, 212, 0.1) 36px)",
          }}
        />
      </div>

      <div className="max-w-[1920px] mx-auto space-y-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-6">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2 hover:bg-slate-800 text-slate-400 hover:text-white">
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
          <div className="flex items-center gap-4">
            <Link href="/all-summary">
              <Button
                variant="outline"
                className="gap-2 border-slate-700 hover:bg-slate-800 hover:border-cyan-500/50 bg-transparent text-slate-400 hover:text-white"
              >
                <BarChart3 className="w-4 h-4" />
                전체 결과 확인
              </Button>
            </Link>
          </div>
        </motion.div>

        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
            <SideRankingCard title="AI 평가" rankings={aiRankings} delay={0.2} />
            <CenterRankingCard rankings={combinedRankings} delay={0.3} />
            <SideRankingCard title="경영진 평가" rankings={onsiteRankings} delay={0.4} />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-between pt-4 border-t border-slate-800"
        >
          <p className="text-xs text-slate-500">© 2025 SK Group. All rights reserved.</p>
          <p className="text-xs text-slate-500">AI 기반 발표 평가 시스템</p>
        </motion.div>
      </div>
    </div>
  )
}
