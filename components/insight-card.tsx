"use client"

import { motion } from "framer-motion"
import { Lightbulb, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

/**
 * 패널토의 인사이트 인터페이스
 */
export interface PanelInsight {
  comment_id: number
  insight_text: string
  timestamp: string
  timestamp_seconds: number
  created_at: string
  reason: string
}

/**
 * 인사이트 카드 Props
 */
interface InsightCardProps {
  insight: PanelInsight
  index: number
}

/**
 * 인사이트 카드 컴포넌트
 * 
 * 패널토의 실시간 인사이트를 타임라인 형태로 표시합니다.
 * 새 인사이트가 추가될 때 fade-in 애니메이션 효과를 제공합니다.
 * 
 * @param insight - 인사이트 데이터
 * @param index - 인사이트 순서 (애니메이션 딜레이용)
 */
export function InsightCard({ insight, index }: InsightCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: "easeOut"
      }}
    >
      <Card className="mb-4 border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow">
        <CardContent className="p-4">
          {/* 헤더: 타임스탬프와 아이콘 */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-blue-500" />
              <Badge variant="outline" className="text-xs">
                인사이트 #{insight.comment_id}
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{insight.timestamp}</span>
            </div>
          </div>

          {/* 본문: 인사이트 텍스트 */}
          <p className="text-base leading-relaxed text-foreground">
            {insight.insight_text}
          </p>

          {/* 푸터: 선정 이유 (있는 경우) */}
          {insight.reason && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-muted-foreground italic">
                💡 {insight.reason}
              </p>
            </div>
          )}

          {/* 생성 시간 (디버그용, 필요시 제거) */}
          {/* <p className="mt-2 text-xs text-gray-400">
            생성: {new Date(insight.created_at).toLocaleTimeString("ko-KR")}
          </p> */}
        </CardContent>
      </Card>
    </motion.div>
  )
}

/**
 * 인사이트 리스트 컴포넌트
 * 
 * 여러 인사이트를 타임라인 형태로 표시합니다.
 * 
 * @param insights - 인사이트 배열
 */
interface InsightListProps {
  insights: PanelInsight[]
}

export function InsightList({ insights }: InsightListProps) {
  if (insights.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
        <Lightbulb className="w-12 h-12 mb-4 opacity-30" />
        <p className="text-lg font-medium">아직 인사이트가 없습니다</p>
        <p className="text-sm">패널토의가 진행되면 실시간으로 표시됩니다</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {insights.map((insight, index) => (
        <InsightCard
          key={insight.comment_id}
          insight={insight}
          index={index}
        />
      ))}
    </div>
  )
}

