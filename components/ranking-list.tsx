"use client"

import { motion, AnimatePresence } from "framer-motion"
import { TrendingUp, TrendingDown, Minus, Trophy, Medal, Award } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useState, useEffect } from "react"

interface RankingItem {
  name: string
  total: number
  change: number
  rank: number
}

interface RankingListProps {
  ranking: RankingItem[]
  currentSpeaker: string
  compact?: boolean
}

export function RankingList({ ranking, currentSpeaker, compact = false }: RankingListProps) {
  const [previousRanks, setPreviousRanks] = useState<Record<string, number>>({})
  const [changedItems, setChangedItems] = useState<Set<string>>(new Set())

  useEffect(() => {
    const newChanges = new Set<string>()
    ranking.forEach((item) => {
      if (previousRanks[item.name] && previousRanks[item.name] !== item.rank) {
        newChanges.add(item.name)
      }
    })

    if (newChanges.size > 0) {
      setChangedItems(newChanges)
      setTimeout(() => setChangedItems(new Set()), 2000)
    }

    const newRanks: Record<string, number> = {}
    ranking.forEach((item) => {
      newRanks[item.name] = item.rank
    })
    setPreviousRanks(newRanks)
  }, [ranking])

  const getInitials = (name: string) => {
    return name.slice(0, 2)
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-4 h-4 text-accent" />
    if (rank === 2) return <Medal className="w-4 h-4 text-muted-foreground" />
    if (rank === 3) return <Award className="w-4 h-4 text-[#CD7F32]" />
    return null
  }

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-400" />
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-400" />
    return <Minus className="w-4 h-4 text-muted-foreground" />
  }

  const getGradientClass = (item: RankingItem) => {
    if (!changedItems.has(item.name)) return ""

    const prevRank = previousRanks[item.name]
    if (!prevRank) return ""

    if (prevRank > item.rank) {
      // Rank improved (number decreased)
      return "rank-up-gradient"
    } else if (prevRank < item.rank) {
      // Rank worsened (number increased)
      return "rank-down-gradient"
    }
    return ""
  }

  if (compact) {
    return (
      <div className="space-y-1.5">
        <AnimatePresence mode="popLayout">
          {ranking.map((item) => (
            <motion.div
              key={item.name}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{
                opacity: 1,
                x: 0,
                scale: changedItems.has(item.name) ? [1, 1.05, 1] : 1,
              }}
              exit={{ opacity: 0, x: 20 }}
              transition={{
                layout: { duration: 0.6, ease: "easeInOut" },
                opacity: { duration: 0.3 },
                scale: { duration: 0.5, ease: "easeOut" },
              }}
              className={`relative flex items-center gap-2 p-2 rounded-lg transition-all duration-500 overflow-hidden ${
                item.name === currentSpeaker
                  ? "bg-[#EA002C]/20 border border-[#EA002C]/40 shadow-lg shadow-[#EA002C]/20"
                  : "bg-slate-800/50 hover:bg-slate-800/70 border border-slate-700/50"
              } ${getGradientClass(item)}`}
            >
              {changedItems.has(item.name) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.3, 0] }}
                  transition={{ duration: 2 }}
                  className={`absolute inset-0 ${
                    previousRanks[item.name] > item.rank
                      ? "bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-transparent"
                      : "bg-gradient-to-r from-red-500/20 via-orange-500/20 to-transparent"
                  }`}
                />
              )}

              <div className="flex items-center justify-center w-6 h-6 text-xs font-bold relative z-10">
                {getRankIcon(item.rank) || item.rank}
              </div>
              <Avatar className="w-7 h-7 relative z-10">
                <AvatarFallback className="bg-[#EA002C]/20 text-[#EA002C] font-semibold text-xs">
                  {getInitials(item.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 relative z-10">
                <p
                  className={`text-xs font-medium truncate ${item.name === currentSpeaker ? "text-white font-semibold" : "text-white"}`}
                >
                  {item.name}
                </p>
                <p className="text-[10px] text-gray-400">{item.total.toFixed(1)}</p>
              </div>
              <div className="flex items-center relative z-10">{getChangeIcon(item.change)}</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {ranking.map((item, index) => (
          <motion.div
            key={item.name}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{
              layout: { duration: 0.6, ease: "easeInOut" },
              opacity: { duration: 0.3 },
            }}
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
              item.name === currentSpeaker
                ? "bg-primary/20 border border-primary/30 glow-primary"
                : "bg-secondary/50 hover:bg-secondary"
            }`}
          >
            <div className="flex items-center justify-center w-8 h-8 text-sm font-bold">
              {getRankIcon(item.rank) || item.rank}
            </div>
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                {getInitials(item.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{item.name}</p>
              <p className="text-sm text-muted-foreground">점수: {item.total.toFixed(1)}</p>
            </div>
            <div className="flex items-center gap-1">{getChangeIcon(item.change)}</div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
