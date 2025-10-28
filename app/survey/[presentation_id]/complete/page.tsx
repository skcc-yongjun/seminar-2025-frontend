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
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex justify-center mb-6"
          >
            <div className="bg-green-500/10 rounded-full p-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <h1 className="text-3xl font-bold text-foreground mb-3">
              {!isLoading && nextPresentationId === null 
                ? "평가가 모두 종료되었습니다" 
                : "평가 제출 완료"}
            </h1>
            <p className="text-muted-foreground mb-2">
              {!isLoading && nextPresentationId === null 
                ? "모든 발표에 대한 평가를 완료하셨습니다. 감사합니다!" 
                : "소중한 평가를 제출해주셔서 감사합니다."}
            </p>

            {isLoading && (
              <div className="mt-8 text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">다음 발표 확인 중...</p>
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
                      className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
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
                        className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600"
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
