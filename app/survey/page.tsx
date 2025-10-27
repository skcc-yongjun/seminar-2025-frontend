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
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">설문조사 페이지로 이동 중...</p>
      </div>
    </div>
  )
}
