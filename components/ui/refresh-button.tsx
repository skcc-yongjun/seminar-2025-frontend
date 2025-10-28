"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion } from "framer-motion"
import { RefreshCw } from "lucide-react"
import { Button } from "./button"

interface RefreshButtonProps {
  onRefresh: () => void
  isRefreshing?: boolean
  autoRefreshInterval?: number // 자동 새로고침 간격 (ms)
  className?: string
}

export function RefreshButton({ 
  onRefresh, 
  isRefreshing = false, 
  autoRefreshInterval = 5000,
  className 
}: RefreshButtonProps) {
  const [rotation, setRotation] = useState(0)
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false)
  const onRefreshRef = useRef(onRefresh)

  // onRefresh 함수를 ref에 저장하여 최신 상태 유지
  useEffect(() => {
    onRefreshRef.current = onRefresh
  }, [onRefresh])

  // 안전한 새로고침 함수
  const safeRefresh = useCallback(() => {
    onRefreshRef.current()
  }, [])

  useEffect(() => {
    if (!isAutoRefreshing) return

    const interval = setInterval(() => {
      setRotation(prev => {
        const newRotation = prev + 30 // 30도씩 회전 (12번에 한 바퀴)
        if (newRotation >= 360) {
          // 12시 위치(360도)에 도달하면 새로고침 실행
          // setTimeout을 사용하여 렌더링 완료 후 실행
          setTimeout(() => {
            safeRefresh()
          }, 0)
          return 0 // 다시 0도로 리셋
        }
        return newRotation
      })
    }, autoRefreshInterval / 12) // 12등분으로 나누어 부드럽게 회전

    return () => clearInterval(interval)
  }, [isAutoRefreshing, safeRefresh, autoRefreshInterval])

  const handleClick = () => {
    safeRefresh()
    // 수동 클릭 시에도 회전 애니메이션
    setRotation(prev => prev + 360)
  }

  const toggleAutoRefresh = () => {
    setIsAutoRefreshing(prev => !prev)
    if (!isAutoRefreshing) {
      setRotation(0) // 자동 새로고침 시작 시 0도부터 시작
    }
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClick}
        disabled={isRefreshing}
        className="p-2 h-8 w-8"
      >
        <motion.div
          animate={{ rotate: rotation }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <RefreshCw className="w-4 h-4" />
        </motion.div>
      </Button>
      <Button
        variant={isAutoRefreshing ? "default" : "outline"}
        size="sm"
        onClick={toggleAutoRefresh}
        className="text-xs px-2 py-1 h-6"
      >
        {isAutoRefreshing ? "자동 ON" : "자동 OFF"}
      </Button>
    </div>
  )
}
