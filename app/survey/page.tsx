"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { fetchPresentations } from "@/lib/api"

export default function SurveyPage() {
  const router = useRouter()

  useEffect(() => {
    async function redirectToFirstPresentation() {
      try {
        // 세션1의 발표 목록 조회
        const presentations = await fetchPresentations("세션1")
        
        console.log("===== 서베이 발표 조회 결과 =====")
        console.log(`총 발표 개수: ${presentations.length}`)
        console.log("원본 순서 (API 응답):")
        presentations.forEach((p, idx) => {
          console.log(`  [${idx}] ID: ${p.presentation_id}, Order: ${p.presentation_order}, Topic: ${p.topic}`)
        })
        
        if (presentations.length === 0) {
          console.error("세션1 발표가 없습니다.")
          return
        }

        // presentation_order 기준으로 오름차순 정렬
        const sortedPresentations = [...presentations].sort(
          (a, b) => a.presentation_order - b.presentation_order
        )

        console.log("\n정렬 후 순서 (presentation_order 기준):")
        sortedPresentations.forEach((p, idx) => {
          console.log(`  [${idx}] ID: ${p.presentation_id}, Order: ${p.presentation_order}, Topic: ${p.topic}`)
        })

        // 첫 번째 발표로 리다이렉트
        const firstPresentationId = sortedPresentations[0].presentation_id
        console.log(`\n→ 첫 번째 발표로 리다이렉트: ${firstPresentationId}`)
        console.log("==================================\n")
        
        router.push(`/survey/${firstPresentationId}`)
      } catch (error) {
        console.error("발표 목록 조회 실패:", error)
      }
    }

    redirectToFirstPresentation()
  }, [router])

  return (
    <div 
      className="flex items-center justify-center min-h-screen relative overflow-hidden"
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
      
      <div className="text-center relative z-10">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"
            style={{ boxShadow: "0 0 20px rgba(6, 182, 212, 0.5)" }}
          ></div>
          <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border border-cyan-500/30 mx-auto"></div>
        </div>
        <p className="text-cyan-400 text-lg font-medium">설문조사 페이지로 이동 중...</p>
      </div>
    </div>
  )
}
