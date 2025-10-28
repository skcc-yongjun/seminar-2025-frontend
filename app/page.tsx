"use client"

import { motion, useMotionValue, useSpring } from "framer-motion"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Mic, FileText, BookOpen, Brain, Database, Zap, BarChart3, ArrowRight, MessageCircleQuestion, Users, Settings } from "lucide-react"

export default function SessionEntry() {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const smoothMouseX = useSpring(mouseX, { damping: 20, stiffness: 100 })
  const smoothMouseY = useSpring(mouseY, { damping: 20, stiffness: 100 })

  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([])

  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
    }))
    setParticles(newParticles)

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [mouseX, mouseY])

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
    <div className="min-h-screen p-4 md:p-6 flex flex-col items-center justify-center relative overflow-hidden bg-slate-950">
      <div className="fixed inset-0 pointer-events-none">
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

        <motion.div
          className="fixed inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(180deg, transparent 0%, rgba(34, 211, 238, 0.1) 50%, transparent 100%)",
            height: "200px",
          }}
          animate={{
            y: ["-200px", "100vh"],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />

        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: particle.delay,
              ease: "easeInOut",
            }}
          />
        ))}

        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"
          style={{
            x: useSpring(smoothMouseX, { damping: 50 }),
            y: useSpring(smoothMouseY, { damping: 50 }),
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          style={{
            x: useSpring(smoothMouseX, { damping: 70 }),
            y: useSpring(smoothMouseY, { damping: 70 }),
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{
            duration: 5,
            repeat: Number.POSITIVE_INFINITY,
            delay: 1,
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-3xl mx-auto w-full relative z-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <motion.div
              className="relative w-20 h-20 rounded-xl flex items-center justify-center shadow-lg group"
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
                  className="text-white font-bold text-3xl"
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
          </div>
          <motion.h1
            className="text-4xl md:text-5xl font-bold text-white mb-4 text-balance tracking-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {"SK그룹 CEO Seminar".split("").map((char, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                {char}
              </motion.span>
            ))}
          </motion.h1>
          <motion.div
            className="h-1 w-32 mx-auto bg-gradient-to-r from-transparent via-cyan-500 to-transparent"
            animate={{
              width: ["8rem", "10rem", "8rem"],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
            }}
          />
        </motion.div>

        <div className="space-y-4">
          {/* Session 1 Divider */}
          <motion.div 
            initial={{ opacity: 0, scaleX: 0 }} 
            animate={{ opacity: 1, scaleX: 1 }} 
            transition={{ delay: 0.05, duration: 0.5 }}
            className="flex items-center my-8"
          >
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
            <motion.div 
              className="px-6 py-2 bg-slate-900/80 backdrop-blur-xl rounded-full border border-cyan-500/30"
              whileHover={{ scale: 1.05, borderColor: "rgba(6, 182, 212, 0.6)" }}
            >
              <span className="text-sm font-semibold text-cyan-400">Session 1</span>
            </motion.div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Link href="/post-presentation" className="block group">
              <motion.div
                className="relative w-full h-24 rounded-xl overflow-hidden transition-all duration-300 active:scale-[0.98]"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-cyan-500/40 to-cyan-500/20 blur-xl"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />

                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl border border-cyan-500/30 rounded-xl group-hover:border-cyan-500/60 group-hover:bg-slate-900/80 transition-all duration-300">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent h-8"
                    initial={{ top: "-2rem" }}
                    whileHover={{
                      top: "100%",
                      transition: { duration: 1, ease: "linear" },
                    }}
                  />
                </div>

                <div className="relative h-full flex items-center justify-center px-6">
                  <span className="text-xl font-semibold text-white text-center text-balance group-hover:text-cyan-400 transition-colors duration-300">
                    [session1] 발표 종료 후 대시보드
                  </span>
                </div>
              </motion.div>
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Link href="/single-presenter?session=세션1" className="block group">
              <motion.div
                className="relative w-full h-24 rounded-xl overflow-hidden transition-all duration-300 active:scale-[0.98]"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-cyan-500/40 to-cyan-500/20 blur-xl"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />

                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl border border-cyan-500/30 rounded-xl group-hover:border-cyan-500/60 group-hover:bg-slate-900/80 transition-all duration-300">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent h-8"
                    initial={{ top: "-2rem" }}
                    whileHover={{
                      top: "100%",
                      transition: { duration: 1, ease: "linear" },
                    }}
                  />
                </div>

                <div className="relative h-full flex items-center justify-center px-6">
                  <span className="text-xl font-semibold text-white text-center text-balance group-hover:text-cyan-400 transition-colors duration-300">
                    [Session1] Seminar Control
                  </span>
                </div>
              </motion.div>
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Link href="/ranking" className="block group">
              <motion.div
                className="relative w-full h-24 rounded-xl overflow-hidden transition-all duration-300 active:scale-[0.98]"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-500/30 via-blue-500/50 to-purple-500/30 blur-2xl"
                  animate={{
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                  }}
                />

                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-800/80 to-slate-900/80 backdrop-blur-xl border-2 border-purple-500/50 rounded-xl group-hover:border-blue-500 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all duration-300">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/20 to-transparent h-8"
                    initial={{ top: "-2rem" }}
                    whileHover={{
                      top: "100%",
                      transition: { duration: 1, ease: "linear" },
                    }}
                  />
                </div>

                <div className="relative h-full flex items-center justify-center px-6">
                  <span className="text-xl font-bold text-blue-400 text-center text-balance group-hover:text-white transition-colors duration-300 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">
                    [session1] 전체 종합평가 결과
                  </span>
                </div>
              </motion.div>
            </Link>
          </motion.div>

          {/* Session 2 Divider */}
          <motion.div 
            initial={{ opacity: 0, scaleX: 0 }} 
            animate={{ opacity: 1, scaleX: 1 }} 
            transition={{ delay: 0.25, duration: 0.5 }}
            className="flex items-center my-8"
          >
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
            <motion.div 
              className="px-6 py-2 bg-slate-900/80 backdrop-blur-xl rounded-full border border-cyan-500/30"
              whileHover={{ scale: 1.05, borderColor: "rgba(6, 182, 212, 0.6)" }}
            >
              <span className="text-sm font-semibold text-cyan-400">Session 2</span>
            </motion.div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Link href="/single-presenter?session=세션2" className="block group">
              <motion.div
                className="relative w-full h-24 rounded-xl overflow-hidden transition-all duration-300 active:scale-[0.98]"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-cyan-500/40 to-cyan-500/20 blur-xl"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />

                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl border border-cyan-500/30 rounded-xl group-hover:border-cyan-500/60 group-hover:bg-slate-900/80 transition-all duration-300">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent h-8"
                    initial={{ top: "-2rem" }}
                    whileHover={{
                      top: "100%",
                      transition: { duration: 1, ease: "linear" },
                    }}
                  />
                </div>

                <div className="relative h-full flex items-center justify-center gap-3 px-6">
                  <span className="text-xl font-semibold text-white text-center text-balance group-hover:text-cyan-400 transition-colors duration-300">
                    [Session2] Seminar Control
                  </span>
                </div>
              </motion.div>
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Link href="/qna" className="block group">
              <motion.div
                className="relative w-full h-24 rounded-xl overflow-hidden transition-all duration-300 active:scale-[0.98]"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-cyan-500/40 to-cyan-500/20 blur-xl"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />

                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl border border-cyan-500/30 rounded-xl group-hover:border-cyan-500/60 group-hover:bg-slate-900/80 transition-all duration-300">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent h-8"
                    initial={{ top: "-2rem" }}
                    whileHover={{
                      top: "100%",
                      transition: { duration: 1, ease: "linear" },
                    }}
                  />
                </div>

                <div className="relative h-full flex items-center justify-center gap-3 px-6">
                  <motion.div whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }} transition={{ duration: 0.5 }}>
                    <MessageCircleQuestion className="w-6 h-6 text-cyan-400 group-hover:text-cyan-300 transition-colors duration-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
                  </motion.div>
                  <span className="text-xl font-semibold text-white text-center text-balance group-hover:text-cyan-400 transition-colors duration-300">
                    [session2] Q&amp;A 세션
                  </span>
                </div>
              </motion.div>
            </Link>
          </motion.div>

          {/* Non Session Divider */}
          <motion.div 
            initial={{ opacity: 0, scaleX: 0 }} 
            animate={{ opacity: 1, scaleX: 1 }} 
            transition={{ delay: 0.42, duration: 0.5 }}
            className="flex items-center my-8"
          >
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
            <motion.div 
              className="px-6 py-2 bg-slate-900/80 backdrop-blur-xl rounded-full border border-purple-500/30"
              whileHover={{ scale: 1.05, borderColor: "rgba(168, 85, 247, 0.6)" }}
            >
              <span className="text-sm font-semibold text-purple-400">Non Session</span>
            </motion.div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
            <Link href="/panel-discussion" className="block group">
              <motion.div
                className="relative w-full h-24 rounded-xl overflow-hidden transition-all duration-300 active:scale-[0.98]"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-purple-500/40 to-purple-500/20 blur-xl"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />

                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl border border-purple-500/30 rounded-xl group-hover:border-purple-500/60 group-hover:bg-slate-900/80 transition-all duration-300">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/20 to-transparent h-8"
                    initial={{ top: "-2rem" }}
                    whileHover={{
                      top: "100%",
                      transition: { duration: 1, ease: "linear" },
                    }}
                  />
                </div>

                <div className="relative h-full flex items-center justify-center gap-3 px-6">
                  <motion.div whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }} transition={{ duration: 0.5 }}>
                    <Users className="w-6 h-6 text-purple-400 group-hover:text-purple-300 transition-colors duration-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                  </motion.div>
                  <span className="text-xl font-semibold text-white text-center text-balance group-hover:text-purple-400 transition-colors duration-300">
                    [패널토의] 실시간 인사이트 모니터링
                  </span>
                </div>
              </motion.div>
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Link href="/survey" className="block group">
              <motion.div
                className="relative w-full h-24 rounded-xl overflow-hidden transition-all duration-300 active:scale-[0.98]"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-cyan-500/40 to-cyan-500/20 blur-xl"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />

                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl border border-cyan-500/30 rounded-xl group-hover:border-cyan-500/60 group-hover:bg-slate-900/80 transition-all duration-300">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent h-8"
                    initial={{ top: "-2rem" }}
                    whileHover={{
                      top: "100%",
                      transition: { duration: 1, ease: "linear" },
                    }}
                  />
                </div>

                <div className="relative h-full flex items-center justify-center px-6">
                  <span className="text-xl font-semibold text-white text-center text-balance group-hover:text-cyan-400 transition-colors duration-300">
                    Survey
                  </span>
                </div>
              </motion.div>
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
            <Link href="/operation" className="block group">
              <motion.div
                className="relative w-full h-24 rounded-xl overflow-hidden transition-all duration-300 active:scale-[0.98]"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-orange-500/40 to-orange-500/20 blur-xl"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />

                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl border border-orange-500/30 rounded-xl group-hover:border-orange-500/60 group-hover:bg-slate-900/80 transition-all duration-300">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-500/20 to-transparent h-8"
                    initial={{ top: "-2rem" }}
                    whileHover={{
                      top: "100%",
                      transition: { duration: 1, ease: "linear" },
                    }}
                  />
                </div>

                <div className="relative h-full flex items-center justify-center gap-3 px-6">
                  <motion.div whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }} transition={{ duration: 0.5 }}>
                    <Settings className="w-6 h-6 text-orange-400 group-hover:text-orange-300 transition-colors duration-300 drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]" />
                  </motion.div>
                  <span className="text-xl font-semibold text-white text-center text-balance group-hover:text-orange-400 transition-colors duration-300">
                    운영자 전용 페이지
                  </span>
                </div>
              </motion.div>
            </Link>
          </motion.div>

        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="max-w-7xl mx-auto w-full relative z-10 mt-24"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-white tracking-tight">실시간 AI 발표 랭킹 흐름도</h2>
          <p className="text-base text-cyan-400/80">데이터 기반의 객관적인 평가로 발표 역량을 극대화</p>
        </div>

        <div className="relative py-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-4 flex-wrap max-w-6xl mx-auto">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="flex items-center gap-4"
              >
                <div className="flex flex-col items-center">
                  <motion.div
                    className="relative group cursor-pointer"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
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
                    <div className="relative w-24 h-24 bg-slate-900/90 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-cyan-500/30 shadow-xl group-hover:border-cyan-500/60 transition-all duration-300">
                      <motion.div whileHover={{ scale: 1.2, rotate: 360 }} transition={{ duration: 0.6 }}>
                        <step.icon
                          className="w-10 h-10 text-cyan-400 group-hover:text-cyan-300 transition-colors"
                          strokeWidth={1.5}
                        />
                      </motion.div>
                    </div>
                  </motion.div>
                  <div className="mt-4 text-center">
                    <p className="text-sm font-semibold text-white mb-1">{step.title}</p>
                    <p className="text-xs text-cyan-400/80 whitespace-pre-line leading-tight">{step.subtitle}</p>
                  </div>
                </div>

                {index < steps.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + index * 0.1 }}
                    className="hidden md:block"
                  >
                    <motion.div
                      animate={{
                        x: [0, 5, 0],
                        opacity: [0.6, 1, 0.6],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Number.POSITIVE_INFINITY,
                        delay: index * 0.2,
                      }}
                    >
                      <ArrowRight className="w-8 h-8 text-cyan-500/60" strokeWidth={2} />
                    </motion.div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6 }}
          className="text-center mt-12"
        >
          <motion.div className="inline-block relative group cursor-default" whileHover={{ scale: 1.05 }}>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-cyan-500/20 rounded-full blur-xl"
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
              }}
            />

            <div className="relative px-6 py-3 bg-slate-900/80 backdrop-blur-xl rounded-full border border-cyan-500/30 group-hover:border-cyan-500/60 transition-all duration-300">
              <p className="text-sm font-medium text-white">
                <span className="text-cyan-400 font-bold">7단계</span> 파이프라인 아키텍처로 구성된{" "}
                <span className="text-blue-400 font-bold">전체 시스템</span>
              </p>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="text-center mt-16 relative z-10"
      >
        <div className="h-px w-64 mx-auto bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent mb-4" />
        <p className="text-xs text-cyan-400/60">© 2025 SK Group. All rights reserved.</p>
      </motion.div>
    </div>
  )
}
