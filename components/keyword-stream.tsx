"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"

interface Keyword {
  term: string
  sentiment: "positive" | "negative" | "neutral"
  isNew?: boolean
}

interface KeywordStreamProps {
  keywords: Keyword[]
}

export function KeywordStream({ keywords }: KeywordStreamProps) {
  const [burstingKeywords, setBurstingKeywords] = useState<string[]>([])

  useEffect(() => {
    const newKeywords = keywords.filter((k) => k.isNew).map((k) => k.term)
    if (newKeywords.length > 0) {
      setBurstingKeywords(newKeywords)
      // Remove from bursting list after animation completes
      setTimeout(() => {
        setBurstingKeywords([])
      }, 1500)
    }
  }, [keywords])

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-success/20 text-success border-success/30 shadow-success/50"
      case "negative":
        return "bg-destructive/20 text-destructive border-destructive/30 shadow-destructive/50"
      default:
        return "bg-primary/20 text-primary border-primary/30 shadow-primary/50"
    }
  }

  return (
    <div className="relative">
      <AnimatePresence>
        {burstingKeywords.map((term) => {
          const keyword = keywords.find((k) => k.term === term)
          if (!keyword) return null

          return (
            <motion.div
              key={`burst-${term}`}
              initial={{
                position: "fixed",
                left: "50%",
                top: "50%",
                x: "-50%",
                y: "-50%",
                opacity: 1,
                scale: 0.5,
              }}
              animate={{
                left: "auto",
                top: "auto",
                x: 0,
                y: 0,
                opacity: 0,
                scale: 1.5,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 1.2,
                ease: [0.34, 1.56, 0.64, 1],
              }}
              className="pointer-events-none z-50"
            >
              <Badge
                variant="outline"
                className={`${getSentimentColor(keyword.sentiment)} px-3 py-1.5 text-xs font-medium shadow-2xl`}
              >
                <span className="relative z-10">{keyword.term}</span>
              </Badge>
            </motion.div>
          )
        })}
      </AnimatePresence>

      <div className="flex flex-wrap gap-2">
        <AnimatePresence mode="popLayout">
          {keywords.map((keyword, index) => {
            const isBursting = burstingKeywords.includes(keyword.term)

            return (
              <motion.div
                key={keyword.term}
                initial={{
                  opacity: 0,
                  scale: 0,
                  x: isBursting ? -200 : -100,
                  rotate: isBursting ? -360 : -180,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  x: 0,
                  rotate: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0,
                  x: 100,
                  rotate: 180,
                }}
                transition={{
                  delay: isBursting ? 1.2 : index * 0.08,
                  type: "spring",
                  stiffness: isBursting ? 300 : 400,
                  damping: isBursting ? 20 : 25,
                }}
              >
                <Badge
                  variant="outline"
                  className={`${getSentimentColor(keyword.sentiment)} ${
                    keyword.isNew ? "animate-pulse shadow-lg" : "shadow-md"
                  } px-3 py-1.5 text-xs font-medium transition-all duration-300 hover:scale-110 relative overflow-hidden`}
                >
                  {keyword.isNew && (
                    <>
                      <motion.span
                        initial={{ scale: 0, opacity: 1 }}
                        animate={{ scale: [0, 1.5, 0], opacity: [1, 0.5, 0] }}
                        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                        className="absolute inset-0 bg-current rounded-full"
                      />
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="inline-block w-2 h-2 bg-current rounded-full mr-2 relative z-10"
                      />
                    </>
                  )}
                  <span className="relative z-10">{keyword.term}</span>
                </Badge>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
