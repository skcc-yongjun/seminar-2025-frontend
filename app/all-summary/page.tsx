"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, BarChart3 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function AllSummaryPage() {
  const [detailedTab, setDetailedTab] = useState<"ai" | "onsite">("ai")
  const [selectedCriterion, setSelectedCriterion] = useState("전략적 중요도")

  const allPresenters = [
    {
      name: "김민수",
      company: "SK텔레콤",
      aiScore: 8.7,
      onsiteScore: 8.8,
      finalScore: 8.8,
      detailedScores: {
        "전략적 중요도": 9.0,
        "O/I 수준 진단": 8.7,
        "과제 목표 수준": 8.9,
        "실행 가능성": 8.8,
        "Process/System": 8.6,
        "본원적 경쟁력 연계": 8.5,
        혁신성: 8.7,
        "기대 효과": 8.9,
      },
    },
    {
      name: "박성호",
      company: "SK하이닉스",
      aiScore: 8.3,
      onsiteScore: 8.4,
      finalScore: 8.4,
      detailedScores: {
        "전략적 중요도": 8.8,
        "O/I 수준 진단": 8.3,
        "과제 목표 수준": 8.4,
        "실행 가능성": 8.0,
        "Process/System": 8.2,
        "본원적 경쟁력 연계": 8.1,
        혁신성: 8.5,
        "기대 효과": 8.6,
      },
    },
    {
      name: "이정훈",
      company: "SK E&S",
      aiScore: 7.7,
      onsiteScore: 8.0,
      finalScore: 7.8,
      detailedScores: {
        "전략적 중요도": 8.5,
        "O/I 수준 진단": 7.6,
        "과제 목표 수준": 7.7,
        "실행 가능성": 7.3,
        "Process/System": 7.5,
        "본원적 경쟁력 연계": 7.8,
        혁신성: 7.9,
        "기대 효과": 8.0,
      },
    },
    {
      name: "정수연",
      company: "SK바이오팜",
      aiScore: 8.1,
      onsiteScore: 7.9,
      finalScore: 8.0,
      detailedScores: {
        "전략적 중요도": 8.2,
        "O/I 수준 진단": 8.0,
        "과제 목표 수준": 7.5,
        "실행 가능성": 7.1,
        "Process/System": 7.8,
        "본원적 경쟁력 연계": 8.3,
        혁신성: 8.1,
        "기대 효과": 7.9,
      },
    },
    {
      name: "윤풍영",
      company: "SK AX",
      aiScore: 7.0,
      onsiteScore: 7.3,
      finalScore: 7.2,
      detailedScores: {
        "전략적 중요도": 8.0,
        "O/I 수준 진단": 7.0,
        "과제 목표 수준": 8.3,
        "실행 가능성": 8.6,
        "Process/System": 6.8,
        "본원적 경쟁력 연계": 6.5,
        혁신성: 7.2,
        "기대 효과": 7.0,
      },
    },
    {
      name: "최영희",
      company: "SK네트웍스",
      aiScore: 6.9,
      onsiteScore: 7.2,
      finalScore: 7.1,
      detailedScores: {
        "전략적 중요도": 7.5,
        "O/I 수준 진단": 6.8,
        "과제 목표 수준": 7.9,
        "실행 가능성": 7.5,
        "Process/System": 6.5,
        "본원적 경쟁력 연계": 6.3,
        혁신성: 7.0,
        "기대 효과": 6.8,
      },
    },
    {
      name: "강동원",
      company: "SK이노베이션",
      aiScore: 6.5,
      onsiteScore: 6.8,
      finalScore: 6.7,
      detailedScores: {
        "전략적 중요도": 7.0,
        "O/I 수준 진단": 6.5,
        "과제 목표 수준": 6.8,
        "실행 가능성": 6.3,
        "Process/System": 6.2,
        "본원적 경쟁력 연계": 6.0,
        혁신성: 6.7,
        "기대 효과": 6.5,
      },
    },
    {
      name: "한지민",
      company: "SK스퀘어",
      aiScore: 6.2,
      onsiteScore: 6.5,
      finalScore: 6.3,
      detailedScores: {
        "전략적 중요도": 6.8,
        "O/I 수준 진단": 6.2,
        "과제 목표 수준": 6.5,
        "실행 가능성": 6.0,
        "Process/System": 5.8,
        "본원적 경쟁력 연계": 5.9,
        혁신성: 6.4,
        "기대 효과": 6.3,
      },
    },
  ]

  const criteria = [
    "전략적 중요도",
    "O/I 수준 진단",
    "과제 목표 수준",
    "실행 가능성",
    "Process/System",
    "본원적 경쟁력 연계",
    "혁신성",
    "기대 효과",
  ]

  const colors = ["#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899"]

  const aiRanked = [...allPresenters].sort((a, b) => b.aiScore - a.aiScore)
  const finalRanked = [...allPresenters].sort((a, b) => b.finalScore - a.finalScore)
  const onsiteRanked = [...allPresenters].sort((a, b) => b.onsiteScore - a.onsiteScore)

  const criterionSorted = [...allPresenters].sort(
    (a, b) => b.detailedScores[selectedCriterion] - a.detailedScores[selectedCriterion],
  )

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
                <p className="text-xl font-bold text-white">전체 세션 평가 비교</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-xl md:text-2xl font-semibold text-balance text-white">
              2025년 CEO세미나 O/I Session 종합 평가
            </h1>
            <p className="text-xs text-slate-400">전체 8개 세션 평가 자료 비교</p>
          </div>
        </motion.div>

        {/* Main Ranking Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-3xl font-bold text-white text-center mb-8">전체 랭킹</h2>
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
            {/* AI Ranking - 2 columns */}
            <Card className="lg:col-span-2 bg-slate-900/40 backdrop-blur-sm border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
              <CardHeader>
                <CardTitle className="text-xl text-center text-white">AI 평가</CardTitle>
                <p className="text-xs text-center text-slate-400">멤버사</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiRanked.map((presenter, idx) => (
                    <motion.div
                      key={presenter.company}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + idx * 0.05 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-cyan-500/20"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-700/50 flex items-center justify-center text-cyan-400 font-bold">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="text-white font-medium">{presenter.company}</p>
                          <p className="text-xs text-slate-400">{presenter.name}</p>
                        </div>
                      </div>
                      <p className="text-cyan-400 font-bold text-lg">{presenter.aiScore.toFixed(1)}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Final Ranking - 3 columns (Center, highlighted) */}
            <Card className="lg:col-span-3 bg-slate-900/60 backdrop-blur-md border-cyan-400/50 shadow-[0_0_60px_rgba(6,182,212,0.4)] relative overflow-hidden">
              {/* Animated background effects */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-purple-500/20"
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
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
                <CardTitle className="text-2xl text-center text-white drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]">
                  최종 순위
                </CardTitle>
                <p className="text-sm text-center text-cyan-300/80">멤버사</p>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="space-y-3">
                  {finalRanked.map((presenter, idx) => (
                    <motion.div
                      key={presenter.company}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + idx * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border-2 border-cyan-500/30 hover:border-cyan-400/60 transition-all relative overflow-hidden group"
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
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl"
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
                          <p className="text-slate-400 text-sm">{presenter.name}</p>
                        </div>
                      </div>
                      <motion.p
                        className="text-cyan-400 font-bold text-2xl relative z-10"
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
                        {presenter.finalScore.toFixed(1)}
                      </motion.p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Onsite Ranking - 2 columns */}
            <Card className="lg:col-span-2 bg-slate-900/40 backdrop-blur-sm border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
              <CardHeader>
                <CardTitle className="text-xl text-center text-white">경영진 평가</CardTitle>
                <p className="text-xs text-center text-slate-400">멤버사</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {onsiteRanked.map((presenter, idx) => (
                    <motion.div
                      key={presenter.company}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + idx * 0.05 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 border border-cyan-500/20"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-700/50 flex items-center justify-center text-cyan-400 font-bold">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="text-white font-medium">{presenter.company}</p>
                          <p className="text-xs text-slate-400">{presenter.name}</p>
                        </div>
                      </div>
                      <p className="text-cyan-400 font-bold text-lg">{presenter.onsiteScore.toFixed(1)}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Detailed Scores Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16"
        >
          <h2 className="text-3xl font-bold text-white text-center mb-8">세부 항목 점수</h2>

          {/* Tab buttons for AI/Onsite evaluation */}
          <div className="flex justify-center gap-4 mb-6">
            <Button
              onClick={() => setDetailedTab("ai")}
              variant={detailedTab === "ai" ? "default" : "outline"}
              className={`gap-2 ${
                detailedTab === "ai"
                  ? "bg-cyan-500/20 border-cyan-400 text-cyan-400 hover:bg-cyan-500/30"
                  : "border-cyan-500/30 text-slate-400 hover:bg-slate-800/50 hover:text-white"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              AI 평가 세부항목
            </Button>
            <Button
              onClick={() => setDetailedTab("onsite")}
              variant={detailedTab === "onsite" ? "default" : "outline"}
              className={`gap-2 ${
                detailedTab === "onsite"
                  ? "bg-cyan-500/20 border-cyan-400 text-cyan-400 hover:bg-cyan-500/30"
                  : "border-cyan-500/30 text-slate-400 hover:bg-slate-800/50 hover:text-white"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              현장 평가 세부항목
            </Button>
          </div>

          {/* Criterion selection buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {criteria.map((criterion) => (
              <Button
                key={criterion}
                onClick={() => setSelectedCriterion(criterion)}
                variant="outline"
                size="sm"
                className={`${
                  selectedCriterion === criterion
                    ? "bg-cyan-500/20 border-cyan-400 text-cyan-400"
                    : "border-cyan-500/30 text-slate-400 hover:bg-slate-800/50 hover:text-white"
                }`}
              >
                [{criterion}]
              </Button>
            ))}
          </div>

          {/* Horizontal bar chart for selected criterion */}
          <Card className="bg-slate-900/40 backdrop-blur-sm border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
            <CardHeader>
              <CardTitle className="text-2xl text-cyan-400 flex items-center gap-2">
                <div className="w-1 h-8 bg-cyan-400 rounded-full" />[{selectedCriterion}]
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {criterionSorted.map((presenter, idx) => {
                  const score = presenter.detailedScores[selectedCriterion]
                  const maxScore = 10
                  const percentage = (score / maxScore) * 100

                  return (
                    <motion.div
                      key={presenter.company}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 1, delay: idx * 0.05 }}
                      className="flex items-center gap-4"
                    >
                      <p className="text-white font-medium w-32 flex-shrink-0">{presenter.company}</p>
                      <div className="relative h-8 bg-slate-800/50 rounded-lg overflow-hidden flex-1">
                        <motion.div
                          className="absolute inset-y-0 left-0 rounded-lg"
                          style={{
                            background: `linear-gradient(90deg, ${colors[idx % colors.length]}, ${colors[(idx + 1) % colors.length]})`,
                            boxShadow: `0 0 20px ${colors[idx % colors.length]}80`,
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1, delay: idx * 0.05 }}
                        />
                      </div>
                      <p className="text-cyan-400 font-bold text-xl w-16 text-right flex-shrink-0">
                        {score.toFixed(1)}
                      </p>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-between pt-3 border-t border-cyan-500/20"
        >
          <p className="text-xs text-slate-500">© 2025 SK Group. All rights reserved.</p>
          <p className="text-xs text-slate-500">AI 기반 종합 평가 시스템</p>
        </motion.div>
      </div>
    </div>
  )
}
