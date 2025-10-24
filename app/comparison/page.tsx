"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowLeft, BarChart3, Trophy, ListOrdered } from "lucide-react"
import Link from "next/link"

interface SessionData {
  id: string
  title: string
  presenter: string
  company: string
  aiScores: Record<string, number>
  onSiteScores: Record<string, number>
  aiAverage: number
  onSiteAverage: number
}

export default function ComparisonPage() {
  const [activeTab, setActiveTab] = useState<"ranking" | "ai-details" | "onsite-details">("ranking")

  const [sessions] = useState<SessionData[]>([
    {
      id: "1",
      title: "Global Top-tier 대비 O/I 경쟁력 분석",
      presenter: "윤풍영",
      company: "SK AX",
      aiScores: {
        "[O/I 수준 진단]": 8.5,
        "[과제 목표 수준]": 5.5,
        "[성과 지속 가능성]": 7.0,
        "[Process/System]": 5.0,
        "[본원적 경쟁력 연계]": 8.2,
        "[혁신성]": 7.5,
        "[실행 가능성]": 6.8,
        "[기대 효과]": 7.8,
      },
      onSiteScores: {
        "[전략적 중요도]": 8.0,
        "[실행 가능성]": 6.5,
        "[발표 완성도]": 7.5,
      },
      aiAverage: 7.0,
      onSiteAverage: 7.3,
    },
    {
      id: "2",
      title: "AI 기반 고객 경험 혁신 전략",
      presenter: "김민수",
      company: "SK텔레콤",
      aiScores: {
        "[O/I 수준 진단]": 9.0,
        "[과제 목표 수준]": 8.5,
        "[성과 지속 가능성]": 8.8,
        "[Process/System]": 7.5,
        "[본원적 경쟁력 연계]": 9.2,
        "[혁신성]": 9.5,
        "[실행 가능성]": 8.0,
        "[기대 효과]": 8.8,
      },
      onSiteScores: {
        "[전략적 중요도]": 9.0,
        "[실행 가능성]": 8.5,
        "[발표 완성도]": 8.8,
      },
      aiAverage: 8.7,
      onSiteAverage: 8.8,
    },
    {
      id: "3",
      title: "친환경 에너지 전환 로드맵",
      presenter: "이정훈",
      company: "SK E&S",
      aiScores: {
        "[O/I 수준 진단]": 7.8,
        "[과제 목표 수준]": 7.2,
        "[성과 지속 가능성]": 8.5,
        "[Process/System]": 6.8,
        "[본원적 경쟁력 연계]": 8.0,
        "[혁신성]": 7.5,
        "[실행 가능성]": 7.8,
        "[기대 효과]": 8.2,
      },
      onSiteScores: {
        "[전략적 중요도]": 8.5,
        "[실행 가능성]": 7.5,
        "[발표 완성도]": 8.0,
      },
      aiAverage: 7.7,
      onSiteAverage: 8.0,
    },
    {
      id: "4",
      title: "반도체 공정 최적화 방안",
      presenter: "박성호",
      company: "SK하이닉스",
      aiScores: {
        "[O/I 수준 진단]": 8.8,
        "[과제 목표 수준]": 8.0,
        "[성과 지속 가능성]": 7.5,
        "[Process/System]": 8.5,
        "[본원적 경쟁력 연계]": 8.8,
        "[혁신성]": 8.2,
        "[실행 가능성]": 8.5,
        "[기대 효과]": 8.0,
      },
      onSiteScores: {
        "[전략적 중요도]": 8.8,
        "[실행 가능성]": 8.0,
        "[발표 완성도]": 8.5,
      },
      aiAverage: 8.3,
      onSiteAverage: 8.4,
    },
    {
      id: "5",
      title: "글로벌 물류 네트워크 확장",
      presenter: "최영희",
      company: "SK네트웍스",
      aiScores: {
        "[O/I 수준 진단]": 7.0,
        "[과제 목표 수준]": 6.5,
        "[성과 지속 가능성]": 7.2,
        "[Process/System]": 6.0,
        "[본원적 경쟁력 연계]": 7.5,
        "[혁신성]": 6.8,
        "[실행 가능성]": 7.0,
        "[기대 효과]": 7.2,
      },
      onSiteScores: {
        "[전략적 중요도]": 7.5,
        "[실행 가능성]": 7.0,
        "[발표 완성도]": 7.2,
      },
      aiAverage: 6.9,
      onSiteAverage: 7.2,
    },
    {
      id: "6",
      title: "바이오 신약 개발 파이프라인",
      presenter: "정수연",
      company: "SK바이오파",
      aiScores: {
        "[O/I 수준 진단]": 8.2,
        "[과제 목표 수준]": 7.8,
        "[성과 지속 가능성]": 8.0,
        "[Process/System]": 7.5,
        "[본원적 경쟁력 연계]": 8.5,
        "[혁신성]": 8.8,
        "[실행 가능성]": 7.2,
        "[기대 효과]": 8.5,
      },
      onSiteScores: {
        "[전략적 중요도]": 8.2,
        "[실행 가능성]": 7.5,
        "[발표 완성도]": 8.0,
      },
      aiAverage: 8.1,
      onSiteAverage: 7.9,
    },
    {
      id: "7",
      title: "디지털 트윈 기반 스마트 팩토리",
      presenter: "강동욱",
      company: "SK이노베이션",
      aiScores: {
        "[O/I 수준 진단]": 7.5,
        "[과제 목표 수준]": 7.0,
        "[성과 지속 가능성]": 7.8,
        "[Process/System]": 7.2,
        "[본원적 경쟁력 연계]": 7.5,
        "[혁신성]": 8.0,
        "[실행 가능성]": 7.5,
        "[기대 효과]": 7.8,
      },
      onSiteScores: {
        "[전략적 중요도]": 7.8,
        "[실행 가능성]": 7.2,
        "[발표 완성도]": 7.5,
      },
      aiAverage: 7.5,
      onSiteAverage: 7.5,
    },
    {
      id: "8",
      title: "메타버스 플랫폼 생태계 구축",
      presenter: "한지민",
      company: "SK스퀘어",
      aiScores: {
        "[O/I 수준 진단]": 6.8,
        "[과제 목표 수준]": 6.5,
        "[성과 지속 가능성]": 6.0,
        "[Process/System]": 5.8,
        "[본원적 경쟁력 연계]": 7.0,
        "[혁신성]": 7.5,
        "[실행 가능성]": 6.2,
        "[기대 효과]": 6.8,
      },
      onSiteScores: {
        "[전략적 중요도]": 7.0,
        "[실행 가능성]": 6.5,
        "[발표 완성도]": 6.8,
      },
      aiAverage: 6.6,
      onSiteAverage: 6.8,
    },
  ])

  const sortedByAI = [...sessions].sort((a, b) => b.aiAverage - a.aiAverage)
  const sortedByOnSite = [...sessions].sort((a, b) => b.onSiteAverage - a.onSiteAverage)

  const aiItems = Object.keys(sessions[0].aiScores)
  const onSiteItems = Object.keys(sessions[0].onSiteScores)

  return (
    <div className="min-h-screen p-4 md:p-6 relative overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sk-red/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sk-red/3 rounded-full blur-3xl" />
      </div>

      <div className="max-w-[1800px] mx-auto space-y-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between border-b border-border/30 pb-4"
        >
          <div className="flex items-center gap-6">
            <Link href="/ranking">
              <Button variant="ghost" size="sm" className="gap-2 hover:bg-sk-red/10">
                <ArrowLeft className="w-4 h-4" />
                뒤로가기
              </Button>
            </Link>
            {/* </CHANGE> */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-sk-red rounded-lg flex items-center justify-center shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div className="border-l border-border/50 pl-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">SK Group</p>
                <p className="text-sm font-semibold text-foreground">전체 세션 평가 비교</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-xl md:text-2xl font-semibold text-balance text-foreground">
              '25년 CEO세미나 O/I Session 종합 평가
            </h1>
            <p className="text-xs text-muted-foreground">전체 8개 세션 평가 지수 비교</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2 border-b border-border/30"
        >
          <button
            onClick={() => setActiveTab("ranking")}
            className={`px-6 py-3 text-sm font-medium transition-all relative ${
              activeTab === "ranking" ? "text-sk-red" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              전체 랭킹
            </div>
            {activeTab === "ranking" && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-sk-red" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("ai-details")}
            className={`px-6 py-3 text-sm font-medium transition-all relative ${
              activeTab === "ai-details" ? "text-sk-red" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-2">
              <ListOrdered className="w-4 h-4" />
              AI 평가 세부항목 점수
            </div>
            {activeTab === "ai-details" && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-sk-red" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("onsite-details")}
            className={`px-6 py-3 text-sm font-medium transition-all relative ${
              activeTab === "onsite-details" ? "text-sk-red" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-2">
              <ListOrdered className="w-4 h-4" />
              현장 평가 세부항목 점수
            </div>
            {activeTab === "onsite-details" && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-sk-red" />
            )}
          </button>
        </motion.div>

        {activeTab === "ranking" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <div className="corporate-card p-6 rounded-lg border border-sk-red/30 shadow-lg">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-sk-red rounded" />
                AI 평가 랭킹
              </h3>
              <div className="space-y-3">
                {sortedByAI.map((session, index) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4 p-4 rounded-lg bg-background/50 border border-border/30 hover:border-sk-red/50 transition-all"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-sk-red/20 to-sk-red/5 flex items-center justify-center border border-sk-red/30">
                      <span className="text-lg font-bold text-sk-red">{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{session.company}</p>
                      <p className="text-xs text-muted-foreground truncate">{session.presenter}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-2xl font-bold text-sk-red">{session.aiAverage.toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground">평균</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="corporate-card p-6 rounded-lg border border-sk-red/30 shadow-lg">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-sk-red rounded" />
                현장 평가 랭킹
              </h3>
              <div className="space-y-3">
                {sortedByOnSite.map((session, index) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4 p-4 rounded-lg bg-background/50 border border-border/30 hover:border-sk-red/50 transition-all"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-sk-red/20 to-sk-red/5 flex items-center justify-center border border-sk-red/30">
                      <span className="text-lg font-bold text-sk-red">{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{session.company}</p>
                      <p className="text-xs text-muted-foreground truncate">{session.presenter}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-2xl font-bold text-sk-red">{session.onSiteAverage.toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground">평균</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "ai-details" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="corporate-card p-6 rounded-lg border border-sk-red/30 shadow-lg">
              <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-sk-red rounded" />
                AI 평가 세부 항목
              </h3>
              <div className="space-y-8">
                {aiItems.map((item, itemIndex) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: itemIndex * 0.1 }}
                    className="space-y-3"
                  >
                    <h4 className="text-sm font-medium text-foreground">{item}</h4>
                    <div className="space-y-2">
                      {sessions.map((session, sessionIndex) => {
                        const score = session.aiScores[item]
                        const maxScore = 10
                        const percentage = (score / maxScore) * 100

                        return (
                          <motion.div
                            key={session.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: itemIndex * 0.1 + sessionIndex * 0.05 }}
                            className="flex items-center gap-3"
                          >
                            <div className="w-32 flex-shrink-0">
                              <p className="text-xs text-muted-foreground truncate">{session.company}</p>
                            </div>
                            <div className="flex-1 relative h-8 bg-background/50 rounded-md border border-border/30 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 1, delay: itemIndex * 0.1 + sessionIndex * 0.05 }}
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-sk-red to-sk-red/70 rounded-md"
                              />
                              <div className="absolute inset-0 flex items-center justify-end px-3">
                                <span className="text-xs font-semibold text-foreground z-10">{score.toFixed(1)}</span>
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "onsite-details" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="corporate-card p-6 rounded-lg border border-sk-red/30 shadow-lg">
              <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-sk-red rounded" />
                현장 평가 세부 항목
              </h3>
              <div className="space-y-8">
                {onSiteItems.map((item, itemIndex) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: itemIndex * 0.1 }}
                    className="space-y-3"
                  >
                    <h4 className="text-sm font-medium text-foreground">{item}</h4>
                    <div className="space-y-2">
                      {sessions.map((session, sessionIndex) => {
                        const score = session.onSiteScores[item]
                        const maxScore = 10
                        const percentage = (score / maxScore) * 100

                        return (
                          <motion.div
                            key={session.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: itemIndex * 0.1 + sessionIndex * 0.05 }}
                            className="flex items-center gap-3"
                          >
                            <div className="w-32 flex-shrink-0">
                              <p className="text-xs text-muted-foreground truncate">{session.company}</p>
                            </div>
                            <div className="flex-1 relative h-8 bg-background/50 rounded-md border border-border/30 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 1, delay: itemIndex * 0.1 + sessionIndex * 0.05 }}
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-sk-red to-sk-red/70 rounded-md"
                              />
                              <div className="absolute inset-0 flex items-center justify-end px-3">
                                <span className="text-xs font-semibold text-foreground z-10">{score.toFixed(1)}</span>
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-between pt-3 border-t border-border/30"
        >
          <p className="text-xs text-muted-foreground">© 2025 SK Group. All rights reserved.</p>
          <p className="text-xs text-muted-foreground">AI 기반 발표 평가 시스템</p>
        </motion.div>
      </div>
    </div>
  )
}
