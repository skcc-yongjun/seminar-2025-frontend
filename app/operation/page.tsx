"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, Settings, Users, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function OperationMainPage() {
  return (
    <div className="min-h-screen p-4 md:p-6 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sk-red/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sk-red/3 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-sk-red transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>돌아가기</span>
          </Link>
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">운영자 전용 페이지</h1>
            <p className="text-xl text-muted-foreground">CEO 미팅 시스템 운영 관리</p>
          </div>
        </motion.div>

        {/* Operation Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* Common Operations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="corporate-card h-full hover:shadow-lg transition-all duration-300 group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-500/20 transition-colors">
                  <Settings className="w-8 h-8 text-blue-400" />
                </div>
                <CardTitle className="text-2xl">공통 관리</CardTitle>
                <CardDescription className="text-base">
                  발표자, 프롬프트, 발표 자료 등 공통 설정 관리
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Link href="/operation/common" className="block">
                  <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                    공통 관리로 이동
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Session 1 Operations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="corporate-card h-full hover:shadow-lg transition-all duration-300 group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-green-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-green-500/20 transition-colors">
                  <Users className="w-8 h-8 text-green-400" />
                </div>
                <CardTitle className="text-2xl">Session 1</CardTitle>
                <CardDescription className="text-base">
                  첫 번째 세션 운영 관리 및 Q&A 생성
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Link href="/operation/session1" className="block">
                  <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
                    Session 1로 이동
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Session 2 Operations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="corporate-card h-full hover:shadow-lg transition-all duration-300 group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-500/20 transition-colors">
                  <Calendar className="w-8 h-8 text-purple-400" />
                </div>
                <CardTitle className="text-2xl">Session 2</CardTitle>
                <CardDescription className="text-base">
                  두 번째 세션 운영 관리 및 Q&A 생성
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Link href="/operation/session2" className="block">
                  <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white">
                    Session 2로 이동
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
