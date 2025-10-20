"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, TrendingUp, TrendingDown, Award, BarChart3 } from "lucide-react"
import Link from "next/link"
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"

export default function AllSummaryPage() {
  const allPresenters = [
    {
      name: "윤풍영",
      company: "SK AX",
      rank: 1,
      totalScore: 8.3,
      scores: { "전략 명확성": 8.5, "실행 구체성": 8.1, "혁신 차별성": 8.4, "그룹 연계성": 8.2 },
      keywords: ["글로벌 벤치마크", "본원경쟁력", "디지털 전환"],
      strength: "전략 명확성과 그룹 연계성이 탁월",
      weakness: "실행 구체성 보완 필요",
    },
    {
      name: "곽노정",
      company: "SK하이닉스",
      rank: 2,
      totalScore: 8.1,
      scores: { "전략 명확성": 8.0, "실행 구체성": 8.3, "혁신 차별성": 8.2, "그룹 연계성": 7.9 },
      keywords: ["반도체 혁신", "기술 경쟁력", "시장 선도"],
      strength: "실행 구체성이 매우 우수",
      weakness: "그룹 연계성 강화 필요",
    },
    {
      name: "유영상",
      company: "SK텔레콤",
      rank: 3,
      totalScore: 7.9,
      scores: { "전략 명확성": 7.8, "실행 구체성": 8.0, "혁신 차별성": 7.9, "그룹 연계성": 7.9 },
      keywords: ["5G 인프라", "AI 플랫폼", "고객 경험"],
      strength: "균형잡힌 전략 수립",
      weakness: "차별화 요소 강화 필요",
    },
    {
      name: "이호정",
      company: "SK네트웍스",
      rank: 4,
      totalScore: 7.7,
      scores: { "전략 명확성": 7.6, "실행 구체성": 7.8, "혁신 차별성": 7.7, "그룹 연계성": 7.7 },
      keywords: ["유통 혁신", "디지털 전환", "고객 중심"],
      strength: "실행 계획이 체계적",
      weakness: "혁신성 부각 필요",
    },
    {
      name: "박상규",
      company: "SK이노베이션",
      rank: 5,
      totalScore: 7.5,
      scores: { "전략 명확성": 7.4, "실행 구체성": 7.6, "혁신 차별성": 7.6, "그룹 연계성": 7.4 },
      keywords: ["친환경 에너지", "배터리 기술", "지속가능성"],
      strength: "친환경 전략이 명확",
      weakness: "그룹 시너지 구체화 필요",
    },
    {
      name: "윤병석",
      company: "SK가스",
      rank: 6,
      totalScore: 7.3,
      scores: { "전략 명확성": 7.2, "실행 구체성": 7.4, "혁신 차별성": 7.3, "그룹 연계성": 7.3 },
      keywords: ["에너지 전환", "안정적 공급", "효율성"],
      strength: "안정적인 실행 계획",
      weakness: "혁신 차별성 강화 필요",
    },
    {
      name: "안재용",
      company: "SK바이오사이언스",
      rank: 7,
      totalScore: 7.1,
      scores: { "전략 명확성": 7.0, "실행 구체성": 7.2, "혁신 차별성": 7.2, "그룹 연계성": 7.0 },
      keywords: ["백신 개발", "바이오 기술", "글로벌 진출"],
      strength: "기술 혁신성이 돋보임",
      weakness: "전략 명확성 보완 필요",
    },
    {
      name: "이석희",
      company: "SK온",
      rank: 8,
      totalScore: 6.9,
      scores: { "전략 명확성": 6.8, "실행 구체성": 7.0, "혁신 차별성": 7.0, "그룹 연계성": 6.8 },
      keywords: ["배터리 솔루션", "전기차", "글로벌 파트너십"],
      strength: "시장 기회 포착이 우수",
      weakness: "전략 구체화 필요",
    },
  ]

  const [selectedPresenter, setSelectedPresenter] = useState<number | null>(null)

  const comparisonData = [
    {
      category: "전략 명확성",
      ...Object.fromEntries(allPresenters.map((p) => [p.company, p.scores["전략 명확성"]])),
    },
    {
      category: "실행 구체성",
      ...Object.fromEntries(allPresenters.map((p) => [p.company, p.scores["실행 구체성"]])),
    },
    {
      category: "혁신 차별성",
      ...Object.fromEntries(allPresenters.map((p) => [p.company, p.scores["혁신 차별성"]])),
    },
    {
      category: "그룹 연계성",
      ...Object.fromEntries(allPresenters.map((p) => [p.company, p.scores["그룹 연계성"]])),
    },
  ]

  const radarData = Object.keys(allPresenters[0].scores).map((key) => ({
    category: key,
    ...Object.fromEntries(allPresenters.map((p) => [p.company, p.scores[key as keyof typeof p.scores]])),
  }))

  const colors = ["#EA002C", "#FF4D4D", "#FF7A7A", "#FFA3A3", "#C70024", "#9E001D", "#7A0016", "#560010"]

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
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2 hover:bg-sk-red/10">
                <ArrowLeft className="w-4 h-4" />
                실시간 대시보드로
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-sk-red rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">SK</span>
              </div>
              <div className="border-l border-border/50 pl-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">SK Group</p>
                <p className="text-sm font-semibold text-foreground">전체 발표자 종합 평가</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-xl md:text-2xl font-semibold text-balance text-foreground">
              2025 경영전략 발표 종합 분석
            </h1>
            <p className="text-xs text-muted-foreground">총 {allPresenters.length}명 발표자 평가 완료</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card className="corporate-card shadow-lg">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-sk-red" />
                  평가 항목별 비교 분석
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="category" stroke="#999" style={{ fontSize: "12px" }} />
                    <YAxis stroke="#999" style={{ fontSize: "12px" }} domain={[0, 10]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(15, 23, 42, 0.95)",
                        border: "1px solid rgba(234, 0, 44, 0.3)",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                    {allPresenters.map((presenter, idx) => (
                      <Bar
                        key={presenter.company}
                        dataKey={presenter.company}
                        fill={colors[idx]}
                        radius={[4, 4, 0, 0]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="corporate-card shadow-lg">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Award className="w-5 h-5 text-sk-red" />
                  종합 랭킹
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {allPresenters.map((presenter, idx) => (
                    <motion.div
                      key={presenter.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * idx }}
                      onClick={() => setSelectedPresenter(idx)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedPresenter === idx
                          ? "border-sk-red bg-sk-red/10"
                          : "border-border/30 hover:border-sk-red/50 hover:bg-sk-red/5"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                              idx === 0
                                ? "bg-yellow-500/20 text-yellow-500"
                                : idx === 1
                                  ? "bg-gray-400/20 text-gray-400"
                                  : idx === 2
                                    ? "bg-orange-500/20 text-orange-500"
                                    : "bg-sk-red/20 text-sk-red"
                            }`}
                          >
                            {presenter.rank}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{presenter.name}</p>
                            <p className="text-xs text-muted-foreground">{presenter.company}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-sk-red">{presenter.totalScore.toFixed(1)}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="corporate-card shadow-lg">
            <CardHeader>
              <CardTitle className="text-base">전체 발표자 역량 레이더 차트</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={500}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#333" />
                  <PolarAngleAxis dataKey="category" stroke="#999" style={{ fontSize: "12px" }} />
                  <PolarRadiusAxis angle={90} domain={[0, 10]} stroke="#666" style={{ fontSize: "10px" }} />
                  {allPresenters.map((presenter, idx) => (
                    <Radar
                      key={presenter.company}
                      name={presenter.company}
                      dataKey={presenter.company}
                      stroke={colors[idx]}
                      fill={colors[idx]}
                      fillOpacity={0.15}
                      strokeWidth={2}
                    />
                  ))}
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {selectedPresenter !== null && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="corporate-card shadow-lg border-sk-red/30">
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span>
                    {allPresenters[selectedPresenter].name} ({allPresenters[selectedPresenter].company}) 상세 분석
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedPresenter(null)}>
                    닫기
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        강점
                      </h3>
                      <p className="text-sm text-muted-foreground bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                        {allPresenters[selectedPresenter].strength}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <TrendingDown className="w-4 h-4 text-orange-500" />
                        개선 필요
                      </h3>
                      <p className="text-sm text-muted-foreground bg-orange-500/10 p-3 rounded-lg border border-orange-500/20">
                        {allPresenters[selectedPresenter].weakness}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold mb-3">주요 키워드</h3>
                    <div className="flex flex-wrap gap-2">
                      {allPresenters[selectedPresenter].keywords.map((keyword, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 bg-sk-red/10 text-sk-red rounded-full text-xs font-medium border border-sk-red/20"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      {Object.entries(allPresenters[selectedPresenter].scores).map(([key, value]) => (
                        <div key={key} className="p-3 bg-background/50 rounded-lg border border-border/30">
                          <p className="text-xs text-muted-foreground mb-1">{key}</p>
                          <p className="text-lg font-bold text-sk-red">{value.toFixed(1)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-between pt-3 border-t border-border/30"
        >
          <p className="text-xs text-muted-foreground">© 2025 SK Group. All rights reserved.</p>
          <p className="text-xs text-muted-foreground">AI 기반 종합 평가 시스템</p>
        </motion.div>
      </div>
    </div>
  )
}
