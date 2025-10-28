"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { CheckCircle2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { fetchPresentations } from "@/lib/api"

export default function CompletePage({ params }: { params: Promise<{ presentation_id: string }> }) {
  const { presentation_id } = use(params)
  const router = useRouter()
  const [nextPresentationId, setNextPresentationId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadNextPresentation() {
      try {
        // 세션1의 모든 발표 조회
        const presentations = await fetchPresentations("세션1")
        
        if (presentations.length === 0) {
          setIsLoading(false)
          return
        }

        // presentation_order 기준으로 오름차순 정렬
        const sortedPresentations = [...presentations].sort(
          (a, b) => a.presentation_order - b.presentation_order
        )

        // 아직 제출하지 않은 첫 번째 발표 찾기 (미제출 발표 우선)
        const unsubmittedPresentation = sortedPresentations.find(p => {
          const key = `survey_submitted_${p.presentation_id}`
          return !localStorage.getItem(key)
        })

        if (unsubmittedPresentation) {
          // 미제출 발표가 있으면 설정
          setNextPresentationId(unsubmittedPresentation.presentation_id)
          console.log("📍 [Complete] 다음 미제출 발표:", unsubmittedPresentation.presentation_id)
        } else {
          // 모든 발표 제출 완료
          setNextPresentationId(null)
          console.log("✅ [Complete] 모든 발표 제출 완료")
        }

        setIsLoading(false)
      } catch (error) {
        console.error("다음 발표 조회 실패:", error)
        setIsLoading(false)
      }
    }

    loadNextPresentation()
  }, [presentation_id])

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: "linear-gradient(to bottom, #0a1628, #0f1f3a, #0a1628)" }}
    >
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div
          className="absolute inset-0 animate-pulse"
          style={{
            backgroundImage:
              "linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>
      
      {/* Floating particles */}
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div
          key={i}
          className="fixed w-1 h-1 bg-cyan-400/30 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Number.POSITIVE_INFINITY,
            delay: Math.random() * 2,
          }}
        />
      ))}
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full relative z-10"
      >
        <div 
          className="rounded-2xl p-8 shadow-lg text-center relative overflow-hidden"
          style={{
            background: "rgba(15, 23, 42, 0.8)",
            backdropFilter: "blur(24px)",
            border: "2px solid rgba(6, 182, 212, 0.3)",
            boxShadow: "0 0 40px rgba(6, 182, 212, 0.2)",
          }}
        >
          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-cyan-400/50 rounded-tl-2xl" />
          <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-cyan-400/50 rounded-tr-2xl" />
          <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-cyan-400/50 rounded-bl-2xl" />
          <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-cyan-400/50 rounded-br-2xl" />
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex justify-center mb-6 relative"
          >
            <div className="bg-cyan-500/20 rounded-full p-4 relative">
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-cyan-400"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                }}
              />
              <CheckCircle2 className="h-16 w-16 text-cyan-400" style={{ filter: "drop-shadow(0 0 10px rgba(6, 182, 212, 0.8))" }} />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <h1 className="text-3xl font-bold text-white mb-3">
              {!isLoading && nextPresentationId === null 
                ? "평가가 모두 종료되었습니다" 
                : "평가 제출 완료"}
            </h1>
            <p className="text-cyan-400/80 mb-2">
              {!isLoading && nextPresentationId === null 
                ? "모든 발표에 대한 평가를 완료하셨습니다. 감사합니다!" 
                : "소중한 평가를 제출해주셔서 감사합니다."}
            </p>

            {isLoading && (
              <div className="mt-8 text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto"
                  style={{ boxShadow: "0 0 20px rgba(6, 182, 212, 0.5)" }}
                ></div>
                <p className="text-sm text-cyan-400/70 mt-2">다음 발표 확인 중...</p>
              </div>
            )}
            
            {!isLoading && nextPresentationId && (
              <div className="mt-8 space-y-3">
                <Link href={`/survey/${nextPresentationId}`} className="block">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full h-14 text-lg font-semibold relative overflow-hidden group"
                      style={{
                        background: "rgba(6, 182, 212, 0.1)",
                        border: "2px solid rgba(6, 182, 212, 0.5)",
                        color: "#22d3ee",
                      }}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        다음 발표자 평가
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5, ease: "easeInOut" }}
                        >
                          <ArrowRight className="h-5 w-5" />
                        </motion.div>
                      </span>
                      <motion.div
                        className="absolute inset-0"
                        style={{ background: "rgba(6, 182, 212, 0.2)" }}
                        initial={{ x: "-100%" }}
                        whileHover={{ x: "0%" }}
                        transition={{ duration: 0.3 }}
                      />
                    </Button>
                  </motion.div>
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
