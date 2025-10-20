"use client"

import { motion } from "framer-motion"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"

interface SummaryData {
  total: number
  comment: string
  aei: number
  topKeywords: Array<{ term: string; score: number }>
  hotspots: Array<{ time: number; intensity: number; label: string }>
  repComments: Array<{ sentiment: string; text: string }>
  allKeywords: Array<{ term: string; sentiment: string; isNew: boolean }>
}

interface SummarySheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  summary: SummaryData
}

export function SummarySheet({ open, onOpenChange, summary }: SummarySheetProps) {
  const presentationSummary = `이번 발표는 SK 그룹의 미래 비전과 지속가능한 성장 전략을 중심으로 진행되었습니다. 발표자는 디지털 전환, ESG 경영, 그리고 글로벌 시장 확대라는 세 가지 핵심 축을 강조하며, 구체적인 실행 계획과 목표를 제시했습니다. 특히 AI와 반도체 기술에 대한 투자 확대 방안이 청중의 높은 관심을 받았으며, 탄소중립 달성을 위한 로드맵도 상세히 설명되었습니다. 전반적으로 명확한 비전 제시와 데이터 기반의 논리적 전개가 돋보였으나, 일부 실행 방안에 대한 구체성이 보완되면 더욱 완성도 높은 발표가 될 것으로 평가됩니다.`

  const getKeywordSize = (index: number, total: number) => {
    const importance = 1 - index / total
    if (importance > 0.8) return "text-3xl font-bold"
    if (importance > 0.6) return "text-2xl font-semibold"
    if (importance > 0.4) return "text-xl font-medium"
    if (importance > 0.2) return "text-lg"
    return "text-base"
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[90vh] overflow-y-auto border-t border-[#EA002C]/30"
        style={{
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a0505 50%, #0a0a0a 100%)",
        }}
      >
        <SheetHeader className="mb-8">
          <div className="flex items-start justify-between relative">
            <div
              className="absolute inset-0 bg-gradient-to-r from-[#EA002C]/10 via-transparent to-transparent rounded-lg blur-xl"
              style={{ zIndex: -1 }}
            />
            <div className="space-y-2">
              <SheetTitle className="text-3xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                발표 평가 리포트
              </SheetTitle>
              <SheetDescription className="text-base text-gray-400">AI 기반 종합 분석 결과</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="glass-card border border-gray-800 shadow-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#EA002C]/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div
              className="absolute -inset-[1px] bg-gradient-to-br from-[#EA002C]/50 via-[#EA002C]/20 to-transparent rounded-lg opacity-50 blur-sm"
              style={{ zIndex: -1 }}
            />
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                종합 평가 점수
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="flex items-baseline gap-2">
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-5xl font-bold bg-gradient-to-br from-[#EA002C] via-red-500 to-red-400 bg-clip-text text-transparent"
                >
                  {summary.total}
                </motion.span>
                <span className="text-2xl text-gray-500">/ 10</span>
              </div>
              <div className="mt-4 h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(summary.total / 10) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-[#EA002C] via-red-500 to-red-400 shadow-lg shadow-[#EA002C]/50"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border border-gray-800 shadow-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-700/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div
              className="absolute -inset-[1px] bg-gradient-to-br from-gray-600/30 via-gray-700/20 to-transparent rounded-lg opacity-50 blur-sm"
              style={{ zIndex: -1 }}
            />
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                청중 공감 지수 (AEI)
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="flex items-baseline gap-2">
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-5xl font-bold bg-gradient-to-br from-white via-gray-200 to-gray-400 bg-clip-text text-transparent"
                >
                  {summary.aei}
                </motion.span>
                <span className="text-2xl text-gray-500">/ 10</span>
              </div>
              <div className="mt-4 h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(summary.aei / 10) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
                  className="h-full bg-gradient-to-r from-gray-400 via-gray-300 to-gray-200 shadow-lg shadow-gray-400/30"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border border-gray-800 shadow-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#EA002C]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div
              className="absolute -inset-[1px] bg-gradient-to-br from-[#EA002C]/30 via-gray-700/20 to-transparent rounded-lg opacity-30 blur-sm"
              style={{ zIndex: -1 }}
            />
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                주요 키워드 (Top 5)
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="space-y-2">
                {summary.topKeywords.slice(0, 5).map((keyword, index) => (
                  <motion.div
                    key={keyword.term}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-white font-medium">{keyword.term}</span>
                    <span className="text-gray-400">{(keyword.score * 100).toFixed(0)}%</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass-card border border-gray-800 shadow-xl relative overflow-hidden">
            <div
              className="absolute -inset-[1px] bg-gradient-to-br from-[#EA002C]/20 via-transparent to-gray-700/20 rounded-lg opacity-30 blur-sm"
              style={{ zIndex: -1 }}
            />
            <CardHeader className="relative z-10">
              <CardTitle className="text-lg font-semibold text-white">AI 총평</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-sm text-gray-300 leading-relaxed">{summary.comment}</p>
            </CardContent>
          </Card>

          <Card className="glass-card border border-gray-800 shadow-xl relative overflow-hidden">
            <div
              className="absolute -inset-[1px] bg-gradient-to-br from-gray-700/20 via-transparent to-[#EA002C]/20 rounded-lg opacity-30 blur-sm"
              style={{ zIndex: -1 }}
            />
            <CardHeader className="relative z-10">
              <CardTitle className="text-lg font-semibold text-white">발표 요약</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                <p className="text-sm text-gray-300 leading-relaxed">{presentationSummary}</p>
              </motion.div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 glass-card border border-gray-800 shadow-xl relative overflow-hidden">
            <div
              className="absolute -inset-[1px] bg-gradient-to-r from-[#EA002C]/20 via-gray-700/10 to-[#EA002C]/20 rounded-lg opacity-40 blur-sm"
              style={{ zIndex: -1 }}
            />
            <CardHeader className="relative z-10">
              <CardTitle className="text-lg font-semibold text-white">전체 키워드 분석</CardTitle>
              <p className="text-xs text-gray-500 mt-1">발표 중 언급된 주요 키워드 (크기는 중요도를 나타냄)</p>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="flex flex-wrap gap-3 justify-start items-center p-6 bg-gradient-to-br from-black/40 via-black/30 to-[#EA002C]/5 rounded-lg min-h-[250px] border border-gray-800/50">
                {summary.allKeywords.map((keyword, index) => {
                  const sizeClass = getKeywordSize(index, summary.allKeywords.length)
                  return (
                    <motion.div
                      key={`${keyword.term}-${index}`}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + index * 0.03 }}
                    >
                      <Badge
                        variant="outline"
                        className={`${sizeClass} px-4 py-2 ${
                          keyword.sentiment === "positive"
                            ? "bg-gradient-to-br from-[#EA002C]/20 to-[#EA002C]/10 text-[#EA002C] border-[#EA002C]/40 shadow-lg shadow-[#EA002C]/20"
                            : "bg-gradient-to-br from-gray-800/70 to-gray-900/50 text-gray-300 border-gray-700"
                        } hover:scale-105 transition-all duration-300 cursor-default backdrop-blur-sm`}
                      >
                        {keyword.term}
                      </Badge>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 glass-card border border-gray-800 shadow-xl relative overflow-hidden">
            <div
              className="absolute -inset-[1px] bg-gradient-to-br from-[#EA002C]/15 via-transparent to-gray-700/15 rounded-lg opacity-30 blur-sm"
              style={{ zIndex: -1 }}
            />
            <CardHeader className="relative z-10">
              <CardTitle className="text-lg font-semibold text-white">주요 피드백</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {summary.repComments.map((comment, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className={`flex items-start gap-3 p-4 rounded-lg border relative overflow-hidden ${
                      comment.sentiment === "positive"
                        ? "bg-[#EA002C]/5 border-[#EA002C]/30"
                        : "bg-gray-800/30 border-gray-700"
                    }`}
                  >
                    {comment.sentiment === "positive" && (
                      <div className="absolute inset-0 bg-gradient-to-br from-[#EA002C]/10 to-transparent opacity-50" />
                    )}
                    {comment.sentiment === "positive" ? (
                      <TrendingUp className="w-5 h-5 text-[#EA002C] flex-shrink-0 mt-0.5 relative z-10" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5 relative z-10" />
                    )}
                    <p className="text-sm text-gray-300 leading-relaxed relative z-10">{comment.text}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  )
}
