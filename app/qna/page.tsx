"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function QnACategories() {
  const categories = [
    {
      id: "business",
      title: "비즈니스",
      subtitle: "Business",
    },
    {
      id: "group",
      title: "그룹사",
      subtitle: "SK Group",
    },
    {
      id: "market",
      title: "시장",
      subtitle: "Market",
    },
  ]

  return (
    <div className="min-h-screen h-screen p-8 md:p-12 bg-background">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors mb-8 text-lg"
          >
            <ArrowLeft className="w-7 h-7" />
            <span>메인으로 돌아가기</span>
          </Link>

          <h1 className="text-6xl md:text-7xl font-bold text-foreground">
            Q&A 카테고리
            <span className="block h-2 w-48 bg-sk-red mt-4" />
          </h1>
        </motion.div>

        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full">
            {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
            >
              <Link href={`/qna/${category.id}`} className="block group">
                <div className="relative h-96 rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-black border border-slate-700/50 transition-all duration-500 hover:border-slate-400/60 hover:shadow-xl hover:shadow-slate-400/10 hover:scale-[1.01] active:scale-[0.99]">
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-600/5 via-slate-500/3 to-transparent opacity-50" />

                  <div className="absolute inset-0 bg-gradient-to-br from-slate-400/0 via-slate-300/5 to-slate-400/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Content */}
                  <div className="relative h-full flex flex-col items-center justify-center p-12 text-center">
                    <h2 className="text-8xl font-bold text-white mb-4 group-hover:text-slate-200 transition-colors duration-500">
                      {category.title}
                    </h2>
                    {category.id === "group" && <span className="block h-1 w-32 bg-slate-400/60 mb-4" />}
                    <p className="text-white/70 text-4xl group-hover:text-white/90 transition-colors duration-500">
                      {category.subtitle}
                    </p>

                    {/* Click button - shown on hover */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
