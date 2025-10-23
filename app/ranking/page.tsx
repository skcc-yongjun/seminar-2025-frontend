"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowLeft, BarChart3 } from "lucide-react"
import Link from "next/link"

interface RankingData {
  rank: number
  company: string
  ceo: string
  score: number
}

export default function RankingPage() {
  const aiRankings: RankingData[] = [
    { rank: 1, company: "SK AX", ceo: "윤풍영 CEO", score: 8.2 },
    { rank: 2, company: "SK Innovation", ceo: "김준 CEO", score: 7.8 },
    { rank: 3, company: "SK Telecom", ceo: "박정호 CEO", score: 7.5 },
  ]

  const onsiteRankings: RankingData[] = [
    { rank: 1, company: "SK Telecom", ceo: "박정호 CEO", score: 8.5 },
    { rank: 2, company: "SK AX", ceo: "윤풍영 CEO", score: 8.0 },
    { rank: 3, company: "SK Innovation", ceo: "김준 CEO", score: 7.6 },
  ]

  const combinedRankings = useMemo(() => {
    const scoreMap = new Map<string, { company: string; ceo: string; aiScore: number; onsiteScore: number }>()

    aiRankings.forEach((ai) => {
      scoreMap.set(ai.company, {
        company: ai.company,
        ceo: ai.ceo,
        aiScore: ai.score,
        onsiteScore: 0,
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
        })
      }
    })

    const combined = Array.from(scoreMap.values())
      .map((item) => ({
        company: item.company,
        ceo: item.ceo,
        score: (item.aiScore + item.onsiteScore) / 2,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((item, index) => ({
        rank: index + 1,
        ...item,
      }))

    return combined
  }, [])

  const getRankBadge = (rank: number) => {
    return (
      <div className="w-14 h-14 flex-shrink-0 rounded-full bg-gradient-to-br from-red-900/80 to-red-950/90 flex items-center justify-center border border-red-800/30">
        <span className="text-xl font-bold text-sk-red">{rank}</span>
      </div>
    )
  }

  const RankingCard = ({
    title,
    subtitle,
    rankings,
    delay,
  }: {
    title: string
    subtitle: string
    rankings: RankingData[]
    delay: number
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-8 bg-sk-red rounded-full" />
        <div>
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        </div>
      </div>

      <div className="space-y-4">
        {rankings.map((ranking, index) => (
          <motion.div
            key={ranking.rank}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + 0.1 + index * 0.1 }}
            className="flex items-center justify-between p-6 rounded-2xl bg-card/30 border border-white/10 hover:border-white/20 transition-all duration-300"
          >
            <div className="flex items-center gap-6">
              {getRankBadge(ranking.rank)}
              <div>
                <h3 className="text-xl font-bold text-foreground">{ranking.company}</h3>
                <p className="text-base text-muted-foreground mt-1">{ranking.ceo}</p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-4xl font-bold text-sk-red">{ranking.score.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground mt-1">평균 점수</div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )

  return (
    <div className="min-h-screen p-4 md:p-8 relative overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-sk-red/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-sk-red/3 rounded-full blur-3xl" />
      </div>

      <div className="max-w-[1800px] mx-auto space-y-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between border-b border-border/30 pb-6"
        >
          <div className="flex items-center gap-6">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2 hover:bg-sk-red/10">
                <ArrowLeft className="w-4 h-4" />
                메인으로
              </Button>
            </Link>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-sk-red to-sk-red/80 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">SK</span>
              </div>
              <div className="border-l border-border/50 pl-4">
                <p className="text-xs text-muted-foreground uppercase tracking-widest">SK Group</p>
                <p className="text-xl font-bold text-foreground">발표 평가 랭킹</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/comparison">
              <Button
                variant="outline"
                className="gap-2 border-sk-red/30 hover:bg-sk-red/10 hover:border-sk-red/50 bg-transparent"
              >
                <BarChart3 className="w-4 h-4" />
                전체 세션 비교
              </Button>
            </Link>
            <Link href="/comparison">
              <Button className="gap-2 bg-sk-red hover:bg-sk-red/90">
                <BarChart3 className="w-4 h-4" />
                전체 세션 통합 평가 결과
              </Button>
            </Link>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <RankingCard title="AI 평가 랭킹" subtitle="AI 기반 종합 평가" rankings={aiRankings} delay={0.2} />

          <RankingCard title="현장 평가 랭킹" subtitle="경영진 현장 평가" rankings={onsiteRankings} delay={0.3} />

          <RankingCard title="합산 평가" subtitle="AI + 현장 평가 종합" rankings={combinedRankings} delay={0.4} />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-between pt-8 border-t border-border/30"
        >
          <p className="text-xs text-muted-foreground">© 2025 SK Group. All rights reserved.</p>
          <p className="text-xs text-muted-foreground">AI 기반 발표 평가 시스템</p>
        </motion.div>
      </div>
    </div>
  )
}
