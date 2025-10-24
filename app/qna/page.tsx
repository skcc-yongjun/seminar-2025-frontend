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
    <div className="min-h-screen p-8 md:p-12 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>메인으로 돌아가기</span>
          </Link>

          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Q&A 카테고리
            <span className="block h-1 w-32 bg-sk-red mt-2" />
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
            >
              <Link href={`/qna/${category.id}`} className="block group">
                <div className="relative h-80 rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-black border border-sk-red/30 transition-all duration-300 hover:border-sk-red hover:shadow-2xl hover:shadow-sk-red/30 hover:scale-[1.02] active:scale-[0.98]">
                  <div className="absolute inset-0 bg-gradient-to-br from-sk-red/20 via-sk-red/5 to-transparent opacity-70" />

                  <div className="absolute inset-0 bg-gradient-to-br from-sk-red/0 via-sk-red/20 to-sk-red/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Content */}
                  <div className="relative h-full flex flex-col items-center justify-center p-8 text-center">
                    <h2 className="text-4xl font-bold text-white mb-2 group-hover:text-sk-red transition-colors duration-300">
                      {category.title}
                    </h2>
                    {category.id === "group" && <span className="block h-0.5 w-20 bg-sk-red/80 mb-2" />}
                    <p className="text-white/60 text-lg group-hover:text-white/80 transition-colors duration-300">
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
  )
}
