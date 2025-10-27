"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import {
  ArrowLeft,
  Brain,
  TrendingUp,
  Target,
  BarChart3,
  Lightbulb,
  Users,
  Zap,
  Globe,
  Briefcase,
  Building2,
  Rocket,
  Sparkles,
  Cpu,
  Factory,
  PieChart,
  Network,
  Gauge,
  Award,
  MessageSquare,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { fetchQnAKeywords } from "@/lib/api"

// -----------------------------
// 아이콘/색상 설정
// -----------------------------
const iconList = [
  TrendingUp,
  Target,
  BarChart3,
  Lightbulb,
  Users,
  Zap,
  Globe,
  Briefcase,
  Building2,
  Rocket,
  Sparkles,
  Cpu,
  Factory,
  PieChart,
  Network,
  Gauge,
  Award,
  MessageSquare,
]

// 어두운 그라디언트(도넛 내부 필에 사용)
const darkGrad = "from-slate-900 via-slate-900 to-black"

interface Category {
  id: string
  title: string
  subtitle: string
  icon: React.ElementType
}

// -----------------------------
// 유틸: 각도/좌표/도넛 Path 계산
// -----------------------------
const degToRad = (deg: number) => (deg * Math.PI) / 180

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const a = degToRad(angleDeg)
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
}

function donutArcPath(
  cx: number,
  cy: number,
  rOuter: number,
  rInner: number,
  startAngleDeg: number,
  endAngleDeg: number
) {
  // SVG arc는 시계방향이 양수(우->하->좌->상) 기준으로 가정
  const largeArcFlag = Math.abs(endAngleDeg - startAngleDeg) > 180 ? 1 : 0
  const sweep = 1

  const p1 = polarToCartesian(cx, cy, rOuter, startAngleDeg)
  const p2 = polarToCartesian(cx, cy, rOuter, endAngleDeg)
  const p3 = polarToCartesian(cx, cy, rInner, endAngleDeg)
  const p4 = polarToCartesian(cx, cy, rInner, startAngleDeg)

  return [
    `M ${p1.x} ${p1.y}`,
    `A ${rOuter} ${rOuter} 0 ${largeArcFlag} ${sweep} ${p2.x} ${p2.y}`,
    `L ${p3.x} ${p3.y}`,
    `A ${rInner} ${rInner} 0 ${largeArcFlag} ${sweep ^ 1} ${p4.x} ${p4.y}`,
    "Z",
  ].join(" ")
}

function arcCenter(
  cx: number,
  cy: number,
  rMid: number,
  startAngleDeg: number,
  endAngleDeg: number
) {
  const mid = (startAngleDeg + endAngleDeg) / 2
  return polarToCartesian(cx, cy, rMid, mid)
}

export default function QnACategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showBrainTooltip, setShowBrainTooltip] = useState(false)

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true)
        setError(null)

        const [k1, k2] = await Promise.all([
          fetchQnAKeywords("세션1"),
          fetchQnAKeywords("세션2"),
        ])
        const all = Array.from(new Set([...(k1 || []), ...(k2 || [])]))

        if (!all.length) throw new Error("no keywords")

        const mapped: Category[] = all.map((kw, i) => ({
          id: kw,
          title: kw,
          subtitle: kw,
          icon: iconList[i % iconList.length],
        }))
        setCategories(mapped)
      } catch (e: any) {
        // 폴백: 3개(예시 이미지처럼) 세그먼트
        setError(e?.message || "failed")
        setCategories([
          { id: "direction", title: "AI 전략 방향", subtitle: "Strategic Direction", icon: Target },
          { id: "bt", title: "AI Biz. 전환", subtitle: "Business Transformation", icon: TrendingUp },
          { id: "compete", title: "AI 경쟁 전략", subtitle: "Competitive Strategy", icon: Cpu },
        ])
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  // SVG 사이즈 및 도넛 반경 설정(반응형)
  const { width, height, cx, cy, rOuter, rInner } = useMemo(() => {
    const w = 920 // viewBox 기준
    const h = 640
    const cx = w / 2
    const cy = h / 2 + 10
    const rOuter = Math.min(w, h) * 0.456 // 바깥 반경 (0.38 * 1.2)
    const rInner = rOuter * 0.4 // 안쪽 반경 (0.5 * 0.8 = 0.4)
    return { width: w, height: h, cx, cy, rOuter, rInner }
  }, [])

  // 각 세그먼트의 시작/끝 각도 계산(3시, 7시, 11시 배치 - 반시계방향 270도 회전)
  const arcs = useMemo(() => {
    const positions = [270, 30, 150] // 3시(270도), 7시(30도), 11시(150도)
    const slice = 85 // 각 버튼당 85도
    const gap = 6 // 세그먼트 사이 간격(도)
    
    return categories.slice(0, 3).map((c, i) => {
      const centerAngle = positions[i]
      const start = centerAngle - slice / 2 + gap / 2
      const end = centerAngle + slice / 2 - gap / 2
      return { c, start, end }
    })
  }, [categories])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-980 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-2xl text-muted-foreground">키워드 로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-980 text-white relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        {/* 동적 배경 그라디언트 */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 via-transparent to-purple-500/5 animate-pulse" />
        </div>
        
        {/* 움직이는 배경 요소들 */}
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/3 rounded-full blur-3xl"
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -20, 30, 0],
            scale: [1, 1.1, 0.9, 1]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-purple-500/3 rounded-full blur-3xl"
          animate={{
            x: [0, -40, 20, 0],
            y: [0, 25, -15, 0],
            scale: [1, 0.8, 1.2, 1]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute top-1/2 right-1/4 w-64 h-64 bg-cyan-500/3 rounded-full blur-3xl"
          animate={{
            x: [0, 20, -30, 0],
            y: [0, -30, 20, 0],
            scale: [1, 1.3, 0.7, 1]
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* 노이즈 텍스처 */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundSize: '200px 200px'
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 p-8 md:p-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>메인으로 돌아가기</span>
          </Link>

          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Q&A 카테고리
            <span className="block h-1 w-32 bg-blue-500 mt-2" />
          </h1>
          {error && <p className="text-yellow-500 mt-4">API 호출 실패: 기본 카테고리를 표시합니다</p>}
        </motion.div>

        {/* 중앙 브레인 + 회전 링 */}
        <div className="relative">
          <svg
            className="w-full"
            viewBox={`0 0 ${width} ${height}`}
            width="100%"
            height="auto"
          >
            <defs>
              {/* 첫 번째 버튼 - #50589C */}
              <radialGradient id="segFill1" cx="50%" cy="50%" r="70%">
                <stop offset="0%" stopColor="rgba(80,88,156,0.3)" />
                <stop offset="100%" stopColor="rgba(80,88,156,0.6)" />
              </radialGradient>
              <linearGradient id="segStroke1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(80,88,156,0.9)" />
                <stop offset="100%" stopColor="rgba(80,88,156,0.7)" />
              </linearGradient>
              
              {/* 두 번째 버튼 - #636CCB */}
              <radialGradient id="segFill2" cx="50%" cy="50%" r="70%">
                <stop offset="0%" stopColor="rgba(99,108,203,0.3)" />
                <stop offset="100%" stopColor="rgba(99,108,203,0.6)" />
              </radialGradient>
              <linearGradient id="segStroke2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(99,108,203,0.9)" />
                <stop offset="100%" stopColor="rgba(99,108,203,0.7)" />
              </linearGradient>
              
              {/* 세 번째 버튼 - #6E8CFB */}
              <radialGradient id="segFill3" cx="50%" cy="50%" r="70%">
                <stop offset="0%" stopColor="rgba(110,140,251,0.3)" />
                <stop offset="100%" stopColor="rgba(110,140,251,0.6)" />
              </radialGradient>
              <linearGradient id="segStroke3" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(110,140,251,0.9)" />
                <stop offset="100%" stopColor="rgba(110,140,251,0.7)" />
              </linearGradient>
            </defs>

            {/* 장식용 바깥/안쪽 원형 점선 */}
            <g>
              <circle cx={cx} cy={cy} r={rOuter + 26} fill="none" stroke="url(#segStroke1)" strokeDasharray="6,8" opacity={0.25} />
              <circle cx={cx} cy={cy} r={rInner - 26} fill="none" stroke="url(#segStroke1)" strokeDasharray="4,10" opacity={0.2} />
            </g>

            {/* 태양계 스타일 회전 궤도들 */}
            <g>
              {/* 첫 번째 궤도 - 가장 안쪽 */}
              <motion.circle
                cx={cx}
                cy={cy}
                r={rInner - 100}
                fill="none"
                stroke="rgba(80,88,156,0.8)"
                strokeWidth="2"
                strokeDasharray="3,6"
                animate={{ rotate: 360 }}
                style={{ originX: cx, originY: cy }}
                transition={{ duration: 2.7, repeat: Infinity, ease: "linear" }}
              />
              
              {/* 두 번째 궤도 */}
              <motion.circle
                cx={cx}
                cy={cy}
                r={rInner - 60}
                fill="none"
                stroke="rgba(99,108,203,0.7)"
                strokeWidth="2"
                strokeDasharray="4,8"
                animate={{ rotate: -360 }}
                style={{ originX: cx, originY: cy }}
                transition={{ duration: 3.3, repeat: Infinity, ease: "linear" }}
              />
              
              {/* 세 번째 궤도 - 도넛 바깥쪽 */}
              <motion.circle
                cx={cx}
                cy={cy}
                r={rOuter + 40}
                fill="none"
                stroke="rgba(110,140,251,0.6)"
                strokeWidth="2"
                strokeDasharray="5,10"
                animate={{ rotate: 360 }}
                style={{ originX: cx, originY: cy }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              />
              
              {/* 네 번째 궤도 - 가장 바깥쪽 */}
              <motion.circle
                cx={cx}
                cy={cy}
                r={rOuter + 80}
                fill="none"
                stroke="rgba(80,88,156,0.5)"
                strokeWidth="2"
                strokeDasharray="6,12"
                animate={{ rotate: -360 }}
                style={{ originX: cx, originY: cy }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              />
              
              {/* 다섯 번째 궤도 - 최외곽 */}
              <motion.circle
                cx={cx}
                cy={cy}
                r={rOuter + 120}
                fill="none"
                stroke="rgba(99,108,203,0.4)"
                strokeWidth="2"
                strokeDasharray="8,16"
                animate={{ rotate: 360 }}
                style={{ originX: cx, originY: cy }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              />
            </g>

            {/* 궤도상의 작은 점들 (행성들) */}
            <g>
              {/* 첫 번째 궤도의 점들 */}
              {[...Array(6)].map((_, i) => (
                <motion.circle
                  key={`orbit1-${i}`}
                  cx={cx + (rInner - 100) * Math.cos((i * 60) * Math.PI / 180)}
                  cy={cy + (rInner - 100) * Math.sin((i * 60) * Math.PI / 180)}
                  r="3"
                  fill="rgba(80,88,156,0.9)"
                  animate={{
                    rotate: 360,
                    cx: cx + (rInner - 100) * Math.cos((i * 60) * Math.PI / 180),
                    cy: cy + (rInner - 100) * Math.sin((i * 60) * Math.PI / 180)
                  }}
                  style={{ originX: cx, originY: cy }}
                  transition={{ duration: 2.7, repeat: Infinity, ease: "linear" }}
                />
              ))}
              
              {/* 두 번째 궤도의 점들 */}
              {[...Array(4)].map((_, i) => (
                <motion.circle
                  key={`orbit2-${i}`}
                  cx={cx + (rInner - 60) * Math.cos((i * 90) * Math.PI / 180)}
                  cy={cy + (rInner - 60) * Math.sin((i * 90) * Math.PI / 180)}
                  r="2.5"
                  fill="rgba(99,108,203,0.8)"
                  animate={{
                    rotate: -360,
                    cx: cx + (rInner - 60) * Math.cos((i * 90) * Math.PI / 180),
                    cy: cy + (rInner - 60) * Math.sin((i * 90) * Math.PI / 180)
                  }}
                  style={{ originX: cx, originY: cy }}
                  transition={{ duration: 3.3, repeat: Infinity, ease: "linear" }}
                />
              ))}
              
              {/* 세 번째 궤도의 점들 */}
              {[...Array(8)].map((_, i) => (
                <motion.circle
                  key={`orbit3-${i}`}
                  cx={cx + (rOuter + 40) * Math.cos((i * 45) * Math.PI / 180)}
                  cy={cy + (rOuter + 40) * Math.sin((i * 45) * Math.PI / 180)}
                  r="2"
                  fill="rgba(110,140,251,0.7)"
                  animate={{
                    rotate: 360,
                    cx: cx + (rOuter + 40) * Math.cos((i * 45) * Math.PI / 180),
                    cy: cy + (rOuter + 40) * Math.sin((i * 45) * Math.PI / 180)
                  }}
                  style={{ originX: cx, originY: cy }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />
              ))}
              
              {/* 네 번째 궤도의 점들 */}
              {[...Array(6)].map((_, i) => (
                <motion.circle
                  key={`orbit4-${i}`}
                  cx={cx + (rOuter + 80) * Math.cos((i * 60) * Math.PI / 180)}
                  cy={cy + (rOuter + 80) * Math.sin((i * 60) * Math.PI / 180)}
                  r="1.5"
                  fill="rgba(80,88,156,0.6)"
                  animate={{
                    rotate: -360,
                    cx: cx + (rOuter + 80) * Math.cos((i * 60) * Math.PI / 180),
                    cy: cy + (rOuter + 80) * Math.sin((i * 60) * Math.PI / 180)
                  }}
                  style={{ originX: cx, originY: cy }}
                  transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                />
              ))}
              
              {/* 다섯 번째 궤도의 점들 */}
              {[...Array(10)].map((_, i) => (
                <motion.circle
                  key={`orbit5-${i}`}
                  cx={cx + (rOuter + 120) * Math.cos((i * 36) * Math.PI / 180)}
                  cy={cy + (rOuter + 120) * Math.sin((i * 36) * Math.PI / 180)}
                  r="1"
                  fill="rgba(99,108,203,0.5)"
                  animate={{
                    rotate: 360,
                    cx: cx + (rOuter + 120) * Math.cos((i * 36) * Math.PI / 180),
                    cy: cy + (rOuter + 120) * Math.sin((i * 36) * Math.PI / 180)
                  }}
                  style={{ originX: cx, originY: cy }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                />
              ))}
            </g>

            {/* 도넛 세그먼트들 */}
            {arcs.map(({ c, start, end }, idx) => {
              const d = donutArcPath(cx, cy, rOuter, rInner, start, end)
              const midPos = arcCenter(cx, cy, (rOuter + rInner) / 2, start, end)
              const Icon = c.icon
              const colorIndex = idx + 1
              const colors = [
                { fill: "url(#segFill1)", stroke: "url(#segStroke1)", shadow: "rgba(80,88,156,0.4)" },
                { fill: "url(#segFill2)", stroke: "url(#segStroke2)", shadow: "rgba(99,108,203,0.4)" },
                { fill: "url(#segFill3)", stroke: "url(#segStroke3)", shadow: "rgba(110,140,251,0.4)" }
              ]
              const currentColor = colors[idx] || colors[0]
              
              return (
                <Link key={c.id} href={`/qna/${c.id}`}> {/* 전체 세그먼트 클릭 */}
                  <g cursor="pointer">
                    <motion.path
                      d={d}
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ 
                        delay: 0.15 * idx + 0.2, 
                        duration: 0.8,
                        type: "spring", 
                        stiffness: 300, 
                        damping: 20 
                      }}
                      fill={currentColor.fill}
                      stroke={currentColor.stroke}
                      strokeWidth={2}
                      style={{ filter: `drop-shadow(0 0 12px ${currentColor.shadow})` }}
                      whileHover={{ 
                        scale: 1.05,
                        y: -8,
                        filter: `drop-shadow(0 8px 20px ${currentColor.shadow})`
                      }}
                    />

                    {/* 타이틀 (한/영) */}
                    <g transform={`translate(${midPos.x}, ${midPos.y})`}>
                      <foreignObject x={-120} y={-42} width={240} height={84}>
                        <div className="flex flex-col items-center justify-center text-center select-none">
                          <div 
                            className="px-4 py-1 rounded-full backdrop-blur-sm inline-flex items-center gap-2"
                            style={{
                              background: `linear-gradient(135deg, ${currentColor.shadow.replace('0.4)', '0.25)')}, ${currentColor.shadow.replace('0.4)', '0.1)')})`,
                              border: `1px solid ${currentColor.shadow.replace('0.4)', '0.6)')}`,
                              boxShadow: `0 4px 12px ${currentColor.shadow.replace('0.4)', '0.5)')}`
                            }}
                          >
                            <Icon 
                              className="w-4 h-4" 
                              strokeWidth={1.5}
                              style={{ color: currentColor.shadow.replace('0.4)', '0.9)') }}
                            />
                            <span className="text-base md:text-lg font-semibold text-foreground">
                              {c.title}
                            </span>
                          </div>
                          <span className="mt-2 text-xs md:text-sm text-muted-foreground">
                            {c.subtitle}
                          </span>
                        </div>
                      </foreignObject>
                    </g>
                  </g>
                </Link>
              )
            })}

            {/* 중앙 원형(브레인) */}
            <g>
              {/* 회전 링 */}
              <motion.circle
                cx={cx}
                cy={cy}
                r={rInner - 36}
                fill="none"
                stroke="rgba(59,130,246,0.25)"
                strokeDasharray="4,8"
                animate={{ rotate: 360 }}
                style={{ originX: cx, originY: cy }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              />
              <motion.circle
                cx={cx}
                cy={cy}
                r={rInner - 64}
                fill="none"
                stroke="rgba(37,99,235,0.25)"
                strokeDasharray="2,10"
                animate={{ rotate: -360 }}
                style={{ originX: cx, originY: cy }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              />

              {/* 중앙 배경 */}
              <defs>
                <radialGradient id="brainBg" cx="50%" cy="50%" r="60%">
                  <stop offset="0%" stopColor="rgba(59,130,246,0.35)" />
                  <stop offset="100%" stopColor="rgba(0,0,0,0.7)" />
                </radialGradient>
              </defs>
              <circle cx={cx} cy={cy} r={rInner - 80} fill="url(#brainBg)" stroke="rgba(59,130,246,0.35)" strokeWidth={2} />

              {/* 브레인 아이콘 */}
              <g transform={`translate(${cx}, ${cy})`}>
                <foreignObject x={-80} y={-80} width={160} height={160}>
                  <div className="w-full h-full flex items-center justify-center">
                    <motion.div 
                      className="relative w-32 h-32 rounded-full bg-gradient-to-br from-slate-900 via-slate-950 to-black border-2 border-blue-500/30 flex items-center justify-center shadow-2xl cursor-pointer group"
                    whileHover={{ 
                      scale: 1.05,
                      y: -2,
                      boxShadow: "0 8px 16px rgba(59, 130, 246, 0.3)"
                    }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 300, 
                      damping: 20 
                    }}
                    onMouseEnter={() => setShowBrainTooltip(true)}
                    onMouseLeave={() => setShowBrainTooltip(false)}
                  >
                    <Brain 
                      className="w-12 h-12 md:w-16 md:h-16 text-blue-500 group-hover:text-blue-400 transition-colors duration-200" 
                      strokeWidth={1.5} 
                    />
                    </motion.div>
                  </div>
                </foreignObject>
              </g>
            </g>
          </svg>
        </div>

        {/* 브레인 툴팁 - SVG 외부에 위치 */}
        {showBrainTooltip && (
          <motion.div
            className="fixed z-50 pointer-events-none"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%) translateY(-120px)'
            }}
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-6 py-3 bg-slate-800/95 backdrop-blur-sm border border-blue-500/30 rounded-lg shadow-xl">
              <div className="text-lg font-semibold text-white whitespace-nowrap">
                AI에게 질문하시겠습니까?
              </div>
              {/* 화살표 */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800/95"></div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
