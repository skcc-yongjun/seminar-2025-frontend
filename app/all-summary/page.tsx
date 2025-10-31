"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, BarChart3, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { 
  fetchPresentationsWithPresenters, 
  fetchAIEvaluationScores, 
  fetchHumanEvaluationScores,
  fetchPresentationSummary,
  fetchCategoryRankings,
  type PresentationSummaryData,
  type PresentationWithPresenter,
  type CategoryRankingsResponse
} from "@/lib/api"

export default function AllSummaryPage() {
  const [selectedCriterion, setSelectedCriterion] = useState("전략적 중요도")
  const [allPresenters, setAllPresenters] = useState<PresentationSummaryData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categoryRankings, setCategoryRankings] = useState<CategoryRankingsResponse | null>(null)
  const [criteria, setCriteria] = useState<string[]>([])
  const [aiCriteria, setAiCriteria] = useState<string[]>([])
  const [humanCriteria, setHumanCriteria] = useState<string[]>([])

  // 카테고리명 매핑 테이블 (백엔드 카테고리명 -> 실제 점수 키)
  const categoryMapping: Record<string, string> = {
    "경쟁력 진단": "경쟁력 진단",
    "과제 구체성": "과제 구체성", 
    "도전적 목표": "도전적 목표(CbA)", // 백엔드에서 "도전적 목표"로 올 수 있음
    "도전적 목표(CbA)": "도전적 목표(CbA)",
    "지속 가능한 체계화": "지속 가능한 체계화", // 별도 항목
    "지속가능성": "지속가능성", // 별도 항목 (지속 가능한 체계화와 다른 항목)
    "본원적 경쟁력": "본원적 경쟁력",
    "혁신성": "혁신성"
  }

  // API에서 데이터 로드
  useEffect(() => {
    const loadSummaryData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // 세션1 발표자 정보만 가져오기
        const presentations = await fetchPresentationsWithPresenters("세션1")
        
        // 카테고리별 랭킹 정보 가져오기
        const categoryData = await fetchCategoryRankings("세션1")
        setCategoryRankings(categoryData)
        
        // 평가 기준 추출 (AI + 사람 평가 카테고리 분리)
        const aiCategories = categoryData.ai_category_rankings.map(ranking => ranking.ranking_type)
        const humanCategories = categoryData.human_category_rankings.map(ranking => ranking.ranking_type)
        
        // 카테고리명 정규화 (매핑 적용하여 통일된 이름으로 변환)
        const normalizedAiCategories = aiCategories.map(cat => categoryMapping[cat] || cat)
        const normalizedHumanCategories = humanCategories.map(cat => categoryMapping[cat] || cat)
        
        // "지속 가능한 체계화"를 AI 평가 항목으로 수동 추가 (백엔드에 없는 경우 대비)
        if (!normalizedAiCategories.includes("지속 가능한 체계화")) {
          normalizedAiCategories.push("지속 가능한 체계화")
        }
        
        // 중복 제거하여 최종 카테고리 목록 생성
        const allCategories = [...new Set([...normalizedAiCategories, ...normalizedHumanCategories])]
        
        setCriteria(allCategories)
        setAiCriteria(normalizedAiCategories)
        setHumanCriteria(normalizedHumanCategories)
        
        console.log("백엔드에서 가져온 원본 카테고리:", { ai: aiCategories, human: humanCategories })
        console.log("정규화된 카테고리:", { ai: normalizedAiCategories, human: normalizedHumanCategories })
        console.log("최종 표시할 카테고리:", allCategories)
        
        // 첫 번째 기준을 기본 선택으로 설정
        if (allCategories.length > 0) {
          setSelectedCriterion(allCategories[0])
        }
        
        // 각 발표에 대한 점수와 요약 정보 가져오기
        const summaryData: PresentationSummaryData[] = []
        
        for (const presentation of presentations) {
          try {
            // AI 평가 점수 가져오기
            const aiScores = await fetchAIEvaluationScores(presentation.presentation_id)
            console.log(`발표 ${presentation.presentation_id} AI 점수:`, aiScores)
            
            // 사람 평가 점수 가져오기
            const humanScores = await fetchHumanEvaluationScores(presentation.presentation_id)
            console.log(`발표 ${presentation.presentation_id} 사람 점수:`, humanScores)
            
            // 요약 정보 가져오기
            const summary = await fetchPresentationSummary(presentation.presentation_id)
            
            // 점수 계산
            const aiScore = aiScores.length > 0 
              ? aiScores.reduce((sum, score) => sum + Number(score.score), 0) / aiScores.length 
              : 0
            
            const humanScore = humanScores.length > 0 
              ? humanScores.reduce((sum, score) => sum + Number(score.score), 0) / humanScores.length 
              : 0
            
            const finalScore = humanScore > 0 ? humanScore : aiScore
            
            // 상세 점수 매핑 (AI + 사람 평가 점수 모두 포함)
            const detailedScores: Record<string, number> = {}
            
            // AI 평가 점수 매핑
            aiScores.forEach(score => {
              const categoryKey = score.category
              // 카테고리 매핑 적용 (예: "지속가능성" -> "지속 가능한 체계화")
              const mappedCategory = categoryMapping[categoryKey] || categoryKey
              detailedScores[mappedCategory] = Number(score.score)
              // 원본 카테고리명도 유지 (역매핑을 위해)
              if (mappedCategory !== categoryKey) {
                detailedScores[categoryKey] = Number(score.score)
              }
            })
            
            // 사람 평가 점수 매핑 (같은 카테고리가 있으면 평균값 사용)
            humanScores.forEach(score => {
              const categoryKey = score.category
              // 카테고리 매핑 적용
              const mappedCategory = categoryMapping[categoryKey] || categoryKey
              
              // 매핑된 카테고리로 점수 찾기
              const existingScore = detailedScores[mappedCategory]
              if (existingScore !== undefined) {
                // 이미 AI 점수가 있으면 평균값 사용
                detailedScores[mappedCategory] = (existingScore + Number(score.score)) / 2
              } else {
                // AI 점수가 없으면 사람 점수만 사용
                detailedScores[mappedCategory] = Number(score.score)
              }
              
              // 원본 카테고리명도 업데이트
              if (mappedCategory !== categoryKey) {
                const existingOriginalScore = detailedScores[categoryKey]
                if (existingOriginalScore !== undefined) {
                  detailedScores[categoryKey] = (existingOriginalScore + Number(score.score)) / 2
                } else {
                  detailedScores[categoryKey] = Number(score.score)
                }
              }
            })
            
            console.log(`발표 ${presentation.presentation_id} 상세 점수:`, detailedScores)
            
            summaryData.push({
              presentation_id: presentation.presentation_id,
              presenter_name: presentation.presenter?.name || "발표자 미정",
              company: presentation.presenter?.company || "회사 미정",
              topic: presentation.topic || "주제 미정",
              ai_score: Math.round(aiScore * 10) / 10,
              human_score: Math.round(humanScore * 10) / 10,
              final_score: Math.round(finalScore * 10) / 10,
              detailed_scores: detailedScores,
              summary_text: summary?.summary_text,
              key_points: summary?.key_points || []
            })
          } catch (err) {
            console.error(`발표 ${presentation.presentation_id} 데이터 로드 실패:`, err)
            // 에러가 있어도 다른 발표는 계속 처리
          }
        }
        
        setAllPresenters(summaryData)
      } catch (err) {
        console.error("요약 데이터 로드 실패:", err)
        setError("데이터를 불러오는데 실패했습니다.")
      } finally {
        setIsLoading(false)
      }
    }

    loadSummaryData()
  }, [])

  // 데이터가 없을 때 사용할 기본값
  const displayPresenters = allPresenters.length > 0 ? allPresenters : []
  const sortedPresenters = displayPresenters.sort((a, b) => b.final_score - a.final_score)

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

  // 데이터가 없는 경우
  if (displayPresenters.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-white text-lg">표시할 데이터가 없습니다.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }



  const colors = ["#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899"]

  const aiRanked = [...displayPresenters].sort((a, b) => b.ai_score - a.ai_score)
  const finalRanked = [...displayPresenters].sort((a, b) => b.final_score - a.final_score)
  const onsiteRanked = [...displayPresenters].sort((a, b) => b.human_score - a.human_score)

  // 선택된 기준이 AI 평가인지 현장 평가인지 확인
  const isAICriterion = aiCriteria.includes(selectedCriterion)
  const isHumanCriterion = humanCriteria.includes(selectedCriterion)

  const criterionSorted = criteria.length > 0 
    ? [...displayPresenters].sort(
        (a, b) => (b.detailed_scores[selectedCriterion] || 0) - (a.detailed_scores[selectedCriterion] || 0),
      )
    : []

  // AI 평가 (전체 표시)
  const aiDisplay = aiRanked;
  
  // 경영진 평가 (전체 표시)
  const onsiteDisplay = onsiteRanked;

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
                        {presenter.ai_score.toFixed ? presenter.ai_score.toFixed(1) : presenter.ai_score}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Final Ranking - 3 columns (Center, highlighted) */}
            <Card
              className="lg:col-span-3 bg-slate-900/60 backdrop-blur-md border-cyan-400/80 shadow-[0_0_120px_40px_rgba(6,182,212,0.8)] relative overflow-hidden animate-strong-glow"
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
              {/* === 이하 패널 내부 내용은 그대로 유지 === */}

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
                <CardTitle className="text-2xl text-center text-white drop-shadow-[0_0_25px_cyan] font-extrabold animate-pulse">최종 순위</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="space-y-3">
                  {finalRanked.map((presenter, idx) => (
                    <motion.div
                      key={`${presenter.presentation_id}-${idx}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + idx * 0.05 }}
                      whileHover={{ scale: 1.04 }}
                      className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border-2 border-cyan-400/60 transition-all relative overflow-hidden group shadow-[0_0_60px_10px_rgba(6,182,212,0.7)]"
                    >
                      {/* 강한 글로우 순위원(circle) */}
                      <motion.div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-extrabold text-xl shadow-[0_0_30px_10px_cyan] bg-gradient-to-br from-cyan-400 via-blue-400 to-purple-400 border-cyan-300 border-2 animate-pulse-glow"
                        style={{ boxShadow: `0 0 50px 10px cyan, 0 0 80px 18px #3b82f6` }}
                      >
                        {idx + 1}
                      </motion.div>
                      <div>
                        <p className="text-white font-bold text-lg group-hover:text-cyan-300 transition-colors">
                          {presenter.company}
                        </p>
                      </div>
                      <motion.p
                        className="text-cyan-300 font-extrabold text-2xl drop-shadow-[0_0_18px_cyan] animate-pulse"
                        style={{ textShadow: "0 0 40px cyan, 0 0 6px #06b6d4" }}
                      >
                        {presenter.final_score.toFixed(1)}
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
                        {presenter.human_score?.toFixed ? presenter.human_score.toFixed(1) : presenter.human_score}
                      </p>
                    </div>
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


           {/* Criterion selection buttons */}
           <div className="flex flex-wrap justify-center gap-3 mb-8">
             {criteria.map((criterion) => {
               const isAI = aiCriteria.includes(criterion)
               const isHuman = humanCriteria.includes(criterion)
               
               return (
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
                   {isAI && <span className="ml-1 text-xs text-cyan-300">(AI)</span>}
                   {isHuman && <span className="ml-1 text-xs text-orange-300">(현장)</span>}
                 </Button>
               )
             })}
           </div>

          {/* Horizontal bar chart for selected criterion */}
          <Card className="bg-slate-900/40 backdrop-blur-sm border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
            <CardHeader>
              <CardTitle className="text-2xl text-cyan-400 flex items-center gap-2">
                <div className="w-1 h-8 bg-cyan-400 rounded-full" />
                [{selectedCriterion}]
                {isAICriterion && <span className="text-sm text-cyan-300">(AI)</span>}
                {isHumanCriterion && <span className="text-sm text-orange-300">(현장)</span>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {criterionSorted.map((presenter, idx) => {
                  // 카테고리 매핑: 여러 가능한 키를 시도
                  let mappedKey = categoryMapping[selectedCriterion] || selectedCriterion
                  let score = presenter.detailed_scores[mappedKey] || 0
                  
                  // 매핑된 키로 찾지 못하면 원본 키로도 시도
                  if (score === 0) {
                    score = presenter.detailed_scores[selectedCriterion] || 0
                  }
                  
                  // 역방향 매핑도 확인 (점수 키 -> 카테고리명)
                  if (score === 0) {
                    // 매핑 테이블의 모든 값을 확인
                    for (const [mapKey, mapValue] of Object.entries(categoryMapping)) {
                      if (mapValue === selectedCriterion || selectedCriterion.includes(mapValue) || mapValue.includes(selectedCriterion)) {
                        score = presenter.detailed_scores[mapValue] || presenter.detailed_scores[mapKey] || 0
                        if (score > 0) break
                      }
                    }
                  }
                  
                  // 점수 키에 직접 카테고리명이 있는지 확인 (부분 일치)
                  if (score === 0) {
                    for (const [key, value] of Object.entries(presenter.detailed_scores)) {
                      if (key === selectedCriterion || 
                          key.includes(selectedCriterion) || 
                          selectedCriterion.includes(key) ||
                          key.replace(/\s/g, '') === selectedCriterion.replace(/\s/g, '') ||
                          selectedCriterion.replace(/\s/g, '') === key.replace(/\s/g, '')) {
                        score = value
                        break
                      }
                    }
                  }
                  
                  const maxScore = 100 // 100점 만점으로 변경
                  const percentage = (score / maxScore) * 100
                  
                  console.log(`발표자 ${presenter.company}, 기준 "${selectedCriterion}" -> 매핑 "${mappedKey}", 점수: ${score}`, "전체 상세점수:", presenter.detailed_scores)

                  return (
                    <motion.div
                      key={`${presenter.presentation_id}-${idx}`}
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
