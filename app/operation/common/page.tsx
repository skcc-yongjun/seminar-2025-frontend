"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, Users, Presentation, FileText, MessageSquare } from "lucide-react"

export default function OperationCommonPage() {
  const sections = [
    {
      icon: Users,
      title: "발표자 관리",
      description: "발표자 CRUD - 발표자, 회사",
      href: "/operation/common/speakers",
    },
    {
      icon: Presentation,
      title: "발표 관리",
      description: "발표 정보 CRUD - 세션 / 발표자 / 주제 / 순서 / 상태",
      href: "/operation/common/presentations",
    },
    {
      icon: FileText,
      title: "프롬프트 관리",
      description: "프롬프트 CRUD - 발표 / 프롬프트 타입 / 내용",
      href: "/operation/common/prompts",
    },
    {
      icon: MessageSquare,
      title: "Q&A 관리",
      description: "Q&A CRUD - 발표(세션2) / 질문 내용 / 선택 캐릭터 / 답변",
      href: "/operation/common/qna",
    },
  ]

  return (
    <div className="min-h-screen p-4 md:p-6 relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sk-red/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sk-red/3 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-sk-red transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>돌아가기</span>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Operation - 공통</h1>
          <p className="text-muted-foreground">공통 운영 관리 화면</p>
        </motion.div>

        {/* Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sections.map((section, index) => (
            <motion.div
              key={section.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Link href={section.href} className="block group">
                <div className="corporate-card rounded-xl p-6 h-full transition-all duration-300 hover:scale-[1.02]">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-sk-red/10 rounded-lg flex items-center justify-center group-hover:bg-sk-red/20 transition-colors">
                      <section.icon className="w-6 h-6 text-sk-red" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-sk-red transition-colors">
                        {section.title}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">{section.description}</p>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
