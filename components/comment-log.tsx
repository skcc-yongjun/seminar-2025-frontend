"use client"

import { motion } from "framer-motion"
import { MessageSquare, Info } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

interface Comment {
  timestamp: string
  text: string
  evidence?: string
}

interface CommentLogProps {
  comments: Comment[]
}

export function CommentLog({ comments }: CommentLogProps) {
  const [blinkingIndex, setBlinkingIndex] = useState<number | null>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      if (comments.length > 0) {
        // Blink the most recent comment
        setBlinkingIndex(0)
        // Stop blinking after 2 seconds
        setTimeout(() => {
          setBlinkingIndex(null)
        }, 2000)
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [comments.length])

  return (
    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
      {comments.map((comment, index) => {
        const isBlinking = blinkingIndex === index

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-start gap-3 p-3 bg-secondary/50 rounded-lg border border-border/50 relative overflow-hidden ${
              isBlinking ? "animate-pulse shadow-lg shadow-primary/50" : ""
            }`}
          >
            {isBlinking && (
              <>
                <motion.span
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{ scale: [0, 1.5, 0], opacity: [1, 0.5, 0] }}
                  transition={{ duration: 1, repeat: 2 }}
                  className="absolute inset-0 bg-primary/20 rounded-lg"
                />
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 0.5, repeat: 4 }}
                  className="absolute inset-0 border-2 border-primary rounded-lg"
                />
              </>
            )}
            <MessageSquare
              className={`w-4 h-4 mt-1 flex-shrink-0 relative z-10 ${
                isBlinking ? "text-primary animate-pulse" : "text-primary"
              }`}
            />
            <div className="flex-1 min-w-0 relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-muted-foreground font-mono">{comment.timestamp}</span>
                {isBlinking && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="inline-block w-2 h-2 bg-primary rounded-full animate-pulse"
                  />
                )}
              </div>
              <p className="text-sm leading-relaxed">{comment.text}</p>
            </div>
            {comment.evidence && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0 relative z-10">
                    <Info className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">근거 자료</h4>
                    <p className="text-sm text-muted-foreground">{comment.evidence}</p>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}
