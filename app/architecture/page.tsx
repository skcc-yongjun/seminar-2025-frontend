"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Mic, FileText, BookOpen, Brain, Database, Zap, BarChart3, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function ArchitecturePage() {
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
    <div className="min-h-screen p-6 md:p-12 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sk-red/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground mb-6">
              <ArrowLeft className="w-4 h-4" />
              대시보드로 돌아가기
            </Button>
          </Link>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-sk-red rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">SK</span>
            </div>
            <div className="border-l border-border/50 pl-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">SK Group</p>
              <p className="text-base font-semibold text-foreground">발표 평가 시스템</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">실시간 AI 발표 랭킹 흐름도</h1>
          <p className="text-lg text-muted-foreground">데이터 기반의 객관적인 평가로 발표 역량을 극대화</p>
        </motion.div>

        <div className="relative py-12">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-4 flex-wrap max-w-6xl mx-auto">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.1 }}
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
                    transition={{ delay: 0.3 + index * 0.1 }}
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
          transition={{ delay: 1 }}
          className="text-center mt-16"
        >
          <div className="inline-block px-6 py-3 bg-gradient-to-r from-sk-red/10 to-cyan-500/10 rounded-full border border-sk-red/20">
            <p className="text-sm font-medium">
              <span className="text-cyan-400 font-bold">7단계</span> 파이프라인 아키텍처로 구성된{" "}
              <span className="text-sk-red font-bold">전체 시스템</span>
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="mt-12 text-center"
        >
          <Link href="/">
            <Button className="gap-2 bg-sk-red hover:bg-sk-red/90 text-white px-8 py-6 text-base shadow-lg">
              <BarChart3 className="w-5 h-5" />
              실시간 대시보드 보기
            </Button>
          </Link>
        </motion.div>

        <div className="mt-16 pt-8 border-t border-border/30 text-center">
          <p className="text-xs text-muted-foreground">© 2025 SK Group. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
