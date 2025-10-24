"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Mic, FileText, BookOpen, Brain, Database, Zap, BarChart3, ArrowRight, MessageCircleQuestion } from "lucide-react"

export default function SessionEntry() {
  const steps = [
    {
      icon: Mic,
      title: "음성 입력",
      subtitle: "Audio Input",
      color: "from-cyan-500 to-cyan-600",
    },
    {
      icon: FileText,
      title: "전사 및 분할",
      subtitle: "Transcription &\nChunking",
      color: "from-cyan-500 to-cyan-600",
    },
    {
      icon: BookOpen,
      title: "컨텍스트 보강",
      subtitle: "RAG",
      color: "from-cyan-500 to-cyan-600",
    },
    {
      icon: Brain,
      title: "AI 평가",
      subtitle: "AI Evaluation",
      color: "from-cyan-500 to-cyan-600",
    },
    {
      icon: Database,
      title: "데이터 저장",
      subtitle: "Persistence &\nAggregation",
      color: "from-cyan-500 to-cyan-600",
    },
    {
      icon: Zap,
      title: "실시간 전달",
      subtitle: "Real-time\nDelivery",
      color: "from-cyan-500 to-cyan-600",
    },
    {
      icon: BarChart3,
      title: "대시보드",
      subtitle: "Dashboard\nVisualization",
      color: "from-cyan-500 to-cyan-600",
    },
  ]

  return (
    <div className="min-h-screen p-4 md:p-6 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sk-red/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sk-red/3 rounded-full blur-3xl" />
      </div>

      <div className="max-w-3xl mx-auto w-full relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-20 h-20 bg-sk-red rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-3xl">SK</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">{"SK그룹 CEO Seminar"}</h1>
        </motion.div>

        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Link href="/post-presentation" className="block group">
              <div className="relative w-full h-24 rounded-xl overflow-hidden border border-sk-red/30 transition-all duration-300 hover:border-sk-red/60 hover:shadow-lg hover:shadow-sk-red/20 active:scale-[0.98]">
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-sk-red/0 via-sk-red/5 to-sk-red/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 bg-gradient-to-r from-sk-red/10 via-sk-red/20 to-sk-red/10 opacity-0 group-active:opacity-100 transition-opacity duration-150" />

                {/* Button content */}
                <div className="relative h-full flex items-center justify-center px-6 backdrop-blur-sm bg-card/30">
                  <span className="text-xl font-semibold text-foreground text-center text-balance group-hover:text-sk-red transition-colors duration-300">
                    [session1] 발표 종료 후 대시보드
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Link href="/ranking" className="block group">
              <div className="relative w-full h-24 rounded-xl overflow-hidden border-2 border-sk-red/50 transition-all duration-300 hover:border-sk-red hover:shadow-xl hover:shadow-sk-red/30 active:scale-[0.98] bg-gradient-to-r from-sk-red/10 to-sk-red/5">
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-sk-red/10 via-sk-red/20 to-sk-red/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 bg-gradient-to-r from-sk-red/20 via-sk-red/30 to-sk-red/20 opacity-0 group-active:opacity-100 transition-opacity duration-150" />

                {/* Button content */}
                <div className="relative h-full flex items-center justify-center px-6 backdrop-blur-sm">
                  <span className="text-xl font-bold text-sk-red text-center text-balance group-hover:text-white transition-colors duration-300">
                    [session1] 전체 종합평가 결과
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>


          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Link href="/qna" className="block group">
              <div className="relative w-full h-24 rounded-xl overflow-hidden border border-cyan-500/30 transition-all duration-300 hover:border-cyan-500/60 hover:shadow-lg hover:shadow-cyan-500/20 active:scale-[0.98]">
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-cyan-500/20 to-cyan-500/10 opacity-0 group-active:opacity-100 transition-opacity duration-150" />

                {/* Button content */}
                <div className="relative h-full flex items-center justify-center gap-3 px-6 backdrop-blur-sm bg-card/30">
                  <MessageCircleQuestion className="w-6 h-6 text-cyan-400 group-hover:text-cyan-300 transition-colors duration-300" />
                  <span className="text-xl font-semibold text-foreground text-center text-balance group-hover:text-cyan-400 transition-colors duration-300">
                    [session2] Q&amp;A 세션
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
                    
          {/* Survey Start */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Link href="/survey/presentation-001" className="block group">
              {/* </CHANGE> */}
              <div className="relative w-full h-24 rounded-xl overflow-hidden border border-sk-red/30 transition-all duration-300 hover:border-sk-red/60 hover:shadow-lg hover:shadow-sk-red/20 active:scale-[0.98]">
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-sk-red/0 via-sk-red/5 to-sk-red/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 bg-gradient-to-r from-sk-red/10 via-sk-red/20 to-sk-red/10 opacity-0 group-active:opacity-100 transition-opacity duration-150" />

                {/* Button content */}
                <div className="relative h-full flex items-center justify-center px-6 backdrop-blur-sm bg-card/30">
                  <span className="text-xl font-semibold text-foreground text-center text-balance group-hover:text-sk-red transition-colors duration-300">
                    Survey
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>          
          {/* Survey End */}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="max-w-7xl mx-auto w-full relative z-10 mt-24"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-foreground">실시간 AI 발표 랭킹 흐름도</h2>
          <p className="text-base text-muted-foreground">데이터 기반의 객관적인 평가로 발표 역량을 극대화</p>
        </div>

        <div className="relative py-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-4 flex-wrap max-w-6xl mx-auto">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex items-center gap-4"
              >
                <div className="flex flex-col items-center">
                  <div className="relative group">
                    <motion.div
                      animate={{
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        delay: index * 0.2,
                      }}
                      className={`absolute inset-0 bg-gradient-to-br ${step.color} rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity`}
                    />
                    <div className="relative w-24 h-24 bg-slate-800/80 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-cyan-500/30 shadow-xl">
                      <step.icon className="w-10 h-10 text-cyan-400" strokeWidth={1.5} />
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-sm font-semibold text-foreground mb-1">{step.title}</p>
                    <p className="text-xs text-cyan-400 whitespace-pre-line leading-tight">{step.subtitle}</p>
                  </div>
                </div>

                {index < steps.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="hidden md:block"
                  >
                    <ArrowRight className="w-8 h-8 text-cyan-500/60" strokeWidth={2} />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="text-center mt-12"
        >
          <div className="inline-block px-6 py-3 bg-gradient-to-r from-sk-red/10 to-cyan-500/10 rounded-full border border-sk-red/20">
            <p className="text-sm font-medium">
              <span className="text-cyan-400 font-bold">7단계</span> 파이프라인 아키텍처로 구성된{" "}
              <span className="text-sk-red font-bold">전체 시스템</span>
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="text-center mt-16 relative z-10"
      >
        <p className="text-xs text-muted-foreground">© 2025 SK Group. All rights reserved.</p>
      </motion.div>
    </div>
  )
}
