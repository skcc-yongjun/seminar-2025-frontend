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
  MessageSquare
} from "lucide-react"
import { useState, useEffect } from "react"
import { fetchQnAKeywords } from "@/lib/api"

// 아이콘 목록 - 다양한 비즈니스/전략 아이콘들
const iconList = [
  TrendingUp, Target, BarChart3, Lightbulb, Users, Zap, 
  Globe, Briefcase, Building2, Rocket, Sparkles, Cpu,
  Factory, PieChart, Network, Gauge, Award, MessageSquare
]

// 키워드별 색상 매핑 - 어둡고 투명한 색상 (투명도는 인라인 스타일로 적용)
const colorSchemes = [
  { color: "from-slate-900 via-slate-800 to-slate-900" },
  { color: "from-slate-900 via-slate-800 to-slate-900" },
  { color: "from-slate-900 via-slate-800 to-slate-900" },
  { color: "from-slate-900 via-slate-800 to-slate-900" },
  { color: "from-slate-900 via-slate-800 to-slate-900" },
  { color: "from-slate-900 via-slate-800 to-slate-900" },
]

interface Category {
  id: string
  title: string
  subtitle: string
  icon: React.ElementType
  color: string
  accentColor: string
  position: string
  angle: number
}

export default function QnACategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // 세션1과 세션2의 키워드를 모두 가져오기
        const [keywords1, keywords2] = await Promise.all([
          fetchQnAKeywords("세션1"),
          fetchQnAKeywords("세션2")
        ])
        
        // 두 세션의 키워드를 합치고 중복 제거
        const allKeywords = Array.from(new Set([...keywords1, ...keywords2]))
        
        // 키워드를 카테고리 형식으로 변환
        const categoryList: Category[] = allKeywords.map((keyword, index) => {
          const angle = index * (360 / allKeywords.length) // 균등하게 배치
          const iconIndex = index % iconList.length
          const colorIndex = index % colorSchemes.length
          const IconComponent = iconList[iconIndex]
          
          return {
            id: keyword,
            title: keyword,
            subtitle: keyword,
            icon: IconComponent,
            color: colorSchemes[colorIndex].color,
            accentColor: "sk-red",
            position: index % 3 === 0 ? "left" : index % 3 === 1 ? "top" : "right",
            angle: angle,
          }
        })
        
        setCategories(categoryList)
      } catch (err) {
        console.error('Error fetching keywords:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch keywords')
        
        // Fallback to hardcoded categories if API fails
        setCategories([
          { 
            id: "business", 
            title: "비즈니스", 
            subtitle: "Business",
            icon: TrendingUp,
            color: "from-slate-900 via-slate-800 to-slate-900",
            accentColor: "sk-red",
            position: "left",
            angle: 240
          },
          { 
            id: "group", 
            title: "그룹사", 
            subtitle: "SK Group",
            icon: Building2,
            color: "from-slate-900 via-slate-800 to-slate-900",
            accentColor: "sk-red",
            position: "top",
            angle: 0
          },
          { 
            id: "market", 
            title: "시장", 
            subtitle: "Market",
            icon: BarChart3,
            color: "from-slate-900 via-slate-800 to-slate-900",
            accentColor: "sk-red",
            position: "right",
            angle: 120
          },
        ])
      } finally {
        setLoading(false)
      }
    }
    
    fetchCategories()
  }, [])

  // Calculate position based on angle
  const getPosition = (angle: number, radius: number) => {
    const radian = (angle * Math.PI) / 180
    return {
      x: Math.sin(radian) * radius,
      y: -Math.cos(radian) * radius,
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen p-8 md:p-12 bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-sk-red mx-auto mb-4"></div>
          <p className="text-2xl text-muted-foreground">키워드 로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 md:p-12 bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-sk-red/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
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
            <span className="block h-1 w-32 bg-sk-red mt-2" />
          </h1>
          {error && (
            <p className="text-yellow-500 mt-4">
              API 호출 실패: 기본 카테고리를 표시합니다
            </p>
          )}
        </motion.div>

        {/* Circular Layout Container */}
        <div className="relative flex items-center justify-center min-h-[600px] md:min-h-[700px] mt-16">
          {/* Central Brain Icon with Rings */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
          >
            {/* Outer rings */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              className="absolute inset-0 -m-20"
            >
              <div className="w-full h-full rounded-full border-2 border-sk-red/20 border-dashed" />
            </motion.div>
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 40, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              className="absolute inset-0 -m-12"
            >
              <div className="w-full h-full rounded-full border border-blue-500/20 border-dashed" />
            </motion.div>

            {/* Central brain container */}
            <div className="relative w-32 h-32 md:w-40 md:h-40">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-sk-red/30 via-blue-500/30 to-purple-500/30 rounded-full blur-2xl animate-pulse" />

              {/* Brain icon */}
              <div className="relative w-full h-full rounded-full bg-gradient-to-br from-slate-900 via-slate-950 to-black border-2 border-sk-red/30 flex items-center justify-center shadow-2xl">
                <Brain className="w-16 h-16 md:w-20 md:h-20 text-sk-red" strokeWidth={1.5} />
              </div>
            </div>
          </motion.div>

          {/* Category Cards in Circular Arrangement */}
          {categories.map((category, index) => {
            const radius = typeof window !== 'undefined' && window.innerWidth < 768 ? 200 : 280
            const position = getPosition(category.angle, radius)
            const Icon = category.icon

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  x: position.x,
                  y: position.y,
                }}
                transition={{
                  delay: 0.4 + index * 0.15,
                  type: "spring",
                  stiffness: 80,
                }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{
                  width: typeof window !== 'undefined' && window.innerWidth < 768 ? "200px" : "240px",
                }}
              >
                <Link href={`/qna/${category.id}`} className="block group">
                  <div
                    className={`relative h-56 md:h-64 rounded-2xl overflow-hidden bg-gradient-to-br ${category.color} border-2 border-sk-red/30 transition-all duration-300 hover:border-sk-red hover:shadow-2xl hover:shadow-sk-red/20 hover:scale-105 active:scale-95`}
                    style={{ opacity: 0.9 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-sk-red/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Content */}
                    <div className="relative h-full flex flex-col items-center justify-center p-6 text-center gap-4">
                      <motion.div
                        whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                        className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-sk-red/10 backdrop-blur-sm flex items-center justify-center border-2 border-sk-red/30"
                      >
                        <Icon className="w-8 h-8 md:w-10 md:h-10 text-sk-red" strokeWidth={1.5} />
                      </motion.div>

                      {/* Title */}
                      <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2 group-hover:scale-105 transition-transform">
                          {category.title}
                        </h2>
                        <p className="text-muted-foreground text-sm md:text-base group-hover:text-foreground/80 transition-colors">
                          {category.subtitle}
                        </p>
                      </div>

                      <motion.div
                        className="absolute bottom-4 opacity-0 group-hover:opacity-100 transition-opacity"
                        animate={{ y: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                      >
                        <div className="w-8 h-1 bg-sk-red rounded-full" />
                      </motion.div>
                    </div>

                    <div className="absolute top-0 right-0 w-20 h-20 bg-sk-red/5 rounded-bl-full" />
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-black/30 rounded-tr-full" />
                  </div>
                </Link>
              </motion.div>
            )
          })}

          {/* Connecting lines (optional decorative element) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" style={{ zIndex: 5 }}>
            {categories.map((category, index) => {
              const radius = typeof window !== 'undefined' && window.innerWidth < 768 ? 200 : 280
              const position = getPosition(category.angle, radius)
              const centerX = "50%"
              const centerY = "50%"

              return (
                <motion.line
                  key={category.id}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.3 }}
                  transition={{ delay: 0.6 + index * 0.1, duration: 0.8 }}
                  x1={centerX}
                  y1={centerY}
                  x2={`calc(${centerX} + ${position.x}px)`}
                  y2={`calc(${centerY} + ${position.y}px)`}
                  stroke="url(#gradient)"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
              )
            })}
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgb(234, 0, 44)" stopOpacity="0.5" />
                <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.5" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  )
}
