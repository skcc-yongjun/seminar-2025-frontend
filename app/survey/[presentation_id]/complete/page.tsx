"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { CheckCircle2, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function CompletePage({ params }: { params: { presentation_id: string } }) {
  const [presenter, setPresenter] = useState({ name: "", topic: "" })
  const [nextPresentationId, setNextPresentationId] = useState("")

  useEffect(() => {
    const submissionKey = `survey_submitted_${params.presentation_id}`
    const submissionData = localStorage.getItem(submissionKey)

    if (submissionData) {
      const data = JSON.parse(submissionData)
      setPresenter({
        name: data.presenterName || "발표자",
        topic: data.presenterTopic || "발표 주제",
      })
    }

    const currentId = params.presentation_id
    const match = currentId.match(/(\d+)$/)
    if (match) {
      const currentNumber = Number.parseInt(match[1])
      const nextNumber = currentNumber + 1
      const nextId = currentId.replace(/\d+$/, String(nextNumber).padStart(match[1].length, "0"))
      setNextPresentationId(nextId)
    }
  }, [params.presentation_id])

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
            <h1 className="text-3xl font-bold text-foreground mb-3">평가 제출 완료</h1>
            <p className="text-muted-foreground mb-2">소중한 평가를 제출해주셔서 감사합니다.</p>
            {presenter.name && (
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">평가 완료</p>
                <p className="font-semibold text-foreground">{presenter.name}</p>
                <p className="text-sm text-muted-foreground mt-1">{presenter.topic}</p>
              </div>
            )}

            <div className="mt-8">
              {nextPresentationId && (
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
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
