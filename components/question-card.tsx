"use client"

import { motion } from "framer-motion"
import { CheckCircle2, Sparkles, ArrowRight } from "lucide-react"

interface QuestionCardProps {
  question: {
    id: number
    keyword: string // Added keyword field for short display text
    question: string
    duration: string
    answered: boolean
  }
  index: number
  onSelect: (id: number) => void
}

export function QuestionCard({ question, index, onSelect }: QuestionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, type: "spring", stiffness: 100 }}
      whileHover={{ scale: 1.03, y: -8 }}
      onClick={() => onSelect(question.id)}
      className="relative cursor-pointer group"
    >
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#E61E2A]/50 via-[#E61E2A]/30 to-[#E61E2A]/50 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500" />

      <div className="relative bg-gradient-to-br from-[#2a2a2a] to-[#1f1f1f] rounded-2xl p-6 border border-white/5 group-hover:border-[#E61E2A]/30 transition-all duration-300 overflow-hidden">
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#E61E2A]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#E61E2A]/5 rounded-full blur-2xl" />
        </div>

        <div className="relative space-y-4">
          <div className="flex items-center justify-between">
            <motion.div
              className="relative"
              whileHover={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
            >
              <div className="absolute inset-0 bg-[#E61E2A] rounded-full blur-md opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-[#E61E2A] to-[#c01820] flex items-center justify-center text-white font-bold text-lg shadow-xl">
                Q{question.id}
              </div>
            </motion.div>

            {question.answered ? (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              </motion.div>
            ) : (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              >
                <Sparkles className="w-5 h-5 text-[#E61E2A]/60" />
              </motion.div>
            )}
          </div>

          <p className="text-white/90 font-semibold leading-relaxed min-h-[60px] text-pretty group-hover:text-white transition-colors text-lg">
            {question.keyword}
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <motion.div
              className="flex items-center gap-2 text-[#E61E2A] opacity-0 group-hover:opacity-100 transition-opacity"
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
            >
              <span className="text-sm font-medium">재생하기</span>
              <ArrowRight className="w-4 h-4" />
            </motion.div>
          </div>
        </div>

        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#E61E2A] to-transparent"
          initial={{ scaleX: 0 }}
          whileHover={{ scaleX: 1 }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  )
}
